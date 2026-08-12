import { useEffect, useState } from "react";
import { supabase, isCabinetEnabled } from "./supabase";
import { AuthContext } from "./authData";

/**
 * Tracks the Supabase auth session and the matching row from `profiles`
 * (which carries the student/teacher role). Both are null when signed
 * out, or when the cabinet isn't configured at all.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(isCabinetEnabled);
  // The profile is tagged with the user id it was fetched for, so
  // "still loading" and "belongs to a stale session" can both be
  // derived by comparing it to the current userId — no separate
  // loading flag to keep in sync by hand. `error` carries the reason
  // when the row genuinely wasn't found (or RLS denied it), so the UI
  // can say why instead of showing "loading" forever.
  const [fetchedProfile, setFetchedProfile] = useState({ id: null, profile: null, error: null });
  // Supabase signs the visitor in with a temporary session the moment
  // they land on the password-reset link, and fires this event instead
  // of a normal sign-in — caught here so Cabinet.jsx can show a "set a
  // new password" form instead of the regular logged-in view.
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (!isCabinetEnabled) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!isCabinetEnabled || !userId) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) =>
        setFetchedProfile({ id: userId, profile: data ?? null, error: data ? null : error })
      );
  }, [userId]);

  const profile = userId && fetchedProfile.id === userId ? fetchedProfile.profile : null;
  const profileError = userId && fetchedProfile.id === userId ? fetchedProfile.error : null;
  const profileLoading = Boolean(userId) && fetchedProfile.id !== userId;
  const loading = isCabinetEnabled && (sessionLoading || profileLoading);

  const value = {
    enabled: isCabinetEnabled,
    session,
    user: session?.user ?? null,
    profile,
    profileError,
    loading,
    isRecovery,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    requestPasswordReset: (email) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cabinet`,
      }),
    completeRecovery: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) setIsRecovery(false);
      return { error };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
