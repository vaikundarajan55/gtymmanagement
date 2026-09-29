import crypto from 'crypto';
import { PLANS, GST_RATE, MAX_BOOKING_DAYS_AHEAD } from '../config/plans.js';
import * as razorpay from '../utils/razorpay.js';
import ClassModel, { csvList } from '../models/ClassModel.js';
import BookingModel from '../models/BookingModel.js';
import CustomerModel from '../models/CustomerModel.js';
import { crud } from './crudController.js';
import { handle, fail, listParams } from '../utils/http.js';
import { notifyAdmins, publishSiteUpdate } from '../utils/realtime.js';
import { sendBookingEmails } from '../utils/mailer.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const round2 = (n) => Math.round(n * 100) / 100;
const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// "6:30 PM" → minutes since midnight
const slotMinutes = (slot) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot);
  if (!m) return null;
  return ((+m[1] % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + +m[2];
};

// PAYMENT_MODE=dummy switches checkout to the built-in demo gateway (no real money moves)
const paymentMode = () => (process.env.PAYMENT_MODE === 'dummy' ? 'dummy' : 'razorpay');
const paymentsEnabled = () => paymentMode() === 'dummy' || razorpay.isConfigured();

const loadPublic = async (publicId) => {
  const booking = await BookingModel.findPublic(publicId);
  if (!booking) throw fail(404, 'Booking not found');
  return { ...booking, razorpay_key_id: booking.gateway === 'razorpay' ? razorpay.publicKeyId() || null : null };
};

// A paid booking takes seats: tell admins, tell website tabs to refresh seat counts,
// and email the confirmation to the customer and the office
const announcePaid = async (b) => {
  notifyAdmins('new_booking', { booking_no: b.booking_no, name: b.customer_name, total: Number(b.total) });
  publishSiteUpdate('availability');
  const full = await BookingModel.findPublic(b.public_id);
  if (full) sendBookingEmails(full);
};

// ── Public ────────────────────────────────────────────────────────────────

export const catalog = handle(async (_req, res) => {
  res.json({
    classes: await ClassModel.catalog(),
    plans: Object.entries(PLANS).map(([name, p]) => ({ name, price: p.price, months: p.months })),
    gstRate: GST_RATE,
    maxDaysAhead: MAX_BOOKING_DAYS_AHEAD,
    paymentsEnabled: paymentsEnabled(),
    paymentMode: paymentMode(),
  });
});

// Validates the cart against live prices/schedule/capacity and returns priced line items
const priceItems = async (items) => {
  if (!Array.isArray(items) || !items.length) throw fail(400, 'Your cart is empty');
  if (items.length > 20) throw fail(400, 'Too many items in one order');

  const classIds = [...new Set(items.filter((i) => i.type === 'class').map((i) => +i.class_id))];
  const classes = Object.fromEntries((await ClassModel.findActiveByIds(classIds)).map((c) => [c.id, c]));

  const now = new Date();
  const today = localDate(now);
  const lastDay = localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + MAX_BOOKING_DAYS_AHEAD));
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const lines = [];
  const wanted = {}; // seats requested per session across the whole cart
  for (const it of items) {
    if (it.type === 'plan') {
      const plan = PLANS[it.plan];
      if (!plan) throw fail(400, `Unknown plan: ${it.plan}`);
      lines.push({ item_type: 'plan', class_id: null, plan: it.plan, title: `${it.plan} Membership`, session_date: null, time_slot: null, qty: 1, unit_price: plan.price });
      continue;
    }
    if (it.type !== 'class') throw fail(400, 'Invalid cart item');

    const cls = classes[+it.class_id];
    if (!cls) throw fail(400, 'A class in your cart is no longer available');
    const qty = Number.parseInt(it.qty, 10);
    if (!(qty >= 1 && qty <= 10)) throw fail(400, 'You can book 1 to 10 people per session');
    const date = String(it.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today || date > lastDay)
      throw fail(400, `${cls.name}: choose a date within the next ${MAX_BOOKING_DAYS_AHEAD} days`);
    const weekday = DAYS[new Date(`${date}T00:00:00`).getDay()];
    if (!csvList(cls.days).includes(weekday)) throw fail(400, `${cls.name} does not run on ${weekday}`);
    if (!csvList(cls.time_slots).includes(it.time)) throw fail(400, `${cls.name} has no ${it.time} session`);
    if (date === today && slotMinutes(it.time) <= nowMin) throw fail(400, `${cls.name} at ${it.time} today has already started`);

    const key = `${cls.id}|${date}|${it.time}`;
    wanted[key] = (wanted[key] || 0) + qty;
    lines.push({ item_type: 'class', class_id: cls.id, plan: null, title: cls.name, session_date: date, time_slot: it.time, qty, unit_price: Number(cls.price), _key: key, _capacity: cls.capacity });
  }

  const keys = Object.keys(wanted);
  if (keys.length) {
    const booked = await BookingModel.bookedSeats([...new Set(keys.map((k) => +k.split('|')[0]))], [...new Set(keys.map((k) => k.split('|')[1]))]);
    for (const l of lines.filter((x) => x._key)) {
      const left = l._capacity - (booked[l._key] || 0);
      if (wanted[l._key] > left) throw fail(409, `${l.title} on ${l.session_date} at ${l.time_slot} has only ${Math.max(0, left)} spot(s) left`);
    }
  }

  return lines.map(({ _key, _capacity, ...l }) => ({ ...l, amount: round2(l.unit_price * l.qty) }));
};

export const create = handle(async (req, res) => {
  const { customer = {}, items } = req.body;
  // Checkout requires a website account; contact fields default to the account's details
  const account = await CustomerModel.findContact(req.user.id);
  if (!account) throw fail(401, 'Please log in again');
  const name = String(customer.name || account.name || '').trim();
  const email = String(customer.email || account.email || '').trim();
  const phone = String(customer.phone || account.phone || '').replace(/[\s-]/g, '');
  const notes = String(customer.notes || '').trim().slice(0, 500) || null;
  if (name.length < 2) throw fail(400, 'Please enter your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'Please enter a valid email');
  if (!/^\+?\d{10,15}$/.test(phone)) throw fail(400, 'Please enter a valid phone number');
  const lines = await priceItems(items);
  if (!paymentsEnabled()) throw fail(503, 'Online payment is not set up yet. Please try again later or call the gym.');

  const gateway = paymentMode();
  const subtotal = round2(lines.reduce((n, l) => n + l.amount, 0));
  const tax = round2(subtotal * GST_RATE);
  const total = round2(subtotal + tax);
  const publicId = crypto.randomBytes(16).toString('hex');

  const { id, bookingNo } = await BookingModel.createWithItems({
    public_id: publicId, customer_id: account.id, customer_name: name, customer_email: email, customer_phone: phone,
    notes, subtotal, tax, total, gateway,
  }, lines);

  if (gateway === 'dummy') {
    await BookingModel.setOrderId(id, `dummy_order_${crypto.randomBytes(8).toString('hex')}`);
  } else {
    // Create the Razorpay order last; if it fails, drop the unpayable booking
    try {
      const order = await razorpay.createOrder({ amount: total, receipt: bookingNo, notes: { booking_no: bookingNo } });
      await BookingModel.setOrderId(id, order.id);
    } catch (err) {
      await BookingModel.remove(id);
      throw fail(502, `Could not start payment: ${err.message}`);
    }
  }
  res.status(201).json({ public_id: publicId, booking_no: bookingNo, total });
});

export const getPublic = handle(async (req, res) => res.json(await loadPublic(req.params.publicId)));

export const verifyPayment = handle(async (req, res) => {
  const { public_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const b = await BookingModel.findByPublicId(public_id);
  if (!b) throw fail(404, 'Booking not found');
  if (b.status === 'paid') return res.json(await loadPublic(public_id));
  if (!['pending', 'failed'].includes(b.status)) throw fail(409, `This booking is ${b.status}`);
  if (b.gateway !== 'razorpay') throw fail(400, 'This booking is not a Razorpay payment');
  if (razorpay_order_id !== b.razorpay_order_id) throw fail(400, 'Payment does not belong to this booking');
  if (!razorpay.verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature }))
    throw fail(400, 'Payment signature verification failed');

  // Double-check with Razorpay that the money matches this order
  const payment = await razorpay.fetchPayment(razorpay_payment_id);
  if (payment.order_id !== b.razorpay_order_id || payment.amount !== Math.round(Number(b.total) * 100) || !['captured', 'authorized'].includes(payment.status))
    throw fail(400, 'Payment could not be confirmed');

  await BookingModel.markPaid(b.id, { paymentId: razorpay_payment_id, signature: razorpay_signature, method: payment.method });
  await announcePaid(b);
  res.json(await loadPublic(public_id));
});

// Demo gateway: the website's dummy checkout reports the simulated outcome here.
// Only bookings created in dummy mode can be settled this way, and only while dummy mode is on.
const DUMMY_METHODS = ['upi', 'card', 'netbanking', 'wallet'];
export const dummyPay = handle(async (req, res) => {
  const { public_id, method, outcome, detail } = req.body;
  if (paymentMode() !== 'dummy') throw fail(403, 'The demo payment gateway is switched off');
  if (!DUMMY_METHODS.includes(method)) throw fail(400, 'Choose a payment method');
  const b = await BookingModel.findByPublicId(public_id);
  if (!b) throw fail(404, 'Booking not found');
  if (b.gateway !== 'dummy') throw fail(400, 'This booking must be paid through Razorpay');
  if (b.status === 'paid') return res.json(await loadPublic(public_id));
  if (!['pending', 'failed'].includes(b.status)) throw fail(409, `This booking is ${b.status}`);

  const paymentId = `dummy_pay_${crypto.randomBytes(8).toString('hex')}`;
  if (outcome === 'success') {
    await BookingModel.markPaid(b.id, { paymentId, method });
    await announcePaid(b);
  } else {
    const reason = `Payment declined by the bank (demo)${detail ? ` · ${String(detail).slice(0, 60)}` : ''}`;
    await BookingModel.markFailed(b.id, { paymentId, method, reason });
  }
  res.json(await loadPublic(public_id));
});

export const recordFailure = handle(async (req, res) => {
  const { public_id, reason, razorpay_payment_id } = req.body;
  await BookingModel.recordFailure(public_id, { reason, paymentId: razorpay_payment_id });
  res.json({ ok: true });
});

// ── Admin ─────────────────────────────────────────────────────────────────

export const listAdmin = handle(async (req, res) => res.json(await BookingModel.listAdmin(listParams(req.query))));
export const items = handle(async (req, res) => res.json(await BookingModel.items(req.params.id)));

// Cancelling or deleting a paid booking frees seats on the website
export const { update, remove } = crud(BookingModel, { publicResource: 'availability' });
