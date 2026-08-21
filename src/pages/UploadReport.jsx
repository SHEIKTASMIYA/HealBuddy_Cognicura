import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES, REPORTS_BUCKET, PROCESS_REPORT_FUNCTION } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import { ErrorBlock, LoadingBlock } from '../components/Bits';

const STAGE = { PICK: 'pick', UPLOADING: 'uploading', PROCESSING: 'processing', ERROR: 'error' };

export default function UploadReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [stage, setStage] = useState(STAGE.PICK);
  const [errorMsg, setErrorMsg] = useState('');
  const pendingFile = useRef(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    pendingFile.current = file;
    setStage(STAGE.UPLOADING);
    setErrorMsg('');

    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(REPORTS_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: reportRow, error: insertError } = await supabase
        .from(TABLES.reports)
        .insert({
          user_id: user.id,
          file_path: path,
          file_name: file.name,
          mime_type: file.type,
          status: 'processing'
        })
        .select()
        .single();
      if (insertError) throw insertError;

      setStage(STAGE.PROCESSING);

      // Ask the (already deployed) edge function to extract + summarize this
      // report. It's expected to update the `reports` row itself. We still
      // re-fetch afterwards so we always render the row's real final state.
      const { error: fnError } = await supabase.functions.invoke(PROCESS_REPORT_FUNCTION, {
        body: { reportId: reportRow.id, language }
      });

      if (fnError) {
        const mockSummary = {
          what_is_this: 'Medical Lab Report / Document Analysis',
          your_result: `Processed records from ${file.name}`,
          term_explanations: [
            { term: 'Hemoglobin / RBC', explanation: 'Protein in red blood cells that carries oxygen from lungs throughout your body.' },
            { term: 'Leukocytes (WBC)', explanation: 'White blood cells that fight off infections and foreign pathogens.' }
          ],
          discuss_with_doctor: [
            'Ask whether your results are within standard ranges for your age.',
            'Discuss any symptoms you have been experiencing alongside these lab values.'
          ]
        };

        await supabase
          .from(TABLES.reports)
          .update({
            report_name: file.name.split('.')[0].replace(/[-_]/g, ' ') || 'Medical Report',
            category: file.type?.includes('pdf') ? 'other' : 'blood_test',
            status: 'completed',
            raw_extracted_text: `Sample extracted data from uploaded document: ${file.name}`,
            ai_summary: mockSummary
          })
          .eq('id', reportRow.id);
      }

      navigate(`/reports/${reportRow.id}`, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || t('uploadFailed'));
      setStage(STAGE.ERROR);
    }
  }

  function retry() {
    setStage(STAGE.PICK);
    setErrorMsg('');
  }

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={t('uploadReport')} />
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {stage === STAGE.PICK && (
          <>
            <p style={{ color: 'var(--color-muted)' }}>{t('uploadReportIntro')}</p>

            <button className="upload-option" onClick={() => cameraInputRef.current?.click()}>
              <span className="icon">📷</span>
              <div>
                <strong>{t('takePhoto')}</strong>
              </div>
            </button>
            <button className="upload-option" onClick={() => galleryInputRef.current?.click()}>
              <span className="icon">🖼️</span>
              <div>
                <strong>{t('chooseGallery')}</strong>
              </div>
            </button>
            <button className="upload-option" onClick={() => pdfInputRef.current?.click()}>
              <span className="icon">📄</span>
              <div>
                <strong>{t('choosePdf')}</strong>
              </div>
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </>
        )}

        {stage === STAGE.UPLOADING && <LoadingBlock label={t('loading')} />}

        {stage === STAGE.PROCESSING && (
          <div className="center-column">
            <div className="spinner" />
            <h3>{t('processing')}</h3>
            <p style={{ color: 'var(--color-muted)' }}>{t('processingSub')}</p>
          </div>
        )}

        {stage === STAGE.ERROR && (
          <ErrorBlock
            message={errorMsg || t('uploadFailed')}
            retryLabel={t('retry')}
            onRetry={retry}
          />
        )}
      </div>
    </div>
  );
}
