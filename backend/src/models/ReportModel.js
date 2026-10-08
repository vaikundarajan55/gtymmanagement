import { query, paginate } from '../config/db.js';

// A fee belongs to the report date it was paid on, or its due date while still unpaid
const REPORT_DATE = 'COALESCE(f.paid_date, f.due_date)';

const FROM = `FROM fees f
  LEFT JOIN members m ON m.id = f.member_id
  LEFT JOIN trainers t ON t.id = m.trainer_id`;

// Builds the shared WHERE clause from the validated filters
const where = ({ from, to, month, year, trainerId }) => {
  const conds = [];
  const params = [];
  if (from) { conds.push(`${REPORT_DATE} >= ?`); params.push(from); }
  if (to) { conds.push(`${REPORT_DATE} <= ?`); params.push(to); }
  if (month) { conds.push(`MONTH(${REPORT_DATE}) = ?`); params.push(month); }
  if (year) { conds.push(`YEAR(${REPORT_DATE}) = ?`); params.push(year); }
  if (trainerId === 'none') conds.push('m.trainer_id IS NULL');
  else if (trainerId) { conds.push('m.trainer_id = ?'); params.push(trainerId); }
  return { sql: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
};

class ReportModel {
  // Fee collections per member, with their trainer, filtered by date range / month / year / trainer
  async fees(filters, page, limit) {
    const w = where(filters);
    const list = await paginate(
      `SELECT f.id, f.plan, f.amount, f.status, f.payment_mode, f.receipt_no,
              DATE_FORMAT(f.paid_date, '%Y-%m-%d') AS paid_date, DATE_FORMAT(f.due_date, '%Y-%m-%d') AS due_date,
              m.name AS member_name, m.phone AS member_phone, t.name AS trainer_name
       ${FROM} ${w.sql}
       ORDER BY ${REPORT_DATE} DESC, f.id DESC`,
      w.params, page, limit
    );
    const [s] = await query(
      `SELECT COUNT(*) AS records,
              COUNT(DISTINCT f.member_id) AS members,
              COALESCE(SUM(CASE WHEN f.status = 'paid' THEN f.amount END), 0) AS collected,
              COALESCE(SUM(CASE WHEN f.status <> 'paid' THEN f.amount END), 0) AS outstanding
       ${FROM} ${w.sql}`,
      w.params
    );
    return {
      ...list,
      summary: { records: Number(s.records), members: Number(s.members), collected: Number(s.collected), outstanding: Number(s.outstanding) },
    };
  }
}

export default new ReportModel();
