"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Star, Zap, Dices } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

const SPIN_COOLDOWN_HOURS = 24;

const prizePool = [
    ...Array(40).fill(10), // 40% chance for 10 TAMRA
    ...Array(30).fill(20), // 30% chance for 20 TAMRA
    ...Array(29).fill(50), // 29% chance for 50 TAMRA
    ...Array(1).fill(200), // 1% chance for 200 TAMRA
];

export function GamificationFeatures() {
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastSpin, setLastSpin] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const { toast } = useToast();
  const { userProfile, updateUserBalance } = useAuth();

  useEffect(() => {
    const storedLastSpin = localStorage.getItem('tamra-last-spin');
    if (storedLastSpin) {
      setLastSpin(Number(storedLastSpin));
    } else {
      setTimeLeft(0);
    }
  }, []);

  useEffect(() => {
    if (lastSpin === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceSpin = now - lastSpin;
      const cooldownMillis = SPIN_COOLDOWN_HOURS * 60 * 60 * 1000;
      const remaining = cooldownMillis - timeSinceSpin;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSpin]);


  const handleSpin = () => {
    if (isSpinning || timeLeft > 0) return;

    setIsSpinning(true);
    setSpinResult(null);
    
    const now = Date.now();
    setLastSpin(now);
    localStorage.setItem('tamra-last-spin', String(now));

    setTimeout(() => {
      const result = prizePool[Math.floor(Math.random() * prizePool.length)];
      setSpinResult(result);
      setIsSpinning(false);
      
      try {
        updateUserBalance(result);
        toast({
          title: 'Congratulations!',
          description: `You won ${result} TAMRA from the lucky spin!`,
        });
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update your balance. Please try again.",
        });
        console.error("Failed to update balance:", error);
      }
    }, 2000);
  };
  
  const isSpinAvailable = timeLeft <= 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Star className="text-yellow-400" />Level & Rewards</CardTitle>
        <CardDescription>Stay active to level up and earn exclusive rewards.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg border border-border/50 p-4">
                <p className="text-sm text-muted-foreground">Your Level</p>
                <p className="text-3xl font-bold text-copper-gradient">{userProfile?.level || 1}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-4">
                <p className="text-sm text-muted-foreground">Mining Streak</p>
                <p className="text-3xl font-bold flex items-center justify-center gap-1"><Zap className="h-6 w-6 text-yellow-400" /> {userProfile?.miningStreak || 0} days</p>
            </div>
        </div>
        
        <div>
            <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Dices className="text-accent" /> Daily Lucky Spin</h3>
            <div className="rounded-lg border border-border/50 bg-background p-4 flex flex-col items-center space-y-4">
                <p className="text-muted-foreground">Spin for a chance to win up to 200 TAMRA!</p>
                <Button onClick={handleSpin} disabled={isSpinning || !isSpinAvailable} className="bg-copper-gradient text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSpinning ? 'Spinning...' : (isSpinAvailable ? 'Spin Now' : `Spin in ${formatTime(timeLeft)}`)}
                </Button>
                {spinResult !== null && (
                    <p className="font-bold text-lg animate-in fade-in">You won <span className="text-copper-gradient">{spinResult} TAMRA</span>!</p>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
