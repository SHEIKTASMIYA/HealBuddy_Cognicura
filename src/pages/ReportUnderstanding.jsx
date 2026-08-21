import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import SpecialistCareMap from '../components/SpecialistCareMap';
import { Disclaimer, ErrorBlock, LoadingBlock } from '../components/Bits';

export default function ReportUnderstanding() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [report, setReport] = useState(undefined); // undefined = loading
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      const { data, error: fetchError } = await supabase
        .from(TABLES.reports)
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (fetchError) {
        setError(t('error'));
        return;
      }
      setReport(data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reportId, user.id, t]);

  if (error) {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <TopBar title={t('uploadReport')} />
        <div style={{ padding: 20 }}>
          <ErrorBlock message={error} />
        </div>
      </div>
    );
  }

  if (report === undefined) {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <TopBar title={t('uploadReport')} />
        <LoadingBlock />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <TopBar title={t('uploadReport')} />
        <ErrorBlock message={t('uploadFailed')} />
      </div>
    );
  }

  if (report.status === 'processing') {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <TopBar title={t('uploadReport')} />
        <div className="center-column">
          <div className="spinner" />
          <h3>{t('processing')}</h3>
          <p style={{ color: 'var(--color-muted)' }}>{t('processingSub')}</p>
        </div>
      </div>
    );
  }

  if (report.status === 'error') {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <TopBar title={t('uploadReport')} />
        <div style={{ padding: 20 }}>
          <ErrorBlock
            message={report.error_message || t('uploadFailed')}
            retryLabel={t('uploadAnother')}
            onRetry={() => navigate('/upload-report')}
          />
        </div>
      </div>
    );
  }

  const summary = report.ai_summary || {};
  const testName = report.report_name || report.test_name || t('report');
  const whatIsThis = summary.what_is_this || report.what_is_this || 'Medical Analysis Document';
  const yourResult = summary.your_result || report.result_text || report.raw_extracted_text || 'Completed document review.';
  const terms = Array.isArray(summary.term_explanations)
    ? summary.term_explanations
    : Array.isArray(report.terms)
    ? report.terms
    : [];
  const discussPoints = Array.isArray(summary.discuss_with_doctor)
    ? summary.discuss_with_doctor
    : Array.isArray(report.discuss_points)
    ? report.discuss_points
    : [];

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={testName} />
      <div style={{ padding: 20 }}>
        <section className="card" style={{ marginBottom: 16 }}>
          <h3>{t('whatIsThisTest')}</h3>
          <p>{whatIsThis}</p>
        </section>

        <section className="card" style={{ marginBottom: 16 }}>
          <h3>{t('yourResult')}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{yourResult}</p>
        </section>

        {terms.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <h3>{t('termsExplained')}</h3>
            {terms.map((term, idx) => (
              <div className="term-card" key={idx}>
                <div className="term-name">{term.term}</div>
                <p style={{ margin: 0 }}>{term.explanation}</p>
              </div>
            ))}
          </section>
        )}

        {discussPoints.length > 0 && (
          <section className="card" style={{ marginBottom: 16 }}>
            <h3>{t('discussWithDoctor')}</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {discussPoints.map((point, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {point}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 10, fontStyle: 'italic', color: 'var(--color-muted)' }}>
              {t('mayBeWorthDiscussing')}
            </p>
          </section>
        )}

        {/* Integrated Inline Specialist Recommendation & Local Care Map */}
        <SpecialistCareMap reportCategory={report.category} reportName={testName} />

        <Disclaimer>{t('reportDisclaimer')}</Disclaimer>

        <div className="bottom-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/upload-report')}>
            {t('uploadAnother')}
          </button>
        </div>
      </div>
    </div>
  );
}
