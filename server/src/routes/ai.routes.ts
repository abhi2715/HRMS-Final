import { Router } from 'express';
import { chatWithAI } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Only authenticated users can chat with AI
router.post('/chat', protect, chatWithAI);

export default router;
