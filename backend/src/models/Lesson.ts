import { Schema, model, Document, Types } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number; // em minutos
  isFree: boolean;
  course: Types.ObjectId;
  videos: Types.ObjectId[];
  activities: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String }, // Conteúdo em texto/HTML
  order: { type: Number, required: true },
  duration: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }]
}, {
  timestamps: true
});

export const Lesson = model<ILesson>('Lesson', lessonSchema);