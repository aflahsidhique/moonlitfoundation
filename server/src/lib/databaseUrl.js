const DEFAULT_CONNECTION_LIMIT = 3;
function positiveConnectionLimit(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 20) : DEFAULT_CONNECTION_LIMIT;
}
function hasParameter(url, name) {
  return new RegExp(`(?:[?&])${name}=`, "i").test(url);
}
function addParameter(url, name, value) {
  if (hasParameter(url, name)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${name}=${encodeURIComponent(value)}`;
}
function pooledDatabaseUrl(databaseUrl, connectionLimit = process.env.DB_CONNECTION_LIMIT) {
  if (!databaseUrl) return databaseUrl;
  let result = addParameter(databaseUrl, "connection_limit", positiveConnectionLimit(connectionLimit));
  result = addParameter(result, "pool_timeout", 15);
  return result;
}
module.exports = { DEFAULT_CONNECTION_LIMIT, pooledDatabaseUrl, positiveConnectionLimit };
