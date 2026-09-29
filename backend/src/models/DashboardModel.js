import { query } from '../config/db.js';

const one = async (sql) => Object.values((await query(sql))[0])[0];

const DashboardModel = {
  async summary() {
    const [totalUsers, totalTrainers, revenue, feesDue, totalOrders, birthdaysToday, newEnquiries] = await Promise.all([
      one('SELECT COUNT(*) FROM members WHERE status = "active"'),
      one('SELECT COUNT(*) FROM trainers WHERE status = "active"'),
      one('SELECT COALESCE(SUM(amount),0) FROM fees WHERE MONTH(paid_date) = MONTH(NOW()) AND YEAR(paid_date) = YEAR(NOW()) AND status = "paid"'),
      one('SELECT COUNT(*) FROM fees WHERE status IN ("pending","overdue")'),
      one('SELECT COUNT(*) FROM orders WHERE MONTH(order_date) = MONTH(NOW())'),
      one('SELECT COUNT(*) FROM members WHERE DAY(dob) = DAY(NOW()) AND MONTH(dob) = MONTH(NOW())'),
      one('SELECT COUNT(*) FROM enquiries WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'),
    ]);
    return { totalUsers, totalTrainers, revenue, feesDue, totalOrders, birthdaysToday, newEnquiries };
  },

  // Money collected = paid gym fees + paid online bookings.
  //   daily   – last 7 days (oldest first), for the day-wise pie chart
  //   monthly – last 12 months (oldest first), for the month-wise line chart
  // Keys are built from the database's CURDATE() so they match the dates stored by MySQL.
  async charts() {
    const [{ today }] = await query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today");
    const [dailyRows, monthlyRows] = await Promise.all([
      query(
        `SELECT d, SUM(fees) AS fees, SUM(online) AS online, SUM(n) AS payments FROM (
           SELECT DATE_FORMAT(paid_date, '%Y-%m-%d') AS d, amount AS fees, 0 AS online, 1 AS n
           FROM fees WHERE status = 'paid' AND paid_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
           UNION ALL
           SELECT DATE_FORMAT(paid_at, '%Y-%m-%d'), 0, total, 1
           FROM bookings WHERE status = 'paid' AND paid_at >= CURDATE() - INTERVAL 6 DAY AND paid_at < CURDATE() + INTERVAL 1 DAY
         ) x GROUP BY d`
      ),
      query(
        `SELECT m, SUM(fees) AS fees, SUM(online) AS online FROM (
           SELECT DATE_FORMAT(paid_date, '%Y-%m') AS m, amount AS fees, 0 AS online
           FROM fees WHERE status = 'paid' AND paid_date >= DATE_FORMAT(CURDATE() - INTERVAL 11 MONTH, '%Y-%m-01') AND paid_date <= CURDATE()
           UNION ALL
           SELECT DATE_FORMAT(paid_at, '%Y-%m'), 0, total
           FROM bookings WHERE status = 'paid' AND paid_at >= DATE_FORMAT(CURDATE() - INTERVAL 11 MONTH, '%Y-%m-01')
         ) x GROUP BY m`
      ),
    ]);

    const byKey = (rows, key) => Object.fromEntries(rows.map((r) => [r[key], r]));
    const days = byKey(dailyRows, 'd');
    const months = byKey(monthlyRows, 'm');
    const base = new Date(`${today}T00:00:00Z`);
    const iso = (dt) => dt.toISOString().slice(0, 10);

    const daily = Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(base); dt.setUTCDate(base.getUTCDate() - (6 - i));
      const r = days[iso(dt)];
      return { date: iso(dt), fees: Number(r?.fees || 0), online: Number(r?.online || 0), payments: Number(r?.payments || 0) };
    });
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const dt = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - (11 - i), 1));
      const key = iso(dt).slice(0, 7);
      const r = months[key];
      return { month: key, fees: Number(r?.fees || 0), online: Number(r?.online || 0) };
    });
    return { today, daily, monthly };
  },
};

export default DashboardModel;
