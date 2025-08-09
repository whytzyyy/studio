'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, UserCredential } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  tamraBalance: number;
  referrals: number;
  miningStreak: number;
  badges: string[];
}
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<any>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string; }) => Promise<any>;
  reauthenticate: (password: string) => Promise<any>;
  updateUserPassword: (newPass: string) => Promise<any>;
  updateUserBalance: (amount: number) => Promise<void>;
  updateUserStreak: (streak: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            // Check for badges on profile load
            checkForBadges(user.uid, profileData);
            setUserProfile(profileData);
          } else {
            const userEmail = user.email || 'Anonymous';
            const initialProfile: UserProfile = {
              displayName: user.displayName || userEmail.split('@')[0],
              email: user.email || '',
              photoURL: user.photoURL || '',
              tamraBalance: 0,
              referrals: 0,
              miningStreak: 0,
              badges: ['pioneer'], // Award pioneer badge on creation
            };
            setDoc(doc(firestore, 'users', user.uid), initialProfile);
          }
          setLoading(false); 
        });
        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const checkForBadges = async (uid: string, profile: UserProfile) => {
    const userDocRef = doc(firestore, 'users', uid);
    const badgesToAward: string[] = [];

    // Pioneer badge (should be added at signup, this is a fallback)
    if (!profile.badges.includes('pioneer')) {
        badgesToAward.push('pioneer');
    }
    
    // Serial Miner badge
    if (profile.miningStreak >= 7 && !profile.badges.includes('serial_miner')) {
        badgesToAward.push('serial_miner');
    }

    // Socialite badge
    if (profile.referrals > 20 && !profile.badges.includes('socialite')) {
        badgesToAward.push('socialite');
    }

    if (badgesToAward.length > 0) {
        await updateDoc(userDocRef, {
            badges: arrayUnion(...badgesToAward)
        });
    }
  }


  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    if (user) {
      // Create a document for the new user in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: user.email?.split('@')[0] || 'New User',
        email: user.email,
        photoURL: '',
        tamraBalance: 0,
        referrals: 0,
        miningStreak: 0,
        createdAt: new Date().toISOString(),
        badges: ['pioneer']
      });
    }
    return userCredential;
  };


  const logout = () => {
    return signOut(auth);
  };
  
  const updateUserProfile = (profile: { displayName?: string; photoURL?: string; }) => {
      if(auth.currentUser){
          const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
          updateDoc(userDocRef, profile); // Update Firestore as well
          return updateProfile(auth.currentUser, profile);
      }
      return Promise.reject(new Error("No user logged in"));
  }

  const reauthenticate = (password: string) => {
    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, password);
      return reauthenticateWithCredential(user, credential);
    }
    return Promise.reject('No user to reauthenticate.');
  };

  const updateUserPassword = (newPass: string) => {
    const user = auth.currentUser;
    if (user) {
      return updatePassword(user, newPass);
    }
    return Promise.reject('No user to update password for.');
  };

  const updateUserBalance = async (amount: number) => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        tamraBalance: increment(amount)
      });
    } else {
      throw new Error("No user logged in to update balance.");
    }
  };
  
  const updateUserStreak = async (streak: number) => {
      const user = auth.currentUser;
      if (user) {
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, { miningStreak: streak });
      } else {
          throw new Error("No user logged in to update streak.");
      }
  }


  const value = { user, userProfile, loading, login, signup, logout, updateUserProfile, reauthenticate, updateUserPassword, updateUserBalance, updateUserStreak };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
