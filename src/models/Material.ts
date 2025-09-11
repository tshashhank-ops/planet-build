import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMaterial extends Document {
  title: string;
  description: string;
  type: string;
  condition: 'new' | 'reclaimed';
  price: number;
  quantity: number;
  location: string;
  owner: Types.ObjectId;
  photos: string[];
  createdAt: Date;
}

const MaterialSchema: Schema<IMaterial> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  condition: { type: String, enum: ['new', 'reclaimed'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const Material: Model<IMaterial> = mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);
