import ClassModel, { csvList } from '../models/ClassModel.js';
import BookingModel from '../models/BookingModel.js';
import { crud } from './crudController.js';
import { handle, fail, listParams } from '../utils/http.js';

export const listAdmin = handle(async (req, res) => res.json(await ClassModel.listAdmin(listParams(req.query))));

// Public: seats left per time slot on a date
export const availability = handle(async (req, res) => {
  const { date } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw fail(400, 'date must be YYYY-MM-DD');
  const cls = await ClassModel.findActive(req.params.id);
  if (!cls) throw fail(404, 'Class not found');
  const booked = await BookingModel.bookedSeats([cls.id], [date]);
  res.json(Object.fromEntries(csvList(cls.time_slots).map((s) => [s, Math.max(0, cls.capacity - (booked[`${cls.id}|${date}|${s}`] || 0))])));
});

// The booking page and timetable refresh as soon as a class is added, edited or hidden
export const { create, update, remove } = crud(ClassModel, { publicResource: 'classes' });
