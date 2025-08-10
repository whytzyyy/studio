"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, UserPlus, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/hooks/useAuth';
import { Separator } from './ui/separator';

export function ReferralProgram() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const referralLink = user ? `${window.location.origin}/signup?ref=${user.uid}` : "";
  const referredUsers = userProfile?.referredUsers || [];

  const handleCopy = () => {
    if (!referralLink) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate your referral link.",
        });
        return;
    }
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
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!referralLink}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy referral link</span>
            </Button>
          </div>
        </div>
        
        <Separator />

        <div>
          <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Users className="text-accent" /> Your Referred Users ({referredUsers.length})</h3>
          <div className="rounded-lg border border-border/50">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Date Joined</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {referredUsers.length > 0 ? (
                    referredUsers.map((u) => (
                    <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.displayName}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{new Date(u.joinedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                        You haven't referred anyone yet. Share your link!
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
