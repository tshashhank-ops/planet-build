import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { Providers } from "@/components/providers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/shared/sidebar";

export const metadata: Metadata = {
	title: "PlanetBuild Marketplace",
	description:
		"A sustainable digital marketplace for new and reclaimed building materials.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
					rel="stylesheet"></link>
				<link
					href="https://fonts.googleapis.com/icon?family=Material+Icons"
					rel="stylesheet"
				/>
			</head>
			<body className="font-body antialiased">
				<Providers>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset className="flex flex-col">
							<Header />
							<div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
								{children}
							</div>
							<Footer />
							<Toaster />
						</SidebarInset>
					</SidebarProvider>
				</Providers>
			</body>
		</html>
	);
}
