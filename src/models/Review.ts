import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
  organisation: Types.ObjectId; 
  reviewer: Types.ObjectId;       
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema({
  organisation: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
;
