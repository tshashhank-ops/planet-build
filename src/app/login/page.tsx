"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Leaf } from "lucide-react";

const formSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email." }),
	password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const result = await login(values.email, values.password);
			if (result === null) {
				// Login was successful, user state will be updated by session sync
				toast({
					title: "Login Successful",
					description: "Welcome back! Redirecting...",
				});
				// Wait a moment for session to update, then redirect
				setTimeout(() => {
					router.push("/");
				}, 1000);
			} else {
				toast({
					title: "Login Failed",
					description: "Invalid email or password. Please try again.",
					variant: "destructive",
				});
				form.resetField("password");
			}
		} catch (error) {
			toast({
				title: "An Error Occurred",
				description: "Something went wrong. Please try again later.",
				variant: "destructive",
			});
		}
	}

	return (
		<div className="flex items-center justify-center py-12">
			<Card className="mx-auto max-w-sm">
				<CardHeader className="text-center">
					<div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
						<Leaf className="h-6 w-6" />
					</div>
					<CardTitle className="text-2xl font-bold font-headline">
						Welcome Back
					</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="name@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center">
											<FormLabel>Password</FormLabel>
											<Link
												href="#"
												className="ml-auto inline-block text-sm underline">
												Forgot your password?
											</Link>
										</div>
										<FormControl>
											<Input
												type="password"
												placeholder="••••••••"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full"
								disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Logging In..." : "Log In"}
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full bg-gray-100 hover:bg-gray-200 text-black mt-2 rounded-full flex items-center justify-between px-4"
								onClick={() => {
									import("next-auth/react").then(({ signIn }) =>
										signIn("google", { callbackUrl: "/" })
									);
								}}>
								<span className="flex-1 text-center">Continue with Google</span>
								<img
									src="https://www.svgrepo.com/show/355037/google.svg"
									alt="Google logo"
									className="w-5 h-5 ml-2"
								/>
							</Button>
						</form>
					</Form>
					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link href="/signup" className="underline">
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
