
'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, UserCredential } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion, getDoc, runTransaction } from 'firebase/firestore';

interface ReferredUser {
  uid: string;
  displayName: string;
  joinedAt: string;
}

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  tamraBalance: number;
  referrals: number;
  miningStreak: number;
  badges: string[];
  level: number;
  completedTasks: string[]; 
  solanaAddress?: string;
  referredUsers?: ReferredUser[];
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
      if (user) {
        setUser(user);
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            
            // Recalculate level and check for badges every time profile data changes
            const newLevel = Math.min(10, Math.floor((profileData.tamraBalance || 0) / 1000) + 1);
            if (newLevel > (profileData.level || 1)) {
              await updateDoc(userDocRef, { level: newLevel });
              // The snapshot will re-fire with the new level, triggering the final badge check
            } else {
               // If level hasn't changed, check for other badges
              await checkForBadges(user.uid, profileData);
            }

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
        // Use arrayUnion to avoid adding duplicate badges
        await updateDoc(userDocRef, {
            badges: arrayUnion(...badgesToAward)
        });
    }
  }

  const login = async (email: string, pass: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, referralCode?: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    
    if (newUser) {
      const newUserDisplayName = newUser.email?.split('@')[0] || 'New User';
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        displayName: newUserDisplayName,
        email: newUser.email,
        photoURL: '/logo.png',
        tamraBalance: 0,
        referrals: 0,
        miningStreak: 0,
        level: 1,
        createdAt: new Date().toISOString(),
        badges: ['pioneer'],
        completedTasks: [],
        referredUsers: []
      });

      // Handle referral if code is provided
      if (referralCode) {
        const referrerDocRef = doc(firestore, 'users', referralCode);
        const referrerDoc = await getDoc(referrerDocRef);
        if (referrerDoc.exists()) {
          const newReferredUser: ReferredUser = {
            uid: newUser.uid,
            displayName: newUserDisplayName,
            joinedAt: new Date().toISOString(),
          };
          await updateDoc(referrerDocRef, {
            tamraBalance: increment(100),
            referrals: increment(1),
            referredUsers: arrayUnion(newReferredUser)
          });
        }
      }
      return userCredential;
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

  const updateUserBalance = async (amount: number) => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        tamraBalance: increment(amount)
      });
      // Level recalculation is now handled by the onSnapshot listener,
      // so we don't need to explicitly call it here.
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
