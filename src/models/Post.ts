import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'reclaimed';
  price: number;
  quantity: number;
  location: string;
  owner?: Types.ObjectId;
  photos?: string[];
  createdAt: Date;
  dimensions?: string;
  weight?: string;
  incoterms?: string;
  hsCode?: string;
  specialHandling?: boolean;
  enableBidding?: boolean;
  startingBid?: number;
  auctionEndDate?: Date;
}

const PostSchema: Schema<IPost> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['new', 'reclaimed'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Organisation', required: false },
  photos: [{ type: String, default: ['https://placehold.co/600x400.png'] }],
  createdAt: { type: Date, default: Date.now },
  dimensions: { type: String },
  weight: { type: String },
  incoterms: { type: String },
  hsCode: { type: String },
  specialHandling: { type: Boolean },
  enableBidding: { type: Boolean },
  startingBid: { type: Number },
  auctionEndDate: { type: Date },
}, { collection: 'posts' });

export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
