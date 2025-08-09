"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, UserPlus, Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const referralLink = "https://tamravault.io/invite/aB1c2D3e";

interface Referrer {
  id: string;
  rank: number;
  name: string;
  referrals: number;
  avatar: string;
}

export function ReferralProgram() {
  const { toast } = useToast();
  const [topReferrers, setTopReferrers] = useState<Referrer[]>([]);

  useEffect(() => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, orderBy('referrals', 'desc'), limit(3));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const referrers: Referrer[] = [];
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        referrers.push({
          id: doc.id,
          rank: index + 1,
          name: data.displayName || 'Anonymous',
          referrals: data.referrals || 0,
          avatar: data.photoURL || `https://placehold.co/40x40.png`,
        });
      });
      setTopReferrers(referrers);
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to clipboard!",
      description: "Your referral link is ready to be shared.",
    });
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><UserPlus />Referral Program</CardTitle>
        <CardDescription>Earn 100 TAMRA for every friend you refer. The more you refer, the more you earn!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="referral-link" className="text-sm font-medium text-muted-foreground">Your Personal Referral Link</label>
          <div className="flex items-center space-x-2 mt-1">
            <Input id="referral-link" type="text" value={referralLink} readOnly className="font-mono"/>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy referral link</span>
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Trophy className="text-amber-400" /> Top Referrers</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topReferrers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} data-ai-hint="person avatar" alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{user.referrals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
