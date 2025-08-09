"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

const COOLDOWN_HOURS = 24;

export function DailyMining() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const { user, userProfile, updateUserBalance, updateUserStreak } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const storedLastClaim = localStorage.getItem(`tamra-last-claim-${user.uid}`);
    if (storedLastClaim) {
      setLastClaim(Number(storedLastClaim));
    } else {
        // If no claim is stored, user can claim immediately
        setTimeLeft(0);
    }
  }, [user]);

  useEffect(() => {
    if (lastClaim === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceClaim = now - lastClaim;
      const cooldownMillis = COOLDOWN_HOURS * 60 * 60 * 1000;
      const remaining = cooldownMillis - timeSinceClaim;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaim]);

  const handleClaim = async () => {
    if (!user) return;
    const now = Date.now();
    
    // Streak logic
    const lastClaimDate = lastClaim ? new Date(lastClaim) : null;
    const today = new Date();
    let newStreak = userProfile?.miningStreak || 0;

    if (lastClaimDate) {
        const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
        if (hoursSinceLastClaim < 48) { // Continued streak
            newStreak++;
        } else { // Streak broken
            newStreak = 1;
        }
    } else { // First claim
        newStreak = 1;
    }

    try {
        await updateUserBalance(50);
        await updateUserStreak(newStreak);
        setLastClaim(now);
        localStorage.setItem(`tamra-last-claim-${user.uid}`, String(now));
        toast({
            title: 'Claim Successful!',
            description: `You've claimed 50 TAMRA. Your mining streak is now ${newStreak} days!`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to claim tokens. Please try again.",
        });
        console.error("Failed to claim:", error);
    }
  };
  
  const isClaimable = timeLeft <= 0;
  const progress = lastClaim ? Math.min(100, ((COOLDOWN_HOURS * 3600 * 1000 - timeLeft) / (COOLDOWN_HOURS * 3600 * 1000)) * 100) : 100;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Card className="h-full border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-copper-gradient">Daily Mining</CardTitle>
        <CardDescription>Claim 50 TAMRA tokens every 24 hours.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
        <div className="relative font-mono text-5xl font-bold text-white">
          <span className="text-copper-gradient">50</span> TAMRA
        </div>
        <div className="w-full max-w-md space-y-4">
          <Button onClick={handleClaim} disabled={!isClaimable} size="lg" className="w-full text-lg font-bold bg-copper-gradient text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted">
            {isClaimable ? 'Claim Now' : `Claim in ${formatTime(timeLeft)}`}
          </Button>
          {!isClaimable && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Cooldown</span>
                </div>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2 [&>div]:bg-copper-gradient" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
