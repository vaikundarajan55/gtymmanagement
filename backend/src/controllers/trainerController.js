import TrainerModel from '../models/TrainerModel.js';
import { crud } from './crudController.js';
import { handle, listParams } from '../utils/http.js';

export const list = handle(async (req, res) => res.json(await TrainerModel.list(listParams(req.query))));

// Public: website "Meet the team"
export const team = handle(async (_req, res) => res.json(await TrainerModel.team()));

// Trainer names/experience appear on the website (team, class coach), so changes are published
export const { create, update, remove } = crud(TrainerModel, { publicResource: 'trainers' });
