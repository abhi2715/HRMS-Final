import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Allow any authenticated user to search, controller handles RBAC filtering
router.get('/', globalSearch);

export default router;
