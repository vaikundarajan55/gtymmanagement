import { Router } from 'express';
import { authenticateCustomer } from '../middleware/auth.js';
import * as customer from '../controllers/customerController.js';

// /api/customer — website customer accounts
const router = Router();

router.post('/register', customer.register);
router.post('/login', customer.login);
router.post('/forgot-password', customer.forgotPassword);
router.post('/reset-password', customer.resetPassword);

router.get('/me', authenticateCustomer, customer.getProfile);
router.put('/me', authenticateCustomer, customer.updateProfile);
router.put('/password', authenticateCustomer, customer.changePassword);
router.get('/dashboard', authenticateCustomer, customer.getDashboard);
router.get('/bookings', authenticateCustomer, customer.myBookings);
router.get('/bookings/:bookingNo', authenticateCustomer, customer.myBooking);

export default router;
