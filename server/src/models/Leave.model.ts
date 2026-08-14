import mongoose, { Document, Schema, Model } from 'mongoose';
import { LeaveStatus, LeaveType } from '../../../shared/types/enums';

export interface ILeave {
  user: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId;
  type: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  reason: string;
  reviewer?: mongoose.Types.ObjectId;
  reviewerComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaveDocument extends ILeave, Document {}
export interface ILeaveModel extends Model<ILeaveDocument> {}

const leaveSchema = new Schema<ILeaveDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewerComments: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        if (ret.__v !== undefined) delete (ret as any).__v;
        return ret;
      },
    },
  }
);

const Leave = mongoose.model<ILeaveDocument, ILeaveModel>('Leave', leaveSchema);
export default Leave;
