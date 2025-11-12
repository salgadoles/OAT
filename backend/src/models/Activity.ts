// models/Activity.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'discussion' | 'project';
  instructions: string;
  maxScore: number;
  deadline?: Date;
  course: Types.ObjectId;
  lesson?: Types.ObjectId;
  order: number;
  questions?: Types.ObjectId[];
  submissions: Types.ObjectId[];
  allowFileUpload: boolean;
  allowedFileTypes: string[];
  maxFileSize: number; // em MB
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['quiz', 'assignment', 'discussion', 'project'],
    required: true 
  },
  instructions: { type: String, required: true },
  maxScore: { type: Number, default: 100 },
  deadline: { type: Date },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  lesson: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lesson' 
  },
  order: { type: Number, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Submission' }],
  allowFileUpload: { type: Boolean, default: false },
  allowedFileTypes: [{ type: String }], // ['pdf', 'doc', 'docx', 'zip', etc]
  maxFileSize: { type: Number, default: 10 } // 10MB padrão
}, {
  timestamps: true
});

export const Activity = model<IActivity>('Activity', activitySchema);