import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

// Anonymous socket for the public website. The server only sends it "site:update"
// events naming a resource (gym, classes, trainers, banners, availability);
// listeners then re-read the public API.
let socket = null;
const listeners = new Set();

const connect = () => {
  socket = io(SOCKET_URL, { transports: ['websocket'], reconnectionDelay: 2000 });
  socket.on('site:update', ({ resource }) => listeners.forEach((l) => l.resources.includes(resource) && l.fn(resource)));
  // After a dropped connection, refresh everything in case an update was missed while offline
  socket.io.on('reconnect', () => listeners.forEach((l) => l.fn(null)));
};

export const onSiteUpdate = (resources, fn) => {
  const entry = { resources, fn };
  listeners.add(entry);
  if (!socket) connect();
  return () => {
    listeners.delete(entry);
    // Close the socket when no website component is listening (e.g. inside the admin panel)
    if (!listeners.size && socket) { socket.close(); socket = null; }
  };
};
