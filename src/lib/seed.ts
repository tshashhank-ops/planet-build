import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Conversation } from '../models/Conversations'; // adjust path
import { Message } from '../models/Message'; // adjust path
import { User } from '../models/User'; // adjust path

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/planet_build';

async function seedConversationsAndMessages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Fetch users
    const users = await User.find({});
    if (users.length < 3)
      throw new Error('Not enough users to seed conversations');

    // 2. Delete old conversations and messages
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('🗑️ Deleted old conversations and messages');

    // 3. Prepare conversation data
    const conversationsData = [
      {
        _id: new mongoose.Types.ObjectId('651111111111111111111111'),
        isActive: true,
        users: [
          {
            userId: users[0]._id,
            isActive: true,
            joinedAt: new Date(Date.now() - 3600000),
          },
          {
            userId: users[1]._id,
            isActive: true,
            joinedAt: new Date(Date.now() - 3500000),
          },
        ],
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
        lastMessage: {
          _id: new mongoose.Types.ObjectId('661111111111111111111111'),
          conversationId: new mongoose.Types.ObjectId('651111111111111111111111'),
          sentUserId: users[1]._id,
          text: 'Yes, the project files are ready for review. When can we meet?',
          isEdited: false,
          isDeleted: false,
          deliveredTo: [users[0]._id, users[1]._id],
          readBy: [users[0]._id],
          reaction: {},
          createdAt: new Date(Date.now() - 10 * 60000),
          updatedAt: new Date(Date.now() - 10 * 60000),
        },
        unreadCount: 1,
      },
      {
        _id: new mongoose.Types.ObjectId('652222222222222222222222'),
        isActive: true,
        users: [
          {
            userId: users[0]._id,
            isActive: true,
            joinedAt: new Date(Date.now() - 7200000),
          },
          {
            userId: users[2]._id,
            isActive: true,
            joinedAt: new Date(Date.now() - 7100000),
          },
        ],
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(),
        lastMessage: {
          _id: new mongoose.Types.ObjectId('662222222222222222222222'),
          conversationId: new mongoose.Types.ObjectId('652222222222222222222222'),
          sentUserId: users[0]._id,
          text: 'Great, I can pick up the documents tomorrow afternoon.',
          isEdited: false,
          isDeleted: false,
          deliveredTo: [users[0]._id, users[2]._id],
          readBy: [users[0]._id],
          reaction: {},
          createdAt: new Date(Date.now() - 24 * 60 * 60000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60000),
        },
        unreadCount: 1,
      },
    ];

    const messagesData = [
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111110'),
        conversationId: new mongoose.Types.ObjectId('651111111111111111111111'),
        sentUserId: users[0]._id,
        text: 'Hello, are the project files ready for review?',
        isEdited: false,
        isDeleted: false,
        deliveredTo: [users[0]._id, users[1]._id],
        readBy: [users[0]._id],
        reaction: {},
        createdAt: new Date(Date.now() - 15 * 60000),
        updatedAt: new Date(Date.now() - 15 * 60000),
      },
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111111'),
        conversationId: new mongoose.Types.ObjectId('651111111111111111111111'),
        sentUserId: users[1]._id,
        text: 'Yes, the project files are ready for review. When can we meet?',
        isEdited: false,
        isDeleted: false,
        deliveredTo: [users[0]._id, users[1]._id],
        readBy: [users[0]._id],
        reaction: {},
        createdAt: new Date(Date.now() - 10 * 60000),
        updatedAt: new Date(Date.now() - 10 * 60000),
      },
      {
        _id: new mongoose.Types.ObjectId('662222222222222222222222'),
        conversationId: new mongoose.Types.ObjectId('652222222222222222222222'),
        sentUserId: users[0]._id,
        text: 'Great, I can pick up the documents tomorrow afternoon.',
        isEdited: false,
        isDeleted: false,
        deliveredTo: [users[0]._id, users[2]._id],
        readBy: [users[0]._id],
        reaction: {},
        createdAt: new Date(Date.now() - 24 * 60 * 60000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60000),
      },
    ];

    // 4. Insert data
    await Conversation.insertMany(conversationsData);
    await Message.insertMany(messagesData);
    console.log('✅ Inserted conversations and messages');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding conversations and messages:', error);
    process.exit(1);
  }
}

seedConversationsAndMessages();
