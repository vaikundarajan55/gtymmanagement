import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'admin_gym_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30',
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// limit of 'all' (arrives as NaN) or <= 0 returns every row on one page
export const paginate = async (sql, params = [], page = 1, limit = 10) => {
  if (!(limit > 0)) {
    const [rows] = await pool.execute(sql, params);
    return {
      data: rows,
      pagination: { page: 1, limit: 'all', total: rows.length, totalPages: 1 },
    };
  }
  page = page > 0 ? page : 1;
  const offset = (page - 1) * limit;
  const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS t`;
  const [countRows] = await pool.execute(countSql, params);
  const total = countRows[0].total;
  const [rows] = await pool.execute(`${sql} LIMIT ? OFFSET ?`, [...params, limit, offset]);
  return {
    data: rows,
    pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export default pool;
