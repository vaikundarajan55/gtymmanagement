import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as classes from '../controllers/classController.js';

// /api/classes — Class Master (admin) + public seat availability
const router = Router();

router.get('/:id/availability', classes.availability); // public
router.get('/', authenticate, classes.listAdmin);
router.post('/', authenticate, classes.create);
router.put('/:id', authenticate, classes.update);
router.delete('/:id', authenticate, classes.remove);

export default router;
