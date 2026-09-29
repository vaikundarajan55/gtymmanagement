// Backend locations. Uploaded files are served from the API server's /uploads path.
// Empty values mean "same server that served this page" (production build served by the backend).
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
const SERVER_ORIGIN = new URL(API_URL, window.location.origin).origin;

// "/uploads/banners/x.jpg" → "http://localhost:5000/uploads/banners/x.jpg"; full URLs pass through
export const assetUrl = (path) => (path && path.startsWith('/uploads/') ? `${SERVER_ORIGIN}${path}` : path || '');
