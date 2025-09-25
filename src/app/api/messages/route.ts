import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Conversation } from '@/models/Conversations';
import { Message } from '@/models/Message';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ success: false, error: 'Missing conversationId' }, { status: 400 });
  }
  try {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET_conversations(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
  }
  try {
    const conversations = await Conversation.find({ 'users.userId': userId }).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const message = await Message.create({
      conversationId: body.conversationId,
      sentUserId: body.sentUserId,
      text: body.text,
      media: body.media,
      isEdited: body.isEdited ?? false,
      isDeleted: body.isDeleted ?? false,
      deliveredTo: body.deliveredTo ?? [],
      readBy: body.readBy ?? [],
      reactions: body.reactions ?? [],
      replyTo: body.replyTo ?? null,
    });
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
