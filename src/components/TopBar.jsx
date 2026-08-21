import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

export default function TopBar({ title, onBack, onMenu, right }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onMenu && (
          <button className="icon-btn" aria-label="Menu" onClick={onMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {onBack !== false && !onMenu && (
          <button
            className="icon-btn"
            aria-label="Back"
            onClick={() => (onBack ? onBack() : navigate(-1))}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Logo size="small" variant="icon" />
          <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>{title || 'HealBuddy'}</h1>
        </div>
      </div>

      {/* Desktop Navigation Header Links */}
      <nav className="desktop-nav" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className={`btn-text ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`btn-text ${location.pathname === '/reports' ? 'active' : ''}`}
          onClick={() => navigate('/reports')}
        >
          Reports
        </button>
        <button
          className={`btn-text ${location.pathname === '/record-symptoms' ? 'active' : ''}`}
          onClick={() => navigate('/record-symptoms')}
        >
          Symptoms
        </button>
        <button
          className={`btn-text ${location.pathname === '/medications' ? 'active' : ''}`}
          onClick={() => navigate('/medications')}
        >
          Medicines
        </button>
        <button
          className={`btn-text ${location.pathname === '/find-care' ? 'active' : ''}`}
          onClick={() => navigate('/find-care')}
        >
          Find Care
        </button>

        {/* Language switcher */}
        <button
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: 13, borderRadius: 999 }}
          onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
        >
          🌐 {language === 'en' ? 'తెలుగు' : 'English'}
        </button>

        {right}
      </nav>
    </header>
  );
}
