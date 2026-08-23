import mongoose, { Document, Schema, Types } from 'mongoose';
import { LeaveStatus } from '../../../shared/types/enums';

export interface ILeaveRequest extends Document {
  employee: Types.ObjectId;
  leaveType: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approver?: Types.ObjectId;
  decisionDate?: Date;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
    },
    approver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    decisionDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ employee: 1, startDate: 1 });
leaveRequestSchema.index({ status: 1 });

export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
