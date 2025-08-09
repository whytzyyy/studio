import { BackgroundParticles } from "@/components/background-particles";
import { CommunityStats } from "@/components/community-stats";
import { DailyMining } from "@/components/daily-mining";
import { GamificationFeatures } from "@/components/gamification-features";
import { Header } from "@/components/header";
import { LogoAnimation } from "@/components/logo-animation";
import { NftBadge } from "@/components/nft-badge";
import { ReferralProgram } from "@/components/referral-program";
import { SocialTasks } from "@/components/social-tasks";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background font-body text-foreground">
      <BackgroundParticles />
      <Header />
      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center pt-24">
          <LogoAnimation />
          <p className="max-w-2xl text-lg text-muted-foreground">
            Join the Tamra revolution. Mine daily, complete tasks, and refer
            friends to earn TAMRA tokens before the official launch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <DailyMining />
          </div>
          <div className="md:col-span-1">
            <CommunityStats />
          </div>
        </div>

        <Separator className="my-12 bg-primary/10" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ReferralProgram />
          <SocialTasks />
        </div>

        <Separator className="my-12 bg-primary/10" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <GamificationFeatures />
          <NftBadge />
        </div>
      </div>
    </main>
  );
}
