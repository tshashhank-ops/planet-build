'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { users } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Leaf } from 'lucide-react';
import PostCard from '@/components/post-card';
import EcoBadge from '@/components/eco-badge';
import { useEffect, useState, use } from 'react';
import SellForm from '@/app/sell/sell-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const userId = Number(id);
    const user = users.find((u) => u.id === userId);

    if (!user) {
        notFound();
    }

    // State for posts from DB
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editPost, setEditPost] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Fetch posts from DB
    useEffect(() => {
        const fetchPosts = async () => {
            const res = await fetch('/api/posts');
            const data = await res.json();
            setPosts(data.data || []);
        };
        fetchPosts();
    }, []);

    // Filter posts for this user (assuming owner is stored as string or ObjectId)
    const userPosts = posts.filter(p => {
        // Try both string and number comparison for owner
        return p.owner == id || p.ownerId == id || p.owner == user.id || p.ownerId == user.id;
    });

    // Reviews logic remains unchanged
    const userReviews = user.reviews.map(review => {
        const author = users.find(u => u.id === review.authorId);
        return { ...review, author };
    });

    // Edit post handler
    const handleEdit = (post: any) => {
        setEditPost(post);
        setModalOpen(true);
    };

    // Delete post handler
    const handleDelete = async (post: any) => {
        setLoading(true);
        try {
            const postId = post._id || post.id;
            if (!postId) {
                alert('Post ID not found.');
                setLoading(false);
                return;
            }
            await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            // Refetch posts
            const res = await fetch('/api/posts');
            const data = await res.json();
            setPosts(data.data || []);
        } finally {
            setLoading(false);
        }
    };

    // On edit success, close modal and refresh posts
    const handleEditSuccess = async () => {
        setModalOpen(false);
        setEditPost(null);
        const res = await fetch('/api/posts');
        const data = await res.json();
        setPosts(data.data || []);
    };

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
                        <p className="text-muted-foreground">Member since {new Date(user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-lg">{user.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({user.reviews.length} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-primary">
                            <Leaf className="w-5 h-5" />
                            <span className="font-bold text-lg">{user.carbonCredits.toLocaleString()}</span>
                            <span className="text-muted-foreground">Carbon Credits Earned</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                           {user.badges.map(badge => <EcoBadge key={badge} badgeName={badge} />)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="listings" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="listings">Active Listings ({userPosts.length})</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({user.reviews.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="listings">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <div key={post._id || post.id } className="relative group">
                                    <PostCard post={post} />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <Button size="icon" variant="outline" onClick={() => handleEdit(post)}>
                                            Edit
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleDelete(post)} disabled={loading}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground py-8">This user has no active listings.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="reviews">
                    <div className="space-y-6 mt-6">
                         {userReviews.length > 0 ? (
                            userReviews.map(review => (
                                <Card key={review.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            {review.author && (
                                                <Avatar>
                                                    <AvatarImage src={review.author.avatar} alt={review.author.name} data-ai-hint={review.author.dataAiHint} />
                                                    <AvatarFallback>{review.author.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold">{review.author?.name || 'Anonymous'}</p>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                                                <p className="mt-2 text-foreground">{review.comment}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                         ) : (
                            <p className="text-center text-muted-foreground py-8">This user has not received any reviews yet.</p>
                         )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {editPost && (
                        <SellForm
                            post={editPost}
                            mode="edit"
                            onSuccess={handleEditSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
