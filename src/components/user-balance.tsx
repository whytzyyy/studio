'use client';
import { useAuth } from '@/hooks/useAuth';
import { Gem } from 'lucide-react';

export function UserBalance() {
  const { userProfile } = useAuth();

  return (
    <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-card/50 backdrop-blur-sm px-6 py-3">
      <Gem className="h-6 w-6 text-accent" />
      <span className="font-bold text-2xl text-white">{userProfile?.tamraBalance?.toLocaleString() || 0}</span>
      <span className="text-base text-muted-foreground">TAMRA</span>
    </div>
  );
}
