
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EcoBadge from '@/components/eco-badge';
import { useEffect, useState } from 'react';
import { Star, Leaf } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function ReviewsPage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState<any | null>(null);
  const [orgReviews, setOrgReviews] = useState<any[]>([]);
  const { user: authUser } = useAuth();

  if (!authUser || authUser.role !== 'buyer') {
    return <div className="text-center py-12 text-destructive font-bold">Access denied. Buyers only.</div>;
  }

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.data || null);
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    async function fetchOrgReviews() {
      if (!user?.organisation) {
        setOrgReviews([]);
        return;
      }
      const reviewsRes = await fetch('/api/reviews');
      const reviewsData = await reviewsRes.json();
      const filteredReviews = (reviewsData.data || []).filter((r: any) => {
        return r.organisation == user.organisation || r.organisation?._id == user.organisation;
      });
      setOrgReviews(filteredReviews);
    }
    fetchOrgReviews();
  }, [user]);

  if (user === null) {
    return <div className="text-center py-12 text-muted-foreground">User not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.dataAiHint}/>
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
            <p className="text-muted-foreground">Member since {user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{user.rating ? user.rating.toFixed(1) : 'N/A'}</span>
              <span className="text-muted-foreground">({Array.isArray(user.reviews) ? user.reviews.length : 0} reviews)</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-primary">
              <Leaf className="w-5 h-5" />
              <span className="font-bold text-lg">{user.carbonCredits ? user.carbonCredits.toLocaleString() : 0}</span>
              <span className="text-muted-foreground">Carbon Credits Earned</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
               {(user.badges || []).map((badge: string) => <EcoBadge key={badge} badgeName={badge} />)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 mt-6">
        {orgReviews.length > 0 ? (
          orgReviews.map((review: any) => (
            <Card key={review._id || review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {review.reviewer && (
                    <Avatar>
                      <AvatarImage src={review.reviewer.avatar} alt={review.reviewer.name} />
                      <AvatarFallback>{review.reviewer.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{review.reviewer?.name || 'Anonymous'}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
                    <p className="mt-2 text-foreground">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">This organisation has not received any reviews yet.</p>
        )}
      </div>
    </div>
  )
}
