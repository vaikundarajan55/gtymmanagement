import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as memberships from '../controllers/membershipController.js';

// /api/memberships — members whose plan period has ended / is ending (admin only)
const router = Router();
router.use(authenticate);

router.get('/completed', memberships.completed);
router.get('/stats', memberships.stats);

export default router;
