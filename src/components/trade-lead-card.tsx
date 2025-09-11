'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TradeLead, User } from '@/lib/types';
import { Calendar, Tag, MapPin, Package, Gavel } from 'lucide-react';
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

interface TradeLeadCardProps {
  lead: TradeLead;
  user?: User;
}

export default function TradeLeadCard({ lead, user }: TradeLeadCardProps) {
  const isBuyLead = lead.type === 'buy';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/trade-hub/${lead.id}`} className="group h-full block">
            <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={isBuyLead ? "destructive" : "default"} className="bg-opacity-80">
                    {isBuyLead ? 'Demand' : 'Supply'}
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
                <p className="text-muted-foreground text-xs italic line-clamp-3">{lead.description}</p>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Package className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Volume: <span className="font-medium text-foreground">{lead.volume.toLocaleString()} {lead.unit}</span></span>
                </div>
                {lead.pricePerUnit && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Target Price: <span className="font-medium text-foreground">${lead.pricePerUnit.toFixed(2)} / {lead.unit}</span></span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Location: <span className="font-medium text-foreground">{lead.location}</span></span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Delivery: <span className="font-medium text-foreground">{format(new Date(lead.deliveryAfter), 'MMM d')} - {format(new Date(lead.deliveryBefore), 'MMM d, yyyy')}</span></span>
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
                        <span className="font-semibold text-muted-foreground">{isBuyLead ? 'Fulfill Now Price: ' : 'Commit Now Price: '}</span>
                        <span className="font-bold text-primary">${lead.pricePerUnit.toFixed(2)} / {lead.unit}</span>
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
