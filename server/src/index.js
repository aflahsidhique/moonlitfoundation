require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { publicCache, noStore } = require("./middleware/cache");
const authRoutes = require("./routes/auth.routes");
const volunteerAuthRoutes = require("./routes/volunteerAuth.routes");
const volunteersRoutes = require("./routes/volunteers.routes");
const bloodRequestsRoutes = require("./routes/bloodRequests.routes");
const partnersRoutes = require("./routes/partners.routes");
const contactRoutes = require("./routes/contact.routes");
const newsletterRoutes = require("./routes/newsletter.routes");
const eventsRoutes = require("./routes/events.routes");
const eventRegistrationsRoutes = require("./routes/eventRegistrations.routes");
const eventFeedbackRoutes = require("./routes/eventFeedback.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const adminUsersRoutes = require("./routes/adminUsers.routes");
const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    exposedHeaders: ["ETag"],
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS: " + origin));
    }
  })
);
app.use(express.json({ limit: "512kb" }));
app.use(morgan("dev"));
app.use(noStore);
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get(
  "/api/config",
  publicCache({ maxAge: 3600, swr: 86400 }),
  (req, res) => res.json({ vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null })
);
app.use("/api/auth", authRoutes);
app.use("/api/volunteer-auth", volunteerAuthRoutes);
app.use("/api/volunteers", volunteersRoutes);
app.use("/api/blood-requests", bloodRequestsRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/website", require("./routes/website.routes"));
app.use("/api/event-registrations", eventRegistrationsRoutes);
app.use("/api/event-feedback", eventFeedbackRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin-users", adminUsersRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 4e3;
app.listen(PORT, () => {
  console.log(`Moonlit Foundation admin API listening on http://localhost:${PORT}`);
});
