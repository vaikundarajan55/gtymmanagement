import Model from './Model.js';
import { fail } from '../utils/http.js';

class MemberModel extends Model {
  constructor() {
    super({
      table: 'members',
      required: ['name', 'phone'],
      fields: ['name', 'email', 'phone', 'dob', 'address', 'plan', 'trainer_id', 'status', 'join_date'],
    });
  }

  list({ like, page, limit }) {
    return this.paginate(
      `SELECT m.*, t.name AS trainer_name FROM members m LEFT JOIN trainers t ON m.trainer_id = t.id
       WHERE m.name LIKE ? OR m.email LIKE ? OR m.phone LIKE ? ORDER BY m.id DESC`,
      [like, like, like], page, limit
    );
  }

  birthdaysThisMonth() {
    return this.query(
      `SELECT id, name, phone, plan, dob FROM members
       WHERE MONTH(dob) = MONTH(NOW()) AND status = "active"
       ORDER BY DAY(dob) ASC`
    );
  }

  options() {
    return this.query('SELECT id, name, phone FROM members ORDER BY name');
  }

  // The schema has no enforced foreign keys, so guard linked rows here
  async remove(id) {
    const [{ n }] = await this.query(
      'SELECT (SELECT COUNT(*) FROM fees WHERE member_id = ?) + (SELECT COUNT(*) FROM orders WHERE member_id = ?) AS n', [id, id]
    );
    if (n > 0) throw fail(409, 'This member has fee or order records. Delete those first, or mark the member inactive.');
    await super.remove(id);
  }
}

export default new MemberModel();
