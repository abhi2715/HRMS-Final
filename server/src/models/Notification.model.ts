import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '../../../shared/types/enums';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedEntity?: mongoose.Types.ObjectId;
  entityModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedEntity: {
      type: Schema.Types.ObjectId,
      // Dynamic reference based on entityModel
      refPath: 'entityModel',
    },
    entityModel: {
      type: String,
      enum: ['Task', 'LeaveRequest', 'DailyProgress', 'WeeklyReport'], // Extend as needed
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching unread notifications quickly
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
