import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as contacts from '../controllers/contactController.js';

// /api/contacts — public POST from the website form, admin POST via /admin
const router = Router();

router.post('/', contacts.submit);
router.get('/', authenticate, contacts.list);
router.post('/admin', authenticate, contacts.create);
router.put('/:id', authenticate, contacts.update);
router.delete('/:id', authenticate, contacts.remove);

export default router;
