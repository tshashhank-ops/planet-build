
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PostCard from '@/components/post-card';
import EcoBadge from '@/components/eco-badge';
import { useEffect, useState } from 'react';
import SellForm from '@/app/sell/sell-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function ActiveListingsPage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState<any | null>(null);
  const [orgPosts, setOrgPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editPost, setEditPost] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    async function fetchOrgPosts() {
      if (!user?.organisation) {
        setOrgPosts([]);
        return;
      }
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      const filteredPosts = (postsData.data || []).filter((p: any) => {
        return p.owner == user.organisation || p.owner?._id == user.organisation;
      });
      setOrgPosts(filteredPosts);
    }
    fetchOrgPosts();
  }, [user]);

  if (user === null) {
    return <div className="text-center py-12 text-muted-foreground">User not found.</div>;
  }

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
      setOrgPosts(data.data || []);
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
    setOrgPosts(data.data || []);
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
            <p className="text-muted-foreground">Member since {user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
            <div className="flex items-center gap-2 mt-2">
              {/* Add rating, reviews, carbon credits, badges if needed */}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
               {(user.badges || []).map((badge: string) => <EcoBadge key={badge} badgeName={badge} />)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {orgPosts.length > 0 ? (
          orgPosts.map((post: any) => (
            <div key={post._id || post.id } className="relative group">
              <PostCard post={post} />
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <Button className='bg-gray-50 hover:bg-green-500 material-icons text-black' size="icon" variant="outline" onClick={() => handleEdit(post)}>
                  &#xe3c9;
                </Button>
                <Button className='bg-red-600 hover:bg-red-800 text-white material-icons' size="icon" variant="destructive" onClick={() => handleDelete(post)} disabled={loading}>
                  &#xe872;
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-8">This organisation has no active listings.</p>
        )}
      </div>

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
