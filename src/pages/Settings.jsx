import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';

export default function Settings() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    const { error: signOutError } = await signOut();
    if (signOutError) {
      setError(t('signOutError'));
      return;
    }
    navigate('/login', { replace: true });
  }

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={t('settings')} />
      <div style={{ padding: 20 }}>
        {profile?.full_name && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{profile.full_name}</p>
            {profile.location && (
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>{profile.location}</p>
            )}
          </div>
        )}

        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <span style={{ fontWeight: 600 }}>{t('language')}</span>
          <div className="lang-toggle">
            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
              {t('english')}
            </button>
            <button className={language === 'te' ? 'active' : ''} onClick={() => setLanguage('te')}>
              {t('telugu')}
            </button>
          </div>
        </div>

        {error && <p className="error-text" role="alert">{error}</p>}

        <div style={{ marginTop: 30 }}>
          {confirmingLogout ? (
            <div className="card">
              <p>{t('logoutConfirm')}</p>
              <div className="row">
                <button className="btn btn-secondary" onClick={() => setConfirmingLogout(false)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  {t('logout')}
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setConfirmingLogout(true)}>
              {t('logout')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
