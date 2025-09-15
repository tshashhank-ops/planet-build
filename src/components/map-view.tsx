'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Navigation, Loader2, List } from 'lucide-react';
import type { Post } from '@/lib/types';

interface MapViewProps {
  materials: Post[];
}

export default function MapView({ materials }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError(`Error: ${error.message}. Please enable location services.`);
        setIsLoadingLocation(false);
      }
    );
  };
  
  useEffect(() => {
    if (materials.length > 0 && !materials.find(m => m.id === selectedPost?.id)) {
      setSelectedPost(materials[0]);
    } else if (materials.length === 0) {
        setSelectedPost(null);
    }
  }, [materials, selectedPost]);

  return (
    <Card className="h-[600px] lg:h-[700px] w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden">
      <div className="col-span-1 flex flex-col h-full border-r">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5"/>
            Listings
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow">
          <div className="p-4 pt-0 space-y-2">
            {materials.map((post) => (
              <Button
                key={post.id}
                variant={selectedPost?.id === post.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-auto py-2 text-left"
                onClick={() => setSelectedPost(post)}
              >
                <MapPin className="mr-3 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold leading-tight">{post.title}</p>
                  <p className="text-sm text-muted-foreground">{post.location}</p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="col-span-2 bg-muted relative flex flex-col justify-center items-center p-4">
        <Image src="https://placehold.co/1200x800.png" alt="Map of listings" fill className="object-cover" data-ai-hint="city map" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute top-4 right-4 z-10">
            {userLocation ? (
                 <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs shadow-lg">
                     <p className="font-semibold text-primary">Your Location</p>
                     <p>Lat: {userLocation.lat.toFixed(4)}, Lon: {userLocation.lon.toFixed(4)}</p>
                 </div>
            ) : (
                <Button onClick={handleGetLocation} disabled={isLoadingLocation}>
                    {isLoadingLocation ? <Loader2 className="animate-spin" /> : <MapPin />}
                    <span>Get My Location</span>
                </Button>
            )}
        </div>

        {locationError && <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground p-3 rounded-md z-10 text-sm shadow-lg">{locationError}</div>}

    {selectedPost && (
       <Card className="z-10 w-11/12 max-w-md bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{selectedPost.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{selectedPost.location}</span>
          </div>
          {userLocation ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">DISTANCE</p>
                <p className="text-lg font-bold text-primary">{(Math.random() * 50 + 5).toFixed(1)} miles</p>
              </div>
               <Button className="w-full" size="lg">
                <Navigation className="mr-2"/>
                Get Directions
              </Button>
            </div>
          ) : (
             <p className="text-sm text-center text-muted-foreground p-4 bg-secondary rounded-md">
               Click &quot;Get My Location&quot; to calculate distance and directions.
             </p>
          )}
        </CardContent>
       </Card>
    )}
    {!selectedPost && (
      <div className="z-10 text-center text-background p-4 rounded-lg bg-black/50">
        <MapPin className="h-12 w-12 mx-auto mb-2"/>
        <h3 className="text-xl font-semibold">Select a listing</h3>
        <p>Choose a listing from the list to see details on the map.</p>
      </div>
    )}
      </div>
    </Card>
  );
}
