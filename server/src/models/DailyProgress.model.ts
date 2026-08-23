import mongoose, { Document, Schema, Model } from 'mongoose';
import { DailyProgressStatus } from '../../../shared/types/enums';

export interface IDailyProgress {
  employee: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId;
  date: Date;
  tasksWorkedOn: mongoose.Types.ObjectId[];
  workCompleted?: string;
  progress?: string;
  blockers?: string;
  notes?: string;
  attachments: string[];
  status: DailyProgressStatus;
  submittedAt?: Date;
  lockedAt?: Date;
  lockedBy?: mongoose.Types.ObjectId;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyProgressDocument extends IDailyProgress, Document {}

export interface IDailyProgressModel extends Model<IDailyProgressDocument> {}

const dailyProgressSchema = new Schema<IDailyProgressDocument>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    date: {
      type: Date,
      required: true,
    },
    tasksWorkedOn: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    workCompleted: {
      type: String,
      maxlength: 5000,
    },
    progress: {
      type: String,
      maxlength: 5000,
    },
    blockers: {
      type: String,
      maxlength: 5000,
    },
    notes: {
      type: String,
      maxlength: 5000,
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'locked'],
      default: 'draft',
    },
    submittedAt: {
      type: Date,
    },
    lockedAt: {
      type: Date,
    },
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastEditedAt: {
      type: Date,
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

// Unique compound index: one progress report per employee per date
dailyProgressSchema.index({ employee: 1, date: 1 }, { unique: true });
dailyProgressSchema.index({ team: 1, date: 1 });
dailyProgressSchema.index({ status: 1 });

const DailyProgress = mongoose.models.DailyProgress || mongoose.model<IDailyProgressDocument, IDailyProgressModel>('DailyProgress', dailyProgressSchema);

export default DailyProgress;
