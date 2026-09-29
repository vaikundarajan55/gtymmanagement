import pool, { query, paginate } from '../config/db.js';
import Model from './Model.js';

const PUBLIC_COLUMNS = `id, booking_no, public_id, customer_name, customer_email, customer_phone, notes, subtotal, tax, total, status, gateway,
  razorpay_order_id, razorpay_payment_id, payment_method, failure_reason, paid_at, created_at`;

const ITEM_COLUMNS = `item_type, plan, title, DATE_FORMAT(session_date, '%Y-%m-%d') AS session_date, time_slot, qty, unit_price, amount`;

class BookingModel extends Model {
  constructor() {
    // Bookings are created by customers at checkout; admins only change status/notes
    super({ table: 'bookings', required: [], fields: ['status', 'notes'], amountCol: 'total' });
  }

  // Seats already taken by paid bookings, keyed "classId|date|slot"
  async bookedSeats(classIds, dates) {
    if (!classIds.length || !dates.length) return {};
    const rows = await query(
      `SELECT bi.class_id, DATE_FORMAT(bi.session_date, '%Y-%m-%d') AS d, bi.time_slot, SUM(bi.qty) AS n
       FROM booking_items bi JOIN bookings b ON b.id = bi.booking_id
       WHERE b.status = 'paid' AND bi.class_id IN (${classIds.map(() => '?').join(',')})
         AND bi.session_date IN (${dates.map(() => '?').join(',')})
       GROUP BY bi.class_id, d, bi.time_slot`,
      [...classIds, ...dates]
    );
    return Object.fromEntries(rows.map((r) => [`${r.class_id}|${r.d}|${r.time_slot}`, Number(r.n)]));
  }

  // Inserts the booking and its line items in one transaction; returns { id, bookingNo }
  async createWithItems(booking, lines) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [ins] = await conn.execute(
        `INSERT INTO bookings (public_id, customer_id, customer_name, customer_email, customer_phone, notes, subtotal, tax, total, status, gateway)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [booking.public_id, booking.customer_id, booking.customer_name, booking.customer_email, booking.customer_phone,
          booking.notes, booking.subtotal, booking.tax, booking.total, booking.gateway]
      );
      const id = ins.insertId;
      const bookingNo = `GP${String(new Date().getFullYear()).slice(2)}${String(id).padStart(6, '0')}`;
      for (const l of lines) {
        await conn.execute(
          `INSERT INTO booking_items (booking_id, item_type, class_id, plan, title, session_date, time_slot, qty, unit_price, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, l.item_type, l.class_id, l.plan, l.title, l.session_date, l.time_slot, l.qty, l.unit_price, l.amount]
        );
      }
      await conn.execute('UPDATE bookings SET booking_no = ? WHERE id = ?', [bookingNo, id]);
      await conn.commit();
      return { id, bookingNo };
    } catch (err) {
      await conn.rollback().catch(() => {});
      throw err;
    } finally {
      conn.release();
    }
  }

  setOrderId(id, orderId) {
    return query('UPDATE bookings SET razorpay_order_id = ? WHERE id = ?', [orderId, id]);
  }

  async findByPublicId(publicId) {
    const [row] = await query('SELECT * FROM bookings WHERE public_id = ?', [publicId]);
    return row || null;
  }

  // Booking as shown on the payment/confirmation pages (by unguessable public id)
  async findPublic(publicId) {
    const [b] = await query(`SELECT ${PUBLIC_COLUMNS} FROM bookings WHERE public_id = ?`, [publicId]);
    if (!b) return null;
    // Class duration/trainer power the confirmation page's session tickets and calendar links
    const items = await query(
      `SELECT bi.item_type, bi.plan, bi.title, DATE_FORMAT(bi.session_date, '%Y-%m-%d') AS session_date, bi.time_slot, bi.qty,
              bi.unit_price, bi.amount, c.duration_min, t.name AS trainer_name
       FROM booking_items bi
       LEFT JOIN classes c ON c.id = bi.class_id
       LEFT JOIN trainers t ON t.id = c.trainer_id
       WHERE bi.booking_id = ? ORDER BY bi.id`,
      [b.id]
    );
    const { id, ...rest } = b;
    return { ...rest, items };
  }

  markPaid(id, { paymentId, signature = null, method }) {
    return query(
      `UPDATE bookings SET status = 'paid', razorpay_payment_id = ?, razorpay_signature = COALESCE(?, razorpay_signature),
              payment_method = ?, failure_reason = NULL, paid_at = NOW()
       WHERE id = ?`,
      [paymentId, signature, method || null, id]
    );
  }

  markFailed(id, { paymentId, method, reason }) {
    return query(
      `UPDATE bookings SET status = 'failed', razorpay_payment_id = ?, payment_method = ?, failure_reason = ? WHERE id = ?`,
      [paymentId, method, reason, id]
    );
  }

  // Reported by the browser when the Razorpay popup fails; never downgrades a paid booking
  recordFailure(publicId, { reason, paymentId }) {
    return query(
      `UPDATE bookings SET status = 'failed', failure_reason = ?, razorpay_payment_id = COALESCE(?, razorpay_payment_id)
       WHERE public_id = ? AND status IN ('pending', 'failed')`,
      [String(reason || 'Payment failed').slice(0, 255), paymentId || null, publicId]
    );
  }

  // ── Admin ──
  listAdmin({ like, page, limit }) {
    return paginate(
      `SELECT b.id, b.booking_no, b.customer_name, b.customer_email, b.customer_phone, b.notes, b.subtotal, b.tax, b.total,
              b.status, b.gateway, b.payment_method, b.razorpay_payment_id, b.failure_reason, b.paid_at, b.created_at,
              (SELECT GROUP_CONCAT(bi.title ORDER BY bi.id SEPARATOR ', ') FROM booking_items bi WHERE bi.booking_id = b.id) AS items_summary,
              (SELECT COALESCE(SUM(bi.qty), 0) FROM booking_items bi WHERE bi.booking_id = b.id) AS items_qty
       FROM bookings b
       WHERE b.booking_no LIKE ? OR b.customer_name LIKE ? OR b.customer_phone LIKE ? OR b.customer_email LIKE ? OR b.status LIKE ?
       ORDER BY b.id DESC`,
      [like, like, like, like, like], page, limit
    );
  }

  items(bookingId) {
    return query(`SELECT ${ITEM_COLUMNS} FROM booking_items WHERE booking_id = ? ORDER BY id`, [bookingId]);
  }

  // ── Customer account ──
  async customerSummary(customerId) {
    const [totals] = await query(
      `SELECT COUNT(*) AS bookings,
              SUM(status = 'paid') AS paid,
              SUM(status IN ('pending','failed')) AS unpaid,
              COALESCE(SUM(CASE WHEN status = 'paid' THEN total END), 0) AS spent
       FROM bookings WHERE customer_id = ?`, [customerId]
    );
    const upcoming = await query(
      `SELECT b.booking_no, bi.title, DATE_FORMAT(bi.session_date, '%Y-%m-%d') AS session_date, bi.time_slot, bi.qty
       FROM booking_items bi JOIN bookings b ON b.id = bi.booking_id
       WHERE b.customer_id = ? AND b.status = 'paid' AND bi.item_type = 'class' AND bi.session_date >= CURDATE()
       ORDER BY bi.session_date, STR_TO_DATE(bi.time_slot, '%l:%i %p') LIMIT 5`, [customerId]
    );
    const [{ sessions }] = await query(
      `SELECT COALESCE(SUM(bi.qty), 0) AS sessions FROM booking_items bi JOIN bookings b ON b.id = bi.booking_id
       WHERE b.customer_id = ? AND b.status = 'paid' AND bi.item_type = 'class' AND bi.session_date >= CURDATE()`, [customerId]
    );
    const recent = await query(
      'SELECT booking_no, public_id, total, status, created_at FROM bookings WHERE customer_id = ? ORDER BY id DESC LIMIT 5', [customerId]
    );
    return {
      bookings: Number(totals.bookings || 0), paid: Number(totals.paid || 0), unpaid: Number(totals.unpaid || 0),
      spent: Number(totals.spent || 0), upcomingSessions: Number(sessions || 0), upcoming, recent,
    };
  }

  listForCustomer(customerId, status) {
    return query(
      `SELECT b.booking_no, b.public_id, b.total, b.status, b.gateway, b.payment_method, b.paid_at, b.created_at,
              (SELECT GROUP_CONCAT(bi.title ORDER BY bi.id SEPARATOR ', ') FROM booking_items bi WHERE bi.booking_id = b.id) AS items_summary,
              (SELECT MIN(bi.session_date) FROM booking_items bi WHERE bi.booking_id = b.id AND bi.session_date >= CURDATE()) AS next_session
       FROM bookings b WHERE b.customer_id = ? ${status ? 'AND b.status = ?' : ''} ORDER BY b.id DESC`,
      status ? [customerId, status] : [customerId]
    );
  }

  async findForCustomer(bookingNo, customerId) {
    const [b] = await query(
      `SELECT id, booking_no, public_id, customer_name, customer_email, customer_phone, notes, subtotal, tax, total, status, gateway,
              razorpay_payment_id AS payment_id, payment_method, failure_reason, paid_at, created_at
       FROM bookings WHERE booking_no = ? AND customer_id = ?`,
      [bookingNo, customerId]
    );
    if (!b) return null;
    const { id, ...booking } = b;
    return { ...booking, items: await this.items(id) };
  }
}

export default new BookingModel();
