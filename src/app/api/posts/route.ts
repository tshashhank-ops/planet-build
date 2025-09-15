import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '../../../lib/mongodb';
import { Post } from '../../../models/Post';

const postSchema = z.object({
	title: z.string(),
	description: z.string(),
	category: z.string(),
	condition: z.enum(['new', 'reclaimed']),
	price: z.number(),
	quantity: z.number(),
	location: z.string(),
	owner: z.string().optional(),
	photos: z.array(z.string()).optional(),
	dimensions: z.string().optional(),
	weight: z.string().optional(),
	incoterms: z.string().optional(),
	hsCode: z.string().optional(),
	specialHandling: z.boolean().optional(),
	enableBidding: z.boolean().optional(),
});

export async function GET() {
	await dbConnect();
	try {
		const posts = await Post.find();
		return NextResponse.json({ success: true, data: posts });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	await dbConnect();
	try {
		const body = await req.json();
		console.log('POST body:', body);

		const parsed = postSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.errors }, { status: 400 });
		}
		const post = new Post({ ...parsed.data });
		await post.save();
		return NextResponse.json({ success: true, data: post });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}
