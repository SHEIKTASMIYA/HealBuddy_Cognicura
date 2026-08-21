import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import Logo from '../components/Logo';

const MODE = { EMAIL: 'email', MOBILE: 'mobile' };
const INTENT = { LOGIN: 'login', SIGNUP: 'signup' };

export default function Login() {
  const { t, language, setLanguage } = useLanguage();
  const [mode, setMode] = useState(MODE.MOBILE);
  const [intent, setIntent] = useState(INTENT.LOGIN);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fn =
      intent === INTENT.SIGNUP
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { error: authError } = await fn;
    setLoading(false);
    if (authError) setError(authError.message || t('authError'));
    // On success, AuthContext's onAuthStateChange picks up the session and
    // App's route guards send the user to create-profile or dashboard.
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: mobile });
    setLoading(false);
    if (otpError) {
      setError(otpError.message || t('authError'));
    } else {
      setOtpSentTo(mobile);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: otp,
      type: 'sms'
    });
    setLoading(false);
    if (verifyError) setError(verifyError.message || t('authError'));
  }

  return (
    <div className="screen">
      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <div className="lang-toggle" style={{ width: 160, marginBottom: 24 }}>
          <button
            type="button"
            className={language === 'en' ? 'active' : ''}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={language === 'te' ? 'active' : ''}
            onClick={() => setLanguage('te')}
          >
            తె
          </button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Logo size="medium" variant="full" />
        </div>
        <p style={{ color: 'var(--color-muted)', fontWeight: 500, fontSize: 14 }}>{t('tagline')}</p>
      </div>

      <div className="row" style={{ marginBottom: 20 }}>
        <button
          className={`btn ${intent === INTENT.LOGIN ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIntent(INTENT.LOGIN)}
        >
          {t('login')}
        </button>
        <button
          className={`btn ${intent === INTENT.SIGNUP ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIntent(INTENT.SIGNUP)}
        >
          {t('signup')}
        </button>
      </div>

      {mode === MODE.MOBILE ? (
        <form onSubmit={otpSentTo ? handleVerifyOtp : handleSendOtp}>
          <div className="field">
            <label htmlFor="mobile">{t('mobileNumber')}</label>
            <input
              id="mobile"
              type="tel"
              placeholder="+91 98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={Boolean(otpSentTo)}
              required
            />
          </div>

          {otpSentTo && (
            <div className="field">
              <label htmlFor="otp">{t('otp')}</label>
              <p className="hint">
                {t('otpSent')} {otpSentTo}
              </p>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="error-text" role="alert">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('loading') : otpSentTo ? t('verifyOtp') : t('sendOtp')}
          </button>

          <button
            type="button"
            className="btn-text"
            onClick={() => {
              setMode(MODE.EMAIL);
              setError('');
            }}
          >
            {t('useEmailInstead')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit}>
          <div className="field">
            <label htmlFor="email">{t('email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">{t('password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="error-text" role="alert">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('loading') : intent === INTENT.SIGNUP ? t('signup') : t('login')}
          </button>

          <button
            type="button"
            className="btn-text"
            onClick={() => {
              setMode(MODE.MOBILE);
              setError('');
            }}
          >
            {t('useMobileInstead')}
          </button>
        </form>
      )}
    </div>
  );
}
