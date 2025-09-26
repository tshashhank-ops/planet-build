import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

const MONGO_URI =
	process.env.MONGO_URI || "mongodb://localhost:27017/planet_build";

async function seedUsers() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		// Clear existing users
		await User.deleteMany({});
		console.log("🗑️ Deleted existing users");

		// Create the users you specified with proper password hashes
		const usersData = [
			{
				name: "Bob Eco",
				email: "bob@ecorenovations.com",
				passwordHash: await bcrypt.hash("password123", 10),
				role: "seller",
				organisation: new mongoose.Types.ObjectId("68c0108bc8644e6b99e24b1b"),
				createdAt: new Date("2021-12-15T00:00:00.000Z"),
				memberSince: "2021-12-15",
				badges: ["Eco Warrior"],
				carbonCredits: 120,
				dataAiHint: "profile eco seller",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
			},
			{
				name: "Charlie Modern",
				email: "charlie@modernhomes.llc",
				passwordHash: await bcrypt.hash("password123", 10),
				role: "buyer",
				organisation: new mongoose.Types.ObjectId("68c0108bc8644e6b99e24b1c"),
				createdAt: new Date("2023-02-05T00:00:00.000Z"),
				memberSince: "2023-02-05",
				badges: ["Verified Buyer"],
				carbonCredits: 50,
				dataAiHint: "profile modern architect",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
			},
			{
				name: "Alice Builder",
				email: "alice@greenbuild.co",
				passwordHash: await bcrypt.hash("password123", 10),
				role: "staff",
				organisation: new mongoose.Types.ObjectId("68c0108bc8644e6b99e24b1a"),
				createdAt: new Date("2022-04-01T00:00:00.000Z"),
				memberSince: "2022-04-01",
				badges: ["Project Manager", "Sustainability Champ"],
				carbonCredits: 300,
				dataAiHint: "profile photo construction worker",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn",
			},
		];

		// Insert users
		const users = await User.insertMany(usersData);
		console.log(
			"✅ Created users:",
			users.map((u) => ({ email: u.email, name: u.name }))
		);

		console.log("\n📝 Test credentials:");
		console.log("Email: bob@ecorenovations.com | Password: password123");
		console.log("Email: charlie@modernhomes.llc | Password: password123");
		console.log("Email: alice@greenbuild.co | Password: password123");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error creating users:", error);
		process.exit(1);
	}
}

seedUsers();
