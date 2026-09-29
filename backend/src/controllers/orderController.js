import OrderModel from '../models/OrderModel.js';
import { crud } from './crudController.js';
import { handle, listParams } from '../utils/http.js';

export const list = handle(async (req, res) => res.json(await OrderModel.list(listParams(req.query))));
export const { create, update, remove } = crud(OrderModel);
