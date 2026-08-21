import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

export default function SideNav({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { t } = useLanguage();

  if (!open) return null;

  const menuItems = [
    { label: t('dashboard') || 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: t('understandReport') || 'Understand a Report', icon: '📄', path: '/upload-report' },
    { label: 'My Reports', icon: '📁', path: '/reports' },
    { label: t('recordSymptoms') || 'Record Symptoms', icon: '🎤', path: '/record-symptoms' },
    { label: 'Voice Assistant', icon: '🎙️', path: '/voice-assistant' },
    { label: t('symptomHistory') || 'Symptom History', icon: '📋', path: '/symptom-history' },
    { label: 'My Medicines', icon: '💊', path: '/medications' },
    { label: 'My Consultations', icon: '🏥', path: '/consultations' },
    { label: t('healthHistory') || 'Health Timeline', icon: '📚', path: '/health-history' },
    { label: 'Find the Right Care', icon: '🩺', path: '/find-care' },
    { label: t('doctorSummary') || 'Doctor Summary', icon: '📝', path: '/doctor-summary' },
    { label: 'Privacy & Security', icon: '🔒', path: '/privacy' },
    { label: 'Emergency Assistance', icon: '🆘', path: '/emergency' },
    { label: t('settings') || 'Settings & Profile', icon: '⚙️', path: '/settings' }
  ];

  function handleNav(path) {
    onClose();
    navigate(path);
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="app-logo">
            <Logo size="medium" variant="icon" />
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>{t('appName')}</h2>
              <p className="user-name">{profile?.full_name || 'Health Account'}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <div className="drawer-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="drawer-icon">{item.icon}</span>
                <span className="drawer-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="drawer-footer">
          <button
            className="btn btn-outline drawer-logout"
            onClick={async () => {
              onClose();
              await signOut();
              navigate('/login');
            }}
          >
            🚪 {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
