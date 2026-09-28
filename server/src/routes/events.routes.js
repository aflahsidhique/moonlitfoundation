const express = require("express");
const { publicCache } = require("../middleware/cache");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");
const { parseEventImage, storeEventImage } = require("../lib/eventImage");
const { emailConfigured, recipientsFor, shareEvent, safeUrl } = require("../lib/eventEmail");

const router = express.Router();

const EVENT_FIELDS = ["title", "category", "description", "location", "eventDate", "startTime", "endTime"];

// Protected uploads use the same media storage as volunteer photos.
router.post("/image", requireAuth, parseEventImage, async (req, res, next) => {
  try { res.status(201).json({ imageUrl: await storeEventImage(req.file) }); } catch (error) { next(error); }
});

router.get("/:id/email-preview", requireAuth, async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: "Event not found." });
    const audience = req.query.audience || "volunteers";
    const { recipients, skipped } = await recipientsFor(prisma, event.id, audience);
    res.json({ count: recipients.length, skipped, configured: emailConfigured() });
  } catch (error) { next(error); }
});

router.post("/:id/share", requireAuth, async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: "Event not found." });
    res.json({ delivery: await shareEvent(prisma, event, req.body) });
  } catch (error) { next(error); }
});

// Public — published events only, split into upcoming/past by the caller.
router.get("/", publicCache({ maxAge: 60, swr: 600 }), async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: "published" },
      orderBy: { eventDate: "asc" },
      include: { _count: { select: { registrations: true } } }
    });
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

// Admin — every event regardless of status, with registration counts.
router.get("/admin", requireAuth, async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "desc" },
      include: { _count: { select: { registrations: true } } }
    });
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

// Admin — create (defaults to draft unless status:"published" is sent).
router.post("/", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, EVENT_FIELDS);
    if (req.body.imageUrl && !safeUrl(req.body.imageUrl)) return res.status(400).json({ error: "Image URL must use http or https." });
    const { title, category, description, location, eventDate, startTime, endTime, imageUrl, photoAlbumUrl, capacity, status, durationHours } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        category,
        description,
        location,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        durationHours: durationHours ? Number(durationHours) : null,
        imageUrl: imageUrl || null,
        photoAlbumUrl: photoAlbumUrl || null,
        capacity: capacity ? Number(capacity) : null,
        status: status === "published" ? "published" : "draft"
      }
    });
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

// Admin — edit any field.
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    if (req.body.imageUrl && !safeUrl(req.body.imageUrl)) return res.status(400).json({ error: "Image URL must use http or https." });
    const { title, category, description, location, eventDate, startTime, endTime, imageUrl, photoAlbumUrl, capacity, status, durationHours } = req.body;
    if (status !== undefined && !["draft", "published"].includes(status)) {
      return res.status(400).json({ error: "status must be draft or published." });
    }
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(durationHours !== undefined && { durationHours: durationHours ? Number(durationHours) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(photoAlbumUrl !== undefined && { photoAlbumUrl: photoAlbumUrl || null }),
        ...(capacity !== undefined && { capacity: capacity ? Number(capacity) : null }),
        ...(status !== undefined && { status })
      }
    });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

// Admin — publish/unpublish.
router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status } = req.body;
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ error: "status must be draft or published." });
    }
    const event = await prisma.event.update({ where: { id: req.params.id }, data: { status } });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Public — register for a published event, capacity-aware.
router.post("/:id/register", async (req, res, next) => {
  try {
    requireFields(req.body, ["name", "email", "phone"]);
    const { name, email, phone } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { registrations: true } } }
    });
    if (!event || event.status !== "published") {
      return res.status(404).json({ error: "Event not found." });
    }
    if (event.capacity && event._count.registrations >= event.capacity) {
      return res.status(409).json({ error: "This event is full." });
    }

    const registration = await prisma.eventRegistration.create({
      data: { eventId: event.id, name, email, phone }
    });
    res.status(201).json({ registration });
  } catch (err) {
    next(err);
  }
});

// Public — leave feedback on an event that has already taken place.
// No login required, loosely matched by name/email (same trust model as
// registration). Only allowed once the event's date has passed.
router.post("/:id/feedback", async (req, res, next) => {
  try {
    requireFields(req.body, ["name", "email", "rating"]);
    const { name, email, comment } = req.body;
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be a whole number from 1 to 5." });
    }

    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event || event.status !== "published") {
      return res.status(404).json({ error: "Event not found." });
    }
    if (new Date(event.eventDate) > new Date()) {
      return res.status(400).json({ error: "You can leave feedback once the event has taken place." });
    }

    const feedback = await prisma.eventFeedback.create({
      data: { eventId: event.id, name, email, rating, comment: comment || null }
    });
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
});

// Admin — registrations for one event.
router.get("/:id/registrations", requireAuth, async (req, res, next) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ registrations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
