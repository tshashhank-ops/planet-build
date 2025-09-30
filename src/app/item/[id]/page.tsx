"use client";

import { use, useMemo, useState, useEffect, Key } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
// import { posts, users } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Star,
	MessageSquare,
	Truck,
	Gavel,
	Timer,
	AlertTriangle,
	X,
} from "lucide-react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import BuyingAssistant from "@/components/buying-assistant";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSocket } from "@/lib/socket";
import type { Message as ChatMessage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Bid, Post } from "@/lib/types";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import type { User, Organisation } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";

export default function ItemPage({ params }: { params: { id: string } }) {
	const { toast } = useToast();
	const { user: currentUser } = useAuth();
	const [post, setPost] = useState<Post | null>(null);
	const [seller, setSeller] = useState<User | null>(null);
	const [org, setOrg] = useState<Organisation | null>(null);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");

	useEffect(() => {
		async function fetchPostAndSeller() {
			if (!params.id) return;
			const postRes: Response = await fetch(`/api/posts/${params.id}`);
			if (!postRes.ok) return setPost(null);
			const postData = await postRes.json();
			const post: Post = postData.data;
			setPost(post);
			if (post?.seller) {
				const sellerRes: Response = await fetch(`/api/users/${post.seller}`);
				if (sellerRes.ok) {
					const sellerData = await sellerRes.json();
					setSeller(sellerData.data);
				} else {
					setSeller(null);
				}
			} else {
				setSeller(null);
			}
			if (post?.owner) {
				const orgRes: Response = await fetch(
					`/api/organisations/${post.owner}`
				);
				if (orgRes.ok) {
					const orgData = await orgRes.json();
					setOrg(orgData.data);
				} else {
					setOrg(null);
				}
			} else {
				setOrg(null);
			}
		}
		fetchPostAndSeller();
	}, [params.id]);

	// Join socket room and stream messages for the opened conversation
	useEffect(() => {
		const socket = getSocket();
		if (conversationId) {
			socket.emit("joinRoom", conversationId);
			const onNew = (msg: ChatMessage) => {
				if (msg.conversationId === conversationId) {
					setChatHistory((prev) => [...prev, msg]);
				}
			};
			socket.on("newMessage", onNew);
			return () => {
				socket.off("newMessage", onNew);
			};
		}
	}, [conversationId]);

	async function openChatWithSeller() {
		if (!currentUser || !seller || !post) return;
		try {
			const res = await fetch("/api/messages/conversations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId1: currentUser._id,
					userId2: (seller as any)._id || seller,
					postId: post._id,
				}),
			});
			const data = await res.json();
			if (data.success && data.data && data.data._id) {
				setConversationId(data.data._id);
				setIsChatOpen(true);
				const msgsRes = await fetch(
					`/api/messages?conversationId=${data.data._id}`
				);
				const msgs = await msgsRes.json();
				setChatHistory(msgs.success ? msgs.data : []);
			} else {
				toast({
					title: "Error",
					description: data.error || "Could not start conversation.",
					variant: "destructive",
				});
			}
		} catch (err) {
			toast({
				title: "Error",
				description: "Could not start conversation.",
				variant: "destructive",
			});
		}
	}

	const sendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !conversationId || !currentUser) return;
		const msg: ChatMessage = {
			_id: Date.now().toString(),
			conversationId,
			sentUserId: currentUser._id,
			text: newMessage,
			isEdited: false,
			isDeleted: false,
			deliveredTo: [],
			readBy: [],
			reactions: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		getSocket().emit("sendMessage", msg);
		setNewMessage("");
	};

	const isBiddingEnabled =
		post?.enableBidding &&
		post.auctionEndDate &&
		!isNaN(new Date(post.auctionEndDate).getTime());

	const highestBid = useMemo(() => {
		if (!isBiddingEnabled || !post) return 0;
		const bids = post.bidHistory || [];
		if (bids.length === 0) {
			return post.startingBid || 0;
		}
		return Math.max(...bids.map((b: any) => b.amount), post.startingBid || 0);
	}, [isBiddingEnabled, post]);

	const [timeLeft, setTimeLeft] = useState("");
	const [auctionEnded, setAuctionEnded] = useState(false);

	useEffect(() => {
		if (!isBiddingEnabled || !post?.auctionEndDate) {
			setTimeLeft("");
			setAuctionEnded(false);
			return;
		}

		const auctionEndDate = new Date(post.auctionEndDate);
		let intervalId: NodeJS.Timeout;

		const updateTimer = () => {
			const now = new Date();
			const difference = auctionEndDate.getTime() - now.getTime();

			if (difference <= 0) {
				setTimeLeft("Auction ended");
				setAuctionEnded(true);
				if (intervalId) clearInterval(intervalId);
				return;
			}

			const days = Math.floor(difference / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
			setAuctionEnded(false);
		};

		updateTimer();
		intervalId = setInterval(updateTimer, 1000);

		return () => clearInterval(intervalId);
	}, [isBiddingEnabled, post?.auctionEndDate]);

	const [bidAmount, setBidAmount] = useState<number | string>("");

	const handlePlaceBid = (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentUser) {
			toast({
				title: "Please Log In",
				description: "You must be logged in to place a bid.",
				variant: "destructive",
			});
			return;
		}

		const bidValue = Number(bidAmount);

		if (!bidAmount || isNaN(bidValue) || bidValue <= 0) {
			toast({
				title: "Invalid Bid",
				description: "Please enter a valid positive bid amount.",
				variant: "destructive",
			});
			return;
		}
		if (bidValue <= highestBid) {
			toast({
				title: "Bid Too Low",
				description: `Your bid must be higher than the current bid of $${highestBid.toFixed(
					2
				)}.`,
				variant: "destructive",
			});
			return;
		}

		if (!post) return;

		const newBid: Bid = {
			userId: currentUser._id,
			amount: bidValue,
			timestamp: new Date().toISOString(),
		};

		const updatedMaterial = {
			...post,
			bidHistory: [...(post.bidHistory || []), newBid],
		};
		setPost(updatedMaterial);

		toast({
			title: "Bid Placed!",
			description: `You successfully bid $${bidValue.toFixed(2)} on ${
				post.title
			}.`,
			className: "bg-primary text-primary-foreground",
		});
		setBidAmount("");
	};

	const handleBuyNow = () => {
		if (!post) return;
		toast({
			title: "Purchase Successful!",
			description: `You have purchased ${post.title} for $${post.price.toFixed(
				2
			)}.`,
			className: "bg-primary text-primary-foreground",
		});
	};

	if (post === null) {
		return <p>Loading...</p>;
	}

	return (
		<div className="grid md:grid-cols-3 gap-8 lg:gap-12">
			<div className="md:col-span-2">
				<Carousel className="w-full">
					<CarouselContent>
						{post.photos.map((src: string | StaticImport, index: number) => (
							<CarouselItem key={index}>
								<Card className="overflow-hidden">
									<Image
										src={src}
										alt={`${post.title} image ${index + 1}`}
										width={800}
										height={600}
										className="w-full h-auto object-cover aspect-[4/3]"
										data-ai-hint={post.dataAiHint}
									/>
								</Card>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="left-4" />
					<CarouselNext className="right-4" />
				</Carousel>

				{/* Seller-only photo management */}
				{currentUser && (
					<div className="mt-3 flex flex-wrap gap-2">
						<ImageUploader
							label="Add Photos"
							multiple
							onUpload={async (urls) => {
								const next = [...(post.photos || []), ...urls];
								setPost({ ...post, photos: next });
								await fetch(`/api/posts/${post._id}`, {
									method: "PUT",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ photos: next }),
								});
								toast({
									title: "Photo Update",
									description: `Photo URLs sent: ${next.join(", ")}`,
									variant: "default",
								});
							}}
						/>
						{post.photos?.map((url, i) => (
							<div key={url + "-" + i} className="flex items-center gap-2">
								<Button
									variant="outline"
									onClick={async () => {
										const next =
											post.photos?.filter((_, idx) => idx !== i) || [];
										setPost({ ...post, photos: next });
										await fetch(`/api/posts/${post._id}`, {
											method: "PUT",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ photos: next }),
										});

										toast({
											title: "Photo Update",
											description: `Photo URLs sent: ${next.join(", ")}`,
											variant: "default",
										});
									}}>
									Delete
								</Button>
								<ImageUploader
									label="Replace"
									onUpload={async (urls) => {
										const replacement = urls[0];
										if (!replacement) return;
										const next = (post.photos || []).map((p, idx) =>
											idx === i ? replacement : p
										);
										setPost({ ...post, photos: next });
										await fetch(`/api/posts/${post._id}`, {
											method: "PUT",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ photos: next }),
										});
										toast({
											title: "Photo Update",
											description: `Photo URLs sent: ${next.join(", ")}`,
											variant: "default",
										});
									}}
								/>
							</div>
						))}
					</div>
				)}

				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Description</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">{post.description}</p>
					</CardContent>
				</Card>

				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Specifications</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 text-sm">
							{Object.entries(post.specs || {}).map(([key, value]) => (
								<div key={key}>
									<p className="font-semibold">{key}</p>
									<p className="text-muted-foreground">{String(value)}</p>
								</div>
							))}
							{post.dimensions && (
								<div>
									<p className="font-semibold">Dimensions</p>
									<p className="text-muted-foreground">{post.dimensions}</p>
								</div>
							)}
							{post.weight && (
								<div>
									<p className="font-semibold">Weight</p>
									<p className="text-muted-foreground">{post.weight}</p>
								</div>
							)}
							{post.incoterms && (
								<div>
									<p className="font-semibold">Incoterms</p>
									<p className="text-muted-foreground">{post.incoterms}</p>
								</div>
							)}
							{post.hsCode && (
								<div>
									<p className="font-semibold">HS Code</p>
									<p className="text-muted-foreground">{post.hsCode}</p>
								</div>
							)}
							{post.specialHandling && (
								<div className="col-span-2 flex items-center gap-2 text-amber-600">
									<AlertTriangle className="h-4 w-4" />
									<p className="font-semibold">Requires Special Handling</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="md:col-span-1 space-y-6">
				{isBiddingEnabled ? (
					<Card>
						<CardHeader>
							<Badge
								className="w-fit mb-2"
								variant={
									post.condition === "reclaimed" ? "default" : "secondary"
								}>
								{post.condition}
							</Badge>
							<h1 className="text-3xl font-bold font-headline">{post.title}</h1>
							<p className="text-sm text-muted-foreground">{post.location}</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col sm:flex-row sm:justify-between rounded-lg border p-4 sm:items-center gap-4">
								<div className="flex-1">
									<p className="text-sm font-medium text-muted-foreground">
										Current Bid
									</p>
									<p className="text-xl md:text-2xl font-bold text-primary">
										${highestBid.toFixed(2)}
									</p>
								</div>
								<div className="text-left sm:text-right flex-1">
									<p className="text-sm font-medium text-muted-foreground">
										Time Left
									</p>
									<div className="flex items-center sm:justify-end gap-1.5 text-xl md:text-2xl font-bold">
										<Timer className="h-5 w-5" />
										<span>
											{auctionEnded ? "Ended" : timeLeft || "Loading..."}
										</span>
									</div>
								</div>
							</div>
							<p className="text-sm text-center text-muted-foreground -mt-2">
								{post.bidHistory?.length || 0} bids placed
							</p>

							{!auctionEnded ? (
								<>
									<form onSubmit={handlePlaceBid} className="space-y-3 pt-2">
										<div className="flex items-end gap-2">
											<div className="flex-grow">
												<label htmlFor="bid" className="text-sm font-medium">
													Your Bid
												</label>
												<Input
													id="bid"
													type="number"
													value={bidAmount}
													onChange={(e) => setBidAmount(e.target.value)}
													placeholder={`$${(highestBid + 1).toFixed(
														2
													)} or more`}
													step="1"
													min={highestBid + 1}
													className="mt-1"
													required
													disabled={!currentUser}
												/>
											</div>

											<Button
												type="submit"
												size="lg"
												className="h-[46px]"
												disabled={!currentUser}>
												<Gavel className="mr-2 h-4 w-4" /> Place Bid
											</Button>
										</div>
										{!currentUser && (
											<p className="text-xs text-destructive text-center">
												Please log in to place a bid.
											</p>
										)}
									</form>

									<div className="flex items-center gap-4">
										<div className="flex-1 border-t"></div>
										<span className="text-xs text-muted-foreground">OR</span>
										<div className="flex-1 border-t"></div>
									</div>

									<Button
										size="lg"
										variant="outline"
										className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
										onClick={handleBuyNow}>
										Buy Now for ${post.price.toFixed(2)}
									</Button>
								</>
							) : (
								<div className="text-center p-4 bg-muted rounded-md">
									<p className="font-semibold">This auction has ended.</p>
									<p className="text-sm text-muted-foreground">
										The winning bid was ${highestBid.toFixed(2)}.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader>
							<Badge
								className="w-fit mb-2"
								variant={
									post.condition === "reclaimed" ? "default" : "secondary"
								}>
								{post.condition}
							</Badge>
							<h1 className="text-3xl font-bold font-headline">{post.title}</h1>
							<p className="text-sm text-muted-foreground">{post.location}</p>
							<p className="text-4xl font-bold text-primary pt-2">
								${post.price.toFixed(2)}
							</p>
						</CardHeader>
						{currentUser && currentUser.role !== "seller" && (
							<CardContent className="space-y-4">
								<Button
									size="lg"
									className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
									onClick={handleBuyNow}>
									Buy Now
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="w-full"
									disabled={!currentUser || !seller}
									onClick={() => {
										if (!currentUser || !seller) {
											toast({
												title: "Please Log In",
												description:
													"You must be logged in to message the seller.",
												variant: "destructive",
											});
											return;
										}
										openChatWithSeller();
									}}>
									<MessageSquare className="mr-2 h-4 w-4" /> Message Seller
								</Button>
								<Button size="lg" variant="outline" className="w-full">
									<Truck className="mr-2 h-4 w-4" /> Get Delivery Quote
								</Button>
							</CardContent>
						)}
					</Card>
				)}

				{seller && <BuyingAssistant post={post} seller={seller} />}

				<Card>
					<CardHeader>
						<CardTitle>Sold By</CardTitle>
					</CardHeader>
					<CardContent>
						{seller && seller.name && seller._id && org && (
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage
										src={seller.avatar}
										alt={seller.name}
										data-ai-hint={seller.dataAiHint}
									/>
									<AvatarFallback>{seller.name?.charAt(0)}</AvatarFallback>
								</Avatar>
								<div>
									<Link
										href={`/profile/${seller._id}`}
										className="font-bold text-lg hover:underline">
										{seller.name}
									</Link>
									<div className="flex items-center gap-1 text-sm">
										{org.name && (
											<Link
												href={`/organisations/${org._id}`}
												className="hover:underline">
												{org.name}
											</Link>
										)}
										<br />
										<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
										{org.rating} (
										{Array.isArray(org.reviews) ? org.reviews.length : 0}{" "}
										reviews)
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Right-side chat drawer */}
			<Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
				<SheetContent side="right" className="w-full sm:w-[440px] p-0">
					<SheetHeader className="p-4 border-b flex flex-row items-center gap-3">
						<SheetTitle className="flex-1">
							Chat with Seller
							{seller && (
								<div className="flex items-center gap-4">
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={seller.avatar}
											alt={seller.name}
											data-ai-hint={seller.dataAiHint}
										/>
										<AvatarFallback>{seller.name?.charAt(0)}</AvatarFallback>
									</Avatar>
									<div>
										<Link
											href={`/profile/${seller._id}`}
											className="text-sm hover:underline">
											{seller.name}
										</Link>
									</div>
								</div>
							)}
						</SheetTitle>
						{/* <Button
							variant="ghost"
							size="icon"
							onClick={() => setIsChatOpen(false)}>
							<X className="h-4 w-4" />
						</Button> */}
					</SheetHeader>
					<div className="p-4 border-b flex items-center gap-3">
						{post && (
							<>
								{post.photos?.[0] ? (
									<img
										src={post.photos[0]}
										alt={post.title}
										className="h-12 w-12 rounded object-cover"
									/>
								) : (
									<div className="h-12 w-12 rounded bg-muted" />
								)}
								<div className="min-w-0">
									<p className="font-semibold truncate max-w-[260px]">
										{post.title}
									</p>
									<p className="text-xs text-muted-foreground truncate max-w-[260px]">
										{post.location} • ${post.price.toFixed(2)}
									</p>
								</div>
							</>
						)}
					</div>
					<ScrollArea className="h-[calc(100vh-260px)] p-4">
						<div className="space-y-3">
							{chatHistory.map((m) => (
								<div
									key={m._id}
									className={`flex ${
										m.sentUserId === currentUser?._id
											? "justify-end"
											: "justify-start"
									}`}>
									<div
										className={`px-3 py-2 rounded-lg max-w-[75%] ${
											m.sentUserId === currentUser?._id
												? "bg-primary text-primary-foreground"
												: "bg-gray-200"
										}`}>
										{m.text}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
					<form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
						<Input
							placeholder="Type a message"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
						/>
						<Button type="submit" disabled={!newMessage.trim()}>
							Send
						</Button>
					</form>
				</SheetContent>
			</Sheet>
		</div>
	);
}
