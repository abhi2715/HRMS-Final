import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { env } from '../config/env';

/**
 * Auth controller — thin layer delegating to auth service.
 *
 * Handles HTTP concerns (cookies, status codes) while business logic stays in the service.
 */

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/api/v1/auth', domain: undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── Login ──────────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

// ── Refresh Token ──────────────────────────────────────────────
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentRefreshToken = req.cookies?.refreshToken;
    if (!currentRefreshToken) {
      res.status(401).json({
        success: false,
        message: 'No refresh token provided',
        error: { code: 'NO_REFRESH_TOKEN' },
      });
      return;
    }

    const result = await authService.refreshAccessToken(currentRefreshToken);

    // Set new refresh token cookie (rotation)
    res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Token refreshed');
  } catch (error) {
    // Clear the invalid cookie
    res.clearCookie('refreshToken', { path: '/api/v1/auth', domain: undefined });
    next(error);
  }
}

// ── Logout ─────────────────────────────────────────────────────
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (req.user) {
      await authService.logout(req.user.id, refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/api/v1/auth', domain: undefined });

    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

// ── Logout All Sessions ────────────────────────────────────────
export async function logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user) {
      await authService.logoutAll(req.user.id);
    }

    res.clearCookie('refreshToken', { path: '/api/v1/auth', domain: undefined });

    sendSuccess(res, null, 'All sessions logged out');
  } catch (error) {
    next(error);
  }
}

// ── Get Current User ───────────────────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, { user }, 'Current user retrieved');
  } catch (error) {
    next(error);
  }
}

// ── Create User (Admin) ───────────────────────────────────────
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.createUser(req.body);
    sendCreated(res, { user }, 'User created successfully');
  } catch (error) {
    next(error);
  }
}

// ── Change Password ────────────────────────────────────────────
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.changePassword(req.user!.id, req.body);

    // Clear refresh cookie since all sessions are invalidated
    res.clearCookie('refreshToken', { path: '/api/v1/auth', domain: undefined });

    sendSuccess(res, null, 'Password changed successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
}

// ── Deactivate User (Admin) ────────────────────────────────────
export async function deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.deactivateUser(req.params.userId as string);
    sendSuccess(res, { user }, 'User deactivated');
  } catch (error) {
    next(error);
  }
}

// ── Activate User (Admin) ──────────────────────────────────────
export async function activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.activateUser(req.params.userId as string);
    sendSuccess(res, { user }, 'User activated');
  } catch (error) {
    next(error);
  }
}
