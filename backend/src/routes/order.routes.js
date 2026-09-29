import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as orders from '../controllers/orderController.js';

// /api/orders (admin only)
const router = Router();
router.use(authenticate);

router.get('/', orders.list);
router.post('/', orders.create);
router.put('/:id', orders.update);
router.delete('/:id', orders.remove);

export default router;
