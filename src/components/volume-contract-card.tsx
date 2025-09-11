'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TradeLead, User, TradeLeadBid } from '@/lib/types';
import { Calendar, Tag, MapPin, Package, Gavel, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from './ui/button';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EcoBadge from './eco-badge';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface VolumeContractCardProps {
  lead: TradeLead;
  user?: User;
}

export default function VolumeContractCard({ lead, user }: VolumeContractCardProps) {
  const isBuyLead = lead.type === 'buy';

  const getBestBid = (bids: TradeLeadBid[]) => {
    if (!bids || bids.length === 0) return null;
    return bids.reduce((best, current) => {
        if (isBuyLead) {
            return current.pricePerUnit < best.pricePerUnit ? current : best;
        }
        return current.pricePerUnit > best.pricePerUnit ? current : best;
    });
  }

  const bestBid = getBestBid(lead.bids);


  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/trade-hub/${lead.id}`} className="group h-full block">
            <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={isBuyLead ? "destructive" : "default"} className="bg-opacity-80 flex items-center gap-1.5">
                    <Layers className="h-3 w-3"/>
                    <span>Volume Contract</span>
                  </Badge>
                  {user && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.dataAiHint} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-muted-foreground">{user.name}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg leading-tight pt-2">{lead.materialName}</h3>
                <p className="text-sm text-muted-foreground">{lead.category}</p>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow space-y-3 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Package className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Total Volume: <span className="font-medium text-foreground">{lead.volume.toLocaleString()} {lead.unit}</span></span>
                </div>
                 {bestBid && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Gavel className="h-4 w-4 flex-shrink-0 mt-0.5" />
                     <span>Best Bid: <span className="font-medium text-primary">${bestBid.pricePerUnit.toFixed(2)} / {lead.unit}</span> for <span className="font-medium text-foreground">{bestBid.volume?.toLocaleString() || 'Full Volume'} {lead.unit}</span></span>
                  </div>
                 )}
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Location: <span className="font-medium text-foreground">{lead.location}</span></span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className={cn(buttonVariants(), "w-full")}>
                  <Gavel className="mr-2 h-4 w-4" />
                  View & Bid
                </div>
              </CardFooter>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
           <div className="space-y-2">
            <div>
              <p className="font-bold text-base">{lead.materialName} ({isBuyLead ? 'Demand' : 'Supply'})</p>
              <p className="text-sm text-muted-foreground line-clamp-4">{lead.description}</p>
            </div>
            {lead.pricePerUnit && (
                <>
                    <Separator/>
                    <div className="text-sm">
                        <span className="font-semibold text-muted-foreground">Commit Now Price: </span>
                        <span className="font-bold text-primary">${lead.pricePerUnit.toFixed(2)} / {lead.unit} (Full Volume)</span>
                    </div>
                </>
            )}
            {user && user.badges.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold mb-1.5">Posted by {user.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {user.badges.map(badge => <EcoBadge key={badge} badgeName={badge} />)}
                  </div>
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
