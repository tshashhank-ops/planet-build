'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
// import { users } from '@/lib/mock-data';
import UserAvatarCard from '@/components/UserAvatarCard';
import UserDetailsCard from '@/components/UserDetailsCard';
import EditUserModal from '@/components/EditUserModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Leaf } from 'lucide-react';
import EcoBadge from '@/components/eco-badge';
import { useEffect, useState, use } from 'react';
import SellForm from '@/app/sell/sell-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import React from 'react';
export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [user, setUser] = useState<any | null>(null);
    const [orgPosts, setOrgPosts] = useState<any[]>([]);
    const [orgReviews, setOrgReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editPost, setEditPost] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [organisationName, setOrganisationName] = useState('');

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
        async function fetchOrganisationName() {
            if (!user?.organisation) {
                setOrganisationName('');
                return;
            }
            const orgId = typeof user.organisation === 'object' ? user.organisation._id : user.organisation;
            const res = await fetch(`/api/organisations`);
            if (!res.ok) return;
            const data = await res.json();
            const org = (data.data || []).find((o: any) => o._id === orgId);
            setOrganisationName(org ? org.name : '');
        }
        fetchOrganisationName();
    }, [user]);

    useEffect(() => {
        async function fetchOrgData() {
            if (!user?.organisation) {
                setOrgPosts([]);
                setOrgReviews([]);
                return;
            }
            // Fetch posts for organisation
            const postsRes = await fetch('/api/posts');
            const postsData = await postsRes.json();
            const filteredPosts = (postsData.data || []).filter((p: any) => {
                return p.owner == user.organisation || p.owner?._id == user.organisation;
            });
            setOrgPosts(filteredPosts);

            // Fetch reviews for organisation
            const reviewsRes = await fetch('/api/reviews');
            const reviewsData = await reviewsRes.json();
            const filteredReviews = (reviewsData.data || []).filter((r: any) => {
                return r.organisation == user.organisation || r.organisation?._id == user.organisation;
            });
            setOrgReviews(filteredReviews);
        }
        fetchOrgData();
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
        setEditPost(data.data || []);
    };

    return (
        <div className="space-y-8 flex flex-col md:flex-row gap-8">
            <div className="w-1/3 w-150 h-150 rounded-full mt-20">
                <UserAvatarCard avatar={user.avatar} name={user.name} dataAiHint={user.dataAiHint} />
            </div>
            <div className="max-w-2xl w-full bg-white rounded-2xl hover:bg-gray-50 hover:shadow-2xl shadow-lg p-8">
                <UserDetailsCard
                    name={user.name}
                    email={user.email}
                    organisationName={organisationName}
                    role={user.role}
                    memberSince={user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                    rating={user.rating}
                    reviewsCount={Array.isArray(user.reviews) ? user.reviews.length : 0}
                    carbonCredits={user.carbonCredits}
                    badges={user.badges}
                />
                <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setEditUserOpen(true)}>Edit</Button>
                    {/* Delete and Create buttons will be added here */}
                </div>
            </div>
            <EditUserModal open={editUserOpen} onOpenChange={setEditUserOpen} user={user} organisationName={organisationName} onSave={async (updatedUser) => {
                setUser({ ...user, ...updatedUser });
            }} />


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
