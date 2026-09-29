import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboard = createAsyncThunk('gym/dashboard', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/dashboard'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchTrainers = createAsyncThunk('gym/trainers', async (p = {}, { rejectWithValue }) => {
  try { const { data } = await api.get(`/trainers?page=${p.page||1}&search=${p.search||''}&limit=${p.limit||10}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchUsers = createAsyncThunk('gym/users', async (p = {}, { rejectWithValue }) => {
  try { const { data } = await api.get(`/users?page=${p.page||1}&search=${p.search||''}&limit=${p.limit||10}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchFees = createAsyncThunk('gym/fees', async (p = {}, { rejectWithValue }) => {
  try { const { data } = await api.get(`/fees?page=${p.page||1}&search=${p.search||''}&limit=${p.limit||10}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchOrders = createAsyncThunk('gym/orders', async (p = {}, { rejectWithValue }) => {
  try { const { data } = await api.get(`/orders?page=${p.page||1}&search=${p.search||''}&limit=${p.limit||10}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchBirthdays = createAsyncThunk('gym/birthdays', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/users/birthdays'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchContacts = createAsyncThunk('gym/contacts', async (p = {}, { rejectWithValue }) => {
  try { const { data } = await api.get(`/contacts?page=${p.page||1}&limit=${p.limit||10}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchEnquiries = createAsyncThunk('gym/enquiries', async (p = {}, { rejectWithValue }) => {
  try { const { data } = await api.get(`/enquiries?page=${p.page||1}&limit=${p.limit||10}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

// Paged list fetchers for the admin booking/class/membership pages
const pagedFetch = (type, path) => createAsyncThunk(type, async (p = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({ page: p.page || 1, search: p.search || '', limit: p.limit || 10, ...(p.filter ? { filter: p.filter } : {}) });
    const { data } = await api.get(`${path}?${params}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Error'); }
});

export const fetchBookings = pagedFetch('gym/bookings', '/bookings');
export const fetchClasses = pagedFetch('gym/classes', '/classes');
export const fetchRenewals = pagedFetch('gym/renewals', '/memberships/completed');
export const fetchBanners = pagedFetch('gym/banners', '/banners');

const gymSlice = createSlice({
  name: 'gym',
  initialState: {
    dashboard: null,
    trainers: [], users: [], fees: [], orders: [], birthdays: [],
    contacts: [], enquiries: [], bookings: [], classes: [], renewals: [], banners: [],
    pagination: {},
    loading: false, error: null,
  },
  reducers: { clearGymError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    const handle = (thunk, key) => {
      builder
        .addCase(thunk.pending, (s) => { s.loading = true; })
        .addCase(thunk.fulfilled, (s, a) => {
          s.loading = false;
          if (key === 'dashboard') { s.dashboard = a.payload; }
          else { s[key] = a.payload.data || a.payload; s.pagination = { ...s.pagination, [key]: a.payload.pagination }; }
        })
        .addCase(thunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    };
    handle(fetchDashboard, 'dashboard');
    handle(fetchTrainers, 'trainers');
    handle(fetchUsers, 'users');
    handle(fetchFees, 'fees');
    handle(fetchOrders, 'orders');
    handle(fetchBirthdays, 'birthdays');
    handle(fetchContacts, 'contacts');
    handle(fetchEnquiries, 'enquiries');
    handle(fetchBookings, 'bookings');
    handle(fetchClasses, 'classes');
    handle(fetchRenewals, 'renewals');
    handle(fetchBanners, 'banners');
  },
});

export const { clearGymError } = gymSlice.actions;
export default gymSlice.reducer;
