
'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, UserCredential } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion, getDoc, runTransaction, collection, query, orderBy, getDocs } from 'firebase/firestore';

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
const TOTAL_SUPPLY_CAP = 50000000;


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
            
            const profileUpdates: { [key: string]: any } = {};

            if (newLevel > (profileData.level || 1)) {
              profileUpdates.level = newLevel;
            }

            const badgesToAward: string[] = [];
            const currentBadges = profileData.badges || [];

            if (!currentBadges.includes('pioneer')) {
                badgesToAward.push('pioneer');
            }
            if ((profileData.miningStreak || 0) >= 7 && !currentBadges.includes('serial_miner')) {
                badgesToAward.push('serial_miner');
            }
            if ((profileData.referrals || 0) > 20 && !currentBadges.includes('socialite')) {
                badgesToAward.push('socialite');
            }
            if ((profileData.level || newLevel) >= 10 && !currentBadges.includes('masterpiece')) {
              badgesToAward.push('masterpiece');
            }

            if (badgesToAward.length > 0) {
              profileUpdates.badges = arrayUnion(...badgesToAward);
            }

            if (Object.keys(profileUpdates).length > 0) {
              await updateDoc(userDocRef, profileUpdates);
            } else {
              setUserProfile(profileData);
            }

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

      const statsDocRef = doc(firestore, 'community-stats', 'live');
      
      await runTransaction(firestore, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        const currentTotal = statsDoc.data()?.totalTamraClaimed || 0;

        if (currentTotal >= TOTAL_SUPPLY_CAP) {
            // Don't add new member if cap is reached? Or just don't give referral bonus.
            // For now, we will still add the member but block token rewards.
             transaction.set(statsDocRef, { totalMembers: increment(1) }, { merge: true });
        } else {
            transaction.set(statsDocRef, { totalMembers: increment(1) }, { merge: true });

            if (referralCode) {
                const referrerDocRef = doc(firestore, 'users', referralCode);
                const referrerDoc = await transaction.get(referrerDocRef);
                if (referrerDoc.exists()) {
                    const newReferredUser: ReferredUser = {
                        uid: newUser.uid,
                        displayName: newUserDisplayName,
                        joinedAt: new Date().toISOString(),
                    };
                    transaction.update(referrerDocRef, {
                        tamraBalance: increment(100),
                        referrals: increment(1),
                        referredUsers: arrayUnion(newReferredUser)
                    });
                    // Also update the global claimed count for the referral bonus
                    transaction.set(statsDocRef, { totalTamraClaimed: increment(100) }, { merge: true });
                }
            }
        }

      });
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
    if (!user || amount <= 0) {
        throw new Error("Invalid user or amount.");
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);
    const statsDocRef = doc(firestore, 'community-stats', 'live');
    
    await runTransaction(firestore, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        const currentTotal = statsDoc.data()?.totalTamraClaimed || 0;

        if (currentTotal >= TOTAL_SUPPLY_CAP) {
            throw new Error("Total supply cap reached. Cannot claim more tokens.");
        }
        
        // Ensure we don't overshoot the cap
        const awardableAmount = Math.min(amount, TOTAL_SUPPLY_CAP - currentTotal);
        if (awardableAmount <= 0) {
             throw new Error("Total supply cap reached. Cannot claim more tokens.");
        }

        transaction.update(userDocRef, { tamraBalance: increment(awardableAmount) });
        transaction.set(statsDocRef, { totalTamraClaimed: increment(awardableAmount) }, { merge: true });
    });
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
     if (!user) {
        throw new Error("You must be logged in to complete a task.");
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const statsDocRef = doc(firestore, 'community-stats', 'live');
    
    await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document does not exist!");
        }

        const completedTasks = userDoc.data().completedTasks || [];
        if (completedTasks.includes(taskId)) {
            throw new Error("You have already completed this task.");
        }

        const statsDoc = await transaction.get(statsDocRef);
        const currentTotal = statsDoc.data()?.totalTamraClaimed || 0;

        if (currentTotal >= TOTAL_SUPPLY_CAP) {
            throw new Error("Total supply cap reached. Cannot claim rewards.");
        }

        const awardableAmount = Math.min(reward, TOTAL_SUPPLY_CAP - currentTotal);
        if (awardableAmount <= 0) {
             throw new Error("Total supply cap reached. Cannot claim rewards.");
        }

        transaction.update(userDocRef, {
            tamraBalance: increment(awardableAmount),
            completedTasks: arrayUnion(taskId)
        });

        transaction.set(statsDocRef, { totalTamraClaimed: increment(awardableAmount) }, { merge: true });
    });
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

    
