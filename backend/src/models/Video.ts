import { Schema, model, Document, Types } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  duration: number;
  thumbnail: string;
  isProcessed: boolean;
  lesson: Types.ObjectId;
  order: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  duration: { type: Number, default: 0 },
  thumbnail: { type: String },
  isProcessed: { type: Boolean, default: false },
  lesson: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  order: { type: Number, required: true },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Video = model<IVideo>('Video', videoSchema);