import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as reports from '../controllers/reportController.js';

// /api/reports — admin reports (admin only)
const router = Router();
router.use(authenticate);

router.get('/fees', reports.fees);

export default router;
