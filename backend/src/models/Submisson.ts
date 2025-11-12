// models/Submission.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  student: Types.ObjectId;
  activity: Types.ObjectId;
  course: Types.ObjectId;
  answers?: any[]; // Para quizzes
  textAnswer?: string; // Para discussões
  files: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedAt: Date;
  }[];
  score?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  status: 'pending' | 'submitted' | 'graded' | 'late';
}

const submissionSchema = new Schema<ISubmission>({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  activity: { 
    type: Schema.Types.ObjectId, 
    ref: 'Activity', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  answers: [{ type: Schema.Types.Mixed }],
  textAnswer: { type: String },
  files: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  score: { type: Number },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now },
  gradedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'graded', 'late'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

export const Submission = model<ISubmission>('Submission', submissionSchema);