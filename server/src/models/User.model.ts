import mongoose, { Document, Schema, Model } from 'mongoose';
import { UserRole } from '../../../shared/types/enums';
import { hashPassword, comparePassword } from '../utils/password.utils';

/**
 * User model — authentication and identity.
 *
 * Stores credentials, role, and hashed refresh tokens.
 * Password is hashed via pre-save hook.
 * Refresh tokens are stored as SHA-256 hashes (not raw tokens).
 */

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  team?: mongoose.Types.ObjectId;
  isActive: boolean;
  joiningDate: Date;
  salary?: number;
  refreshTokens: string[];  // hashed refresh tokens (supports multi-device)
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Role is required'],
      default: UserRole.EMPLOYEE,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      select: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false, // never returned in queries by default
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        if (ret.password !== undefined) delete (ret as any).password;
        if (ret.refreshTokens !== undefined) delete (ret as any).refreshTokens;
        if (ret.__v !== undefined) delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// ── Virtual: fullName ──────────────────────────────────────────
userSchema.virtual('fullName').get(function (this: IUserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// ── Pre-save: hash password ────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();

  try {
    this.password = await hashPassword(this.password);
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ── Instance method: compare password ──────────────────────────
userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

// ── Static method: find by email ───────────────────────────────
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// ── Indexes ────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ team: 1 });

const User = (mongoose.models.User as IUserModel) || mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
