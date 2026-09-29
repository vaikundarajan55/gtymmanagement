import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomerModel from '../models/CustomerModel.js';
import BookingModel from '../models/BookingModel.js';
import GymModel from '../models/GymModel.js';
import { corsOrigins, isAllowedOrigin } from '../config/cors.js';
import { handle, fail } from '../utils/http.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/mailer.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'gym_secret_key_2024';
const RESET_MINUTES = 30;
const isProd = () => process.env.NODE_ENV === 'production';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{10,15}$/;
const cleanPhone = (p) => String(p || '').replace(/[\s-]/g, '');
const checkPassword = (p) => {
  if (String(p || '').length < 8) throw fail(400, 'Password must be at least 8 characters');
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) throw fail(400, 'Password must include letters and numbers');
};
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

const loadCustomer = async (id) => {
  const c = await CustomerModel.findPublic(id);
  if (!c) throw fail(404, 'Account not found');
  return c;
};

const issueToken = (c) => jwt.sign({ id: c.id, email: c.email, role: 'customer' }, JWT_SECRET(), { expiresIn: '7d' });

// ── Auth ──────────────────────────────────────────────────────────────────

export const register = handle(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = cleanPhone(req.body.phone);
  const { password } = req.body;
  if (name.length < 2) throw fail(400, 'Please enter your full name');
  if (!EMAIL_RE.test(email)) throw fail(400, 'Please enter a valid email');
  if (!PHONE_RE.test(phone)) throw fail(400, 'Please enter a valid mobile number');
  checkPassword(password);

  if (await CustomerModel.findByEmail(email)) throw fail(409, 'An account with this email already exists. Try logging in.');

  const id = await CustomerModel.create({ name, email, phone, hash: await bcrypt.hash(password, 12) });
  const customer = await loadCustomer(id);
  sendWelcomeEmail(customer);
  res.status(201).json({ token: issueToken(customer), customer });
});

export const login = handle(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) throw fail(400, 'Email and password are required');
  const row = await CustomerModel.findLogin(email);
  // Same message whether the email or the password is wrong
  if (!row || !(await bcrypt.compare(password, row.password))) throw fail(401, 'Incorrect email or password');
  await CustomerModel.touchLogin(row.id);
  const customer = await loadCustomer(row.id);
  res.json({ token: issueToken(customer), customer });
});

// Picks the website origin the request came from (if allowed) for the reset link
const siteOrigin = (req) => {
  const origin = req.headers.origin;
  return isAllowedOrigin(origin) ? origin : corsOrigins[0];
};

export const forgotPassword = handle(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw fail(400, 'Please enter a valid email');
  const generic = { message: `If an account exists for ${email}, a reset link has been sent. It expires in ${RESET_MINUTES} minutes.` };

  const row = await CustomerModel.findByEmail(email);
  if (!row) return res.json(generic);

  const token = crypto.randomBytes(32).toString('hex');
  await CustomerModel.setResetToken(row.id, sha256(token), RESET_MINUTES);

  const url = `${siteOrigin(req)}/reset-password/${token}`;
  sendPasswordResetEmail({ name: row.name, email, url, minutes: RESET_MINUTES });
  // In development also log the link and hand it back so the flow can be tested without a mailbox
  if (!isProd()) console.log(`[Password reset] ${email}: ${url}`);
  res.json(isProd() ? generic : { ...generic, devResetUrl: url });
});

export const resetPassword = handle(async (req, res) => {
  const { token, password } = req.body;
  if (!/^[a-f0-9]{64}$/.test(String(token || ''))) throw fail(400, 'This reset link is invalid');
  checkPassword(password);
  const row = await CustomerModel.findByValidReset(sha256(token));
  if (!row) throw fail(400, 'This reset link is invalid or has expired. Please request a new one.');
  await CustomerModel.setPassword(row.id, await bcrypt.hash(password, 12));
  res.json({ message: 'Password updated. You can now log in.' });
});

// ── Account ───────────────────────────────────────────────────────────────

export const getProfile = handle(async (req, res) => res.json(await loadCustomer(req.user.id)));

export const updateProfile = handle(async (req, res) => {
  const b = req.body;
  const data = {};
  if ('name' in b) { data.name = String(b.name || '').trim(); if (data.name.length < 2) throw fail(400, 'Please enter your full name'); }
  if ('phone' in b) { data.phone = cleanPhone(b.phone); if (!PHONE_RE.test(data.phone)) throw fail(400, 'Please enter a valid mobile number'); }
  if ('gender' in b) { data.gender = b.gender || null; if (data.gender && !['male', 'female', 'other'].includes(data.gender)) throw fail(400, 'Invalid gender'); }
  if ('dob' in b) { data.dob = b.dob || null; if (data.dob && !/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) throw fail(400, 'Invalid date of birth'); }
  if ('address' in b) data.address = String(b.address || '').trim().slice(0, 255) || null;
  if ('city' in b) data.city = String(b.city || '').trim().slice(0, 80) || null;
  // Email is the login id and is intentionally not editable here
  if (!Object.keys(data).length) throw fail(400, 'Nothing to update');
  await CustomerModel.update(req.user.id, data);
  res.json({ message: 'Profile updated', customer: await loadCustomer(req.user.id) });
});

export const changePassword = handle(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const hash = await CustomerModel.passwordHash(req.user.id);
  if (!hash) throw fail(404, 'Account not found');
  if (!(await bcrypt.compare(String(currentPassword || ''), hash))) throw fail(400, 'Current password is incorrect');
  checkPassword(newPassword);
  if (currentPassword === newPassword) throw fail(400, 'New password must be different from the current one');
  await CustomerModel.setPassword(req.user.id, await bcrypt.hash(newPassword, 12));
  res.json({ message: 'Password changed successfully' });
});

// ── Bookings ──────────────────────────────────────────────────────────────

export const getDashboard = handle(async (req, res) => res.json(await BookingModel.customerSummary(req.user.id)));

export const myBookings = handle(async (req, res) => {
  res.json(await BookingModel.listForCustomer(req.user.id, String(req.query.status || '')));
});

// Full booking with items + gym details, used for both the detail page and the invoice
export const myBooking = handle(async (req, res) => {
  const booking = await BookingModel.findForCustomer(req.params.bookingNo, req.user.id);
  if (!booking) throw fail(404, 'Booking not found');
  const [gym, billing_address] = await Promise.all([GymModel.invoiceInfo(), CustomerModel.billingAddress(req.user.id)]);
  res.json({ ...booking, gym, billing_address });
});
