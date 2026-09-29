import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as trainers from '../controllers/trainerController.js';

// /api/trainers
const router = Router();

router.get('/team', trainers.team); // public: website Meet the team
router.get('/', authenticate, trainers.list);
router.post('/', authenticate, trainers.create);
router.put('/:id', authenticate, trainers.update);
router.delete('/:id', authenticate, trainers.remove);

export default router;
