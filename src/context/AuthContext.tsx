import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Profile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
  loginAsAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as Profile);
        } else {
          const newProfile: Profile = {
            id: firebaseUser.uid,
            full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Archival Patron',
            avatar_url: firebaseUser.photoURL || undefined,
            isAdmin: false
          };
          await setDoc(doc(db, 'profiles', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, updates);
      setProfile({ ...profile, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = (user?.email === import.meta.env.VITE_ADMIN_USER) || profile?.id === 'admin-local';

  const loginAsAdmin = () => {
    setUser({ uid: 'admin-local', displayName: 'System Admin', email: import.meta.env.VITE_ADMIN_USER } as any);
    setProfile({ id: 'admin-local', full_name: 'Administrator', isAdmin: true });
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthModalOpen,
      setAuthModalOpen,
      logout,
      updateProfile,
      isAdmin,
      loginAsAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
