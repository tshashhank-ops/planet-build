'use client';
import SellForm from './sell-form';
import type { Post } from '@/lib/types';

export default function SellFormWrapper() {
  return (
    <SellForm post={null as unknown as Post} mode="create" onSuccess={() => {}} />
  );
}