'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CommunityStats } from "@/components/community-stats";
import { DailyMining } from "@/components/daily-mining";
import { UserBalance } from '@/components/user-balance';
import { UserBadges } from '@/components/user-badges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, Trophy, BookOpen } from 'lucide-react';
import Link from 'next/link';

const QuickAccessCard = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href}>
        <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm hover:border-accent hover:bg-card/70 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="rounded-lg bg-primary/20 p-3">
                    <Icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
)


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

        <div>
            <h2 className="text-2xl font-headline mb-4 text-center">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickAccessCard 
                    href="/dashboard/referrals" 
                    icon={Users} 
                    title="Referrals"
                    description="Invite friends and check top referrers."
                />
                 <QuickAccessCard 
                    href="/dashboard/social-tasks" 
                    icon={Gift} 
                    title="Social Tasks"
                    description="Complete social tasks to earn more TAMRA."
                />
                 <QuickAccessCard 
                    href="/dashboard/rewards" 
                    icon={Trophy} 
                    title="Level & Rewards"
                    description="Check your level and get daily rewards."
                />
                 <QuickAccessCard 
                    href="/dashboard/guide" 
                    icon={BookOpen} 
                    title="Badge Guide"
                    description="Learn how to earn exclusive badges."
                />
            </div>
        </div>
    </div>
  );
}
