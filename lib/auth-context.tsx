"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getFirebase, isFirebaseConfigured } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, configured: isFirebaseConfigured });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getFirebase().auth, (next) => {
      setUser(next);
      setLoading(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, loading, configured: isFirebaseConfigured }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
