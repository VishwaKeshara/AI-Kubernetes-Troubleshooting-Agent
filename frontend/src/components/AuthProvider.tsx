"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { insforge } from "@/lib/insforge";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data.user) {
      setUser(null);
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email,
    });
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return error.message ?? "Sign in failed";
    }

    if (data?.user) {
      setUser({ id: data.user.id, email: data.user.email });
    }

    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      redirectTo: `${window.location.origin}/sign-in`,
    });

    if (error) {
      return error.message ?? "Sign up failed";
    }

    if (data?.requireEmailVerification) {
      return "Account created. Check your email for the verification code, then sign in.";
    }

    if (data?.user && data.accessToken) {
      setUser({ id: data.user.id, email: data.user.email });
    }

    return null;
  }, []);

  const signOut = useCallback(async () => {
    await insforge.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, isLoading, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
