'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { BackgroundParticles } from '@/components/background-particles';
import { LogoAnimation } from '@/components/logo-animation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signup(email, password, referralCode || undefined);
      router.push('/dashboard');
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('This email is already registered. Please log in.');
        } else {
            console.error(err);
            setError('Failed to sign up. Please try again.');
        }
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background font-body text-foreground">
        <BackgroundParticles />
        <div className="relative z-10 flex h-screen items-center justify-center text-white">
        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="items-center text-center">
                <LogoAnimation />
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>Join the vault and start mining.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                <Input
                    id="referral-code"
                    type="text"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full bg-copper-gradient text-primary-foreground hover:opacity-90">
                Sign Up
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/" className="underline text-accent">
                Log in
                </Link>
            </div>
            </CardContent>
        </Card>
        </div>
    </main>
  );
}
