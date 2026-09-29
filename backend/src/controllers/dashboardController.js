import DashboardModel from '../models/DashboardModel.js';
import TrainerModel from '../models/TrainerModel.js';
import MemberModel from '../models/MemberModel.js';
import FeeModel from '../models/FeeModel.js';
import OrderModel from '../models/OrderModel.js';
import ContactModel from '../models/ContactModel.js';
import EnquiryModel from '../models/EnquiryModel.js';
import ClassModel from '../models/ClassModel.js';
import BookingModel from '../models/BookingModel.js';
import BannerModel from '../models/BannerModel.js';
import { handle, fail } from '../utils/http.js';

// /stats/:resource names used by the admin pages' metric cards
const STATS = {
  trainers: TrainerModel, users: MemberModel, fees: FeeModel, orders: OrderModel, contacts: ContactModel,
  enquiries: EnquiryModel, classes: ClassModel, bookings: BookingModel, banners: BannerModel,
};

export const getDashboard = handle(async (_req, res) => res.json(await DashboardModel.summary()));

// Day-wise (last 7 days) and month-wise (last 12 months) collections for the dashboard charts
export const getCharts = handle(async (_req, res) => res.json(await DashboardModel.charts()));

export const getStats = handle(async (req, res) => {
  const model = STATS[req.params.resource];
  if (!model) throw fail(404, 'Unknown resource');
  res.json(await model.stats());
});

// Small id/name lists for dropdowns in admin forms
export const getOptions = handle(async (_req, res) => {
  const [trainers, members] = await Promise.all([TrainerModel.options(), MemberModel.options()]);
  res.json({ trainers, members });
});
