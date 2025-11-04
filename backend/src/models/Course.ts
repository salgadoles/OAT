import { Schema, model, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isPublished: boolean;
  instructor: Types.ObjectId;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em horas
  studentsEnrolled: number;
  rating: number;
  requirements: string[];
  learningObjectives: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  price: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  instructor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: { type: Number, default: 0 },
  studentsEnrolled: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  requirements: [{ type: String }],
  learningObjectives: [{ type: String }]
}, {
  timestamps: true
});

export const Course = model<ICourse>('Course', courseSchema);