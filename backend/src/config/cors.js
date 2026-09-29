// Allowed frontend origins: comma-separated CLIENT_URL list, plus any localhost port in dev
const allowed = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isLocalhost = (origin) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

export const corsOrigins = allowed;
export const isAllowedOrigin = (origin) => Boolean(origin) && (allowed.includes(origin) || isLocalhost(origin));

export const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || isAllowedOrigin(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
