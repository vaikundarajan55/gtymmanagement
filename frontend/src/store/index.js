import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import gymReducer from './slices/gymSlice';
import socketReducer from './slices/socketSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    gym: gymReducer,
    socket: socketReducer,
    cart: cartReducer,
    customer: customerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.instance'],
      },
    }),
});
