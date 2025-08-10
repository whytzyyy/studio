'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { LogoAnimation } from '@/components/logo-animation';
import { BackgroundParticles } from '@/components/background-particles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      // Simplified error handling
      console.error('Login Error:', err);
      setError('Failed to log in. Please check your email and password.');
    }
  };

  if (loading || user) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
            Loading...
        </div>
      )
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background font-body text-foreground">
        <BackgroundParticles />
        <div className="relative z-10 flex h-screen items-center justify-center text-white">
            <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader className="items-center text-center">
                    <LogoAnimation />
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your vault.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
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
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full bg-copper-gradient text-primary-foreground hover:opacity-90">
                    Login
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="underline text-accent">
                    Sign up
                    </Link>
                </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
