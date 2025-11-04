import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  instructions: string;
  type: 'quiz' | 'assignment' | 'discussion' | 'project';
  points: number;
  deadline?: Date;
  lesson: Types.ObjectId;
  questions?: Types.ObjectId[];
  submissions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  title: { type: String, required: true },
  description: { type: String },
  instructions: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['quiz', 'assignment', 'discussion', 'project'],
    required: true 
  },
  points: { type: Number, default: 0 },
  deadline: { type: Date },
  lesson: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Submission' }]
}, {
  timestamps: true
});

export const Activity = model<IActivity>('Activity', activitySchema);