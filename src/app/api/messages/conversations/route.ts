import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversations";

export async function GET(req: NextRequest) {
	await dbConnect();
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");
	if (!userId) {
		return NextResponse.json(
			{ success: false, error: "Missing userId" },
			{ status: 400 }
		);
	}
	try {
		const conversations = await Conversation.find({ "users.userId": userId })
			.sort({ updatedAt: -1 })
			.populate("users.userId", "name avatar email");
		// Map populated user objects into users array for each conversation
		const populatedConversations = conversations.map((convo) => {
			const users = convo.users.map(
				(u: {
					userId: { _id: { toString: () => any } } | null;
					isActive: any;
					joinedAt: any;
				}) => {
					// If populated, userId is an object
					if (typeof u.userId === "object" && u.userId !== null) {
						return {
							userId: u.userId._id?.toString() || u.userId,
							name: (u.userId as any).name,
							avatar: (u.userId as any).avatar,
							email: (u.userId as any).email,
							isActive: u.isActive,
							joinedAt: u.joinedAt,
						};
					}
					return u;
				}
			);
			return { ...convo.toObject(), users };
		});
		return NextResponse.json({ success: true, data: populatedConversations });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	await dbConnect();
	try {
		const body = await req.json();
		const { userId1, userId2 } = body;

		if (!userId1 || !userId2) {
			return NextResponse.json(
				{ success: false, error: "Missing userId1 or userId2" },
				{ status: 400 }
			);
		}

		// Check if conversation already exists between these users
		const existingConversation = await Conversation.findOne({
			$and: [{ "users.userId": userId1 }, { "users.userId": userId2 }],
		});

		if (existingConversation) {
			return NextResponse.json({ success: true, data: existingConversation });
		}

		// Create new conversation
		const conversation = await Conversation.create({
			users: [
				{ userId: userId1, isActive: true, joinedAt: new Date() },
				{ userId: userId2, isActive: true, joinedAt: new Date() },
			],
		});

		// Populate the conversation with user data
		const populatedConversation = await Conversation.findById(
			conversation._id
		).populate("users.userId", "name avatar email");

		return NextResponse.json({ success: true, data: populatedConversation });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Server error" },
			{ status: 500 }
		);
	}
}
