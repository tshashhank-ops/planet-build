import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '../../../../lib/mongodb';
import { User } from '../../../../models/User';

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  passwordHash: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'staff']).optional(),
  organisation: z.any().optional(),
  createdAt: z.string().optional(),
  memberSince: z.string().optional(),
  badges: z.array(z.string()).optional(),
  carbonCredits: z.number().optional(),
  dataAiHint: z.string().optional(),
  avatar: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    let user = null;
    // Try to fetch by string and ObjectId
    try {
      user = await User.findById(params.id);
    } catch {}
    if (!user) {
      // Try to fetch by email if id looks like an email
      if (params.id.includes('@')) {
        user = await User.findOne({ email: params.id });
      }
    }
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const userObj = user.toObject ? user.toObject() : user;
    userObj.badges = Array.isArray(userObj.badges) ? userObj.badges : (userObj.badges ? [userObj.badges] : []);
    return NextResponse.json({ success: true, data: userObj });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.errors }, { status: 400 });
    }
    const user = await User.findByIdAndUpdate(params.id, parsed.data, { new: true });
  if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  const userObj = user.toObject ? user.toObject() : user;
  userObj.badges = Array.isArray(userObj.badges) ? userObj.badges : (userObj.badges ? [userObj.badges] : []);
  return NextResponse.json({ success: true, data: userObj });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
