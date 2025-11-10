import { Schema, model, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  progress: number;
  completedLessons: Types.ObjectId[];
  grade?: number;
  enrolledAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'dropped';
}

const enrollmentSchema = new Schema<IEnrollment>({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  progress: { type: Number, default: 0 },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  grade: { type: Number },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  }
});

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);