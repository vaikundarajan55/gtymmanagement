import { query } from '../config/db.js';

// Website customer accounts. Password hashes and reset tokens never leave this model
// except through the explicit *Hash/*Reset helpers used by the auth controller.
const PUBLIC_FIELDS = 'id, name, email, phone, gender, DATE_FORMAT(dob, "%Y-%m-%d") AS dob, address, city, created_at, last_login_at';

const first = async (sql, params) => (await query(sql, params))[0] || null;

const CustomerModel = {
  findPublic: (id) => first(`SELECT ${PUBLIC_FIELDS} FROM customers WHERE id = ?`, [id]),
  findContact: (id) => first('SELECT id, name, email, phone FROM customers WHERE id = ?', [id]),
  findByEmail: (email) => first('SELECT id, name FROM customers WHERE email = ?', [email]),
  findLogin: (email) => first('SELECT id, password FROM customers WHERE email = ?', [email]),
  passwordHash: async (id) => (await first('SELECT password FROM customers WHERE id = ?', [id]))?.password ?? null,

  async create({ name, email, phone, hash }) {
    const result = await query('INSERT INTO customers (name, email, phone, password, last_login_at) VALUES (?, ?, ?, ?, NOW())', [name, email, phone, hash]);
    return result.insertId;
  },

  touchLogin: (id) => query('UPDATE customers SET last_login_at = NOW() WHERE id = ?', [id]),

  update(id, data) {
    const cols = Object.keys(data);
    return query(`UPDATE customers SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [...Object.values(data), id]);
  },

  // Setting a password always invalidates any outstanding reset link
  setPassword: (id, hash) => query('UPDATE customers SET password = ?, reset_token_hash = NULL, reset_expires = NULL WHERE id = ?', [hash, id]),

  setResetToken: (id, tokenHash, minutes) =>
    query('UPDATE customers SET reset_token_hash = ?, reset_expires = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?', [tokenHash, minutes, id]),

  findByValidReset: (tokenHash) => first('SELECT id FROM customers WHERE reset_token_hash = ? AND reset_expires > NOW()', [tokenHash]),

  async billingAddress(id) {
    const c = await first('SELECT address, city FROM customers WHERE id = ?', [id]);
    return [c?.address, c?.city].filter(Boolean).join(', ');
  },
};

export default CustomerModel;
