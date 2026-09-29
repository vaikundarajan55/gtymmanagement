import MemberModel from '../models/MemberModel.js';
import { crud } from './crudController.js';
import { handle, listParams } from '../utils/http.js';

export const list = handle(async (req, res) => res.json(await MemberModel.list(listParams(req.query))));
export const birthdays = handle(async (_req, res) => res.json(await MemberModel.birthdaysThisMonth()));
export const { create, update, remove } = crud(MemberModel);
