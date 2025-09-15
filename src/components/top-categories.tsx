'use client';

import { useMemo } from 'react';
import { posts } from '@/lib/mock-data';
import { Shapes } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function TopCategories() {
  const topCategories = useMemo(() => {
    const categoryCounts = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  }, []);

  return (
    <div className="p-2">
      <h3 className="flex items-center gap-2 px-2 text-sm font-semibold text-sidebar-foreground/80 mb-2">
        <Shapes className="h-4 w-4 text-sidebar-primary" />
        Popular Categories
      </h3>
      {topCategories.length > 0 ? (
        <div className="space-y-1 px-1">
          {topCategories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-sidebar-foreground/90 h-7"
              asChild
            >
              <Link href={`/marketplace?category=${category.toLowerCase()}`}>
                {category}
              </Link>
            </Button>
          ))}
        </div>
      ) : (
        <p className="px-2 text-xs text-sidebar-foreground/70">
          No category data available.
        </p>
      )}
    </div>
  );
}
