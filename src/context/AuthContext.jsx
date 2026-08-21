import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, TABLES } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = not checked yet, null = no session
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    setProfileLoading(true);
    const { data, error } = await supabase
      .from(TABLES.profiles)
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfileLoading(false);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load profile', error);
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    // Restores the persisted session (if any) on load.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      if (data.session?.user?.id) fetchProfile(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      if (newSession?.user?.id) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setProfile(null);
    }
    return { error };
  }, []);

  const refreshProfile = useCallback(() => {
    if (session?.user?.id) return fetchProfile(session.user.id);
    return Promise.resolve(null);
  }, [session, fetchProfile]);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    profileLoading,
    sessionChecked: session !== undefined,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
