import crypto from 'crypto';

// Thin wrapper over the Razorpay REST API (https://razorpay.com/docs/api/). Test keys start with rzp_test_.
const API = 'https://api.razorpay.com/v1';

const keys = () => ({ id: process.env.RAZORPAY_KEY_ID, secret: process.env.RAZORPAY_KEY_SECRET });

export const isConfigured = () => Boolean(keys().id && keys().secret);
export const publicKeyId = () => keys().id;

const call = async (method, path, body) => {
  const { id, secret } = keys();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error?.description || `Razorpay request failed (${res.status})`);
    err.status = res.status === 401 ? 502 : res.status;
    throw err;
  }
  return data;
};

// amount is in rupees; Razorpay works in paise
export const createOrder = ({ amount, receipt, notes }) =>
  call('POST', '/orders', { amount: Math.round(amount * 100), currency: 'INR', receipt, notes });

export const fetchPayment = (paymentId) => call('GET', `/payments/${encodeURIComponent(paymentId)}`);

// Checkout signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
export const verifySignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac('sha256', keys().secret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
