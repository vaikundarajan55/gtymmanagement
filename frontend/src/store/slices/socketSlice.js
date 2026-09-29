import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: { connected: false, onlineUsers: 0, visitors: 0 },
  reducers: {
    setConnected: (s, a) => { s.connected = a.payload; },
    setPresence: (s, a) => { s.onlineUsers = a.payload.admins; s.visitors = a.payload.visitors; },
  },
});

export const { setConnected, setPresence } = socketSlice.actions;
export default socketSlice.reducer;
