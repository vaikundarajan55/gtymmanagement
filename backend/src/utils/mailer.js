import nodemailer from 'nodemailer';
import GymModel from '../models/GymModel.js';

// SMTP settings come from .env. Without SMTP_HOST, emails are logged to the console instead of sent.
let transporter;
const getTransporter = () => {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  transporter = SMTP_HOST
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      })
    : null;
  return transporter;
};

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const gymInfo = async () => {
  try { return await GymModel.invoiceInfo(); } catch { return {}; }
};

// Office inbox: OFFICE_EMAIL, else the email saved in Admin → Gym Details
const officeEmail = async (gym) => process.env.OFFICE_EMAIL || gym.email || null;

const layout = (gym, title, body) => `
<div style="background:#f4f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#2563eb,#06b6d4,#10b981);padding:20px 24px;color:#fff">
      <div style="font-size:20px;font-weight:bold">${esc(gym.name || 'GymPro')}</div>
      <div style="font-size:14px;opacity:.9">${esc(title)}</div>
    </div>
    <div style="padding:24px;font-size:14px;line-height:1.6">${body}</div>
    <div style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px">
      ${esc(gym.address || '')}${gym.phone ? ` · ${esc(gym.phone)}` : ''}${gym.email ? ` · ${esc(gym.email)}` : ''}
    </div>
  </div>
</div>`;

const button = (url, label) =>
  `<p style="margin:24px 0"><a href="${esc(url)}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">${esc(label)}</a></p>`;

export const sendMail = async ({ to, subject, html, replyTo }) => {
  if (!to) return;
  const t = getTransporter();
  if (!t) {
    console.log(`[Email not sent — SMTP not configured] to=${to} subject="${subject}"`);
    return;
  }
  await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html, replyTo });
};

// Emails never block or fail the request that triggered them
const fireAndForget = (label, fn) => {
  Promise.resolve().then(fn).catch((err) => console.error(`[Email] ${label} failed:`, err.message));
};

// ── Templates ─────────────────────────────────────────────────────────────

export const sendWelcomeEmail = (customer) => fireAndForget('welcome', async () => {
  const gym = await gymInfo();
  await sendMail({
    to: customer.email,
    subject: `Welcome to ${gym.name || 'GymPro'}!`,
    html: layout(gym, 'Your account is ready', `
      <p>Hi ${esc(customer.name)},</p>
      <p>Thanks for registering. You can now book classes and memberships online and track them from your account.</p>
      <p><strong>Login email:</strong> ${esc(customer.email)}</p>
      <p>See you at the gym!</p>`),
  });
});

export const sendPasswordResetEmail = ({ name, email, url, minutes }) => fireAndForget('password reset', async () => {
  const gym = await gymInfo();
  await sendMail({
    to: email,
    subject: 'Reset your password',
    html: layout(gym, 'Password reset request', `
      <p>Hi ${esc(name || 'there')},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      ${button(url, 'Reset password')}
      <p style="color:#64748b">This link expires in ${minutes} minutes. If you didn't ask for this, you can ignore this email.</p>`),
  });
});

const itemsTable = (items = []) => `
  <table style="width:100%;border-collapse:collapse;margin:12px 0">
    <tr style="background:#f1f5f9;text-align:left">
      <th style="padding:8px">Item</th><th style="padding:8px">Session</th><th style="padding:8px;text-align:right">Qty</th><th style="padding:8px;text-align:right">Amount</th>
    </tr>
    ${items.map((i) => `
    <tr style="border-bottom:1px solid #e2e8f0">
      <td style="padding:8px">${esc(i.title)}</td>
      <td style="padding:8px">${i.session_date ? `${esc(i.session_date)} · ${esc(i.time_slot)}` : '—'}</td>
      <td style="padding:8px;text-align:right">${esc(i.qty)}</td>
      <td style="padding:8px;text-align:right">${money(i.amount)}</td>
    </tr>`).join('')}
  </table>`;

const totals = (b) => `
  <p style="text-align:right;margin:0">Subtotal: ${money(b.subtotal)}<br/>GST: ${money(b.tax)}<br/>
  <strong style="font-size:16px">Total paid: ${money(b.total)}</strong></p>`;

// booking = BookingModel.findPublic() result (includes items)
export const sendBookingEmails = (booking) => fireAndForget('booking', async () => {
  const gym = await gymInfo();
  const office = await officeEmail(gym);

  await Promise.all([
    sendMail({
      to: booking.customer_email,
      subject: `Booking confirmed — ${booking.booking_no}`,
      html: layout(gym, 'Booking confirmation', `
        <p>Hi ${esc(booking.customer_name)},</p>
        <p>Your payment was successful and your booking <strong>${esc(booking.booking_no)}</strong> is confirmed.</p>
        ${itemsTable(booking.items)}
        ${totals(booking)}
        <p>Please arrive 10 minutes before your session. See you soon!</p>`),
    }),
    office && sendMail({
      to: office,
      replyTo: booking.customer_email,
      subject: `New booking ${booking.booking_no} — ${booking.customer_name}`,
      html: layout(gym, 'New booking received', `
        <p>A new booking has been paid on the website.</p>
        <p><strong>Booking:</strong> ${esc(booking.booking_no)}<br/>
           <strong>Customer:</strong> ${esc(booking.customer_name)}<br/>
           <strong>Email:</strong> ${esc(booking.customer_email)}<br/>
           <strong>Phone:</strong> ${esc(booking.customer_phone)}<br/>
           ${booking.payment_method ? `<strong>Payment method:</strong> ${esc(booking.payment_method)}<br/>` : ''}
           ${booking.notes ? `<strong>Notes:</strong> ${esc(booking.notes)}` : ''}</p>
        ${itemsTable(booking.items)}
        ${totals(booking)}`),
    }),
  ]);
});
