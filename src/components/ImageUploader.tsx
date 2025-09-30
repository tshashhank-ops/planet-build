"use client";

import {
	CldUploadButton,
	type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import React from "react";
import { Button } from "@/components/ui/button";

type ImageUploaderProps = {
	label?: string;
	onUpload: (urls: string[]) => void;
	multiple?: boolean;
	// Optional Cloudinary upload preset; if omitted, uses NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
	// uploadPreset?: string;
};

export default function ImageUploader({
	label = "Upload Image",
	onUpload,
	multiple = false,
}: // uploadPreset,
ImageUploaderProps) {
	const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const [error, setError] = React.useState<string>("");

	const handleResults = (result: CloudinaryUploadWidgetResults) => {
		setError("");
		const info = (result?.info as any) || {};
		if (Array.isArray(info)) {
			const urls = info.map((item) => item?.secure_url).filter(Boolean);
			if (urls.length) onUpload(urls);
			else setError("Upload failed: No valid image URLs returned.");
		} else if (info?.secure_url) {
			onUpload([info.secure_url]);
		} else {
			setError("Upload failed: No valid image URL returned.");
		}
	};

	const handleError = (err: any) => {
		setError("Upload failed: " + (err?.message || "Unknown error."));
	};

	return (
		<div>
			{preset ? (
				<CldUploadButton
					uploadPreset={preset}
					options={{
						multiple,
						sources: ["local", "url", "camera"],
						resourceType: "image",
					}}
					onUpload={handleResults}
					onError={handleError}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
					{label}
				</CldUploadButton>
			) : (
				<Button type="button" variant="outline" disabled>
					Cloudinary not configured
				</Button>
			)}
			{error && <div className="text-red-500 text-xs mt-2">{error}</div>}
		</div>
	);
}   