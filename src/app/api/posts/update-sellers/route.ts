import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Post } from "../../../../models/Post";
import { User } from "../../../../models/User";

export async function POST(req: NextRequest) {
	await dbConnect();
	try {
		// Get all posts that don't have a seller
		const postsWithoutSeller = await Post.find({ seller: { $exists: false } });

		// Get a random user to assign as seller
		const users = await User.find({ role: "seller" });
		if (users.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No seller users found" },
				{ status: 400 }
			);
		}

		const randomUser = users[Math.floor(Math.random() * users.length)];

		// Update all posts without seller to have the random user as seller
		const result = await Post.updateMany(
			{ seller: { $exists: false } },
			{ seller: randomUser._id }
		);

		return NextResponse.json({
			success: true,
			message: `Updated ${result.modifiedCount} posts with seller ${randomUser.name}`,
			data: { modifiedCount: result.modifiedCount, seller: randomUser },
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Server error" },
			{ status: 500 }
		);
	}
}
