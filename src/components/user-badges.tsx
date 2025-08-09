"use client";

import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Award, Zap, UserPlus, ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const badgeInfo = {
  pioneer: {
    name: 'Pioneer',
    description: 'Awarded for being one of the first to join the Tamra ecosystem.',
    icon: <Award className="h-4 w-4" />,
  },
  serial_miner: {
    name: 'Serial Miner',
    description: 'Awarded for mining 7 days in a row. Keep up the great work!',
    icon: <Zap className="h-4 w-4" />,
  },
  socialite: {
    name: 'Socialite',
    description: 'Awarded for successfully referring over 20 new users.',
    icon: <UserPlus className="h-4 w-4" />,
  },
  masterpiece: {
    name: 'Masterpiece',
    description: 'Awarded for reaching the maximum level 10. You are a true master!',
    icon: <ShieldCheck className="h-4 w-4" />,
  }
};

export function UserBadges() {
  const { userProfile } = useAuth();
  const badges = userProfile?.badges || [];

  if (badges.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {badges.map((badgeKey) => {
          const badge = badgeInfo[badgeKey as keyof typeof badgeInfo];
          if (!badge) return null;
          return (
            <Tooltip key={badgeKey}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="border-accent text-accent py-2 px-3 flex items-center gap-2 text-sm cursor-default">
                  {badge.icon}
                  <span>{badge.name}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
