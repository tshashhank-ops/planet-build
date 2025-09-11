import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IContract extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  material: Types.ObjectId;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: Date;
}

const ContractSchema: Schema<IContract> = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Contract: Model<IContract> = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
