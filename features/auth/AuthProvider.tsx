import type { AuthError, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "../../lib/supabase/client";
import type { Database } from "../../lib/supabase/database.types";

export type AuthStatus = "loading" | "signed-out" | "authenticated" | "configuration-error";

export type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  error: string;
  notice: string;
  submitting: boolean;
  signIn(email: string, password: string): Promise<boolean>;
  signUp(email: string, password: string): Promise<boolean>;
  signOut(): Promise<void>;
  clearMessages(): void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(error: AuthError, action: "sign-in" | "sign-up" | "sign-out"): string {
  if (error.code === "invalid_credentials") return "The email or password is incorrect.";
  if (error.code === "email_not_confirmed") return "Confirm your email address before signing in.";
  if (error.code === "user_already_exists") return "An account with this email already exists. Try signing in.";
  if (error.status === 429) return "Too many attempts. Wait a moment and try again.";
  if (action === "sign-up") return "The account could not be created. Check the email and password, then retry.";
  if (action === "sign-out") return "The local session was cleared, but the server could not be reached.";
  return "Sign-in failed. Check your connection and try again.";
}

export function AuthProvider({
  children,
  client = supabase,
}: {
  children: ReactNode;
  client?: SupabaseClient<Database> | null;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(client ? "loading" : "configuration-error");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const authRevisionRef = useRef(0);

  useEffect(() => {
    if (!client) {
      setStatus("configuration-error");
      setSession(null);
      return;
    }

    let active = true;
    const initialRevision = ++authRevisionRef.current;

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      authRevisionRef.current += 1;
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "signed-out");
      if (!nextSession) setSubmitting(false);
    });

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || authRevisionRef.current !== initialRevision) return;
      if (sessionError) {
        setError("Your saved session could not be restored. Sign in again.");
        setSession(null);
        setStatus("signed-out");
        return;
      }
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "signed-out");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const clearMessages = useCallback(() => {
    setError("");
    setNotice("");
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!client) return false;
    clearMessages();
    setSubmitting(true);
    const { data, error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (authError) {
      setError(friendlyAuthError(authError, "sign-in"));
      return false;
    }
    authRevisionRef.current += 1;
    setSession(data.session);
    setStatus("authenticated");
    return true;
  }, [clearMessages, client]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!client) return false;
    clearMessages();
    setSubmitting(true);
    const { data, error: authError } = await client.auth.signUp({ email: email.trim(), password });
    setSubmitting(false);
    if (authError) {
      setError(friendlyAuthError(authError, "sign-up"));
      return false;
    }
    if (data.session) {
      authRevisionRef.current += 1;
      setSession(data.session);
      setStatus("authenticated");
    } else {
      setNotice("Account created. Check your email to confirm it, then sign in.");
    }
    return true;
  }, [clearMessages, client]);

  const signOut = useCallback(async () => {
    if (!client) return;
    clearMessages();
    authRevisionRef.current += 1;
    setSession(null);
    setStatus("signed-out");
    const { error: authError } = await client.auth.signOut({ scope: "local" });
    if (authError) setError(friendlyAuthError(authError, "sign-out"));
  }, [clearMessages, client]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    session,
    user: session?.user ?? null,
    error,
    notice,
    submitting,
    signIn,
    signUp,
    signOut,
    clearMessages,
  }), [clearMessages, error, notice, session, signIn, signOut, signUp, status, submitting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
