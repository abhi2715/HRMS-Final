import mongoose, { Document, Schema, Model } from 'mongoose';
import { TaskStatus, TaskPriority } from '../../../shared/types/enums';

/**
 * Task model — work items assigned by CEO → Team Leads, or Team Leads → Employees.
 *
 * Each task tracks its full lifecycle: creation, assignment, progress, status, and comments.
 * The `createdBy` field always stores the user who created the task (CEO or Team Lead).
 * The `assignedTo` field stores the user responsible for completing it.
 */

// ── Comment Sub-document ─────────────────────────────────────────
export interface ITaskComment {
  author: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const taskCommentSchema = new Schema<ITaskComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// ── Task Interface ───────────────────────────────────────────────
export interface ITask {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  assigner: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId;
  parentTask?: mongoose.Types.ObjectId;
  progress: number;
  tags: string[];
  attachments: string[];
  comments: ITaskComment[];
  statusHistory: Array<{
    status: TaskStatus;
    changedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    reason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

export interface ITaskModel extends Model<ITaskDocument> {}

// ── Schema ───────────────────────────────────────────────────────
const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.BACKLOG,
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    assigner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignee is required'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    comments: {
      type: [taskCommentSchema],
      default: [],
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(TaskStatus),
          required: true,
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
        },
      }
    ],
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

// ── Indexes ──────────────────────────────────────────────────────
taskSchema.index({ status: 1, assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ team: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ parentTask: 1 });
taskSchema.index({ team: 1, completedAt: 1 });
taskSchema.index({ assignedTo: 1, completedAt: 1 });
taskSchema.index({ createdAt: 1 });
taskSchema.index({ completedAt: 1 });
taskSchema.index({ status: 1, createdAt: 1 });

const Task = mongoose.models.Task || mongoose.model<ITaskDocument, ITaskModel>('Task', taskSchema);

export default Task;
