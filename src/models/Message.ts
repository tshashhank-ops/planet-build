// message.model.ts
import { Schema, model, models, Types, Document } from "mongoose";

export interface IReaction {
  emoji: string;
  userId: Types.ObjectId;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sentUserId: Types.ObjectId;
  text?: string;
  media?: string;
  isEdited: boolean;
  isDeleted: boolean;
  deliveredTo: Types.ObjectId[];
  readBy: Types.ObjectId[];
  reactions: IReaction[];
  replyTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  emoji: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  sentUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  media: { type: String },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deliveredTo: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  readBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  reactions: { type: [ReactionSchema], default: [] },
  replyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

export const Message = models.Message || model<IMessage>("Message", MessageSchema);
