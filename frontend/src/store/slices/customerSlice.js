import { createSlice } from '@reduxjs/toolkit';
import { CUSTOMER_TOKEN_KEY, CUSTOMER_KEY } from '../../services/customerApi';

const read = () => {
  try {
    return { token: localStorage.getItem(CUSTOMER_TOKEN_KEY), customer: JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null') };
  } catch { return { token: null, customer: null }; }
};
const write = (token, customer) => {
  try {
    if (token) localStorage.setItem(CUSTOMER_TOKEN_KEY, token); else localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    if (customer) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer)); else localStorage.removeItem(CUSTOMER_KEY);
  } catch { /* storage unavailable */ }
};

const customerSlice = createSlice({
  name: 'customer',
  initialState: read(),
  reducers: {
    setSession: (s, { payload: { token, customer } }) => { s.token = token; s.customer = customer; write(token, customer); },
    setCustomer: (s, { payload }) => { s.customer = payload; write(s.token, payload); },
    logoutCustomer: (s) => { s.token = null; s.customer = null; write(null, null); },
  },
});

export const { setSession, setCustomer, logoutCustomer } = customerSlice.actions;
export default customerSlice.reducer;
