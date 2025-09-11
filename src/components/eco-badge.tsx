import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Recycle, ShieldCheck, Truck, Award } from "lucide-react";

interface EcoBadgeProps {
  badgeName: string;
}

const badgeConfig: { [key: string]: { icon: React.ElementType, description: string, className: string } } = {
  'Top Reclaimer': { icon: Recycle, description: "Frequently lists high-quality reclaimed materials.", className: "bg-green-100 text-green-800 border-green-300" },
  'Waste Warrior': { icon: Award, description: "A top seller dedicated to reducing construction waste.", className: "bg-blue-100 text-blue-800 border-blue-300" },
  'Fast Shipper': { icon: Truck, description: "Known for quick and reliable delivery coordination.", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  'Verified Seller': { icon: ShieldCheck, description: "This seller is recognized for reliability and trustworthiness.", className: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  'Verified Buyer': { icon: ShieldCheck, description: "This buyer is recognized for their prompt payment and clear communication.", className: "bg-purple-100 text-purple-800 border-purple-300" }
};

export default function EcoBadge({ badgeName }: EcoBadgeProps) {
  const config = badgeConfig[badgeName] || { icon: ShieldCheck, description: "A valued member of our community.", className: "bg-gray-100 text-gray-800" };
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{badgeName}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
