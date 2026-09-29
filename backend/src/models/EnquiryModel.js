import Model from './Model.js';
import { fail } from '../utils/http.js';

class EnquiryModel extends Model {
  constructor() {
    super({
      table: 'enquiries',
      required: ['name'],
      fields: ['name', 'email', 'phone', 'interest', 'plan', 'message', 'source', 'status'],
    });
  }

  list({ page, limit }) {
    return this.paginate('SELECT * FROM enquiries ORDER BY id DESC', [], page, limit);
  }

  // Website enquiry form
  async submit({ name, email, phone, interest, plan, message, source = 'Website' }) {
    if (!String(name || '').trim()) throw fail(400, 'Please enter your name');
    const result = await this.query(
      'INSERT INTO enquiries (name, email, phone, interest, plan, message, source, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, "new", NOW())',
      [name, email, phone, interest, plan, message, source].map((v) => v ?? null)
    );
    return result.insertId;
  }
}

export default new EnquiryModel();
