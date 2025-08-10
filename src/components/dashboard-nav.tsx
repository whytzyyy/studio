'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { LayoutDashboard, Gift, Users, Trophy, BookOpen, LifeBuoy, UserCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';

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

const helpAndProfileItems = [
    {
        href: '/dashboard/profile',
        label: 'Profile',
        icon: UserCircle,
    },
    {
        href: '/dashboard/help',
        label: 'Help & Feedback',
        icon: LifeBuoy,
    },
]

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { logout } = useAuth();


  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const handleLogout = async () => {
    handleLinkClick();
    await logout();
    router.push('/');
  };


  return (
    <nav className="flex-1 overflow-auto p-4 flex flex-col justify-between">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} onClick={handleLinkClick}>
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
       <SidebarMenu>
        <Separator className="my-2" />
         {helpAndProfileItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} onClick={handleLinkClick}>
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
        <SidebarMenuItem>
            <SidebarMenuButton
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive"
            >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="truncate">Logout</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </nav>
  );
}
