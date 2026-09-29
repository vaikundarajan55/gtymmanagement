import EnquiryModel from '../models/EnquiryModel.js';
import { crud } from './crudController.js';
import { handle, listParams } from '../utils/http.js';
import { notifyAdmins } from '../utils/realtime.js';

export const list = handle(async (req, res) => res.json(await EnquiryModel.list(listParams(req.query))));

// Public: website enquiry form
export const submit = handle(async (req, res) => {
  const id = await EnquiryModel.submit(req.body);
  notifyAdmins('new_enquiry', { id, name: req.body.name });
  res.status(201).json({ message: 'Enquiry submitted successfully', id });
});

export const { create, update, remove } = crud(EnquiryModel);
