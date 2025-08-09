'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile, reauthenticate, updateUserPassword } = useAuth();
  const router = useRouter();
  
  // State for form inputs
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Effect to set initial display name from user profile
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
    try {
        await updateUserProfile({ displayName });
        alert('Profile updated!');
    } catch (error) {
        alert('Failed to update profile.');
        console.error(error);
    }
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

  // --- Render Logic ---

  // 1. Show main loading indicator while auth is being checked
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // 2. After auth check, if there's a user but no profile yet (firestore fetch pending), show profile loading
  if (user && !userProfile) {
     return <div className="flex h-screen items-center justify-center">Loading profile...</div>;
  }

  // 3. If there is no user, we are redirecting, so render nothing to avoid flicker
  if (!user) {
    return null;
  }

  // 4. If we have the user and their profile, render the page
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg bg-card border-primary/20">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>

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
