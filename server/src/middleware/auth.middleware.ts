import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../utils/errors';
import { verifyAccessToken, DecodedToken } from '../utils/token.utils';
import User from '../models/User.model';
import { UserRole } from '../../../shared/types/enums';

/**
 * Authentication middleware.
 *
 * Verifies the JWT access token from the Authorization header.
 * Confirms the user still exists and is active in the database.
 * Attaches the authenticated user to req.user.
 */

export interface AuthenticatedUser {
  id: string;
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AuthenticationError('No authorization token provided'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AuthenticationError('Malformed authorization header'));
    }

    // 2. Verify token
    let decoded: DecodedToken;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new AuthenticationError('Invalid or expired access token'));
    }

    // 3. Verify user still exists and is active
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return next(new AuthenticationError('User no longer exists'));
    }

    if (!user.isActive) {
      return next(new AuthenticationError('Account has been deactivated'));
    }

    // 4. Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return next(new AuthenticationError('Password was recently changed. Please log in again.'));
      }
    }

    // 5. Attach user to request
    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    next(new AuthenticationError('Authentication failed'));
  }
};
