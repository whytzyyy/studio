
'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, UserCredential, updateEmail } from 'firebase/auth';
import { auth, firestore, sendEmailVerification } from '@/lib/firebase';
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
  solanaAddress?: string;
}
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, referralCode?: string) => Promise<any>;
  logout: () => Promise<any>;
  updateUserProfile: (profile: { displayName?: string; }) => Promise<any>;
  reauthenticate: (password: string) => Promise<any>;
  updateUserPassword: (newPass: string) => Promise<any>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserBalance: (amount: number) => Promise<void>;
  updateUserStreak: (streak: number) => Promise<void>;
  completeSocialTask: (taskId: string, reward: number) => Promise<void>;
  submitSolanaAddress: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set user if they are verified
      if (user && user.emailVerified) {
        setUser(user);
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            checkForBadges(user.uid, profileData);
            setUserProfile(profileData);
          }
          setLoading(false); 
        });
        return () => unsubProfile();
      } else {
        setUser(null);
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

  const login = async (email: string, pass: string): Promise<UserCredential> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if (userCredential.user && !userCredential.user.emailVerified) {
      await signOut(auth); // Sign out user if email is not verified
      throw new Error('auth/email-not-verified');
    }
    return userCredential;
  };

  const signup = async (email: string, pass: string, referralCode?: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    
    if (newUser) {
      await sendEmailVerification(newUser);

      // Create document for the new user
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        displayName: newUser.email?.split('@')[0] || 'New User',
        email: newUser.email,
        photoURL: '/logo.png',
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
          await updateDoc(referrerDocRef, {
            tamraBalance: increment(100),
            referrals: increment(1)
          });
        }
      }
      
      await signOut(auth);
    } else {
        throw new Error("Could not create user.");
    }
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const updateUserProfile = async (profile: { displayName?: string; }) => {
      if(auth.currentUser){
          await updateProfile(auth.currentUser, profile);
          const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
          // Only update defined fields in Firestore
          const firestoreUpdate: { [key: string]: any } = {};
          if (profile.displayName !== undefined) firestoreUpdate.displayName = profile.displayName;
          if (Object.keys(firestoreUpdate).length > 0) {
              await updateDoc(userDocRef, firestoreUpdate);
          }
      } else {
        return Promise.reject(new Error("No user logged in"));
      }
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

  const updateUserEmail = async (newEmail: string) => {
    const user = auth.currentUser;
    if (user) {
        await updateEmail(user, newEmail);
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { email: newEmail });
    } else {
        return Promise.reject(new Error("No user to update email for."));
    }
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

  const submitSolanaAddress = async (address: string) => {
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { solanaAddress: address });
    } else {
        throw new Error("You must be logged in to submit an address.");
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
    updateUserEmail,
    updateUserBalance, 
    updateUserStreak,
    completeSocialTask,
    submitSolanaAddress
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
