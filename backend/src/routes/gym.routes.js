import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as gym from '../controllers/gymController.js';

// /api/gym — public read, admin update only (single row)
const router = Router();

router.get('/', gym.get);
router.put('/', authenticate, gym.update);

export default router;
