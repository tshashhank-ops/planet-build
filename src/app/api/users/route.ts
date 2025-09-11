import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '../../../lib/mongodb';
import { User } from '../../../models/User';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(['buyer', 'seller', 'staff']),
});

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.errors }, { status: 400 });
    }
    const user = new User({ ...parsed.data });
    await user.save();
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
