import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';

// /api/auth — admin sign-in
const router = Router();

router.post('/login', auth.login);
router.put('/change-password', authenticate, auth.changePassword);

export default router;
