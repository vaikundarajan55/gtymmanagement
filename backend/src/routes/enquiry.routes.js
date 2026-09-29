import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as enquiries from '../controllers/enquiryController.js';

// /api/enquiries — public POST from the website form, admin POST via /admin
const router = Router();

router.post('/', enquiries.submit);
router.get('/', authenticate, enquiries.list);
router.post('/admin', authenticate, enquiries.create);
router.put('/:id', authenticate, enquiries.update);
router.delete('/:id', authenticate, enquiries.remove);

export default router;
