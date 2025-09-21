import { Card, CardContent } from '@/components/ui/card';
import EcoBadge from '@/components/eco-badge';
import { Star, Leaf } from 'lucide-react';
import React from 'react';

interface UserDetailsCardProps {
  name: string;
  email?: string;
  organisationName?: string;
  role?: string;
  memberSince?: string;
  rating?: number;
  reviewsCount?: number;
  carbonCredits?: number;
  badges?: string[];
}

export default function UserDetailsCard({
  name,
  email,
  organisationName,
  role,
  memberSince,
  rating,
  reviewsCount,
  carbonCredits,
  badges = [],
}: UserDetailsCardProps) {
  return (
    <Card className="p-8">
      <CardContent>
        <h1 className="text-4xl font-bold font-headline mb-2">{name}</h1>
        {email && <p className="text-md text-muted-foreground mb-2">Email: {email}</p>}
        {organisationName && (
          <p className="text-lg font-semibold text-primary mb-1">Organisation: {organisationName}</p>
        )}
        {role && <p className="text-md text-muted-foreground mb-2">Role: {role}</p>}
        <p className="text-muted-foreground mb-2">Member since {memberSince}</p>
        <div className="flex items-center gap-2 mt-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-lg">{rating !== undefined ? rating.toFixed(1) : 'N/A'}</span>
          <span className="text-muted-foreground">({reviewsCount ?? 0} reviews)</span>
        </div>
        <div className="flex items-center gap-2 mt-3 text-primary">
          <Leaf className="w-5 h-5" />
          <span className="font-bold text-lg">{carbonCredits ? carbonCredits.toLocaleString() : 0}</span>
          <span className="text-muted-foreground">Carbon Credits Earned</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {badges.map((badge: string) => <EcoBadge key={badge} badgeName={badge} />)}
        </div>
      </CardContent>
    </Card>
  );
}
