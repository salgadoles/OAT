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
  duration: number;
  studentsEnrolled: number;
  rating: number;
  requirements: string[];
  learningObjectives: string[];
  
  // NOVOS CAMPOS PARA SISTEMA DE APROVAÇÃO
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
  
  // Estrutura de conteúdo
  videos: {
    _id: Types.ObjectId;
    title: string;
    url: string;
    duration: number; // em minutos
    order: number;
    isPreview: boolean;
    uploadedAt: Date;
  }[];
  
  activities: {
    _id: Types.ObjectId;
    title: string;
    type: 'quiz' | 'assignment' | 'discussion';
    instructions: string;
    questions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    }[];
    deadline?: Date;
    maxScore: number;
    order: number;
    createdAt: Date;
  }[];
  
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
  learningObjectives: [{ type: String }],
  
  // NOVOS CAMPOS
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'published'],
    default: 'draft'
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectionReason: { type: String },
  
  videos: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, default: 0 },
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  activities: [{
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['quiz', 'assignment', 'discussion'],
      required: true
    },
    instructions: { type: String, required: true },
    questions: [{
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: Number },
      points: { type: Number, default: 1 }
    }],
    deadline: { type: Date },
    maxScore: { type: Number, default: 100 },
    order: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const Course = model<ICourse>('Course', courseSchema);