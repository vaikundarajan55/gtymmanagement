import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  // Sidebar starts collapsed on phones/tablets so it doesn't cover the page
  initialState: { sidebarOpen: typeof window === 'undefined' || window.innerWidth >= 1024, notifications: [] },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    addNotification: (s, a) => {
      s.notifications.unshift({ id: Date.now(), ...a.payload });
      if (s.notifications.length > 20) s.notifications.pop();
    },
  },
});

export const { toggleSidebar, addNotification } = uiSlice.actions;
export default uiSlice.reducer;
