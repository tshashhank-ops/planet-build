
'use client';

import { useMemo, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { tradeLeads, users } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { TradeLead, TradeLeadBid, User } from '@/lib/types';
import Link from 'next/link';
import { Gavel, Timer, Package, MapPin, Calendar, ArrowDown, ArrowUp, User as UserIcon, Handshake, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ContractAssistant from '@/components/contract-assistant';

export default function TradeLeadPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const leadId = parseInt(params.id, 10);
  const initialLead = useMemo(() => tradeLeads.find((l) => l.id === leadId), [leadId]);

  const [lead, setLead] = useState(initialLead);

  useEffect(() => {
    setLead(initialLead);
  }, [initialLead]);

  const leadPoster = useMemo(() => {
    if (!lead) return null;
    return users.find((u) => u.id === lead.userId);
  }, [lead]);

  const [timeLeft, setTimeLeft] = useState('');
  const [auctionEnded, setAuctionEnded] = useState(false);

  useEffect(() => {
      if (!lead) return;
      const endDate = lead.biddingEndDate ? new Date(lead.biddingEndDate) : null;
      if (!endDate) {
          setTimeLeft('');
          setAuctionEnded(true); // No end date means no bidding
          return;
      }

      let intervalId: NodeJS.Timeout;
      
      const updateTimer = () => {
        const now = new Date();
        const difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft('Bidding ended');
          setAuctionEnded(true);
          if (intervalId) clearInterval(intervalId);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        setAuctionEnded(false);
      }

      updateTimer();
      intervalId = setInterval(updateTimer, 1000);

      return () => clearInterval(intervalId);
  }, [lead]);

  const isBuyLead = lead?.type === 'buy';

  const bestBid = useMemo(() => {
    if (!lead || lead.bids.length === 0) return lead?.pricePerUnit || 0;
    
    const bidPrices = lead.bids.map(b => b.pricePerUnit);
    if (isBuyLead) {
        // For a 'buy' lead (Demand), the best bid is the lowest price
        return Math.min(...bidPrices);
    } else {
        // For a 'sell' lead (Supply), the best bid is the highest price
        return Math.max(...bidPrices);
    }
  }, [lead, isBuyLead]);

  const sortedBids = useMemo(() => {
    if (!lead) return [];
    return [...lead.bids].sort((a, b) => {
        if (isBuyLead) {
            return a.pricePerUnit - b.pricePerUnit; // lowest first
        } else {
            return b.pricePerUnit - a.pricePerUnit; // highest first
        }
    });
  }, [lead, isBuyLead])

  const [bidAmount, setBidAmount] = useState<number | string>('');
  const [bidVolume, setBidVolume] = useState<number | string>('');

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
        toast({ title: 'Please Log In', description: 'You must be logged in to place a bid.', variant: 'destructive' });
        return;
    }

    if (!lead) return;
    
    if (currentUser.id === lead.userId) {
        toast({ title: 'Invalid Action', description: "You cannot bid on your own contract.", variant: 'destructive' });
        return;
    }

    const bidValue = Number(bidAmount);
    const volumeValue = bidVolume ? Number(bidVolume) : undefined;

    if (!bidAmount || isNaN(bidValue) || bidValue <= 0) {
      toast({ title: 'Invalid Bid', description: 'Please enter a valid positive price per unit.', variant: 'destructive' });
      return;
    }

    if (volumeValue && (isNaN(volumeValue) || volumeValue <= 0)) {
       toast({ title: 'Invalid Volume', description: 'Please enter a valid positive volume amount.', variant: 'destructive' });
      return;
    }

     if (volumeValue && volumeValue > lead.volume) {
       toast({ title: 'Volume Too High', description: `Your bid volume cannot exceed the total contract volume of ${lead.volume.toLocaleString()} ${lead.unit}.`, variant: 'destructive' });
      return;
    }


    if (lead.bids.length > 0 && !volumeValue) { // Only check best bid if bidding on full volume for simplicity
        if (isBuyLead && bidValue >= bestBid) {
            toast({ title: 'Bid Too High', description: `Your offer must be lower than the current best offer of $${bestBid.toFixed(2)} per ${lead.unit}.`, variant: 'destructive' });
            return;
        }
        if (!isBuyLead && bidValue <= bestBid) {
            toast({ title: 'Bid Too Low', description: `Your bid must be higher than the current best bid of $${bestBid.toFixed(2)} per ${lead.unit}.`, variant: 'destructive' });
            return;
        }
    }


    const newBid: TradeLeadBid = {
        userId: currentUser.id,
        pricePerUnit: bidValue,
        timestamp: new Date().toISOString(),
        volume: volumeValue
    };

    const updatedLead = {
        ...lead,
        bids: [...lead.bids, newBid],
    };
    setLead(updatedLead);

    toast({ title: 'Bid Placed!', description: `You successfully placed a bid of $${bidValue.toFixed(2)} per ${lead.unit}.`, className: 'bg-primary text-primary-foreground' });
    setBidAmount('');
    setBidVolume('');
  };

  const handleCommitNow = () => {
    if (!currentUser) {
        toast({ title: 'Please Log In', description: 'You must be logged in to commit to a contract.', variant: 'destructive' });
        return;
    }
    if (!lead || !lead.pricePerUnit) return;
    
    if (currentUser.id === lead.userId) {
        toast({ title: 'Invalid Action', description: "You cannot commit to your own contract.", variant: 'destructive' });
        return;
    }

    setAuctionEnded(true);

    toast({
        title: 'Commitment Successful!',
        description: `You have committed to the contract for "${lead.materialName}" at $${lead.pricePerUnit.toFixed(2)} per ${lead.unit}.`,
        className: 'bg-primary text-primary-foreground',
    });
};


  if (!lead || !leadPoster) {
    return notFound();
  }

  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/marketplace?tab=contracts">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Contracts
                </Link>
            </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2" variant={isBuyLead ? 'destructive' : 'default'}>{isBuyLead ? 'Demand' : 'Supply'}</Badge>
                <CardTitle className="font-headline">{lead.materialName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {lead.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{lead.description}</p>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Package className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Volume</p>
                            <p className="font-semibold">{lead.volume.toLocaleString()} {lead.unit}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Delivery Window</p>
                            <p className="font-semibold">{format(new Date(lead.deliveryAfter), 'MMM d, yyyy')} - {format(new Date(lead.deliveryBefore), 'MMM d, yyyy')}</p>
                        </div>
                    </div>
                    {lead.pricePerUnit && (
                        <div className="flex items-center gap-3">
                            {isBuyLead ? <ArrowDown className="h-6 w-6 text-green-500" /> : <ArrowUp className="h-6 w-6 text-green-500" />}
                            <div>
                                <p className="text-sm text-muted-foreground">{isBuyLead ? 'Target Price' : 'Commit Price'}</p>
                                <p className="font-semibold">${lead.pricePerUnit.toFixed(2)} / {lead.unit}</p>
                            </div>
                        </div>
                    )}
                     <div className="flex items-center gap-3">
                        <UserIcon className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Posted By</p>
                            <Link href={`/profile/${leadPoster.id}`} className="font-semibold hover:underline">{leadPoster.name}</Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bids</CardTitle>
                <CardDescription>
                  {lead.bids.length > 0 ? `A total of ${lead.bids.length} bids have been placed.` : 'No bids have been placed yet.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedBids.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Bidder</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead className="text-right">Price / {lead.unit}</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedBids.map((bid, index) => {
                                const bidder = users.find(u => u.id === bid.userId);
                                return (
                                    <TableRow key={index} className={index === 0 ? 'bg-primary/10' : ''}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={bidder?.avatar} alt={bidder?.name} data-ai-hint={bidder?.dataAiHint} />
                                                    <AvatarFallback>{bidder?.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{bidder?.name ?? 'Unknown'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{bid.volume ? `${bid.volume.toLocaleString()} ${lead.unit}` : 'Full Volume'}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">${bid.pricePerUnit.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-secondary rounded-md">
                        <p>Be the first to place a bid on this contract!</p>
                    </div>
                )}
              </CardContent>
            </Card>

          </div>

          <div className="md:col-span-1 space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between rounded-lg border p-4 sm:items-center gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">{isBuyLead ? 'Lowest Offer' : 'Highest Bid'}</p>
                            <p className="text-xl md:text-2xl font-bold text-primary">${bestBid.toFixed(2)}</p>
                        </div>
                        <div className="text-left sm:text-right flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Time Left</p>
                            <div className="flex items-center sm:justify-end gap-1.5 text-xl md:text-2xl font-bold">
                                <Timer className="h-5 w-5" />
                                <span>{auctionEnded ? 'Ended' : timeLeft || 'Loading...'}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!auctionEnded ? (
                    <>
                      <form onSubmit={handlePlaceBid} className="space-y-4 pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="bid" className="text-sm font-medium">Your Bid ($/{lead.unit})</label>
                                <Input
                                    id="bid"
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={isBuyLead ? `< ${bestBid.toFixed(2)}` : `> ${bestBid.toFixed(2)}`}
                                    step="0.01"
                                    className="mt-1"
                                    required
                                    disabled={!currentUser || currentUser.id === lead.userId}
                                />
                            </div>
                             <div>
                                <label htmlFor="volume" className="text-sm font-medium">Volume ({lead.unit})</label>
                                <Input
                                    id="volume"
                                    type="number"
                                    value={bidVolume}
                                    onChange={(e) => setBidVolume(e.target.value)}
                                    placeholder={`e.g., ${lead.volume / 2}`}
                                    className="mt-1"
                                    disabled={!currentUser || currentUser.id === lead.userId}
                                />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground text-center -mt-2">Leave volume blank to bid on the full amount.</p>
          
                          <Button type="submit" size="lg" className="w-full" disabled={!currentUser || auctionEnded || currentUser.id === lead.userId}>
                              <Gavel className="mr-2 h-4 w-4"/> Place Bid
                          </Button>
                          {!currentUser && <p className="text-xs text-destructive text-center">Please log in to place a bid.</p>}
                          {currentUser?.id === lead.userId && <p className="text-xs text-destructive text-center">You cannot bid on your own contract.</p>}
                      </form>

                      {lead.pricePerUnit && (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 border-t"></div>
                                <span className="text-xs text-muted-foreground">OR</span>
                                <div className="flex-1 border-t"></div>
                            </div>

                            <Button size="lg" variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCommitNow} disabled={!currentUser || auctionEnded || currentUser.id === lead.userId}>
                                <Handshake className="mr-2 h-4 w-4" /> {isBuyLead ? 'Fulfill Now at' : 'Commit Now for'} ${lead.pricePerUnit.toFixed(2)}
                            </Button>
                        </>
                      )}
                    </>
                  ) : (
                       <div className="text-center p-4 bg-muted rounded-md">
                          <p className="font-semibold">This contract is closed.</p>
                          <p className="text-sm text-muted-foreground">The final price was ${bestBid.toFixed(2)}.</p>
                       </div>
                  )}
                </CardContent>
              </Card>

              <ContractAssistant lead={lead} poster={leadPoster} />
          </div>
        </div>
    </div>
  );
}
