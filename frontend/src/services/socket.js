import { io } from 'socket.io-client';
import { store } from '../store';
import { setConnected, setPresence } from '../store/slices/socketSlice';
import { addNotification } from '../store/slices/uiSlice';
import { SOCKET_URL } from './config';

let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem('gym_token');
  if (!token || socket?.connected) return;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    store.dispatch(setConnected(true));
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', () => {
    store.dispatch(setConnected(false));
  });

  // { admins, visitors } currently connected (visitors = open website tabs)
  socket.on('presence', (p) => {
    store.dispatch(setPresence(p));
  });

  socket.on('new_enquiry', (data) => {
    store.dispatch(addNotification({ type: 'enquiry', message: `New enquiry from ${data.name}`, data }));
  });

  socket.on('new_contact', (data) => {
    store.dispatch(addNotification({ type: 'contact', message: `New contact from ${data.name}`, data }));
  });

  socket.on('new_booking', (data) => {
    store.dispatch(addNotification({ type: 'booking', message: `New paid booking ${data.booking_no} from ${data.name}`, data }));
  });

  socket.on('fee_due', (data) => {
    store.dispatch(addNotification({ type: 'fee', message: `Fee due for ${data.memberName}`, data }));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getSocket = () => socket;
