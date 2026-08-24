import { Router } from 'express';
import { chatWithAI } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Only authenticated users can chat with AI
router.post('/chat', authenticate, chatWithAI);

export default router;
