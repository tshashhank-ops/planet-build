
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '../../../../lib/mongodb';
import { Post } from '../../../../models/Post';

const postUpdateSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	type: z.string().optional(),
	condition: z.enum(['new', 'reclaimed']).optional(),
	price: z.number().optional(),
	quantity: z.number().optional(),
	location: z.string().optional(),
	owner: z.string().optional(),
	photos: z.array(z.string()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
	await dbConnect();
	try {
		const post = await Post.findById(params.id);
		if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
		return NextResponse.json({ success: true, data: post });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	await dbConnect();
	try {
		const body = await req.json();
		const parsed = postUpdateSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.errors }, { status: 400 });
		}
		const post = await Post.findByIdAndUpdate(params.id, parsed.data, { new: true });
		if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
		return NextResponse.json({ success: true, data: post });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
	await dbConnect();
	try {
		const post = await Post.findByIdAndDelete(params.id);
		if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
		return NextResponse.json({ success: true, data: post });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}
