import axios from 'axios';

// Website-customer API client. Kept separate from the admin client (services/api.js) so the two
// logins never overwrite each other and a customer 401 never bounces to the admin login page.
export const CUSTOMER_TOKEN_KEY = 'gym_customer_token';
export const CUSTOMER_KEY = 'gym_customer';

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

customerApi.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* storage unavailable */ }
  return config;
});

customerApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthCall = /\/customer\/(login|register|forgot-password|reset-password)$/.test(url);
    // Expired/invalid session: clear it and send the visitor to log in, returning here afterwards
    if (err.response?.status === 401 && !isAuthCall) {
      try { localStorage.removeItem(CUSTOMER_TOKEN_KEY); localStorage.removeItem(CUSTOMER_KEY); } catch { /* ignore */ }
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      if (!window.location.pathname.startsWith('/login')) window.location.href = `/login?next=${next}&expired=1`;
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || fallback;

export default customerApi;
