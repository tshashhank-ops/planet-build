import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'buyer' | 'seller' | 'staff';
  organisation: Types.ObjectId; 
  createdAt: Date;
  memberSince: string;
  badges: string[];
  carbonCredits: number;
  dataAiHint?: string;
  avatar?: string; 
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'staff'], required: true },
  organisation: { type: Schema.Types.ObjectId, ref: 'Organisation' }, // link to org
  createdAt: { type: Date, default: Date.now },
  memberSince: { type: String },
  badges: { type: [String], default: [] },
  carbonCredits: { type: Number, default: 0 },
  dataAiHint: { type: String },
  avatar: { type: String }, 
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
