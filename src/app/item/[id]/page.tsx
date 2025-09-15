'use client';

import { use, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { posts, users } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, Truck, Gavel, Timer, AlertTriangle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import BuyingAssistant from '@/components/buying-assistant';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Bid } from '@/lib/types';

export default function ItemPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const itemId = parseInt(params.id, 10);
  const initialMaterial = useMemo(() => posts.find((m) => m.id === itemId), [itemId]);

  const [material, setMaterial] = useState(initialMaterial);

  if (!initialMaterial) {
    notFound();
  }

  useEffect(() => {
    setMaterial(initialMaterial);
  }, [initialMaterial]);

  const seller = useMemo(() => {
    if (!material) return null;
    return users.find((u) => u.id === material.ownerId);
  }, [material]);
  
  const isBiddingEnabled = material?.enableBidding && material.auctionEndDate && !isNaN(new Date(material.auctionEndDate).getTime());

  const highestBid = useMemo(() => {
    if (!isBiddingEnabled || !material) return 0;
    const bids = material.bidHistory || [];
    if (bids.length === 0) {
        return material.startingBid || 0;
    }
    return Math.max(...bids.map(b => b.amount), material.startingBid || 0);
  }, [isBiddingEnabled, material]);

  const [timeLeft, setTimeLeft] = useState('');
  const [auctionEnded, setAuctionEnded] = useState(false);

  useEffect(() => {
      if (!isBiddingEnabled || !material?.auctionEndDate) {
        setTimeLeft('');
        setAuctionEnded(false);
        return;
      };

      const auctionEndDate = new Date(material.auctionEndDate);
      let intervalId: NodeJS.Timeout;
      
      const updateTimer = () => {
        const now = new Date();
        const difference = auctionEndDate.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft('Auction ended');
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
  }, [isBiddingEnabled, material?.auctionEndDate]);

  const [bidAmount, setBidAmount] = useState<number | string>('');

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
        toast({ title: 'Please Log In', description: 'You must be logged in to place a bid.', variant: 'destructive' });
        return;
    }

    const bidValue = Number(bidAmount);

    if (!bidAmount || isNaN(bidValue) || bidValue <= 0) {
      toast({ title: 'Invalid Bid', description: 'Please enter a valid positive bid amount.', variant: 'destructive' });
      return;
    }
    if (bidValue <= highestBid) {
      toast({ title: 'Bid Too Low', description: `Your bid must be higher than the current bid of $${highestBid.toFixed(2)}.`, variant: 'destructive' });
      return;
    }

    if (!material) return;

    const newBid: Bid = {
        userId: currentUser.id,
        amount: bidValue,
        timestamp: new Date().toISOString(),
    };

    const updatedMaterial = {
        ...material,
        bidHistory: [...(material.bidHistory || []), newBid],
    };
    setMaterial(updatedMaterial);

    toast({ title: 'Bid Placed!', description: `You successfully bid $${bidValue.toFixed(2)} on ${material.title}.`, className: 'bg-primary text-primary-foreground' });
    setBidAmount('');
  };

  const handleBuyNow = () => {
    if (!material) return;
    toast({ title: 'Purchase Successful!', description: `You have purchased ${material.title} for $${material.price.toFixed(2)}.`, className: 'bg-primary text-primary-foreground'});
  };

  if (!material || !seller) {
    return notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
      <div className="md:col-span-2">
        <Carousel className="w-full">
          <CarouselContent>
            {material.photos.map((src, index) => (
              <CarouselItem key={index}>
                <Card className="overflow-hidden">
                  <Image
                    src={src}
                    alt={`${material.title} image ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover aspect-[4/3]"
                    data-ai-hint={material.dataAiHint}
                  />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{material.description}</p>
            </CardContent>
        </Card>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(material.specs).map(([key, value]) => (
                        <div key={key}>
                            <p className="font-semibold">{key}</p>
                            <p className="text-muted-foreground">{value}</p>
                        </div>
                    ))}
                    {material.dimensions && (
                        <div>
                            <p className="font-semibold">Dimensions</p>
                            <p className="text-muted-foreground">{material.dimensions}</p>
                        </div>
                    )}
                    {material.weight && (
                        <div>
                            <p className="font-semibold">Weight</p>
                            <p className="text-muted-foreground">{material.weight}</p>
                        </div>
                    )}
                    {material.incoterms && (
                        <div>
                            <p className="font-semibold">Incoterms</p>
                            <p className="text-muted-foreground">{material.incoterms}</p>
                        </div>
                    )}
                    {material.hsCode && (
                        <div>
                            <p className="font-semibold">HS Code</p>
                            <p className="text-muted-foreground">{material.hsCode}</p>
                        </div>
                    )}
                    {material.specialHandling && (
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
              <Badge className="w-fit mb-2" variant={material.condition === 'Reclaimed' ? 'default' : 'secondary'}>{material.condition}</Badge>
              <h1 className="text-3xl font-bold font-headline">{material.title}</h1>
              <p className="text-sm text-muted-foreground">{material.location}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between rounded-lg border p-4 sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Bid</p>
                    <p className="text-xl md:text-2xl font-bold text-primary">${highestBid.toFixed(2)}</p>
                </div>
                <div className="text-left sm:text-right flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Time Left</p>
                    <div className="flex items-center sm:justify-end gap-1.5 text-xl md:text-2xl font-bold">
                        <Timer className="h-5 w-5" />
                        <span>{auctionEnded ? 'Ended' : timeLeft || 'Loading...'}</span>
                    </div>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground -mt-2">
                {material.bidHistory?.length || 0} bids placed
              </p>
              
              {!auctionEnded ? (
              <>
                  <form onSubmit={handlePlaceBid} className="space-y-3 pt-2">
                      <div className="flex items-end gap-2">
                          <div className="flex-grow">
                              <label htmlFor="bid" className="text-sm font-medium">Your Bid</label>
                              <Input
                                  id="bid"
                                  type="number"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(e.target.value)}
                                  placeholder={`$${(highestBid + 1).toFixed(2)} or more`}
                                  step="1"
                                  min={highestBid + 1}
                                  className="mt-1"
                                  required
                                  disabled={!currentUser}
                              />
                          </div>
          
                          <Button type="submit" size="lg" className="h-[46px]" disabled={!currentUser}>
                              <Gavel className="mr-2 h-4 w-4"/> Place Bid
                          </Button>
                      </div>
                      {!currentUser && <p className="text-xs text-destructive text-center">Please log in to place a bid.</p>}
                  </form>

                  <div className="flex items-center gap-4">
                      <div className="flex-1 border-t"></div>
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 border-t"></div>
                  </div>

                  <Button size="lg" variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleBuyNow}>
                  Buy Now for ${material.price.toFixed(2)}
                  </Button>
              </>
              ) : (
                   <div className="text-center p-4 bg-muted rounded-md">
                      <p className="font-semibold">This auction has ended.</p>
                      <p className="text-sm text-muted-foreground">The winning bid was ${highestBid.toFixed(2)}.</p>
                   </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2" variant={material.condition === 'Reclaimed' ? 'default' : 'secondary'}>{material.condition}</Badge>
              <h1 className="text-3xl font-bold font-headline">{material.title}</h1>
              <p className="text-sm text-muted-foreground">{material.location}</p>
              <p className="text-4xl font-bold text-primary pt-2">${material.price.toFixed(2)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleBuyNow}>
                Buy Now
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" /> Message Seller
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                  <Truck className="mr-2 h-4 w-4" /> Get Delivery Quote
              </Button>
            </CardContent>
          </Card>
        )}

        <BuyingAssistant material={material} seller={seller} />

        <Card>
          <CardHeader>
            <CardTitle>Sold By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={seller.avatar} alt={seller.name} data-ai-hint={seller.dataAiHint} />
                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${seller.id}`} className="font-bold text-lg hover:underline">
                  {seller.name}
                </Link>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{seller.rating} ({seller.reviews.length} reviews)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
