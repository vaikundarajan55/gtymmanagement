import { createSlice } from '@reduxjs/toolkit';

// Cart lives in localStorage so it survives refreshes; prices here are for display only —
// the server re-prices every item at checkout.
const STORAGE_KEY = 'gym_cart';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
};
const save = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
};

export const MAX_PEOPLE = 10;

export const itemKey = (i) => (i.type === 'plan' ? `plan-${i.plan}` : `class-${i.classId}-${i.date}-${i.time}`);

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load() },
  reducers: {
    addItem: (s, { payload }) => {
      const key = itemKey(payload);
      const existing = s.items.find((i) => i.key === key);
      if (existing) {
        if (existing.type === 'class') existing.qty = Math.min(MAX_PEOPLE, existing.qty + (payload.qty || 1));
      } else {
        s.items.push({ ...payload, key, qty: payload.type === 'plan' ? 1 : Math.min(MAX_PEOPLE, payload.qty || 1) });
      }
      save(s.items);
    },
    setQty: (s, { payload: { key, qty } }) => {
      const item = s.items.find((i) => i.key === key);
      if (item && item.type === 'class') item.qty = Math.max(1, Math.min(MAX_PEOPLE, qty));
      save(s.items);
    },
    removeItem: (s, { payload: key }) => {
      s.items = s.items.filter((i) => i.key !== key);
      save(s.items);
    },
    clearCart: (s) => {
      s.items = [];
      save(s.items);
    },
  },
});

export const { addItem, setQty, removeItem, clearCart } = cartSlice.actions;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.qty, 0);
export const selectCartSubtotal = (s) => s.cart.items.reduce((n, i) => n + i.price * i.qty, 0);
export default cartSlice.reducer;
