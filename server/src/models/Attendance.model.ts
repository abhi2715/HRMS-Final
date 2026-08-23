import mongoose, { Document, Schema, Model } from 'mongoose';
import { AttendanceStatus } from '../../../shared/types/enums';

export interface IAttendance {
  user: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  checkIn?: Date;
  checkOut?: Date;
  duration?: number; // duration in minutes
  notes?: string;
  correctedBy?: mongoose.Types.ObjectId;
  correctionReason?: string;
  correctionTimestamp?: Date;
  originalValues?: Record<string, any>; // snapshot of original values before correction
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceDocument extends IAttendance, Document {}
export interface IAttendanceModel extends Model<IAttendanceDocument> {}

const attendanceSchema = new Schema<IAttendanceDocument>(
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
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    correctedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    correctionReason: {
      type: String,
      maxlength: 1000,
    },
    correctionTimestamp: {
      type: Date,
    },
    originalValues: {
      type: Schema.Types.Mixed,
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

// Compound index for fast lookup of a user's attendance on a specific date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ team: 1, date: 1 });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.models.Attendance || mongoose.model<IAttendanceDocument, IAttendanceModel>('Attendance', attendanceSchema);
export default Attendance;
