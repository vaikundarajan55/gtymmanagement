import Model from './Model.js';

class FeeModel extends Model {
  constructor() {
    super({
      table: 'fees',
      required: ['member_id', 'amount'],
      fields: ['member_id', 'plan', 'amount', 'paid_date', 'due_date', 'status', 'payment_mode', 'receipt_no'],
    });
  }

  list({ like, page, limit }) {
    return this.paginate(
      `SELECT f.*, m.name AS member_name FROM fees f JOIN members m ON f.member_id = m.id
       WHERE m.name LIKE ? OR f.status LIKE ? ORDER BY f.id DESC`,
      [like, like], page, limit
    );
  }
}

export default new FeeModel();
