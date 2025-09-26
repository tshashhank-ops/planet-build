import type {
	Post,
	User,
	Review,
	Conversation,
	Bid,
	TradeLead,
	Message,
} from "./types";

export const users: User[] = [
	{
		_id: "1",
		id: "1",
		name: "GreenBuild Co.",
		email: "contact@greenbuild.co",
		passwordHash: "hashed_password_1",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robin",
		role: "seller",
		rating: 4.8,
		memberSince: "2022-03-15",
		reviews: [
			{
				_id: "1",
				authorId: "2",
				rating: 5,
				comment: "Excellent materials, fast delivery!",
				date: "2023-05-20",
			},
			{
				_id: "2",
				authorId: "3",
				rating: 4,
				comment: "Good quality wood, as described.",
				date: "2023-04-11",
			},
		],
		badges: ["Top Reclaimer", "Fast Shipper", "Verified Seller"],
		carbonCredits: 1250,
		dataAiHint: "construction company logo",
		createdAt: "2022-03-15T00:00:00Z",
	},
	{
		_id: "2",
		id: "2",
		name: "Eco Renovations",
		email: "info@ecorenovations.com",
		passwordHash: "hashed_password_2",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
		role: "seller",
		rating: 4.5,
		memberSince: "2021-11-01",
		reviews: [
			{
				_id: "3",
				authorId: "1",
				rating: 5,
				comment: "Great windows!",
				date: "2023-08-01",
			},
		],
		badges: ["Waste Warrior", "Verified Seller"],
		carbonCredits: 850,
		dataAiHint: "eco logo",
		createdAt: "2021-11-01T00:00:00Z",
	},
	{
		_id: "3",
		id: "3",
		name: "Modern Homes LLC",
		email: "sales@modernhomes.llc",
		passwordHash: "hashed_password_3",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
		role: "buyer",
		rating: 4.9,
		memberSince: "2023-01-20",
		reviews: [],
		badges: ["Verified Buyer"],
		carbonCredits: 150,
		dataAiHint: "modern architecture logo",
		createdAt: "2023-01-20T00:00:00Z",
	},
];

export const posts: Post[] = [
	{
		id: 1,
		title: "reclaimed Douglas Fir Beams",
		price: 2500.0,
		description:
			"Beautiful, dense Douglas Fir beams salvaged from a 1920s warehouse. Perfect for mantels, exposed rafters, or structural use. Rich patina and history in every piece.",
		condition: "reclaimed",
		photos: [
			"https://placehold.co/600x400.png",
			"https://placehold.co/600x400.png",
		],
		ownerId: 1,
		category: "Wood",
		location: "Oakland, CA",
		quantity: "10 beams",
		specs: { "Wood Species": "Douglas Fir", Age: "Approx. 100 years" },
		incoterms: "EXW",
		hsCode: "4407.11.00",
		weight: "Approx. 1500 lbs total",
		dimensions: 'Each beam: 8" x 8" x 12\'',
		specialHandling: true,
		dataAiHint: "reclaimed wood",
		enableBidding: true,
		auctionEndDate: new Date(
			Date.now() + 3 * 24 * 60 * 60 * 1000
		).toISOString(),
		startingBid: 100.0,
		bidHistory: [
			{
				userId: 2,
				amount: 110.0,
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			},
			{
				userId: 3,
				amount: 125.0,
				timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
	{
		id: 2,
		title: "New Double-Hung Vinyl Windows",
		price: 250.0,
		description:
			"Surplus from a large construction project. High-efficiency, low-E glass, argon-filled. Never installed, still in original packaging.",
		condition: "New",
		photos: [
			"https://placehold.co/600x400.png",
			"https://placehold.co/600x400.png",
		],
		ownerId: 3,
		category: "Windows & Doors",
		location: "Reno, NV",
		quantity: "5 available",
		specs: { Material: "Vinyl", Glass: "Low-E, Argon-filled" },
		dimensions: '36" x 48"',
		weight: "35 lbs each",
		dataAiHint: "house window",
	},
	{
		id: 3,
		title: "Vintage Red Bricks (Lot of 2000)",
		price: 1200.0,
		description:
			"Classic red clay bricks from a historic downtown building. Ideal for accent walls, patios, or garden paths. This listing is for the entire lot of approximately 2000 bricks.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 2,
		category: "Masonry",
		location: "Chicago, IL",
		quantity: "Approx. 2000 available",
		specs: { Type: "Clay Brick", Color: "Red", Style: "Vintage" },
		incoterms: "FOB",
		hsCode: "6904.10.00",
		weight: "Approx. 9000 lbs total (on pallets)",
		dimensions: "Lot fits on 4 standard pallets",
		specialHandling: false,
		dataAiHint: "bricks stack",
		enableBidding: true,
		auctionEndDate: new Date(
			Date.now() + 5 * 24 * 60 * 60 * 1000
		).toISOString(),
		startingBid: 500.0,
		bidHistory: [],
	},
	{
		id: 4,
		title: "Leftover Drywall Sheets",
		price: 10.0,
		description:
			"Standard 1/2 inch drywall sheets, leftover from a home renovation. Full sheets, no damage. Must take all.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 1,
		category: "Drywall & Insulation",
		location: "Austin, TX",
		quantity: "8 sheets",
		specs: { Thickness: "1/2 inch", Type: "Standard" },
		dimensions: "4' x 8'",
		dataAiHint: "drywall stack",
	},
	{
		id: 5,
		title: "Salvaged Maple Flooring (500 sq. ft.)",
		price: 3500.0,
		description:
			"Hard maple tongue-and-groove flooring from a retired gymnasium. Shows character marks and original court lines in some sections. This listing is for the entire lot of 500 sq. ft.",
		condition: "reclaimed",
		photos: [
			"https://placehold.co/600x400.png",
			"https://placehold.co/600x400.png",
		],
		ownerId: 2,
		category: "Flooring",
		location: "Portland, OR",
		quantity: "500 sq. ft.",
		specs: { "Wood Species": "Hard Maple", Width: '2.25"', Condition: "Used" },
		dataAiHint: "wood flooring",
		enableBidding: true,
		auctionEndDate: new Date(
			Date.now() + 2 * 24 * 60 * 60 * 1000
		).toISOString(),
		startingBid: 1500.0,
		bidHistory: [
			{
				userId: 1,
				amount: 1550.0,
				timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
	{
		id: 6,
		title: "New Galvanized Steel Studs",
		price: 5.0,
		description:
			"Over-ordered galvanized steel studs for a commercial project. Lightweight and resistant to rot and fire. Price per stud.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 3,
		category: "Framing",
		location: "Denver, CO",
		quantity: "150 studs",
		specs: { Material: "Galvanized Steel", Gauge: "25" },
		dimensions: "3 5/8\" x 8'",
		dataAiHint: "steel studs",
	},
	{
		id: 7,
		title: "Antique Clawfoot Bathtub",
		price: 400.0,
		description:
			"Beautifully preserved cast iron clawfoot tub from the early 20th century. Recently reglazed. A stunning centerpiece for any bathroom renovation.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 2,
		category: "Plumbing & Fixtures",
		location: "Savannah, GA",
		quantity: "1",
		specs: { Material: "Cast Iron", Era: "Victorian" },
		dimensions: "5 feet long",
		weight: "Approx. 300 lbs",
		specialHandling: true,
		dataAiHint: "clawfoot bathtub",
		enableBidding: true,
		auctionEndDate: new Date(
			Date.now() + 4 * 24 * 60 * 60 * 1000
		).toISOString(),
		startingBid: 150.0,
		bidHistory: [
			{
				userId: 3,
				amount: 160.0,
				timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
			},
			{
				userId: 1,
				amount: 175.0,
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
	{
		id: 8,
		title: "Unused Subway Tiles",
		price: 50.0,
		description:
			"Two boxes of classic white ceramic subway tiles left over from a kitchen remodel. Perfect for a small backsplash or project. Total of 25 sq. ft.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 1,
		category: "Tile",
		location: "Brooklyn, NY",
		quantity: "2 boxes (25 sq. ft.)",
		specs: { Material: "Ceramic", Color: "White", Finish: "Gloss" },
		dimensions: 'Tiles are 3" x 6"',
		dataAiHint: "subway tile",
	},
	{
		id: 9,
		title: "Premium Organic Compost Blend",
		price: 25.0,
		description:
			"A rich blend of organic compost, perfect for garden beds and enriching soil. Sold by the cubic yard.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 1,
		category: "Soil & Compost",
		location: "Boulder, CO",
		quantity: "50 cubic yards",
		specs: { Type: "Organic Compost", Use: "Gardening, Landscaping" },
		dataAiHint: "rich soil",
	},
	{
		id: 10,
		title: "reclaimed Granite Pavers",
		price: 8.0,
		description:
			"Durable and beautiful granite pavers salvaged from a city plaza renovation. Perfect for patios, walkways, or driveways. Price per paver.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 2,
		category: "Hardscaping",
		location: "Philadelphia, PA",
		quantity: "400 pavers",
		specs: { Material: "Granite", Color: "Gray Speckled" },
		dimensions: '6" x 9" x 2"',
		weight: "14 lbs each",
		dataAiHint: "granite pavers",
	},
	{
		id: 11,
		title: "Overstock Denim Fabric Roll",
		price: 150.0,
		description:
			"High-quality 12oz denim fabric, overstock from a major apparel manufacturer. Ideal for jeans, jackets, or upholstery.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 3,
		category: "Fabric Rolls",
		location: "Los Angeles, CA",
		quantity: "1 roll (50 yards)",
		specs: { Material: "Cotton Denim", Weight: "12oz" },
		dataAiHint: "denim fabric",
	},
	{
		id: 12,
		title: "Upcycled Leather Off-cuts",
		price: 45.0,
		description:
			"A mixed box of genuine leather off-cuts from a luxury handbag maker. Various colors and textures. Perfect for crafting, jewelry, and small leather goods.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 1,
		category: "Leather Hides",
		location: "New York, NY",
		quantity: "1 box (10 lbs)",
		specs: { Type: "Genuine Leather", Source: "Post-industrial scrap" },
		dataAiHint: "leather scraps",
	},
	{
		id: 13,
		title: "Bulk Resistor Kit (10,000 pcs)",
		price: 75.0,
		description:
			"Surplus inventory of a comprehensive resistor kit. Contains a wide range of values, perfect for electronics labs, hobbyists, or repair shops.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 2,
		category: "Passive Components",
		location: "San Jose, CA",
		quantity: "1 kit",
		specs: { Type: "Carbon Film Resistors", Tolerance: "5%" },
		dataAiHint: "electronic resistors",
	},
	{
		id: 14,
		title: "Salvaged CPU Chips (Lot of 50)",
		price: 200.0,
		description:
			"A lot of 50 assorted CPU chips, carefully extracted from decommissioned servers and desktop computers. For gold recovery, art projects, or collectors.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 3,
		category: "Semiconductors",
		location: "Phoenix, AZ",
		quantity: "1 lot",
		specs: {
			Source: "E-waste recycling",
			Condition: "Untested, for material recovery",
		},
		specialHandling: true,
		dataAiHint: "cpu chips",
	},
	{
		id: 15,
		title: "Used All-Season Tires (Set of 4)",
		price: 180.0,
		description:
			"A set of four gently used all-season tires with significant tread life remaining. Size: 225/65R17. No patches or plugs.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 1,
		category: "Tires & Wheels",
		location: "Detroit, MI",
		quantity: "1 set of 4",
		specs: { Type: "All-Season", Size: "225/65R17", "Tread Depth": '7/32"' },
		dataAiHint: "car tires",
	},
	{
		id: 16,
		title: "Remanufactured Alternator",
		price: 90.0,
		description:
			"Professionally remanufactured alternator for late model Ford F-150 trucks (2015-2020). Tested and comes with a 90-day warranty.",
		condition: "reclaimed",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 2,
		category: "Engine Components",
		location: "Houston, TX",
		quantity: "1 unit",
		specs: {
			"Part Type": "Alternator",
			Compatibility: "Ford F-150 (2015-2020)",
			Condition: "Remanufactured",
		},
		dataAiHint: "car alternator",
	},
	{
		id: 17,
		title: "Assorted Boxwood Shrubs",
		price: 45.0,
		description:
			"2-gallon boxwood shrubs, perfect for hedges and borders. Hardy and deer-resistant. Overstock from a landscaping project.",
		condition: "New",
		photos: ["https://placehold.co/600x400.png"],
		ownerId: 2,
		category: "Plants",
		location: "Richmond, VA",
		quantity: "25 shrubs",
		specs: { Type: "Buxus", Size: "2-gallon pot" },
		dataAiHint: "boxwood shrub",
	},
];

export const conversations: Conversation[] = [
	{
		_id: "c1",
		isActive: true,
		users: [
			{
				userId: users[0]._id,
				isActive: true,
				joinedAt: new Date(Date.now() - 3600000).toISOString(),
			},
			{
				userId: users[1]._id,
				isActive: true,
				joinedAt: new Date(Date.now() - 3500000).toISOString(),
			},
		],
		createdAt: new Date(Date.now() - 3600000).toISOString(),
		updatedAt: new Date().toISOString(),
		lastMessage: {
			_id: "m1",
			conversationId: "c1",
			sentUserId: users[1]._id,
			text: "Yes, the project files are ready for review. When can we meet?",
			isEdited: false,
			isDeleted: false,
			deliveredTo: [users[0]._id, users[1]._id],
			readBy: [users[0]._id],
			reaction: {},
			createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
			updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
		},
		unreadCount: 1,
	},
	{
		_id: "c2",
		isActive: true,
		users: [
			{
				userId: users[0]._id,
				isActive: true,
				joinedAt: new Date(Date.now() - 7200000).toISOString(),
			},
			{
				userId: users[2]._id,
				isActive: true,
				joinedAt: new Date(Date.now() - 7100000).toISOString(),
			},
		],
		createdAt: new Date(Date.now() - 7200000).toISOString(),
		updatedAt: new Date().toISOString(),
		lastMessage: {
			_id: "m2",
			conversationId: "c2",
			sentUserId: users[0]._id,
			text: "Great, I can pick up the documents tomorrow afternoon.",
			isEdited: false,
			isDeleted: false,
			deliveredTo: [users[0]._id, users[2]._id],
			readBy: [users[0]._id],
			reaction: {},
			createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
			updatedAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
		},
		unreadCount: 1,
	},
];

// Messages
export const messages: Message[] = [
	{
		_id: "m1",
		conversationId: "c1",
		sentUserId: users[0]._id,
		text: "Hello, are the project files ready for review?",
		isEdited: false,
		isDeleted: false,
		deliveredTo: [users[0]._id, users[1]._id],
		readBy: [users[0]._id],
		reaction: {},
		createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
		updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
	},
	{
		_id: "m2",
		conversationId: "c1",
		sentUserId: users[1]._id,
		text: "Yes, the project files are ready for review. When can we meet?",
		isEdited: false,
		isDeleted: false,
		deliveredTo: [users[0]._id, users[1]._id],
		readBy: [users[0]._id],
		reaction: {},
		createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
		updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
	},
	{
		_id: "m3",
		conversationId: "c2",
		sentUserId: users[0]._id,
		text: "Great, I can pick up the documents tomorrow afternoon.",
		isEdited: false,
		isDeleted: false,
		deliveredTo: [users[0]._id, users[2]._id],
		readBy: [users[0]._id],
		reaction: {},
		createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
		updatedAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
	},
];

export const tradeLeads: TradeLead[] = [
	{
		id: 1,
		type: "sell",
		contractType: "volume",
		userId: 1,
		materialName: "Recycled Concrete Aggregate",
		category: "Masonry",
		description:
			"Future supply of high-quality recycled concrete aggregate (RCA) from certified demolition projects. Meets ASTM C33 standards.",
		volume: 10000,
		unit: "tons",
		pricePerUnit: 15.0,
		location: "Oakland, CA",
		deliveryAfter: new Date(
			Date.now() + 60 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 120 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		biddingEndDate: new Date(
			Date.now() + 14 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [
			{
				userId: 3,
				pricePerUnit: 15.5,
				volume: 5000,
				timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				userId: 2,
				pricePerUnit: 16.0,
				volume: 10000,
				timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
	{
		id: 2,
		type: "buy",
		userId: 3,
		materialName: "Structural Steel Beams",
		category: "Framing",
		description:
			"Seeking a large volume of I-beams for a new commercial building. New or high-grade reclaimed considered. Various lengths needed.",
		volume: 50,
		unit: "tons",
		pricePerUnit: 800.0,
		location: "Denver, CO",
		deliveryAfter: new Date(
			Date.now() + 30 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 90 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		biddingEndDate: new Date(
			Date.now() + 10 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [
			{
				userId: 1,
				pricePerUnit: 790.0,
				timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
	{
		id: 3,
		type: "sell",
		userId: 2,
		materialName: "Bulk Organic Compost",
		category: "Soil & Compost",
		description:
			"Commit to a large volume of our premium, nutrient-rich organic compost for the fall planting season. Produced from local green waste.",
		volume: 5000,
		unit: "cubic yards",
		pricePerUnit: 22.0,
		location: "Portland, OR",
		deliveryAfter: new Date(
			Date.now() + 90 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 150 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
		biddingEndDate: new Date(
			Date.now() + 30 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [],
	},
	{
		id: 4,
		type: "buy",
		userId: 1,
		materialName: "rPET Pellets",
		category: "Fabric Rolls",
		description:
			"Looking for a consistent supplier of clear, food-grade recycled PET pellets for our packaging manufacturing line.",
		volume: 20,
		unit: "tons",
		location: "Los Angeles, CA",
		deliveryAfter: new Date(
			Date.now() + 15 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 45 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date().toISOString(),
		biddingEndDate: new Date(
			Date.now() + 5 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [],
	},
	{
		id: 5,
		type: "buy",
		userId: 2,
		materialName: "Bulk Order of Native Perennial Plugs",
		category: "Plants",
		description:
			"Large landscaping project requires a diverse mix of native perennial plugs suitable for Zone 7. Seeking a supplier for a future delivery. Mix should include species like Echinacea, Rudbeckia, and Panicum.",
		volume: 5000,
		unit: "plugs",
		pricePerUnit: 1.25,
		location: "Asheville, NC",
		deliveryAfter: new Date(
			Date.now() + 90 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 120 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		biddingEndDate: new Date(
			Date.now() + 20 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [],
	},
	{
		id: 6,
		type: "sell",
		userId: 1,
		materialName: "Future Availability: Certified Organic Topsoil",
		category: "Soil & Compost",
		description:
			"We will have a large surplus of premium, screened organic topsoil available after a major site development. Perfect for landscaping companies and large-scale garden projects. Taking commitments now.",
		volume: 2000,
		unit: "cubic yards",
		pricePerUnit: 30,
		location: "Boulder, CO",
		deliveryAfter: new Date(
			Date.now() + 60 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 90 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		biddingEndDate: new Date(
			Date.now() + 25 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [
			{
				userId: 3,
				pricePerUnit: 31,
				timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
	{
		id: 7,
		type: "buy",
		userId: 3,
		materialName: "Ipe Hardwood Decking",
		category: "Hardscaping",
		description:
			"Seeking a supplier for a future project requiring approximately 1000 square feet of Ipe or similar high-density hardwood decking.",
		volume: 1000,
		unit: "sq. ft.",
		pricePerUnit: 12,
		location: "Miami, FL",
		deliveryAfter: new Date(
			Date.now() + 45 * 24 * 60 * 60 * 1000
		).toISOString(),
		deliveryBefore: new Date(
			Date.now() + 75 * 24 * 60 * 60 * 1000
		).toISOString(),
		timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		biddingEndDate: new Date(
			Date.now() + 10 * 24 * 60 * 60 * 1000
		).toISOString(),
		bids: [
			{
				userId: 1,
				pricePerUnit: 11.5,
				timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			},
		],
	},
];
