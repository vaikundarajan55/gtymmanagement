import ContactModel from '../models/ContactModel.js';
import { crud } from './crudController.js';
import { handle, listParams } from '../utils/http.js';
import { notifyAdmins } from '../utils/realtime.js';

export const list = handle(async (req, res) => res.json(await ContactModel.list(listParams(req.query))));

// Public: website contact form
export const submit = handle(async (req, res) => {
  const id = await ContactModel.submit(req.body);
  notifyAdmins('new_contact', { id, name: req.body.name, email: req.body.email });
  res.status(201).json({ message: 'Message sent successfully', id });
});

export const { create, update, remove } = crud(ContactModel);
