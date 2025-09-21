import { Schema, model, models, Types, Document } from "mongoose";

interface IUserInConversation {
  userId: Types.ObjectId;
  isActive: boolean;
  joinedAt: Date;
}

export interface IConversation extends Document {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  users: IUserInConversation[];
}

const UserInConversationSchema = new Schema<IUserInConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>({
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
  users: { type: [UserInConversationSchema], default: [] },
});

export const Conversation = models.Conversation || model<IConversation>("Conversation", ConversationSchema);
