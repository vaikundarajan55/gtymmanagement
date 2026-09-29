import { query } from '../config/db.js';

const AdminModel = {
  async findByEmail(email) {
    const [row] = await query('SELECT * FROM admins WHERE email = ?', [email]);
    return row || null;
  },

  async findById(id) {
    const [row] = await query('SELECT * FROM admins WHERE id = ?', [id]);
    return row || null;
  },

  updatePassword(id, hash) {
    return query('UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?', [hash, id]);
  },
};

export default AdminModel;
