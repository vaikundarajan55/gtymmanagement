import { query, paginate } from '../config/db.js';

// A member's plan ends on the due date of their latest paid fee; members with
// no paid fee fall back to join date + plan length.
const PERIODS_SQL = `
  SELECT m.id, m.name, m.email, m.phone, m.plan, m.status, m.join_date, t.name AS trainer_name,
         f.last_paid, f.last_amount,
         COALESCE(f.last_due, DATE_ADD(m.join_date, INTERVAL
           CASE m.plan WHEN 'Monthly' THEN 1 WHEN 'Quarterly' THEN 3 WHEN 'Half-Yearly' THEN 6 ELSE 12 END MONTH)) AS end_date
  FROM members m
  LEFT JOIN trainers t ON t.id = m.trainer_id
  LEFT JOIN (
    SELECT fe.member_id, MAX(fe.due_date) AS last_due, MAX(fe.paid_date) AS last_paid,
           (SELECT f2.amount FROM fees f2 WHERE f2.member_id = fe.member_id AND f2.status = 'paid' ORDER BY f2.due_date DESC LIMIT 1) AS last_amount
    FROM fees fe WHERE fe.status = 'paid' GROUP BY fe.member_id
  ) f ON f.member_id = m.id`;

const FILTERS = {
  completed: 'end_date < CURDATE()',
  expiring: 'end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)',
};

const MembershipModel = {
  list({ filter, like, page, limit }) {
    const where = FILTERS[filter] || FILTERS.completed;
    return paginate(
      `SELECT p.*, DATEDIFF(CURDATE(), p.end_date) AS days_since_end
       FROM (${PERIODS_SQL}) p
       WHERE ${where} AND (p.name LIKE ? OR p.phone LIKE ? OR p.plan LIKE ?)
       ORDER BY p.end_date ${filter === 'expiring' ? 'ASC' : 'DESC'}`,
      [like, like, like], page, limit
    );
  },

  async stats() {
    const [row] = await query(
      `SELECT COUNT(*) AS total,
              SUM(end_date < CURDATE()) AS completed,
              SUM(end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)) AS expiring,
              SUM(end_date >= CURDATE()) AS running
       FROM (${PERIODS_SQL}) p`
    );
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v || 0)]));
  },
};

export default MembershipModel;
