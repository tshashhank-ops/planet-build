// types/next.d.ts
import { Server as IOServer } from "socket.io";
import { Socket } from "net";

declare module "http" {
	interface IncomingMessage {
		socket: Socket & { server: any };
	}
}

declare module "next" {
	interface User {
		_id?: string;
		name?: string;
		email?: string;
	}
}

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			role?: string;
			organisation?: string | null;
			dataAiHint?: string;
			badges?: string[];
			carbonCredits?: number;
			memberSince?: string;
			createdAt?: string;
		};
	}

	interface User {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		userData?: {
			id: string;
			name: string;
			email: string;
			image?: string;
			role: string;
			organisation?: string | null;
			dataAiHint?: string;
			badges: string[];
			carbonCredits: number;
			memberSince: string;
			createdAt: string;
		};
	}
}

export type NextApiResponseServerIO = {
	socket: {
		server: {
			io?: IOServer;
		};
	};
} & import("next").NextApiResponse;
