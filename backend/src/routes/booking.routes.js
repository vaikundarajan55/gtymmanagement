import { Router } from 'express';
import { authenticate, authenticateCustomer } from '../middleware/auth.js';
import * as bookings from '../controllers/bookingController.js';

// /api/bookings — website checkout/payment + admin booking management
const router = Router();

// Website
router.post('/', authenticateCustomer, bookings.create);
router.get('/public/:publicId', bookings.getPublic);
router.post('/verify', bookings.verifyPayment);
router.post('/failed', bookings.recordFailure);
router.post('/dummy-pay', bookings.dummyPay);

// Admin
router.get('/', authenticate, bookings.listAdmin);
router.get('/:id/items', authenticate, bookings.items);
router.put('/:id', authenticate, bookings.update);
router.delete('/:id', authenticate, bookings.remove);

export default router;
