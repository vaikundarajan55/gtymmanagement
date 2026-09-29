import Model from './Model.js';

class TrainerModel extends Model {
  constructor() {
    super({
      table: 'trainers',
      required: ['name'],
      fields: ['name', 'email', 'phone', 'specialization', 'experience', 'salary', 'status', 'joined_date'],
    });
  }

  list({ like, page, limit }) {
    return this.paginate(
      'SELECT * FROM trainers WHERE name LIKE ? OR email LIKE ? OR specialization LIKE ? ORDER BY id DESC',
      [like, like, like], page, limit
    );
  }

  options() {
    return this.query('SELECT id, name FROM trainers ORDER BY name');
  }

  // Website "Meet the team": public columns only (no contact details or salary)
  team() {
    return this.query(
      `SELECT id, name, specialization, experience FROM trainers WHERE status = 'active' ORDER BY experience DESC, name`
    );
  }

  // Members keep their record when their trainer is removed
  async remove(id) {
    await this.query('UPDATE members SET trainer_id = NULL WHERE trainer_id = ?', [id]);
    await super.remove(id);
  }
}

export default new TrainerModel();
