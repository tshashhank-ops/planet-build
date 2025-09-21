import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Organisation } from '../../../models/Organisation';

export async function GET() {
  await dbConnect();
  try {
    const organisations = await Organisation.find().populate('users').populate('reviews');
    return NextResponse.json({ success: true, data: organisations });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const organisation = new Organisation({ ...body });
    await organisation.save();
    return NextResponse.json({ success: true, data: organisation });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
