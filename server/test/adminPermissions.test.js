const test = require("node:test");
const assert = require("node:assert/strict");
const { canAccess, normalizePermissions, resourceForRequest } = require("../src/lib/adminPermissions");
const { pooledDatabaseUrl, positiveConnectionLimit } = require("../src/lib/databaseUrl");
const { normalizeImageUrl, schema } = require("../src/lib/website");
test("normalizes permissions to known, unique values", () => {
  assert.deepEqual(normalizePermissions(["events", "events", "unknown", "volunteers"]), ["events", "volunteers"]);
  assert.deepEqual(normalizePermissions("events"), []);
});
test("super admins can access every area while admins need an assignment", () => {
  assert.equal(canAccess({ role: "super_admin", permissions: [] }, "events"), true);
  assert.equal(canAccess({ role: "admin", permissions: ["events"] }, "events"), true);
  assert.equal(canAccess({ role: "admin", permissions: ["events"] }, "volunteers"), false);
});
test("maps API areas to their permission, including the split website routes", () => {
  assert.equal(resourceForRequest({ baseUrl: "/api/events", path: "/admin" }), "events");
  assert.equal(resourceForRequest({ baseUrl: "/api/website", path: "/images" }), "gallery");
  assert.equal(resourceForRequest({ baseUrl: "/api/website", path: "/admin" }), "website");
  assert.equal(resourceForRequest({ baseUrl: "/api/auth", path: "/me" }), null);
});
test("adds a bounded Prisma pool without overwriting explicit URL settings", () => {
  assert.equal(
    pooledDatabaseUrl("postgresql://user:pass@host/db", "4"),
    "postgresql://user:pass@host/db?connection_limit=4&pool_timeout=15"
  );
  assert.equal(
    pooledDatabaseUrl("postgresql://host/db?sslmode=require&connection_limit=2", "8"),
    "postgresql://host/db?sslmode=require&connection_limit=2&pool_timeout=15"
  );
  assert.equal(positiveConnectionLimit("999"), 20);
  assert.equal(positiveConnectionLimit("invalid"), 3);
});
test("accepts only complete HTTPS image URLs", () => {
  assert.equal(normalizeImageUrl("https://example.com/photo.jpg"), "https://example.com/photo.jpg");
  assert.throws(() => normalizeImageUrl("http://example.com/photo.jpg"), /HTTPS image URL/);
  assert.throws(() => normalizeImageUrl("https://user:secret@example.com/photo.jpg"), /HTTPS image URL/);
  assert.throws(() => normalizeImageUrl("not-a-url"), /HTTPS image URL/);
});
test("exposes three editable slider images for every program", () => {
  const fields = schema.pages.find((page) => page.id === "programs").fields;
  for (const group of ["blood", "welfare", "relief", "environment", "youth"]) {
    assert.equal(fields.filter((field) => field.group === group && field.type === "image").length, 3);
  }
});
