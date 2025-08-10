'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CommunityStats } from "@/components/community-stats";
import { DailyMining } from "@/components/daily-mining";
import { UserBalance } from '@/components/user-balance';
import { UserBadges } from '@/components/user-badges';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
          <p className="max-w-2xl text-lg text-muted-foreground">
            Welcome back, {user.displayName || user.email}! Mine daily, complete tasks, and refer
            friends to grow your vault.
          </p>
          <UserBalance />
          <UserBadges />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <DailyMining />
          </div>
          <div className="md:col-span-1">
            <CommunityStats />
          </div>
        </div>
    </div>
  );
}
