import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as fees from '../controllers/feeController.js';

// /api/fees (admin only)
const router = Router();
router.use(authenticate);

router.get('/', fees.list);
router.post('/', fees.create);
router.put('/:id', fees.update);
router.delete('/:id', fees.remove);

export default router;
