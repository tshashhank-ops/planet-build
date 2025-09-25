"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import EcoBadge from "@/components/eco-badge";
import { Star, Leaf } from "lucide-react";
import PostCard from "@/components/post-card";

export default function OrganisationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [org, setOrg] = useState<any | null>(null);
  const [orgReviews, setOrgReviews] = useState<any[]>([]);
  const [orgPosts, setOrgPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrg() {
      const res = await fetch(`/api/organisations/${id}`);
      if (!res.ok) {
        setOrg(null);
        return;
      }
      const data = await res.json();
      setOrg(data.data || null);
    }
    fetchOrg();
  }, [id]);

  useEffect(() => {
    async function fetchOrgReviewsAndPosts() {
      if (!org?._id) {
        setOrgReviews([]);
        setOrgPosts([]);
        return;
      }
      // Fetch reviews
      const reviewsRes = await fetch("/api/reviews");
      const reviewsData = await reviewsRes.json();
      const filteredReviews = (reviewsData.data || []).filter((r: any) => {
        return r.organisation == org._id || r.organisation?._id == org._id;
      });
      setOrgReviews(filteredReviews);
      // Fetch posts
      const postsRes = await fetch("/api/posts");
      const postsData = await postsRes.json();
      const filteredPosts = (postsData.data || []).filter((p: any) => {
        return p.owner == org._id || p.owner?._id == org._id;
      });
      setOrgPosts(filteredPosts);
    }
    fetchOrgReviewsAndPosts();
  }, [org]);

  if (org === null) {
    return <div className="text-center py-12 text-muted-foreground">Organisation not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Organisation Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Organisation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {org.logo && (
                <Avatar className="h-24 w-24 border-4 border-background ring-4 ring-primary">
                  <img src={org.logo} alt={org.name} className="object-cover w-full h-full rounded-full" />
                </Avatar>
              )}
              <div>
                <h2 className="text-2xl font-bold">{org.name}</h2>
                <p className="text-muted-foreground mt-1">{org.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-lg">{org.rating ? org.rating.toFixed(1) : "N/A"}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(org.badges || []).map((badge: string) => <EcoBadge key={badge} badgeName={badge} />)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">Created: {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Organisation Reviews Card */}
        <Card>
          <CardHeader>
            <CardTitle>Organisation Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {orgReviews.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {orgReviews.map((review: any) => (
                  <div key={review._id || review.id} className="border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.reviewer?.name || "Anonymous"}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</p>
                    <p className="mt-1 text-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Active Listings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orgPosts.length > 0 ? (
            orgPosts.map((post: any) => (
              <PostCard key={post._id || post.id} post={post} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-8">This organisation has no active listings.</p>
          )}
        </div>
      </div>
    </div>
  );
}
