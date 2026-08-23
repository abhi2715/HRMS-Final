import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITeam {
  name: string;
  description?: string;
  manager?: mongoose.Types.ObjectId; // User with role Team Lead
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamDocument extends ITeam, Document {}

export interface ITeamModel extends Model<ITeamDocument> {}

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
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

teamSchema.index({ isActive: 1 });
teamSchema.index({ manager: 1 });

const Team = mongoose.models.Team || mongoose.model<ITeamDocument, ITeamModel>('Team', teamSchema);

export default Team;
