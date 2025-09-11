import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILogisticsRequest extends Document {
  transaction: Types.ObjectId;
  truckType: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  createdAt: Date;
}

const LogisticsRequestSchema: Schema<ILogisticsRequest> = new Schema({
  transaction: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
  truckType: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const LogisticsRequest: Model<ILogisticsRequest> = mongoose.models.LogisticsRequest || mongoose.model<ILogisticsRequest>('LogisticsRequest', LogisticsRequestSchema);
