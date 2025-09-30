"use client";

import React, { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";

type OrgLogoUploaderProps = {
	orgId: string;
	currentLogo?: string;
	onUpdated?: (newLogoUrl: string) => void;
};

export default function OrgLogoUploader({
	orgId,
	currentLogo,
	onUpdated,
}: OrgLogoUploaderProps) {
	const [logo, setLogo] = useState<string | undefined>(currentLogo);
	const [saving, setSaving] = useState(false);

	const saveLogo = async (url: string) => {
		try {
			setSaving(true);
			const res = await fetch(`/api/organisations/${orgId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ logo: url }),
			});
			if (!res.ok) throw new Error("Failed to update logo");
			setLogo(url);
			onUpdated?.(url);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<ImageUploader
				label={logo ? "Change Logo" : "Upload Logo"}
				onUpload={(urls) => {
					if (urls[0]) saveLogo(urls[0]);
				}}
			/>
			{logo && (
				<Button type="button" variant="outline" disabled>
					{saving ? "Saving…" : "Saved"}
				</Button>
			)}
		</div>
	);
}
