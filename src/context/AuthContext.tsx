import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Profile } from '../types';

export type UserRole = 'guest' | 'user' | 'admin';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
  isGuest: boolean;
  userRole: UserRole;
  loginAsAdmin: () => void;
  continueAsGuest: () => void;
  guestName: string;
  guestEmail: string;
  setGuestInfo: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Clear guest mode on real login
        setIsGuest(false);
        setGuestName('');
        setGuestEmail('');
        // Fetch or create profile in Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as Profile);
          } else {
            const newProfile: Profile = {
              id: firebaseUser.uid,
              full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Archival Patron',
              avatar_url: firebaseUser.photoURL || undefined,
              isAdmin: false,
            };
            await setDoc(doc(db, 'profiles', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Firestore profile fetch failed:', err);
          setProfile({
            id: firebaseUser.uid,
            full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Patron',
            isAdmin: false,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setIsGuest(false);
    setGuestName('');
    setGuestEmail('');
    // If it was a local admin session, just clear state
    if (profile?.id === 'admin-local') {
      setUser(null);
      setProfile(null);
      return;
    }
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

  /** True only if the signed-in user's email matches the configured admin email and it is not empty */
  const isAdminByEmail =
    Boolean(user?.email) &&
    user?.email === import.meta.env.VITE_ADMIN_USER &&
    Boolean(import.meta.env.VITE_ADMIN_USER);

  const isAdmin = isAdminByEmail || profile?.id === 'admin-local';

  const userRole: UserRole = isAdmin ? 'admin' : isGuest ? 'guest' : user ? 'user' : 'guest';

  /** Log in as admin using env-var credentials (no Firebase required) */
  const loginAsAdmin = () => {
    setIsGuest(false);
    setUser({ uid: 'admin-local', displayName: 'System Admin', email: import.meta.env.VITE_ADMIN_USER } as any);
    setProfile({ id: 'admin-local', full_name: 'Administrator', isAdmin: true });
    setAuthModalOpen(false);
  };

  /** Continue as an unauthenticated guest — can browse and checkout */
  const continueAsGuest = () => {
    setIsGuest(true);
    setAuthModalOpen(false);
  };

  const setGuestInfo = (name: string, email: string) => {
    setGuestName(name);
    setGuestEmail(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthModalOpen,
        setAuthModalOpen,
        logout,
        updateProfile,
        isAdmin,
        isGuest,
        userRole,
        loginAsAdmin,
        continueAsGuest,
        guestName,
        guestEmail,
        setGuestInfo,
      }}
    >
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
