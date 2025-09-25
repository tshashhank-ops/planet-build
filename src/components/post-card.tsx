import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Post, User } from '@/lib/types';
import React from 'react';
// import { users } from '@/lib/mock-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EcoBadge from './eco-badge';
import { Separator } from './ui/separator';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [seller, setSeller] = React.useState<User | null>(null);
  React.useEffect(() => {
    async function fetchSeller() {
      if (!post.seller) return setSeller(null);
      try {
        const res = await fetch(`/api/users/${post.seller}`);
        if (!res.ok) return setSeller(null);
        const data = await res.json();
        setSeller(data.data || null);
      } catch {
        setSeller(null);
      }
    }
    fetchSeller();
  }, [post.seller]);
  
  const shortDescription =
    post.description.length > 120
      ? `${post.description.substring(0, 120)}...`
      : post.description;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/item/${post._id}`} className="group">
            <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 group-hover:-translate-y-1">
              <CardHeader className="p-0 relative">
                <Badge
                  className="absolute top-2 right-2 z-10"
                  variant={
                    post.condition === 'reclaimed' ? 'default' : 'secondary'
                  }
                  style={
                    post.condition === 'reclaimed'
                      ? {
                          backgroundColor: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                        }
                      : {}
                  }
                >
                  {post.condition}
                </Badge>
                <div className="aspect-w-16 aspect-h-9  overflow-hidden">
                  <Image
                    src={post.photos[0] || 'https://placehold.co/600x400.png'}
                    alt={post.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full transition-transform duration-100 group-hover:scale-105"
                    data-ai-hint={post.dataAiHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {post.location}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ${post.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.category === 'Bricks' ||
                    post.category === 'Flooring'
                      ? 'per unit'
                      : ''}
                  </p>
                </div>
                {seller && seller._id && seller.name && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={seller.avatar}
                        alt={seller.name}
                        data-ai-hint={seller.dataAiHint}
                      />
                      <AvatarFallback>{seller.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </CardFooter>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
              <div>
                <p className="font-bold text-base">{post.title}</p>
                <p className="text-sm text-muted-foreground">{shortDescription}</p>
              </div>
              {seller && seller._id && seller.name && (
                <>
                  <Separator />
                  <div>
                      <p className="text-xs font-semibold mb-1.5">Sold by {seller.name}</p>
                      <div className="flex flex-wrap gap-1">
                          {(seller.badges || []).map((badge: string) => <EcoBadge key={badge} badgeName={badge} />)}
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
