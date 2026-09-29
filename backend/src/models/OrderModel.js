import Model from './Model.js';

class OrderModel extends Model {
  constructor() {
    super({
      table: 'orders',
      required: ['member_id', 'product_name', 'amount'],
      fields: ['member_id', 'product_name', 'quantity', 'amount', 'status', 'order_date'],
    });
  }

  list({ like, page, limit }) {
    return this.paginate(
      `SELECT o.*, m.name AS customer_name FROM orders o JOIN members m ON o.member_id = m.id
       WHERE m.name LIKE ? OR o.product_name LIKE ? OR o.status LIKE ? ORDER BY o.id DESC`,
      [like, like, like], page, limit
    );
  }
}

export default new OrderModel();
