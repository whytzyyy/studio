"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Zap, UserPlus, ShieldCheck, Gem } from 'lucide-react';

const badges = [
  {
    icon: <Award className="h-6 w-6 text-yellow-500" />,
    name: 'Pioneer',
    description: 'Awarded for being one of the first to join the Tamra ecosystem.',
  },
  {
    icon: <Zap className="h-6 w-6 text-sky-400" />,
    name: 'Serial Miner',
    description: 'Awarded for mining 7 days in a row. Keep up the great work!',
  },
  {
    icon: <UserPlus className="h-6 w-6 text-green-500" />,
    name: 'Socialite',
    description: 'Awarded for successfully referring over 20 new users.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-purple-500" />,
    name: 'Masterpiece',
    description: 'Awarded for reaching the maximum level 10. You are a true master!',
  },
];

export function BadgeGuide() {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Gem className="text-accent" /> How to Earn Badges
        </CardTitle>
        <CardDescription>
          Complete achievements to unlock special badges and show off your dedication.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {badges.map((badge) => (
          <div key={badge.name} className="flex items-start gap-4 rounded-lg border border-border/50 p-4">
            <div className="flex-shrink-0">{badge.icon}</div>
            <div>
              <h3 className="font-semibold text-white">{badge.name}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
