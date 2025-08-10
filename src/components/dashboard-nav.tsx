'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Gift, Users, Trophy, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/referrals',
    label: 'Referral Program',
    icon: Users,
  },
  {
    href: '/dashboard/social-tasks',
    label: 'Social Tasks',
    icon: Gift,
  },
  {
    href: '/dashboard/rewards',
    label: 'Level & Rewards',
    icon: Trophy,
  },
    {
    href: '/dashboard/guide',
    label: 'Badge Guide',
    icon: BookOpen,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-auto p-4">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === item.href}
                className="w-full justify-start"
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
