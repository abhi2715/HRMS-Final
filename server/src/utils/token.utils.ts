import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { UserRole } from '../../../shared/types/enums';

/**
 * JWT token utilities.
 *
 * Access tokens are short-lived (default 15m) and sent in Authorization header.
 * Refresh tokens are long-lived (default 7d) and sent as httpOnly cookies.
 * Refresh tokens are hashed before storing in DB to mitigate DB breach scenarios.
 */

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface DecodedToken extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Generate a short-lived access token.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
    issuer: 'hrms',
    subject: payload.userId,
  });
}

/**
 * Generate a long-lived refresh token.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
    issuer: 'hrms',
    subject: payload.userId,
    jwtid: crypto.randomUUID(), // unique ID for each refresh token
  });
}

/**
 * Verify and decode an access token.
 */
export function verifyAccessToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_SECRET, { issuer: 'hrms' }) as DecodedToken;
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: 'hrms' }) as DecodedToken;
}

/**
 * Hash a refresh token for secure DB storage.
 * Uses SHA-256 so that even if the DB is compromised,
 * the raw refresh tokens cannot be extracted.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
