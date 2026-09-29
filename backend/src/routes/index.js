import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import trainerRoutes from './trainer.routes.js';
import memberRoutes from './member.routes.js';
import feeRoutes from './fee.routes.js';
import orderRoutes from './order.routes.js';
import contactRoutes from './contact.routes.js';
import enquiryRoutes from './enquiry.routes.js';
import gymRoutes from './gym.routes.js';
import classRoutes from './class.routes.js';
import catalogRoutes from './catalog.routes.js';
import bookingRoutes from './booking.routes.js';
import customerRoutes from './customer.routes.js';
import membershipRoutes from './membership.routes.js';
import bannerRoutes from './banner.routes.js';

// Mounted at /api. Each module owns its own route file; access rules live next to each route.
const router = Router();

router.use('/auth', authRoutes);
router.use('/', dashboardRoutes);
router.use('/trainers', trainerRoutes);
router.use('/users', memberRoutes);
router.use('/fees', feeRoutes);
router.use('/orders', orderRoutes);
router.use('/contacts', contactRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/gym', gymRoutes);
router.use('/classes', classRoutes);
router.use('/catalog', catalogRoutes);
router.use('/bookings', bookingRoutes);
router.use('/customer', customerRoutes);
router.use('/memberships', membershipRoutes);
router.use('/banners', bannerRoutes);

export default router;
