'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  tamraBalance: number;
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
        const unsubProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          } else {
            // Handle case where user exists in Auth but not in Firestore
            setUserProfile(null);
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

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const updateUserProfile = (profile: { displayName?: string; photoURL?: string; }) => {
      if(auth.currentUser){
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


  const value = { user, userProfile, loading, login, signup, logout, updateUserProfile, reauthenticate, updateUserPassword, updateUserBalance };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
