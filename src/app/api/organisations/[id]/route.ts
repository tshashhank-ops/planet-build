import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import { Organisation } from '../../../../models/Organisation';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    let organisation = await Organisation.findById(id);
    if (!organisation) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    // Only populate if users/reviews arrays are not empty
    if (organisation.users && organisation.users.length > 0) {
      organisation = await Organisation.findById(id).populate('users');
    }
    if (organisation && organisation.reviews && organisation.reviews.length > 0) {
      organisation = await Organisation.findById(id).populate('reviews');
    }
    return NextResponse.json({ success: true, data: organisation });
  } catch (error) {
    console.error('Organisation API error:', error);
    return NextResponse.json({ success: false, error: 'Server error', details: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const body = await req.json();
    const organisation = await Organisation.findByIdAndUpdate(params.id, body, { new: true });
    if (!organisation) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: organisation });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const organisation = await Organisation.findByIdAndDelete(params.id);
    if (!organisation) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: organisation });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
