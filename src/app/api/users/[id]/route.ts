import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '../../../../lib/mongodb';
import { User } from '../../../../models/User';

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  passwordHash: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'staff']).optional(),
  rating: z.number().optional(),
  reputationScore: z.number().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
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
    return NextResponse.json({ success: true, data: user });
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
