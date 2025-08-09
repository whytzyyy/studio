'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile, reauthenticate, updateUserPassword } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Display name cannot be empty.');
      return;
    }
    await updateUserProfile({ displayName });
    alert('Profile updated!');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill in both password fields.');
      return;
    }
    try {
      await reauthenticate(currentPassword);
      await updateUserPassword(newPassword);
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      alert('Failed to update password. Please check your current password.');
      console.error(error);
    }
  };

  if (loading || !userProfile) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings and view your achievements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>

          <hr className="border-border/50" />

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="text-accent" /> Achievements</h3>
            {userProfile?.hasClaimedNft ? (
                <div className="mt-4 flex items-center gap-4 rounded-lg border border-primary/20 p-4 bg-card/50">
                    <Image
                        src="https://placehold.co/300x300.png"
                        alt="Early Supporter NFT Badge"
                        width={80}
                        height={80}
                        data-ai-hint="copper badge"
                        className="rounded-full border-2 border-primary"
                    />
                    <div>
                        <p className="font-bold text-foreground">Early Supporter NFT</p>
                        <p className="text-sm text-muted-foreground">You are a pioneer of the Tamra ecosystem. Thank you!</p>
                    </div>
                </div>
            ) : (
                <p className="mt-2 text-sm text-muted-foreground">No badges earned yet. Keep participating!</p>
            )}
          </div>

          <hr className="border-border/50" />

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="secondary">Change Password</Button>
          </form>

           <Button onClick={() => router.push('/dashboard')} variant="link" className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
