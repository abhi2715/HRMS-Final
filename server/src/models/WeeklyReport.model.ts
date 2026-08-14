import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyReport extends Document {
  team: mongoose.Types.ObjectId;
  teamLead: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;
  
  // Narrative fields
  achievements: string;
  completedWork: string;
  incompleteWork: string;
  blockers: string;
  employeeContributions: string;
  goals: string;
  missedGoals: string;
  nextWeekPriorities: string;
  risks: string;
  notes?: string;
  
  // Derived metrics snapshots
  metrics: {
    tasksCompleted: number;
    tasksPending: number;
    overdueTasks: number;
    completionRate: number;
  };
  
  status: 'Submitted';
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyReportSchema: Schema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    teamLead: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    achievements: { type: String, required: true },
    completedWork: { type: String, required: true },
    incompleteWork: { type: String, required: true },
    blockers: { type: String, required: true },
    employeeContributions: { type: String, required: true },
    goals: { type: String, required: true },
    missedGoals: { type: String, required: true },
    nextWeekPriorities: { type: String, required: true },
    risks: { type: String, required: true },
    notes: { type: String },
    
    metrics: {
      tasksCompleted: { type: Number, required: true, default: 0 },
      tasksPending: { type: Number, required: true, default: 0 },
      overdueTasks: { type: Number, required: true, default: 0 },
      completionRate: { type: Number, required: true, default: 0 },
    },
    
    status: {
      type: String,
      enum: ['Submitted'],
      default: 'Submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports for the same team and week
WeeklyReportSchema.index({ team: 1, weekStartDate: 1, weekEndDate: 1 }, { unique: true });

export default mongoose.model<IWeeklyReport>('WeeklyReport', WeeklyReportSchema);
