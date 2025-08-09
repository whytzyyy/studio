'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, UserCredential } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion, getDoc, runTransaction } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  tamraBalance: number;
  referrals: number;
  miningStreak: number;
  badges: string[];
  level: number;
  completedTasks: string[]; // Changed to string to match Firestore document ID
}
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, referralCode?: string) => Promise<any>;
  logout: () => Promise<any>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string; }) => Promise<any>;
  reauthenticate: (password: string) => Promise<any>;
  updateUserPassword: (newPass: string) => Promise<any>;
  updateUserBalance: (amount: number) => Promise<void>;
  updateUserStreak: (streak: number) => Promise<void>;
  completeSocialTask: (taskId: string, reward: number) => Promise<void>;
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
            checkForBadges(user.uid, profileData);
            setUserProfile(profileData);
          } else {
            // This case is primarily for users who signed up before firestore profile creation was implemented.
            // New users are handled in the signup function.
            const userEmail = user.email || 'Anonymous';
            const initialProfile: UserProfile = {
              displayName: user.displayName || userEmail.split('@')[0],
              email: user.email || '',
              photoURL: user.photoURL || '',
              tamraBalance: 0,
              referrals: 0,
              miningStreak: 0,
              badges: ['pioneer'], // Award pioneer badge on creation
              level: 1,
              completedTasks: [],
            };
            setDoc(userDocRef, initialProfile);
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
    const currentBadges = profile.badges || [];

    // Pioneer badge (should be added at signup, this is a fallback)
    if (!currentBadges.includes('pioneer')) {
        badgesToAward.push('pioneer');
    }
    
    // Serial Miner badge
    if (profile.miningStreak >= 7 && !currentBadges.includes('serial_miner')) {
        badgesToAward.push('serial_miner');
    }

    // Socialite badge
    if (profile.referrals > 20 && !currentBadges.includes('socialite')) {
        badgesToAward.push('socialite');
    }

    // Masterpiece badge
    if (profile.level >= 10 && !currentBadges.includes('masterpiece')) {
      badgesToAward.push('masterpiece');
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

  const signup = async (email: string, pass: string, referralCode?: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    
    if (newUser) {
      // Create document for the new user
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        displayName: newUser.email?.split('@')[0] || 'New User',
        email: newUser.email,
        photoURL: '',
        tamraBalance: 0,
        referrals: 0,
        miningStreak: 0,
        level: 1,
        createdAt: new Date().toISOString(),
        badges: ['pioneer'],
        completedTasks: []
      });

      // Handle referral if code is provided
      if (referralCode) {
        const referrerDocRef = doc(firestore, 'users', referralCode);
        const referrerDoc = await getDoc(referrerDocRef);
        if (referrerDoc.exists()) {
          // Award referrer
          await updateDoc(referrerDocRef, {
            tamraBalance: increment(100),
            referrals: increment(1)
          });
        }
      }
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
      // Recalculate level after balance update
      const updatedDoc = await getDoc(userDocRef);
      if(updatedDoc.exists()) {
        const profile = updatedDoc.data() as UserProfile;
        const newLevel = Math.min(10, Math.floor(profile.tamraBalance / 1000) + 1);
        if(newLevel > (profile.level || 1)) {
          await updateDoc(userDocRef, { level: newLevel });
        }
      }
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

  const completeSocialTask = async (taskId: string, reward: number) => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Use a transaction to ensure atomicity
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const completedTasks = userDoc.data().completedTasks || [];
        if (completedTasks.includes(taskId)) {
          throw new Error("You have already completed this task.");
        }

        transaction.update(userDocRef, {
          tamraBalance: increment(reward),
          completedTasks: arrayUnion(taskId)
        });
      });

    } else {
      throw new Error("You must be logged in to complete a task.");
    }
  };

  const value = { 
    user, 
    userProfile, 
    loading, 
    login, 
    signup, 
    logout, 
    updateUserProfile, 
    reauthenticate, 
    updateUserPassword, 
    updateUserBalance, 
    updateUserStreak,
    completeSocialTask 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
