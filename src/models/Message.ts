// message.model.ts
import { Schema, model, models, Types, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sentUserId: Types.ObjectId;
  text?: string;
  media?: string;
  isEdited: boolean;
  isDeleted: boolean;
  deliveredTo: Types.ObjectId[];
  readBy: Types.ObjectId[];
  reaction: Record<string, number>;
  messageReplyTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  sentUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  media: { type: String },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deliveredTo: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  readBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  reaction: { type: Schema.Types.Mixed, default: {} },
  messageReplyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

export const Message = models.Message || model<IMessage>("Message", MessageSchema);
