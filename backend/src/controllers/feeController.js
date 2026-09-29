import FeeModel from '../models/FeeModel.js';
import { crud } from './crudController.js';
import { handle, listParams } from '../utils/http.js';

export const list = handle(async (req, res) => res.json(await FeeModel.list(listParams(req.query))));
export const { create, update, remove } = crud(FeeModel);
