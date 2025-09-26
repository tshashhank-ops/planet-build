"use client";

import React, {
	createContext,
	useState,
	useCallback,
	ReactNode,
	useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { users as mockUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<User | null>;
	logout: () => void;
	signup: (
		name: string,
		email: string,
		password: string
	) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const { data: session, status } = useSession();
	const router = useRouter();

	// Sync NextAuth session with local user state
	useEffect(() => {
		if (session?.user) {
			// Convert NextAuth user to our User type
			const nextAuthUser: User = {
				_id: session.user.id || "",
				id: session.user.id || "", // Alias for compatibility
				name: session.user.name || "",
				email: session.user.email || "",
				passwordHash: "oauth-user", // Placeholder for OAuth users
				avatar: session.user.image || "",
				role: (session.user.role as "buyer" | "seller" | "staff") || "buyer",
				organisation: session.user.organisation || undefined,
				dataAiHint:
					session.user.dataAiHint || session.user.name || "profile avatar",
				badges: session.user.badges || [],
				carbonCredits: session.user.carbonCredits || 0,
				memberSince: session.user.memberSince || new Date().toISOString(),
				createdAt: session.user.createdAt || new Date().toISOString(),
			};
			setUser(nextAuthUser);
		} else if (status === "unauthenticated") {
			setUser(null);
		}
	}, [session, status]);

	const login = useCallback(
		async (email: string, password: string): Promise<User | null> => {
			try {
				// Use NextAuth's signIn for credentials to persist session
				const { signIn } = await import("next-auth/react");
				const result = await signIn("credentials", {
					email,
					password,
					redirect: false,
				});

				if (result?.ok) {
					// The session will be automatically updated by the useEffect
					// that watches for session changes, so we don't need to setUser here
					return null; // Will be handled by session sync
				}
				return null;
			} catch {
				return null;
			}
		},
		[]
	);

	const logout = useCallback(async () => {
		setUser(null);
		// If user was logged in via NextAuth, sign them out
		if (session) {
			await signOut({ redirect: false });
		}
		router.push("/");
	}, [router, session]);

	const signup = useCallback(
		async (
			name: string,
			email: string,
			password: string
		): Promise<User | null> => {
			try {
				const res = await fetch("/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name,
						email,
						passwordHash: password,
						role: "buyer",
					}),
				});
				const data = await res.json();
				if (res.ok && data.success && data.data) {
					setUser(data.data);
					return data.data;
				}
				return null;
			} catch {
				return null;
			}
		},
		[]
	);

	return (
		<AuthContext.Provider value={{ user, login, logout, signup }}>
			{children}
		</AuthContext.Provider>
	);
}
