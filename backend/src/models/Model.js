import { query, paginate } from '../config/db.js';
import { fail } from '../utils/http.js';

// Base model for a table managed from the admin panel. Only whitelisted `fields` are ever written.
//   table     – SQL table name
//   fields    – columns an admin form may set
//   required  – columns that must be present on create and cannot be cleared on update
//   normalise – optional (data) => errorMessage|null hook that cleans values in place
//   amountCol – column summed in stats() (defaults to `amount` when it is a field)
export default class Model {
  constructor({ table, fields, required = [], normalise = null, amountCol = null }) {
    Object.assign(this, { table, fields, required, normalise });
    this.amountCol = amountCol || (fields.includes('amount') ? 'amount' : null);
  }

  query(sql, params) { return query(sql, params); }
  paginate(sql, params, page, limit) { return paginate(sql, params, page, limit); }

  // Empty strings from forms are stored as NULL
  pick(body) {
    return Object.fromEntries(this.fields.filter((f) => f in body).map((f) => [f, body[f] === '' ? null : body[f]]));
  }

  validate(data, { creating }) {
    const invalid = this.normalise?.(data);
    if (invalid) throw fail(400, invalid);
    const missing = this.required.filter((f) => (creating ? data[f] == null : f in data && data[f] == null));
    if (missing.length) throw fail(400, `Required: ${missing.join(', ')}`);
  }

  async findById(id) {
    const [row] = await query(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
    return row || null;
  }

  async create(body) {
    const data = this.pick(body);
    this.validate(data, { creating: true });
    const cols = Object.keys(data);
    const result = await query(
      `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      Object.values(data)
    );
    return result.insertId;
  }

  async update(id, body) {
    const data = this.pick(body);
    this.validate(data, { creating: false });
    const cols = Object.keys(data);
    if (!cols.length) throw fail(400, 'Nothing to update');
    const result = await query(
      `UPDATE ${this.table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...Object.values(data), id]
    );
    if (!result.affectedRows) throw fail(404, 'Record not found');
  }

  async remove(id) {
    const result = await query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    if (!result.affectedRows) throw fail(404, 'Record not found');
  }

  // Counts (and amount totals where the table has one) grouped by status, for page metric cards
  async stats() {
    const col = this.amountCol;
    const rows = await query(
      `SELECT status, COUNT(*) AS count${col ? `, COALESCE(SUM(${col}), 0) AS amount` : ''} FROM ${this.table} GROUP BY status`
    );
    return {
      total: rows.reduce((n, r) => n + r.count, 0),
      amount: rows.reduce((n, r) => n + Number(r.amount || 0), 0),
      byStatus: Object.fromEntries(rows.map((r) => [r.status, { count: r.count, amount: Number(r.amount || 0) }])),
    };
  }
}
