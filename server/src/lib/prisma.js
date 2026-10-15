const { PrismaClient } = require("@prisma/client");
const { pooledDatabaseUrl } = require("./databaseUrl");
const prisma = new PrismaClient({
  datasources: { db: { url: pooledDatabaseUrl(process.env.DATABASE_URL) } }
});
const SOFT_DELETE_MODELS =  new Set([
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
    params.args.data = { deletedAt:  new Date() };
  } else if (params.action === "deleteMany") {
    params.action = "updateMany";
    params.args.data = Object.assign({}, params.args.data, { deletedAt:  new Date() });
  } else if (params.action === "findUnique" || params.action === "findFirst") {
    params.action = "findFirst";
    const where = params.args.where;
    if (where) {
      const keys = Object.keys(where);
      if (keys.length === 1 && where[keys[0]] && typeof where[keys[0]] === "object" && !Array.isArray(where[keys[0]])) {
        const compoundKey = keys[0];
        const compoundValue = where[compoundKey];
        if (compoundKey === Object.keys(compoundValue).join("_")) {
          delete where[compoundKey];
          Object.assign(where, compoundValue);
        }
      }
      if (where.deletedAt === void 0) where.deletedAt = null;
    }
  } else if (params.action === "findMany") {
    params.args = params.args || {};
    if (!params.args.where) {
      params.args.where = { deletedAt: null };
    } else if (params.args.where.deletedAt === void 0) {
      params.args.where.deletedAt = null;
    }
  }
  return next(params);
});
module.exports = prisma;
