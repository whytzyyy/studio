"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gem, Clock } from 'lucide-react';

export function CommunityStats() {
  const [members, setMembers] = useState(123456);
  const [tamraClaimed, setTamraClaimed] = useState(7890123);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set event date only on client-side to avoid hydration mismatch
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setEventDate(futureDate);
  }, []);
  
  useEffect(() => {
    const memberInterval = setInterval(() => {
      setMembers(prev => prev + Math.floor(Math.random() * 3));
    }, 2500);

    const tamraInterval = setInterval(() => {
      setTamraClaimed(prev => prev + Math.floor(Math.random() * 50) + 20);
    }, 1500);

    return () => {
      clearInterval(memberInterval);
      clearInterval(tamraInterval);
    };
  }, []);

  useEffect(() => {
    if(!eventDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });

      if (difference < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Community Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold">{isClient ? members.toLocaleString() : members}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Gem className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total TAMRA Claimed</p>
            <p className="text-2xl font-bold">{isClient ? tamraClaimed.toLocaleString() : tamraClaimed}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" />
            Special Event Countdown
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-copper-gradient">{String(timeLeft.days).padStart(2, '0')}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-copper-gradient">{String(timeLeft.hours).padStart(2, '0')}</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-copper-gradient">{String(timeLeft.minutes).padStart(2, '0')}</p>
              <p className="text-xs text-muted-foreground">Mins</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-copper-gradient">{String(timeLeft.seconds).padStart(2, '0')}</p>
              <p className="text-xs text-muted-foreground">Secs</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
