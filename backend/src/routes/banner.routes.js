import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as banners from '../controllers/bannerController.js';

// /api/banners — home page hero banners
const router = Router();

router.get('/active', banners.active); // public: home page slider
router.get('/', authenticate, banners.list);
router.post('/upload', authenticate, banners.upload);
router.post('/', authenticate, banners.create);
router.put('/:id', authenticate, banners.update);
router.delete('/:id', authenticate, banners.remove);

export default router;
