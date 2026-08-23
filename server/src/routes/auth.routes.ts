import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, changePasswordSchema, createUserSchema } from '../validators/auth.validator';
import { UserRole } from '../../../shared/types/enums';

const router = Router();

// Strict rate limiter for login
const loginLimiter = process.env.NODE_ENV === 'test' ? (req: any, res: any, next: any) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for auth endpoints
const authLimiter = process.env.NODE_ENV === 'test' ? (req: any, res: any, next: any) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

/**
 * Auth routes.
 *
 * Public:
 *   POST /login       — authenticate with credentials
 *   POST /refresh     — rotate refresh token and get new access token
 *
 * Protected:
 *   POST /logout      — invalidate current session
 *   POST /logout-all  — invalidate all sessions
 *   GET  /me          — get current authenticated user
 *   PUT  /password     — change own password
 *
 * Admin only:
 *   POST   /users               — create a new user
 *   PATCH  /users/:userId/deactivate  — deactivate a user
 *   PATCH  /users/:userId/activate    — activate a user
 */

// ── Public ─────────────────────────────────────────────────────
router.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authLimiter, authController.refresh);

// ── Protected ──────────────────────────────────────────────────
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.getMe);
router.put('/password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);

// ── Admin Only ─────────────────────────────────────────────────
router.post(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: createUserSchema }),
  authController.createUser
);
router.patch(
  '/users/:userId/deactivate',
  authenticate,
  authorize(UserRole.ADMIN),
  authController.deactivateUser
);
router.patch(
  '/users/:userId/activate',
  authenticate,
  authorize(UserRole.ADMIN),
  authController.activateUser
);

export default router;
