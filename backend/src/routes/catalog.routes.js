import { Router } from 'express';
import * as bookings from '../controllers/bookingController.js';

// /api/catalog — public: bookable classes, plan prices, GST and payment mode
const router = Router();

router.get('/', bookings.catalog);

export default router;
