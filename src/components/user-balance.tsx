'use client';
import { useAuth } from '@/hooks/useAuth';
import { Gem } from 'lucide-react';

export function UserBalance() {
  const { userProfile } = useAuth();

  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 backdrop-blur-sm px-4 py-2">
      <Gem className="h-5 w-5 text-accent" />
      <span className="font-bold text-lg text-white">{userProfile?.tamraBalance?.toLocaleString() || 0}</span>
      <span className="text-sm text-muted-foreground">TAMRA</span>
    </div>
  );
}
