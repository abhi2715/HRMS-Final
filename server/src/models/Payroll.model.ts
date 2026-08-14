import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryRecord extends Document {
  employee: mongoose.Types.ObjectId;
  effectiveDate: Date;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  grossSalary: number;
  netSalary: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryRecordSchema: Schema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      index: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically calculate gross and net salary
SalaryRecordSchema.pre<ISalaryRecord>('validate', function (next) {
  if (this.baseSalary !== undefined) {
    this.grossSalary = this.baseSalary + (this.allowances || 0) + (this.bonus || 0);
    this.netSalary = this.grossSalary - (this.deductions || 0);
  }
  next();
});

// Ensure a user can only have one salary record per effective date
SalaryRecordSchema.index({ employee: 1, effectiveDate: 1 }, { unique: true });

export default mongoose.model<ISalaryRecord>('SalaryRecord', SalaryRecordSchema);
