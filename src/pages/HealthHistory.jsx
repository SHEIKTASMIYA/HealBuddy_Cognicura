import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/Bits';

export default function HealthHistory() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [items, setItems] = useState(undefined);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    const [reportsRes, symptomsRes] = await Promise.all([
      supabase
        .from(TABLES.reports)
        .select('id, test_name, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from(TABLES.symptoms)
        .select('id, description, duration_text, medicines_taken, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);
    if (reportsRes.error || symptomsRes.error) {
      setError(t('error'));
      return;
    }

    const merged = [
      ...(reportsRes.data || []).map((r) => ({
        type: 'report',
        id: r.id,
        date: r.created_at,
        title: r.test_name || t('report'),
        status: r.status
      })),
      ...(symptomsRes.data || []).map((s) => ({
        type: 'symptom',
        id: s.id,
        date: s.created_at,
        title: s.description,
        detail: s.duration_text
      })),
      ...(symptomsRes.data || [])
        .filter((s) => s.medicines_taken)
        .map((s) => ({
          type: 'medicine',
          id: `med-${s.id}`,
          date: s.created_at,
          title: s.medicines_taken,
          detail: s.description
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    setItems(merged);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const profileHint = profile?.full_name;

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={t('healthHistory')} />
      <div style={{ padding: 20, flex: 1 }}>
        {profileHint && (
          <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>{profileHint}</p>
        )}

        {items === undefined && !error && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={load} retryLabel={t('retry')} />}
        {items && items.length === 0 && <EmptyState emoji="📖" title={t('noHistory')} />}

        {items && items.length > 0 && (
          <div className="timeline">
            {items.map((item) => (
              <div
                className="timeline-item"
                key={`${item.type}-${item.id}`}
                onClick={() => item.type === 'report' && navigate(`/reports/${item.id}`)}
                style={{ cursor: item.type === 'report' ? 'pointer' : 'default' }}
              >
                <div className="timeline-date">{new Date(item.date).toLocaleDateString()}</div>
                <div className="card">
                  <span className={`tag ${item.type === 'symptom' ? 'accent' : item.type === 'medicine' ? '' : ''}`}>
                    {t(item.type)}
                  </span>
                  <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{item.title}</p>
                  {item.detail && (
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>{item.detail}</p>
                  )}
                  {item.type === 'report' && item.status === 'processing' && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>{t('processing')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
