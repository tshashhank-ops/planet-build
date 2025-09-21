import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrganisation extends Document {
  name: string;
  description?: string;
  users: Types.ObjectId[];            
  reviews: Types.ObjectId[];            
  rating: number;                       
  createdAt: Date;
}

const OrganisationSchema: Schema<IOrganisation> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  rating: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now },
});

export const Organisation: Model<IOrganisation> =
  mongoose.models.Organisation ||
  mongoose.model<IOrganisation>('Organisation', OrganisationSchema);
