'use client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from './ui/sidebar';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-between p-4 sm:p-6 lg:p-8">
      <SidebarTrigger className="md:hidden"/>
      <div></div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost">
              <Link href="/">Login</Link>
            </Button>
            <Button asChild className="bg-copper-gradient text-primary-foreground hover:opacity-90">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
