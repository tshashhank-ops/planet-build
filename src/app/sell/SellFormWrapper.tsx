'use client';
import SellForm from './sell-form';
import type { Post } from '@/lib/types';

import { useAuth } from '@/hooks/use-auth';

export default function SellFormWrapper() {
  const { user } = useAuth();
  if (!user || user.role !== 'seller') {
    return <div className="text-center py-12 text-destructive font-bold">Access denied. Sellers only.</div>;
  }
  return (
    <SellForm post={null as unknown as Post} mode="create" onSuccess={() => {}} />
  );
}