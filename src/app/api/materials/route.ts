import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '../../../lib/mongodb';
import { Material } from '../../../models/Material';

const materialSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  condition: z.enum(['new', 'reclaimed']),
  price: z.number(),
  quantity: z.number(),
  location: z.string(),
  owner: z.string(),
  photos: z.array(z.string()),
});

export async function GET() {
  await dbConnect();
  try {
    const materials = await Material.find();
    return NextResponse.json({ success: true, data: materials });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const parsed = materialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.errors }, { status: 400 });
    }
    const material = new Material({ ...parsed.data });
    await material.save();
    return NextResponse.json({ success: true, data: material });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
