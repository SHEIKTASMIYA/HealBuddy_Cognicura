import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import { EmptyState, ErrorBlock, LoadingBlock, Toast } from '../components/Bits';

export default function SymptomHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [symptoms, setSymptoms] = useState(undefined);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function load() {
    setError('');
    const { data, error: fetchError } = await supabase
      .from(TABLES.symptoms)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(t('error'));
      return;
    }
    setSymptoms(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function handleDelete(id) {
    const { error: deleteError } = await supabase
      .from(TABLES.symptoms)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    setConfirmDeleteId(null);
    if (deleteError) {
      setToast(t('error'));
      return;
    }
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
    setToast(t('delete'));
    setTimeout(() => setToast(''), 1800);
  }

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={t('symptomHistory')} />
      <div style={{ padding: 20, flex: 1 }}>
        {symptoms === undefined && !error && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={load} retryLabel={t('retry')} />}

        {symptoms && symptoms.length === 0 && (
          <EmptyState
            emoji="📝"
            title={t('noSymptoms')}
            action={
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px', marginTop: 8 }} onClick={() => navigate('/record-symptoms')}>
                {t('recordSymptoms')}
              </button>
            }
          />
        )}

        {symptoms && symptoms.length > 0 && (
          <div>
            {symptoms.map((s) => (
              <div className="card" key={s.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{s.description}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                      {s.duration_text ? ` · ${t('since')} ${s.duration_text}` : ''}
                    </p>
                    {s.medicines_taken && (
                      <span className="tag accent" style={{ marginTop: 8, display: 'inline-block' }}>
                        {s.medicines_taken}
                      </span>
                    )}
                  </div>
                </div>

                {confirmDeleteId === s.id ? (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13 }}>{t('confirmDelete')}</p>
                    <div className="row">
                      <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                        {t('cancel')}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row" style={{ marginTop: 12 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/record-symptoms/${s.id}`)}
                    >
                      {t('edit')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(s.id)}>
                      {t('delete')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast message={toast} />
    </div>
  );
}
