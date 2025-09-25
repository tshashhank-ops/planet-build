'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Home, PlusCircle, MessageSquare, Leaf, Star } from 'lucide-react';
import Leaderboard from '../leaderboard';
import TopCategories from '../top-categories';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    { href: '/marketplace', label: 'Marketplace', icon: Home },
  ];

  if (user) {
    menuItems.push({ href: '/messages', label: 'Messages', icon: MessageSquare });
    if (user.role === 'seller' && user.organisation) {
      menuItems.push({ href: `/sell`, label: 'Post an Item', icon: PlusCircle });
      menuItems.push({ href: `/profile/${user._id}/active-listings`, label: 'Active Listings', icon: PlusCircle });
      menuItems.push({ href: `/profile/${user._id}/reviews`, label: 'Reviews', icon: Star });
  }
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
             <Link href="/" className="flex items-center gap-2 text-lg font-bold text-sidebar-primary-foreground font-headline group-data-[state=collapsed]/sidebar-wrapper:justify-center">
              <Leaf className="h-7 w-7 text-sidebar-primary-foreground" />
              <span className="group-data-[state=collapsed]/sidebar-wrapper:hidden">PlanetBuild</span>
            </Link>
        </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive =
              item.href === '/marketplace'
                ? pathname.startsWith('/marketplace') ||
                  pathname.startsWith('/item') ||
                  pathname.startsWith('/trade-hub')
                : pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        <div className="flex-grow" />
        <div className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
            <SidebarSeparator className="my-1" />
            <TopCategories />
            <SidebarSeparator className="my-1" />
            <Leaderboard />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
