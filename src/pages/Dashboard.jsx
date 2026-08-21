import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import { EmptyState, LoadingBlock } from '../components/Bits';

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      const [reportsRes, symptomsRes] = await Promise.all([
        supabase
          .from(TABLES.reports)
          .select('id, report_name, category, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from(TABLES.symptoms)
          .select('id, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);
      if (cancelled) return;
      if (reportsRes.error || symptomsRes.error) {
        setError(t('error'));
        return;
      }
      const merged = [
        ...(reportsRes.data || []).map((r) => ({
          type: 'report',
          id: r.id,
          title: r.report_name || t('report'),
          status: r.category,
          date: r.created_at
        })),
        ...(symptomsRes.data || []).map((s) => ({
          type: 'symptom',
          id: s.id,
          title: s.description,
          date: s.created_at
        }))
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setActivity(merged);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id, t]);

  const firstName = (profile?.full_name || '').split(' ')[0];

  const tiles = [
    {
      key: 'understand',
      title: t('understandReport'),
      sub: t('understandReportSub'),
      onClick: () => navigate('/upload-report'),
      icon: '📄'
    },
    {
      key: 'symptoms',
      title: t('recordSymptoms'),
      sub: t('recordSymptomsSub'),
      onClick: () => navigate('/record-symptoms'),
      icon: '🎤'
    },
    {
      key: 'voice',
      title: 'Voice Assistant',
      sub: 'Talk to HealBuddy directly with voice',
      onClick: () => navigate('/voice-assistant'),
      icon: '🎙️'
    },
    {
      key: 'myreports',
      title: 'My Reports',
      sub: 'Categorized lab tests, scans & notes',
      onClick: () => navigate('/reports'),
      icon: '📁'
    },
    {
      key: 'meds',
      title: 'My Medicines',
      sub: 'Track active & past prescription medicines',
      onClick: () => navigate('/medications'),
      icon: '💊'
    },
    {
      key: 'history',
      title: t('healthHistory'),
      sub: t('healthHistorySub'),
      onClick: () => navigate('/health-history'),
      icon: '📚'
    },
    {
      key: 'findcare',
      title: 'Find the Right Care',
      sub: 'Healthcare guidance & local provider map',
      onClick: () => navigate('/find-care'),
      icon: '🩺'
    },
    {
      key: 'doctor',
      title: t('doctorSummary'),
      sub: t('doctorSummarySub'),
      onClick: () => navigate('/doctor-summary'),
      icon: '📝'
    }
  ];

  return (
    <div className="screen">
      <TopBar
        title={t('appName')}
        onMenu={() => setDrawerOpen(true)}
        right={
          <button className="icon-btn" aria-label={t('settings')} onClick={() => navigate('/settings')}>
            ⚙️
          </button>
        }
      />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ margin: '16px 0 20px' }}>
        <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 13 }}>{t(greetingKey())},</p>
        <h1 style={{ fontSize: 24, margin: '2px 0 0' }}>{firstName || t('appName')}</h1>
      </div>

      <div className="dashboard-grid">
        {tiles.map((tile) => (
          <button key={tile.key} className="dash-tile" onClick={tile.onClick}>
            <span className="tile-icon" style={{ fontSize: 24 }}>{tile.icon}</span>
            <h3>{tile.title}</h3>
            <p>{tile.sub}</p>
          </button>
        ))}
      </div>

      <h3 style={{ marginTop: 28 }}>{t('recentActivity')}</h3>
      <div className="card" style={{ marginTop: 8 }}>
        {activity === null && !error && <LoadingBlock />}
        {error && <p className="error-text">{error}</p>}
        {activity && activity.length === 0 && (
          <EmptyState emoji="🗒️" title={t('noRecentActivity')} />
        )}
        {activity && activity.length > 0 && (
          <div>
            {activity.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                className="list-item"
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}
                onClick={() =>
                  navigate(item.type === 'report' ? `/reports/${item.id}` : '/symptom-history')
                }
              >
                <div>
                  <span className={`tag ${item.type === 'report' ? '' : 'accent'}`}>
                    {item.type === 'report' ? t('report') : t('symptom')}
                  </span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{item.title}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
