import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { corsOptions } from '../config/cors.js';

export const ADMIN_ROOM = 'admins';

let io;

// Admins see how many admins and website visitors are connected right now
const broadcastPresence = () => {
  const admins = io.sockets.adapter.rooms.get(ADMIN_ROOM)?.size || 0;
  const visitors = Math.max(0, io.engine.clientsCount - admins);
  io.to(ADMIN_ROOM).emit('presence', { admins, visitors });
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
  });

  // No token = website visitor (receives public "site:update" events only).
  // A token must be valid; only role 'admin' joins the admin room for private events.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET || 'gym_secret_key_2024');
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const isAdmin = socket.user?.role === 'admin';
    if (isAdmin) {
      socket.join(ADMIN_ROOM);
      console.log(`[Socket] Admin connected: ${socket.user.email} (${socket.id})`);
    }
    broadcastPresence();
    socket.on('disconnect', broadcastPresence);
  });

  return io;
};

export const getIO = () => io;
