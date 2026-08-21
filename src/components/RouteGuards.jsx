import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingBlock } from './Bits';

export function isProfileComplete(profile) {
  if (!profile) return false;
  return Boolean(profile.onboarding_completed || profile.full_name);
}

// RequireAuth: Needs session and completed profile.
export function RequireAuth({ children }) {
  const { sessionChecked, user, profile, profileLoading } = useAuth();

  if (!sessionChecked || (user && profileLoading && profile === null)) {
    return <div className="screen"><LoadingBlock /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isProfileComplete(profile)) return <Navigate to="/create-profile" replace />;
  return children;
}

// RequireSession for /create-profile: Needs session. If profile is ALREADY completed, skip to /dashboard!
export function RequireSession({ children }) {
  const { sessionChecked, user, profile, profileLoading } = useAuth();
  if (!sessionChecked || (user && profileLoading && profile === null)) {
    return <div className="screen"><LoadingBlock /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isProfileComplete(profile)) return <Navigate to="/dashboard" replace />;
  return children;
}

// RedirectIfAuthed for /login: Skip to /dashboard if profile is completed, or /create-profile if new.
export function RedirectIfAuthed({ children }) {
  const { sessionChecked, user, profile, profileLoading } = useAuth();
  if (!sessionChecked || (user && profileLoading && profile === null)) {
    return <div className="screen"><LoadingBlock /></div>;
  }
  if (user && isProfileComplete(profile)) return <Navigate to="/dashboard" replace />;
  if (user && !isProfileComplete(profile)) return <Navigate to="/create-profile" replace />;
  return children;
}
