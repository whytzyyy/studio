"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Star, Zap, Dices } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function GamificationFeatures() {
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { toast } = useToast();

  const handleSpin = () => {
    setIsSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      const result = [10, 20, 50, 100, 200][Math.floor(Math.random() * 5)];
      setSpinResult(result);
      setIsSpinning(false);
      toast({
        title: 'Congratulations!',
        description: `You won ${result} TAMRA from the lucky spin!`,
      });
    }, 2000);
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
                <p className="text-3xl font-bold text-copper-gradient">5</p>
            </div>
            <div className="rounded-lg border border-border/50 p-4">
                <p className="text-sm text-muted-foreground">Mining Streak</p>
                <p className="text-3xl font-bold flex items-center justify-center gap-1"><Zap className="h-6 w-6 text-yellow-400" /> 12 days</p>
            </div>
        </div>

        <div>
            <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Award className="text-accent"/> Unlocked Badges</h3>
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-accent text-accent py-1 px-3">Pioneer</Badge>
                <Badge variant="outline" className="border-accent text-accent py-1 px-3">Serial Miner</Badge>
                <Badge variant="outline" className="border-accent text-accent py-1 px-3">Socialite</Badge>
            </div>
        </div>
        
        <div>
            <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Dices className="text-accent" /> Daily Lucky Spin</h3>
            <div className="rounded-lg border border-border/50 bg-background p-4 flex flex-col items-center space-y-4">
                <p className="text-muted-foreground">Spin for a chance to win up to 200 TAMRA!</p>
                <Button onClick={handleSpin} disabled={isSpinning} className="bg-copper-gradient text-primary-foreground hover:opacity-90">
                    {isSpinning ? 'Spinning...' : 'Spin Now'}
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
