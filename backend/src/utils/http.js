// Shared request/response helpers for controllers

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const fail = (status, message) => new HttpError(status, message);

// DB constraint errors become 4xx; anything unexpected is logged and hidden behind "Server error"
export const sendError = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A record with this email or slug already exists' });
  if (err.code?.startsWith('ER_TRUNCATED') || err.code === 'WARN_DATA_TRUNCATED' || err.code === 'ER_BAD_NULL_ERROR' || err.code === 'ER_DATA_TOO_LONG')
    return res.status(400).json({ message: 'Invalid value in one of the fields' });
  if (!err.status || err.status >= 500) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error' });
};

// Wraps an async controller so thrown errors turn into JSON responses
export const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    sendError(res, err);
  }
};

// ?page=&limit=&search= — limit=all (NaN) returns every row
export const listParams = (q) => {
  const search = String(q.search || '');
  return { page: +(q.page || 1), limit: +(q.limit ?? 10), search, like: `%${search}%` };
};
