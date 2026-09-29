import GymModel, { GYM_FIELDS } from '../models/GymModel.js';
import { handle, fail } from '../utils/http.js';
import { publishSiteUpdate } from '../utils/realtime.js';

// Public: every website page reads name, contact details, hours and About Us from here
export const get = handle(async (_req, res) => res.json(await GymModel.get()));

export const update = handle(async (req, res) => {
  const data = Object.fromEntries(
    GYM_FIELDS.filter((f) => f in req.body).map((f) => [f, req.body[f] === '' ? null : req.body[f]])
  );
  if ('name' in data && !data.name) throw fail(400, 'Gym name is required');
  if (!Object.keys(data).length) throw fail(400, 'Nothing to update');

  const gym = await GymModel.save(data);
  publishSiteUpdate('gym');
  res.json({ message: 'Gym details updated', gym });
});
