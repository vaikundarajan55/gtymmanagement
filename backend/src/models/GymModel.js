import { query } from '../config/db.js';

// Single-row settings table (id = 1): update only
export const GYM_FIELDS = [
  'name', 'tagline', 'phone', 'email', 'address', 'gstin', 'weekday_hours', 'saturday_hours', 'sunday_hours',
  'about_heading', 'about_story', 'mission', 'vision', 'core_values', 'founded_year',
  'members_count', 'trainers_count', 'machines_count',
];

const GymModel = {
  async get() {
    const [gym] = await query('SELECT * FROM gym_settings WHERE id = 1');
    return gym || {};
  },

  // Upsert keeps "update only" semantics even if the row was removed manually
  async save(data) {
    const cols = Object.keys(data);
    await query(
      `INSERT INTO gym_settings (id, ${cols.join(', ')}) VALUES (1, ${cols.map(() => '?').join(', ')})
       ON DUPLICATE KEY UPDATE ${cols.map((c) => `${c} = VALUES(${c})`).join(', ')}`,
      Object.values(data)
    );
    return this.get();
  },

  // Seller block printed on invoices
  async invoiceInfo() {
    const [gym] = await query('SELECT name, address, phone, email, gstin FROM gym_settings WHERE id = 1');
    return gym || {};
  },
};

export default GymModel;
