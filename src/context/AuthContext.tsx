import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, testConnection } from '../firebase';
import { UserProfile } from '../types';
import { 
  signInWithGoogle, 
  signInWithStaffCredentials, 
  signOutUser, 
  getLocalSession, 
  ensureAdminRecord 
} from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isStaff: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithStaffCredentials: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (u: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial firestore health check
    testConnection();

    // 2. Check local session
    const local = getLocalSession();
    if (local && local.user) {
      setUser(local.user);
    }

    // 3. Listen to Firebase Auth state for Google account
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await ensureAdminRecord(fbUser);
          setUser(profile);
        } catch (err: any) {
          console.warn('Auth state sync note:', err.message);
        }
      } else {
        // If no firebase user, but we have a staff session, leave staff logged in
        if (local?.loginMethod !== 'credentials') {
          // not staff session
        }
      }
      setIsLoading(false);
    });

    // If local was already loaded, stop loading indicator
    if (local) {
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await signInWithGoogle();
      setUser(profile);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithStaffCredentials = async (username: string, pass: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await signInWithStaffCredentials(username, pass);
      setUser(profile);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        loginWithGoogle,
        loginWithStaffCredentials,
        logout,
        clearError,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
