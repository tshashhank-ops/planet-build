// server.ts
import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";
import dbConnect from "./src/lib/mongodb"; // connect once
import { Message } from "./src/models/Message"; // import model once

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  await dbConnect(); // connect once

  const expressApp = express();
  const server = createServer(expressApp);

  const io = new SocketIOServer(server, {
    path: "/api/socket",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(`📥 User ${socket.id} joined room ${roomId}`);
    });


    // Handle sending a message (with optional reply)
    socket.on("sendMessage", async (message: any) => {
      try {
        console.log("💬 Saving message:", message);

        // Remove temp _id
        if (message._id && typeof message._id === "string" && message._id.length > 12) {
          delete message._id;
        }

        const saved = await Message.create({
          conversationId: message.conversationId,
          sentUserId: message.sentUserId,
          text: message.text,
          media: message.media,
          isEdited: message.isEdited ?? false,
          isDeleted: message.isDeleted ?? false,
          deliveredTo: message.deliveredTo ?? [],
          readBy: message.readBy ?? [],
          reactions: message.reactions ?? [],
          replyTo: message.replyTo ?? null,
        });
        console.log("💾 Message saved to DB:", saved);
        io.to(message.conversationId).emit("newMessage", saved);
      } catch (err) {
        console.error("Failed to save message to DB:", err);
      }
    });

    // Handle adding/removing a reaction
    socket.on("addReaction", async ({ messageId, emoji, userId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        let updated = false;
        // Remove if already reacted with same emoji
        const idx = msg.reactions.findIndex((r: any) => r.emoji === emoji && r.userId.toString() === userId);
        if (idx !== -1) {
          msg.reactions.splice(idx, 1);
          updated = true;
        } else {
          msg.reactions.push({ emoji, userId });
          updated = true;
        }
        if (updated) {
          await msg.save();
          io.to(msg.conversationId.toString()).emit("messageUpdated", msg);
        }
      } catch (err) {
        console.error("Failed to update reaction:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  expressApp.use((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`🚀 Server ready on http://localhost:${port}`);
  });
});
