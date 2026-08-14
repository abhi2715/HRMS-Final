import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', employeeController.getEmployeeDashboard);
router.get('/profile', employeeController.getMyProfile);

export default router;
