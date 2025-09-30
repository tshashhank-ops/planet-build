import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/models/Conversations";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
	await dbConnect();
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");
	const postId = searchParams.get("postId");
	if (!userId) {
		return NextResponse.json(
			{ success: false, error: "Missing userId" },
			{ status: 400 }
		);
	}
	try {
		const query: any = { "users.userId": userId };
		if (postId) {
			if (!Types.ObjectId.isValid(postId)) {
				return NextResponse.json(
					{ success: false, error: "Invalid postId" },
					{ status: 400 }
				);
			}
			query.postId = new Types.ObjectId(postId);
		}
		const conversations = await Conversation.find(query)
			.sort({ updatedAt: -1 })
			.populate("users.userId", "name avatar email")
			.populate("postId", "title price photos seller location");
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
		const { userId1, userId2, postId } = body;

		if (!userId1 || !userId2) {
			return NextResponse.json(
				{ success: false, error: "Missing userId1 or userId2" },
				{ status: 400 }
			);
		}

		// Validate ids
		if (!Types.ObjectId.isValid(userId1) || !Types.ObjectId.isValid(userId2)) {
			return NextResponse.json(
				{ success: false, error: "Invalid user id(s)" },
				{ status: 400 }
			);
		}
		const postIdFilter = postId
			? Types.ObjectId.isValid(postId)
				? { postId: new Types.ObjectId(postId) }
				: null
			: undefined;
		if (postId && postIdFilter === null) {
			return NextResponse.json(
				{ success: false, error: "Invalid postId" },
				{ status: 400 }
			);
		}

		// Check if conversation already exists between these users for this post (if provided)
		const existingConversation = await Conversation.findOne({
			$and: [
				{ "users.userId": userId1 },
				{ "users.userId": userId2 },
				...(postIdFilter ? [postIdFilter] : []),
			],
		});

		if (existingConversation) {
			return NextResponse.json({ success: true, data: existingConversation });
		}

		// Create new conversation
		const conversation = await Conversation.create({
			postId: postIdFilter ? postIdFilter.postId : undefined,
			users: [
				{ userId: userId1, isActive: true, joinedAt: new Date() },
				{ userId: userId2, isActive: true, joinedAt: new Date() },
			],
		});

		// Populate the conversation with user data
		const populatedConversation = await Conversation.findById(conversation._id)
			.populate("users.userId", "name avatar email")
			.populate("postId", "title price photos seller location");

		return NextResponse.json({ success: true, data: populatedConversation });
	} catch (error: any) {
		console.error("/api/messages/conversations error", error);
		return NextResponse.json(
			{ success: false, error: error?.message || "Server error" },
			{ status: 500 }
		);
	}
}
