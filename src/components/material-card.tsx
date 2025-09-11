import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Material } from '@/lib/types';
import { users } from '@/lib/mock-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EcoBadge from './eco-badge';
import { Separator } from './ui/separator';

interface MaterialCardProps {
  material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
  const seller = users.find((u) => u.id === material.sellerId);
  const shortDescription =
    material.description.length > 120
      ? `${material.description.substring(0, 120)}...`
      : material.description;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/item/${material.id}`} className="group">
            <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
              <CardHeader className="p-0 relative">
                <Badge
                  className="absolute top-2 right-2 z-10"
                  variant={
                    material.condition === 'Reclaimed' ? 'default' : 'secondary'
                  }
                  style={
                    material.condition === 'Reclaimed'
                      ? {
                          backgroundColor: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                        }
                      : {}
                  }
                >
                  {material.condition}
                </Badge>
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <Image
                    src={material.images[0]}
                    alt={material.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={material.dataAiHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {material.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {material.location}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ${material.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {material.category === 'Bricks' ||
                    material.category === 'Flooring'
                      ? 'per unit'
                      : ''}
                  </p>
                </div>
                {seller && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={seller.avatar}
                        alt={seller.name}
                        data-ai-hint={seller.dataAiHint}
                      />
                      <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
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
                <p className="font-bold text-base">{material.name}</p>
                <p className="text-sm text-muted-foreground">{shortDescription}</p>
              </div>
              {seller && (
                <>
                  <Separator />
                  <div>
                      <p className="text-xs font-semibold mb-1.5">Sold by {seller.name}</p>
                      <div className="flex flex-wrap gap-1">
                          {seller.badges.map(badge => <EcoBadge key={badge} badgeName={badge} />)}
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
