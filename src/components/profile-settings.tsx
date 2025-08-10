"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Lock, Mail } from 'lucide-react';
import { UserBadges } from './user-badges';
import { Separator } from './ui/separator';

export function ProfileSettings() {
  const { user, userProfile, updateUserProfile, reauthenticate, updateUserPassword, updateUserEmail } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoURL(userProfile.photoURL || '');
      setNewEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUserProfile({ displayName, photoURL });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update your profile. Please try again.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure your new password and confirmation match.",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Your new password must be at least 6 characters long.",
      });
      return;
    }
    setIsSavingPassword(true);
    try {
      await reauthenticate(currentPassword);
      await updateUserPassword(newPassword);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: "Please check your current password and try again.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };
  
    // Note: Changing email is not implemented as it requires re-authentication,
    // which is already used for password changes. A more complex flow (e.g., modals)
    // would be needed to handle both gracefully. For now, we disable this feature.
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      await reauthenticate(currentPassword);
      await updateUserEmail(newEmail);
      toast({
        title: "Email Updated",
        description: "Your email has been successfully changed.",
      });
       setCurrentPassword('');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Email Change Failed",
        description: "Please check your current password and try again.",
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <UserCircle className="text-accent" /> Profile Settings
          </CardTitle>
          <CardDescription>Manage your public profile and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-accent">
              <AvatarImage src={photoURL} data-ai-hint="person avatar" alt={displayName} />
              <AvatarFallback>{displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                 <h2 className="text-2xl font-bold">{displayName}</h2>
                 <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <UserBadges />
          </div>
          <Separator />
          <form onSubmit={handleProfileUpdate} className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoURL">Photo URL</Label>
                <Input
                  id="photoURL"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/your-photo.png"
                />
              </div>
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
             <Lock className="text-accent" /> Change Password
          </CardTitle>
           <CardDescription>Update your password for security.</CardDescription>
        </CardHeader>
         <form onSubmit={handlePasswordUpdate}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={isSavingPassword}>
                    {isSavingPassword ? 'Saving...' : 'Update Password'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
