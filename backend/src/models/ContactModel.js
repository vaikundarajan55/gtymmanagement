import Model from './Model.js';
import { fail } from '../utils/http.js';

class ContactModel extends Model {
  constructor() {
    super({
      table: 'contacts',
      required: ['name', 'message'],
      fields: ['name', 'email', 'phone', 'subject', 'message', 'status'],
    });
  }

  list({ page, limit }) {
    return this.paginate('SELECT * FROM contacts ORDER BY id DESC', [], page, limit);
  }

  // Website contact form
  async submit({ name, email, phone, subject, message }) {
    if (!String(name || '').trim() || !String(message || '').trim()) throw fail(400, 'Please enter your name and message');
    const result = await this.query(
      'INSERT INTO contacts (name, email, phone, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, "unread", NOW())',
      [name, email, phone, subject, message].map((v) => v ?? null)
    );
    return result.insertId;
  }
}

export default new ContactModel();
