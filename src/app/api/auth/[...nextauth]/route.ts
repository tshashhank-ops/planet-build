import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";

// --- Serverless-friendly Mongoose connection ---
let cached = (global as any).mongooseCache || { conn: null, promise: null };
(global as any).mongooseCache = cached;

async function connectToDB() {
	if (cached.conn) return cached.conn;
	if (!cached.promise) {
		cached.promise = mongoose.connect(process.env.MONGODB_URI!).then((m) => m);
	}
	cached.conn = await cached.promise;
	return cached.conn;
}

// --- NextAuth options ---
export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),

		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "email@example.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					await connectToDB();

					const user = await User.findOne({ email: credentials.email }).exec();
					if (!user) {
						return null;
					}

					const isValid = await bcrypt.compare(
						credentials.password,
						user.passwordHash
					);

					if (!isValid) {
						return null;
					}

					return {
						id: (user._id as any).toString(),
						name: user.name,
						email: user.email,
						image: user.avatar,
					};
				} catch (error) {
					console.error("Error in authorize:", error);
					return null;
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
		// Set maxAge for cookie persistence (e.g., 30 days)
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 1 day
	},
	jwt: {
		// Set cookie options for JWT
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "google") {
				try {
					await connectToDB();

					// Check if user exists in database
					let dbUser = await User.findOne({ email: user.email }).exec();

					if (!dbUser) {
						// Create new user if they don't exist
						dbUser = new User({
							name: user.name,
							email: user.email,
							passwordHash: "oauth-user", // Placeholder for OAuth users
							avatar: user.image,
							role: "buyer",
							dataAiHint: user.name || "profile avatar",
							badges: [],
							carbonCredits: 0,
							memberSince: new Date().toISOString(),
							createdAt: new Date(),
						});
						await dbUser.save();
					}

					// Update the user object with database ID
					user.id = (dbUser._id as any).toString();
				} catch (error) {
					console.error("Error during Google sign-in:", error);
					return false;
				}
			}
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				// Store user data in token for credential logins
				if (user.email) {
					try {
						await connectToDB();
						const dbUser = await User.findOne({ email: user.email }).exec();
						if (dbUser) {
							token.userData = {
								id: (dbUser._id as any).toString(),
								name: dbUser.name,
								email: dbUser.email,
								image: dbUser.avatar,
								role: dbUser.role,
								organisation: dbUser.organisation
									? (dbUser.organisation as any).toString()
									: null,
								dataAiHint: dbUser.dataAiHint,
								badges: dbUser.badges,
								carbonCredits: dbUser.carbonCredits,
								memberSince: dbUser.memberSince,
								createdAt: dbUser.createdAt.toISOString(),
							};
						}
					} catch (error) {
						console.error("Error fetching user data for JWT:", error);
					}
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id as string;
				// Add additional user data to session for both OAuth and credentials
				if (token.userData) {
					session.user = {
						...session.user,
						...token.userData,
					};
				}
			}
			return session;
		},
	},
	secret: process.env.JWT_SECRET || "fallback-secret",
};

// --- Route handlers for App Router ---
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
