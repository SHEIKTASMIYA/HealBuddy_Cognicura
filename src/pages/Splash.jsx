import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete } from '../components/RouteGuards';
import Logo from '../components/Logo';

export default function Splash() {
  const navigate = useNavigate();
  const { sessionChecked, user, profile, profileLoading } = useAuth();

  useEffect(() => {
    if (!sessionChecked) return;
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      if (profileLoading) return;
      if (!isProfileComplete(profile)) {
        navigate('/create-profile', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [sessionChecked, user, profile, profileLoading, navigate]);

  return (
    <div className="screen center-column" style={{ background: '#FAFDFB' }}>
      <div style={{ animation: 'fade-in-up 0.5s ease-out' }}>
        <Logo size="xlarge" variant="full" />
      </div>
      <p style={{ color: 'var(--color-primary-dark)', fontWeight: 600, fontSize: 16, marginTop: 12 }}>
        Understand. Organize. Navigate.
      </p>
      <div className="spinner" style={{ marginTop: 28 }} />
    </div>
  );
}
