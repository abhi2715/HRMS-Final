import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveType extends Document {
  name: string;
  description: string;
  defaultAllocation: number;
  requiresDocumentation: boolean;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leaveTypeSchema = new Schema<ILeaveType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    defaultAllocation: {
      type: Number,
      required: true,
      min: 0,
    },
    requiresDocumentation: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#4F46E5', // Indigo-600 default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveType = mongoose.models.LeaveType || mongoose.model<ILeaveType>('LeaveType', leaveTypeSchema);
