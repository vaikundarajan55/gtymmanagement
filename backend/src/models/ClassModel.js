import Model from './Model.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const csvList = (csv) => String(csv || '').split(',').map((s) => s.trim()).filter(Boolean);

// Class schedules are free text in the admin form; normalise them so the booking page can parse them
function normaliseClass(data) {
  if (data.days != null) {
    const days = String(data.days).split(',').map((d) => d.trim().slice(0, 3).toLowerCase()).filter(Boolean)
      .map((d) => WEEKDAYS.find((w) => w.toLowerCase() === d));
    if (!days.length || days.includes(undefined)) return 'Days must be a comma list like Mon,Wed,Fri';
    data.days = WEEKDAYS.filter((w) => days.includes(w)).join(',');
  }
  if (data.time_slots != null) {
    const slots = String(data.time_slots).split(',').map((t) => t.trim().toUpperCase().replace(/\s+/g, ' ')).filter(Boolean)
      .map((t) => { const m = /^(\d{1,2}):(\d{2}) ?(AM|PM)$/.exec(t); return m && +m[1] >= 1 && +m[1] <= 12 && +m[2] < 60 ? `${+m[1]}:${m[2]} ${m[3]}` : null; });
    if (!slots.length || slots.includes(null)) return 'Times must be a comma list like 6:00 AM,6:30 PM';
    data.time_slots = [...new Set(slots)].join(',');
  }
  if (data.slug != null) {
    data.slug = String(data.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!data.slug) return 'Slug must contain letters or numbers';
  }
  return null;
}

class ClassModel extends Model {
  constructor() {
    super({
      table: 'classes',
      required: ['name', 'slug', 'price', 'days', 'time_slots'],
      normalise: normaliseClass,
      fields: ['name', 'slug', 'category', 'level', 'price', 'duration_min', 'capacity', 'days', 'time_slots', 'trainer_id', 'description', 'status'],
    });
  }

  listAdmin({ like, page, limit }) {
    return this.paginate(
      `SELECT c.*, t.name AS trainer_name FROM classes c LEFT JOIN trainers t ON t.id = c.trainer_id
       WHERE c.name LIKE ? OR c.category LIKE ? OR c.slug LIKE ? ORDER BY c.id`,
      [like, like, like], page, limit
    );
  }

  // Website catalog: active classes with parsed days/time slots
  async catalog() {
    const rows = await this.query(
      `SELECT c.id, c.slug, c.name, c.category, c.level, c.price, c.duration_min, c.capacity, c.days, c.time_slots,
              c.description, t.name AS trainer_name
       FROM classes c LEFT JOIN trainers t ON t.id = c.trainer_id
       WHERE c.status = 'active' ORDER BY c.id`
    );
    return rows.map((c) => ({ ...c, price: Number(c.price), days: csvList(c.days), time_slots: csvList(c.time_slots) }));
  }

  async findActive(id) {
    const [row] = await this.query('SELECT * FROM classes WHERE id = ? AND status = "active"', [id]);
    return row || null;
  }

  findActiveByIds(ids) {
    if (!ids.length) return [];
    return this.query(`SELECT * FROM classes WHERE status = 'active' AND id IN (${ids.map(() => '?').join(',')})`, ids);
  }
}

export default new ClassModel();
