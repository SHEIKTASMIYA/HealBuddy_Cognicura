import { useEffect, useMemo, useState } from 'react';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import { Disclaimer, EmptyState, ErrorBlock, LoadingBlock, Toast } from '../components/Bits';

function buildSuggestedQuestions(symptoms, reports, t) {
  const questions = [];
  if (symptoms.length > 0) {
    questions.push(
      `${t('symptom')}: ${symptoms[0].description} — ${t('mayBeWorthDiscussing')}`
    );
  }
  reports.forEach((r) => {
    (Array.isArray(r.discuss_points) ? r.discuss_points : []).forEach((point) => {
      questions.push(point);
    });
  });
  if (questions.length === 0) {
    questions.push(t('noDataForSummary'));
  }
  return questions;
}

export default function DoctorSummary() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [symptoms, setSymptoms] = useState(undefined);
  const [reports, setReports] = useState(undefined);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [editableName, setEditableName] = useState('');
  const [editableSymptoms, setEditableSymptoms] = useState('');
  const [editableMedicines, setEditableMedicines] = useState('');
  const [editableReports, setEditableReports] = useState('');
  const [editableQuestions, setEditableQuestions] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      const [symptomsRes, reportsRes] = await Promise.all([
        supabase
          .from(TABLES.symptoms)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from(TABLES.reports)
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      if (cancelled) return;
      if (symptomsRes.error || reportsRes.error) {
        setError(t('error'));
        return;
      }
      setSymptoms(symptomsRes.data || []);
      setReports(reportsRes.data || []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id, t]);

  const ready = symptoms !== undefined && reports !== undefined;

  const hasData = ready && (symptoms.length > 0 || reports.length > 0);

  useEffect(() => {
    if (!ready || !hasData) return;
    setEditableName(profile?.full_name || '');
    setEditableSymptoms(
      symptoms
        .map(
          (s) =>
            `• ${s.description}${s.duration_text ? ` (${t('since')} ${s.duration_text})` : ''} — ${new Date(
              s.created_at
            ).toLocaleDateString()}`
        )
        .join('\n')
    );
    setEditableMedicines(
      [
        profile?.current_medicines,
        ...symptoms.filter((s) => s.medicines_taken).map((s) => s.medicines_taken)
      ]
        .filter(Boolean)
        .join(', ')
    );
    setEditableReports(
      reports
        .map((r) => `• ${r.test_name || t('report')} — ${new Date(r.created_at).toLocaleDateString()}`)
        .join('\n')
    );
    setEditableQuestions(buildSuggestedQuestions(symptoms, reports, t).map((q) => `• ${q}`).join('\n'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hasData]);

  const fullSummaryText = useMemo(() => {
    return [
      `${t('doctorSummary')}`,
      '',
      `${t('patientName')}: ${editableName}`,
      '',
      `${t('symptom')}:`,
      editableSymptoms || '—',
      '',
      `${t('currentMedicinesLabel')}:`,
      editableMedicines || '—',
      '',
      `${t('recentReports')}:`,
      editableReports || '—',
      '',
      `${t('suggestedQuestions')}:`,
      editableQuestions || '—',
      '',
      t('reportDisclaimer')
    ].join('\n');
  }, [editableName, editableSymptoms, editableMedicines, editableReports, editableQuestions, t]);

  function handleDownload() {
    const blob = new Blob([fullSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healbuddy-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('doctorSummary'), text: fullSummaryText });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard?.writeText(fullSummaryText);
      setToast(t('shareSummary'));
      setTimeout(() => setToast(''), 1800);
    }
  }

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={t('doctorSummary')} />
      <div style={{ padding: 20, flex: 1 }}>
        {!ready && !error && <LoadingBlock />}
        {error && <ErrorBlock message={error} />}

        {ready && !hasData && <EmptyState emoji="📋" title={t('noDataForSummary')} />}

        {ready && hasData && (
          <>
            <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>{t('editBeforeSharing')}</p>

            <div className="field">
              <label>{t('patientName')}</label>
              <input value={editableName} onChange={(e) => setEditableName(e.target.value)} />
            </div>
            <div className="field">
              <label>{t('symptom')}</label>
              <textarea rows={4} value={editableSymptoms} onChange={(e) => setEditableSymptoms(e.target.value)} />
            </div>
            <div className="field">
              <label>{t('currentMedicinesLabel')}</label>
              <textarea rows={2} value={editableMedicines} onChange={(e) => setEditableMedicines(e.target.value)} />
            </div>
            <div className="field">
              <label>{t('recentReports')}</label>
              <textarea rows={3} value={editableReports} onChange={(e) => setEditableReports(e.target.value)} />
            </div>
            <div className="field">
              <label>{t('suggestedQuestions')}</label>
              <textarea rows={4} value={editableQuestions} onChange={(e) => setEditableQuestions(e.target.value)} />
            </div>

            <Disclaimer>{t('neverAutoShares')}</Disclaimer>

            <div className="bottom-actions">
              <div className="row">
                <button className="btn btn-secondary" onClick={handleDownload}>
                  {t('downloadSummary')}
                </button>
                <button className="btn btn-primary" onClick={handleShare}>
                  {t('shareSummary')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Toast message={toast} />
    </div>
  );
}
