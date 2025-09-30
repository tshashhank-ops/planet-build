"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { posts } from '@/lib/mock-data';
import { getSellerSuggestions } from "../actions";
import { useState, useEffect } from "react";
import { Loader2, Sparkles, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import type { Post } from "@/lib/types";
// Image uploads removed from sell form; manage on the item page after creation

interface SellFormProps {
	post: Post | null;
	mode: "edit" | "create";
	onSuccess: () => void;
}

const formSchema = z
	.object({
		name: z.string().min(5, "Title must be at least 5 characters."),
		description: z
			.string()
			.min(20, "Description must be at least 20 characters."),
		category: z.string({ required_error: "Please select a category." }),
		condition: z.enum(["new", "reclaimed"], {
			required_error: "Please select the condition.",
		}),
		quantity: z.string().min(1, "Please enter the quantity."),
		price: z.coerce.number().positive("Price must be a positive number."),
		location: z.string().min(2, "Please enter a location."),

		dimensions: z.string().optional(),
		weight: z.string().optional(),
		incoterms: z.string().optional(),
		hsCode: z.string().optional(),
		specialHandling: z.boolean().default(false).optional(),

		enableBidding: z.boolean().default(false).optional(),
		startingBid: z.coerce.number().optional(),
		auctionEndDate: z.date().optional(),
	})
	.refine(
		(data) => {
			if (data.enableBidding) {
				return (
					data.startingBid !== undefined &&
					data.startingBid > 0 &&
					data.auctionEndDate !== undefined
				);
			}
			return true;
		},
		{
			message:
				"Starting bid and auction end date are required when bidding is enabled.",
			path: ["enableBidding"],
		}
	);

export default function SellForm({ post, mode, onSuccess }: SellFormProps) {
	const [isSuggesting, setIsSuggesting] = useState(false);
	const { toast } = useToast();
	const { user } = useAuth();
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			quantity: "",
			location: "",
			dimensions: "",
			weight: "",
			incoterms: "",
			hsCode: "",
			specialHandling: false,
			enableBidding: false,
		},
	});

	const condition = form.watch("condition");
	const enableBidding = form.watch("enableBidding");

	// Preload existing post details when editing
	useEffect(() => {
		if (mode === "edit" && post) {
			form.reset({
				name: post.title || "",
				description: post.description || "",
				category: typeof post.category === "string" ? post.category : "",
				condition: (post.condition as "new" | "reclaimed") || undefined,
				quantity:
					post.quantity !== undefined && post.quantity !== null
						? String(post.quantity)
						: "",
				price:
					post.price !== undefined && post.price !== null
						? Number(post.price)
						: (undefined as any),
				location: post.location || "",
				dimensions: post.dimensions || "",
				weight: post.weight || "",
				incoterms: post.incoterms || "",
				hsCode: post.hsCode || "",
				specialHandling: !!post.specialHandling,
				enableBidding: !!post.enableBidding,
				startingBid:
					post.startingBid !== undefined && post.startingBid !== null
						? Number(post.startingBid)
						: (undefined as any),
				auctionEndDate: post.auctionEndDate
					? new Date(post.auctionEndDate)
					: (undefined as any),
			});
			setUploadedPhotos(Array.isArray(post.photos) ? post.photos : []);
		}
	}, [mode, post, form]);

	useEffect(() => {
		if (!user) {
			toast({
				title: "Authentication Required",
				description: "You need to be logged in to list an item. Redirecting...",
				variant: "destructive",
			});
			router.push("/login");
		}
	}, [user, router, toast]);

	useEffect(() => {
		if (!enableBidding) {
			form.resetField("startingBid");
			form.resetField("auctionEndDate");
		}
	}, [enableBidding, form]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			let res;
			const payload = {
				title: values.name,
				description: values.description,
				category: values.category,
				condition: values.condition,
				quantity: Number(values.quantity),
				price: Number(values.price),
				location: values.location,
				dimensions: values.dimensions,
				weight: values.weight,
				incoterms: values.incoterms,
				hsCode: values.hsCode,
				specialHandling: values.specialHandling,
				enableBidding: values.enableBidding,
				startingBid: values.startingBid
					? Number(values.startingBid)
					: undefined,
				auctionEndDate: values.auctionEndDate
					? new Date(values.auctionEndDate).toISOString()
					: undefined,
				seller: user?._id,
				photos: uploadedPhotos,
			};
			if (mode === "edit" && post && post._id) {
				res = await fetch(`/api/posts/${post._id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
			} else {
				res = await fetch("/api/posts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
			}
			if (!res.ok)
				throw new Error(
					mode === "edit"
						? "Failed to update listing"
						: "Failed to create listing"
				);
			toast({
				title: mode === "edit" ? "Listing Updated!" : "Listing Created!",
				description:
					mode === "edit"
						? "Your material listing has been updated."
						: "Your material has been successfully listed on the marketplace.",
				variant: "default",
				className: "bg-primary text-primary-foreground",
			});
			form.reset();
			if (onSuccess) onSuccess();
		} catch (err) {
			toast({
				title: "Error",
				description:
					mode === "edit"
						? "Could not update listing."
						: "Could not create listing.",
				variant: "destructive",
			});
		}
	};

	const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

	const handleSuggestion = async () => {
		const description = form.getValues("description");
		if (!description || description.length < 20) {
			toast({
				title: "Description too short",
				description:
					"Please enter a longer description before getting suggestions.",
				variant: "destructive",
			});
			return;
		}
		setIsSuggesting(true);
		try {
			const result = await getSellerSuggestions({
				newMaterialDescription: description,
			});
			const currentCategory = form.getValues("category");
			// Set to the first suggestion if a category isn't already set
			if (!currentCategory && result.suggestedReclaimedMaterials.length > 0) {
				form.setValue("category", result.suggestedReclaimedMaterials[0]);
			}
			toast({
				title: "AI Suggestions Ready!",
				description: `We've analyzed your description. Check the category dropdown.`,
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Could not get AI suggestions.",
				variant: "destructive",
			});
		} finally {
			setIsSuggesting(false);
		}
	};

	// Fetch unique categories from all posts
	const [categories, setCategories] = useState<string[]>([]);

	useEffect(() => {
		async function fetchCategories() {
			try {
				const res = await fetch("/api/posts");
				if (!res.ok) throw new Error("Failed to fetch posts");
				const data = await res.json();
				const posts = data.data || [];
				const uniqueCategories: any[] = [
					...new Set(
						posts
							.map((post: any) =>
								typeof post.category === "string" ? post.category.trim() : ""
							)
							.filter((cat: any) => !!cat)
					),
				];
				setCategories(uniqueCategories);
			} catch {
				setCategories([]);
			}
		}
		fetchCategories();
	}, []);

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Redirecting to login...</p>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="flex items-center gap-4 p-4 rounded-lg bg-secondary border">
					<Avatar className="h-12 w-12">
						<AvatarImage
							src={user.avatar}
							alt={user.name}
							data-ai-hint={user.dataAiHint}
						/>
						<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<p className="text-sm text-muted-foreground">You are listing as:</p>
						<Link
							href={`/profile/${user._id}`}
							className="font-semibold hover:underline">
							{user.name}
						</Link>
					</div>
				</div>

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Item Title</FormLabel>
							<FormControl>
								<Input placeholder="e.g., Reclaimed Oak Beams" {...field} />
							</FormControl>
							<FormDescription>
								A clear, concise title will help buyers find your item.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Describe your item in detail, including its history, dimensions, and any wear or unique features."
									className="resize-y min-h-[120px]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<FormField
						control={form.control}
						name="condition"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel>Condition</FormLabel>
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex space-x-4">
										<FormItem className="flex items-center space-x-2 space-y-0">
											<FormControl>
												<RadioGroupItem value="new" />
											</FormControl>
											<FormLabel className="font-normal">New</FormLabel>
										</FormItem>
										<FormItem className="flex items-center space-x-2 space-y-0">
											<FormControl>
												<RadioGroupItem value="reclaimed" />
											</FormControl>
											<FormLabel className="font-normal">Reclaimed</FormLabel>
										</FormItem>
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="category"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Category</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a material category" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{categories.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{condition === "new" && (
					<Card className="bg-secondary border-dashed">
						<CardContent className="p-4 flex items-center justify-between">
							<div>
								<h4 className="font-semibold">Is this a new material?</h4>
								<p className="text-sm text-muted-foreground">
									Get AI suggestions for the best reclaimed category to list it
									under.
								</p>
							</div>
							<Button
								type="button"
								onClick={handleSuggestion}
								disabled={isSuggesting}>
								{isSuggesting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Sparkles className="mr-2 h-4 w-4" />
								)}
								Suggest Category
							</Button>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<FormField
						control={form.control}
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Quantity</FormLabel>
								<FormControl>
									<Input placeholder="e.g., 10 beams, 500 sq. ft." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{enableBidding ? "Buy Now Price ($)" : "Price ($)"}
								</FormLabel>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
										$
									</span>
									<FormControl>
										<Input
											type="number"
											placeholder="99.99"
											className="pl-7"
											value={field.value ?? ""}
											onChange={field.onChange}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="location"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Location</FormLabel>
								<FormControl>
									<Input placeholder="City, State" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Separator className="my-8" />
				<div className="space-y-2">
					<h3 className="text-xl font-semibold font-headline">
						Logistics & Shipping
					</h3>
					<p className="text-sm text-muted-foreground">
						Provide details for carriers to plan transportation.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<FormField
						control={form.control}
						name="dimensions"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Dimensions</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g., 4'x8'x1/2'' or 10m x 2m x 1m"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="weight"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Total Weight</FormLabel>
								<FormControl>
									<Input placeholder="e.g., 500 lbs or 225 kg" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="incoterms"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Incoterms</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select Incoterms" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="EXW">EXW (Ex Works)</SelectItem>
										<SelectItem value="FOB">FOB (Free On Board)</SelectItem>
										<SelectItem value="CIF">
											CIF (Cost, Insurance, and Freight)
										</SelectItem>
										<SelectItem value="DDP">
											DDP (Delivered Duty Paid)
										</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									International Commercial Terms for shipping.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="hsCode"
						render={({ field }) => (
							<FormItem>
								<FormLabel>HS Code</FormLabel>
								<FormControl>
									<Input placeholder="e.g., 4407.11.00" {...field} />
								</FormControl>
								<FormDescription>
									Harmonized System code for customs.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="specialHandling"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">
									Special Handling Required
								</FormLabel>
								<FormDescription>
									Does this material require special handling (e.g., fragile,
									hazardous)?
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<Separator className="my-8" />
				<div className="space-y-2">
					<h3 className="text-xl font-semibold font-headline">
						Pricing & Auction
					</h3>
				</div>

				<FormField
					control={form.control}
					name="enableBidding"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">
									Enable Bidding / Auction
								</FormLabel>
								<FormDescription>
									Allow buyers to place bids on this item. Ideal for bulk lots.
									The price above will be the "Buy Now" price.
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				{enableBidding && (
					<div className="space-y-8 rounded-lg border p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<FormField
								control={form.control}
								name="startingBid"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Starting Bid ($)</FormLabel>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
												$
											</span>
											<FormControl>
												<Input
													type="number"
													placeholder="50.00"
													className="pl-7"
													value={field.value ?? ""}
													onChange={field.onChange}
												/>
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="auctionEndDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Auction End Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value ?? undefined}
													onSelect={field.onChange}
													disabled={(date) =>
														date < new Date() || date < new Date("1900-01-01")
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				)}

				{/* Photo uploads are managed on the item page after listing is created */}

				<div className="flex justify-end">
					<Button type="submit" size="lg">
						Create Listing
					</Button>
				</div>
			</form>
		</Form>
	);
}
