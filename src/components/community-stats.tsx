"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gem, Clock } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function CommunityStats() {
  const [members, setMembers] = useState(0);
  const [tamraClaimed, setTamraClaimed] = useState(0);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set event date only on client-side to avoid hydration mismatch
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setEventDate(futureDate);

    // Listen to real-time updates for community stats
    const statsDocRef = doc(firestore, 'community-stats', 'live');
    const unsubscribe = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMembers(data.totalMembers || 0);
        setTamraClaimed(data.totalTamraClaimed || 0);
      } else {
        // You might want to initialize this document in your backend
        console.log("No community stats document!");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if(!eventDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
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
            <p className="text-2xl font-bold">{members.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Gem className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total TAMRA Claimed</p>
            <p className="text-2xl font-bold">{tamraClaimed.toLocaleString()}</p>
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
