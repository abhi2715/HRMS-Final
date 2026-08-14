import User, { IUserDocument } from '../models/User.model';
import { UserRole } from '../../../shared/types/enums';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  TokenPayload,
} from '../utils/token.utils';
import {
  AuthenticationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../utils/errors';
import { logger } from '../utils/logger';
import { LoginInput, CreateUserInput, ChangePasswordInput } from '../validators/auth.validator';

/**
 * Auth service — core authentication business logic.
 *
 * Handles login, token rotation, logout, user creation, and password changes.
 * All refresh tokens are stored as SHA-256 hashes in the User document.
 */

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

function formatUserResponse(user: IUserDocument): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

function buildTokenPayload(user: IUserDocument): TokenPayload {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

// ── Login ──────────────────────────────────────────────────────
export async function login(
  input: LoginInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  // Find user with password field included
  const user = await User.findOne({ email: input.email }).select('+password +refreshTokens');
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Account has been deactivated. Contact your administrator.');
  }

  // Verify password
  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate tokens
  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store hashed refresh token
  const hashedToken = hashRefreshToken(refreshToken);
  user.refreshTokens.push(hashedToken);

  // Limit stored refresh tokens to 5 (most recent devices)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  user.lastLogin = new Date();
  await user.save();

  logger.info(`User logged in: ${user.email} (${user.role})`);

  return {
    user: formatUserResponse(user),
    tokens: { accessToken, refreshToken },
  };
}

// ── Refresh Token Rotation ─────────────────────────────────────
export async function refreshAccessToken(
  currentRefreshToken: string
): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  // Verify the refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(currentRefreshToken);
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  // Find user with refresh tokens
  const user = await User.findById(decoded.userId).select('+refreshTokens');
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Account has been deactivated');
  }

  // Verify the hashed token exists in the user's stored tokens
  const hashedCurrentToken = hashRefreshToken(currentRefreshToken);
  const tokenIndex = user.refreshTokens.indexOf(hashedCurrentToken);

  if (tokenIndex === -1) {
    // Token not found — possible token reuse attack.
    // Invalidate ALL refresh tokens as a security measure.
    logger.warn(`Possible refresh token reuse detected for user: ${user.email}`);
    user.refreshTokens = [];
    await user.save();
    throw new AuthenticationError('Refresh token has been revoked. Please log in again.');
  }

  // Rotate: remove old token, generate new one
  user.refreshTokens.splice(tokenIndex, 1);

  const payload = buildTokenPayload(user);
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshTokens.push(hashRefreshToken(newRefreshToken));
  await user.save();

  return {
    user: formatUserResponse(user),
    tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  };
}

// ── Logout (single session) ────────────────────────────────────
export async function logout(
  userId: string,
  refreshToken?: string
): Promise<void> {
  if (refreshToken) {
    const hashedToken = hashRefreshToken(refreshToken);
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: hashedToken },
    });
  }
  logger.info(`User logged out: ${userId}`);
}

// ── Logout All (all sessions) ──────────────────────────────────
export async function logoutAll(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $set: { refreshTokens: [] },
  });
  logger.info(`All sessions logged out for user: ${userId}`);
}

// ── Get Current User ───────────────────────────────────────────
export async function getMe(userId: string): Promise<UserResponse> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  return formatUserResponse(user);
}

// ── Create User (Admin only) ───────────────────────────────────
export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  // Check for duplicate email
  const existing = await User.findByEmail(input.email);
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  const user = await User.create({
    email: input.email,
    password: input.password,
    role: input.role,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  logger.info(`User created: ${user.email} (${user.role})`);

  return formatUserResponse(user);
}

// ── Change Password ────────────────────────────────────────────
export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await User.findById(userId).select('+password +refreshTokens');
  if (!user) {
    throw new NotFoundError('User');
  }

  const isMatch = await user.comparePassword(input.currentPassword);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }

  user.password = input.newPassword;
  // Invalidate all refresh tokens (force re-login on all devices)
  user.refreshTokens = [];
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);
}

// ── Deactivate User (Admin only) ───────────────────────────────
export async function deactivateUser(userId: string): Promise<UserResponse> {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) {
    throw new NotFoundError('User');
  }

  user.isActive = false;
  user.refreshTokens = []; // revoke all sessions
  await user.save();

  logger.info(`User deactivated: ${user.email}`);

  return formatUserResponse(user);
}

// ── Activate User (Admin only) ─────────────────────────────────
export async function activateUser(userId: string): Promise<UserResponse> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  user.isActive = true;
  await user.save();

  logger.info(`User activated: ${user.email}`);

  return formatUserResponse(user);
}
