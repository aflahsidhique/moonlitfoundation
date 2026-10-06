const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function paginationParams(query = {}, options = {}) {
  const defaultPageSize = options.defaultPageSize || DEFAULT_PAGE_SIZE;
  const maxPageSize = options.maxPageSize || MAX_PAGE_SIZE;
  const page = positiveInteger(query.page, 1);
  const pageSize = Math.min(positiveInteger(query.pageSize, defaultPageSize), maxPageSize);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

function paginationMeta(total, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages
  };
}

async function paginated(delegate, query, args = {}, options = {}) {
  const { page, pageSize, skip, take } = paginationParams(query, options);
  const where = options.softDelete === false ? args.where : { ...(args.where || {}), deletedAt: null };
  const [rows, total] = await Promise.all([
    delegate.findMany({ ...args, where, skip, take }),
    delegate.count({ where })
  ]);
  return { rows, pagination: paginationMeta(total, page, pageSize) };
}

module.exports = { paginated, paginationParams, paginationMeta };
