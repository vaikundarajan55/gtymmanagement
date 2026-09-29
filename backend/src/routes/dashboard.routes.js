import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as dashboard from '../controllers/dashboardController.js';

// /api — admin dashboard counters, metric-card stats and form dropdowns
const router = Router();

router.get('/dashboard', authenticate, dashboard.getDashboard);
router.get('/dashboard/charts', authenticate, dashboard.getCharts);
router.get('/stats/:resource', authenticate, dashboard.getStats);
router.get('/options', authenticate, dashboard.getOptions);

export default router;
