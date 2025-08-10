"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gem, Clock, Trophy, Star } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface Referrer {
  id: string;
  rank: number;
  name: string;
  referrals: number;
  avatar: string;
}

export function CommunityStats() {
  const [members, setMembers] = useState(0);
  const [tamraClaimed, setTamraClaimed] = useState(0);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventOver, setIsEventOver] = useState(false);
  const [topReferrers, setTopReferrers] = useState<Referrer[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  
  const [eligibilityStatus, setEligibilityStatus] = useState<'idle' | 'eligible' | 'ineligible' | 'submitted'>('idle');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, userProfile, submitSolanaAddress } = useAuth();
  const { toast } = useToast();


  useEffect(() => {
    // Set event date only on client-side to avoid hydration mismatch
    setEventDate(() => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 60); 
        return futureDate;
    });

    const statsDocRef = doc(firestore, 'community-stats', 'live');
    const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMembers(data.totalMembers || 0);
        setTamraClaimed(data.totalTamraClaimed || 0);
      } else {
        console.log("No community stats document!");
      }
    });

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, orderBy('referrals', 'desc'), limit(5));

    const unsubscribeReferrers = onSnapshot(q, (querySnapshot) => {
      const referrers: Referrer[] = [];
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        referrers.push({
          id: doc.id,
          rank: index + 1,
          name: data.displayName || 'Anonymous',
          referrals: data.referrals || 0,
          avatar: data.photoURL || `/logo.png`,
        });
      });
      setTopReferrers(referrers);
    });

    // Fetch all users to calculate rank
    if (user && userProfile) {
      const allUsersQuery = query(collection(firestore, 'users'), orderBy('referrals', 'desc'));
      getDocs(allUsersQuery).then(snapshot => {
        const sortedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const currentUserIndex = sortedUsers.findIndex(u => u.id === user.uid);
        if (currentUserIndex !== -1) {
          setUserRank(currentUserIndex + 1);
        }
      });
    }


    return () => {
        unsubscribeStats();
        unsubscribeReferrers();
    };
  }, [user, userProfile]);

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
        setIsEventOver(false);
      } else {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEventOver(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);
  
  const handleCheckEligibility = () => {
    if (!userProfile) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load user profile. Please try again.",
        });
        return;
    }
    
    const balance = userProfile.tamraBalance || 0;
    const referrals = userProfile.referrals || 0;

    if (balance >= 10000 && referrals >= 5) { 
      if (userProfile.solanaAddress) {
        setEligibilityStatus('submitted');
      } else {
        setEligibilityStatus('eligible');
      }
    } else {
      setEligibilityStatus('ineligible');
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solanaAddress || solanaAddress.length < 32 || solanaAddress.length > 44) {
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description: "Please enter a valid Solana wallet address.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitSolanaAddress(solanaAddress);
      setEligibilityStatus('submitted');
      toast({
        title: "Address Submitted!",
        description: "Your Solana wallet address has been saved.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not save your address. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderEligibilityContent = () => {
    switch (eligibilityStatus) {
      case 'eligible':
        return (
          <div className="space-y-4 text-center">
            <p className="text-green-400 font-bold">Congratulations, you are eligible!</p>
            <p className="text-sm text-muted-foreground">Please provide your Solana wallet address for the airdrop.</p>
            <form onSubmit={handleSubmitAddress} className="flex flex-col gap-2">
              <Input 
                placeholder="Enter your Solana wallet address" 
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSubmitting} className="w-full bg-copper-gradient text-primary-foreground hover:opacity-90">
                {isSubmitting ? 'Submitting...' : 'Submit Address'}
              </Button>
            </form>
          </div>
        );
      case 'ineligible':
        return (
          <p className="text-destructive text-center font-bold">Sorry, you are not eligible.</p>
        );
      case 'submitted':
          return (
            <p className="text-accent text-center font-bold">Thank you for providing your wallet address. Tokens will be distributed within 1x24 hours.</p>
          );
      case 'idle':
      default:
        return (
          <Button onClick={handleCheckEligibility} className="w-full bg-copper-gradient text-primary-foreground hover:opacity-90">
            Check Eligibility
          </Button>
        );
    }
  }

  const isCurrentUserInTop = topReferrers.some(r => r.id === user?.uid);

  return (
    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Community Pulse</CardTitle>
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
            Special Event
          </h3>
          {isEventOver ? (
            renderEligibilityContent()
          ) : (
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
          )}
        </div>
        <Separator />
        <div>
          <h3 className="font-headline text-lg mb-4 flex items-center gap-2"><Trophy className="text-amber-400" /> Top Referrers</h3>
          <div className="rounded-md border border-border/50">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Referrals</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {topReferrers.map((refUser) => (
                    <TableRow key={refUser.id} className={cn(refUser.id === user?.uid && "bg-primary/20")}>
                    <TableCell className="font-medium">{refUser.rank || '-'}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={refUser.avatar} alt={refUser.name} />
                                <AvatarFallback>{refUser.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{refUser.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{Number.isFinite(refUser.referrals) ? refUser.referrals : 0}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
          {userRank !== null && !isCurrentUserInTop && userProfile && (
             <div className="mt-4 rounded-md border border-accent/50 bg-primary/20 p-3">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                        <Star className="h-4 w-4 text-accent" />
                        <span>Your Rank</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base text-accent">#{userRank}</p>
                        <p className="text-xs font-mono text-muted-foreground">{userProfile.referrals || 0} Referrals</p>
                    </div>
                </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
