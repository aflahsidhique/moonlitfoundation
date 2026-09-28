const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Every model listed here has a nullable `deletedAt DateTime?` column.
// Route code never has to think about soft deletes — it just calls
// `.delete()`, `.findMany()`, `.findUnique()` etc. as normal; this
// middleware rewrites those calls transparently:
//   - delete / deleteMany  -> update / updateMany, setting deletedAt = now
//   - findMany             -> adds `deletedAt: null` unless the caller
//                              already specified a `deletedAt` filter
//   - findUnique / findFirst -> same, but findUnique is rewritten to
//                              findFirst since findUnique can't combine
//                              its unique-field lookup with extra filters
// (This is Prisma's own documented recipe for soft deletes — see
// https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware/soft-delete-middleware)
//
// Known limitation: middleware only intercepts top-level queries, not
// nested `include`/`select` relation reads or `_count`. A soft-deleted
// EventRegistration, for example, would still be included in an Event's
// `_count.registrations` via `include`. None of the current admin UI
// relies on those counts being delete-aware, but worth remembering if
// that changes.
const SOFT_DELETE_MODELS = new Set([
  "Volunteer",
  "BloodRequest",
  "PartnerInquiry",
  "ContactMessage",
  "NewsletterSubscriber",
  "Event",
  "EventRegistration",
  "Notification",
  "BloodRequestResponse",
  "BloodDonationRecord",
  "EventFeedback"
]);

prisma.$use(async (params, next) => {
  if (!SOFT_DELETE_MODELS.has(params.model)) return next(params);

  if (params.action === "delete") {
    params.action = "update";
    params.args.data = { deletedAt: new Date() };
  } else if (params.action === "deleteMany") {
    params.action = "updateMany";
    params.args.data = Object.assign({}, params.args.data, { deletedAt: new Date() });
  } else if (params.action === "findUnique" || params.action === "findFirst") {
    params.action = "findFirst";
    const where = params.args.where;
    if (where) {
      // findUnique on a @@unique([a, b]) compound key arrives as
      // { a_b: { a: x, b: y } } — that shorthand only works for findUnique.
      // findFirst needs it flattened to top-level filters.
      const keys = Object.keys(where);
      if (keys.length === 1 && where[keys[0]] && typeof where[keys[0]] === "object" && !Array.isArray(where[keys[0]])) {
        const compoundKey = keys[0];
        const compoundValue = where[compoundKey];
        if (compoundKey === Object.keys(compoundValue).join("_")) {
          delete where[compoundKey];
          Object.assign(where, compoundValue);
        }
      }
      if (where.deletedAt === undefined) where.deletedAt = null;
    }
  } else if (params.action === "findMany") {
    params.args = params.args || {};
    if (!params.args.where) {
      params.args.where = { deletedAt: null };
    } else if (params.args.where.deletedAt === undefined) {
      params.args.where.deletedAt = null;
    }
  }

  return next(params);
});

module.exports = prisma;
