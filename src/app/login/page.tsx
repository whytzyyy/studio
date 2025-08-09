'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// This page is deprecated and redirects to the main page which now handles login.
export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
        if(user) {
            router.replace('/dashboard');
        } else {
            router.replace('/');
        }
    }
  }, [loading, user, router]);

  return (
     <div className="flex h-screen items-center justify-center bg-background">
        Redirecting...
    </div>
  );
}
