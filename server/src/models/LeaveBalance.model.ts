import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILeaveBalance extends Document {
  employee: Types.ObjectId;
  leaveType: Types.ObjectId;
  year: number;
  allocation: number;
  used: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    allocation: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    used: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    available: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// A user can only have one balance record per leave type per year
leaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });

// Pre-save hook to ensure available is calculated correctly
leaveBalanceSchema.pre('save', function (next) {
  if (this.isModified('allocation') || this.isModified('used')) {
    this.available = this.allocation - this.used;
  }
  next();
});

export const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);
