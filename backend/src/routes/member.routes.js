import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as members from '../controllers/memberController.js';

// /api/users — gym members (admin only)
const router = Router();
router.use(authenticate);

router.get('/', members.list);
router.get('/birthdays', members.birthdays);
router.post('/', members.create);
router.put('/:id', members.update);
router.delete('/:id', members.remove);

export default router;
