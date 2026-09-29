import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { initSocket } from './utils/socket.js';
import { UPLOAD_ROOT } from './utils/uploads.js';
import routes from './routes/index.js';
import { corsOptions } from './config/cors.js';

const app = express();
const httpServer = createServer(app);

// Socket.io: admins get private notifications, website visitors get live content updates
initSocket(httpServer);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploaded images (banners). The website runs on another origin, so allow cross-origin embedding.
app.use('/uploads', express.static(UPLOAD_ROOT, {
  maxAge: '7d',
  index: false,
  setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Website + admin panel: serve the built React app (frontend/dist) from this same URL.
// Build it with `npm run build:web`; unknown non-API paths fall back to index.html for client-side routing.
const WEB_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (fs.existsSync(path.join(WEB_DIST, 'index.html'))) {
  app.use(express.static(WEB_DIST, { index: false, maxAge: '7d', setHeaders: (res, file) => {
    if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  } }));
  app.get(/^\/(?!api\/|api$|uploads\/|socket\.io\/).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(WEB_DIST, 'index.html'));
  });
} else {
  console.warn(`[Web] ${WEB_DIST} not found — run "npm run build:web" to serve the website from the backend`);
}

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 GymPro Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'gym_management'}\n`);
});
