import MembershipModel from '../models/MembershipModel.js';
import { handle, listParams } from '../utils/http.js';

// Members whose plan period has ended (filter=completed) or ends within 7 days (filter=expiring)
export const completed = handle(async (req, res) => {
  res.json(await MembershipModel.list({ ...listParams(req.query), filter: req.query.filter || 'completed' }));
});

export const stats = handle(async (_req, res) => res.json(await MembershipModel.stats()));
