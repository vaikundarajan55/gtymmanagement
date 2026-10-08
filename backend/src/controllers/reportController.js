import ReportModel from '../models/ReportModel.js';
import { handle, fail, listParams } from '../utils/http.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// ?from=&to=&month=&year=&trainer_id= — every filter is optional; trainer_id=none means unassigned members
const reportFilters = (q) => {
  const f = {};
  if (q.from) { if (!DATE.test(q.from)) throw fail(400, 'Invalid from date'); f.from = q.from; }
  if (q.to) { if (!DATE.test(q.to)) throw fail(400, 'Invalid to date'); f.to = q.to; }
  if (f.from && f.to && f.from > f.to) throw fail(400, 'From date must be before To date');
  if (q.month) {
    f.month = Number.parseInt(q.month, 10);
    if (!(f.month >= 1 && f.month <= 12)) throw fail(400, 'Invalid month');
  }
  if (q.year) {
    f.year = Number.parseInt(q.year, 10);
    if (!(f.year >= 2000 && f.year <= 2100)) throw fail(400, 'Invalid year');
  }
  if (q.trainer_id === 'none') f.trainerId = 'none';
  else if (q.trainer_id) {
    f.trainerId = Number.parseInt(q.trainer_id, 10);
    if (!(f.trainerId > 0)) throw fail(400, 'Invalid trainer');
  }
  return f;
};

export const fees = handle(async (req, res) => {
  const { page, limit } = listParams(req.query);
  res.json(await ReportModel.fees(reportFilters(req.query), page, limit));
});
