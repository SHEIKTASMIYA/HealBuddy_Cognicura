import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeech } from '../lib/useSpeech';
import { isRedFlag } from '../lib/redFlags';
import TopBar from '../components/TopBar';
import SpecialistCareMap from '../components/SpecialistCareMap';
import { Disclaimer, LoadingBlock } from '../components/Bits';

const STEP = {
  DESCRIBE: 'describe',
  CONFIRM: 'confirm',
  DURATION: 'duration',
  MEDICINE_YN: 'medicine_yn',
  MEDICINE_NAME: 'medicine_name',
  REVIEW: 'review',
  SAVED: 'saved',
  EMERGENCY: 'emergency'
};

export default function RecordSymptoms() {
  const navigate = useNavigate();
  const { symptomId } = useParams();
  const isEditing = Boolean(symptomId);
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const speech = useSpeech(language);

  const [step, setStep] = useState(STEP.DESCRIBE);
  const [description, setDescription] = useState('');
  const [durationText, setDurationText] = useState('');
  const [tookMedicine, setTookMedicine] = useState(null);
  const [medicineName, setMedicineName] = useState('');
  const [source, setSource] = useState('text');

  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [micDraft, setMicDraft] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    async function load() {
      const { data, error: fetchError } = await supabase
        .from(TABLES.symptoms)
        .select('*')
        .eq('id', symptomId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!fetchError && data) {
        setDescription(data.description || '');
        setDurationText(data.duration_text || '');
        setTookMedicine(data.medicines_taken ? true : data.medicines_taken === '' ? false : null);
        setMedicineName(data.medicines_taken || '');
        setStep(STEP.REVIEW);
      }
      setLoadingExisting(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isEditing, symptomId, user.id]);

  // Voice-triggered greeting is spoken once when the mic is first used.
  function startVoice() {
    setSource('voice');
    speech.speak(t('micGreeting', { name: profile?.full_name?.split(' ')[0] || '' }));
    captureField(setDescription, STEP.DESCRIBE);
  }

  async function captureField(setter, currentStep) {
    if (!speech.supported) return;
    try {
      const text = await speech.listenOnce();
      setMicDraft(text);
      setter(text);
    } catch {
      // Ignore — user can always type instead.
    }
  }

  function handleDescribeNext() {
    if (!description.trim()) return;
    if (isRedFlag(description)) {
      setStep(STEP.EMERGENCY);
      return;
    }
    setStep(STEP.DURATION);
  }

  function handleDurationNext() {
    setStep(STEP.MEDICINE_YN);
  }

  function handleMedicineChoice(yes) {
    setTookMedicine(yes);
    if (yes) {
      setStep(STEP.MEDICINE_NAME);
    } else {
      setMedicineName('');
      setStep(STEP.REVIEW);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const payload = {
      user_id: user.id,
      description: description.trim(),
      duration_text: durationText.trim() || null,
      medicines_taken: tookMedicine && medicineName.trim() ? [medicineName.trim()] : null,
      input_method: source === 'voice' ? 'voice' : 'typed',
      source,
      red_flag: false
    };

    const { error: saveError } = isEditing
      ? await supabase.from(TABLES.symptoms).update(payload).eq('id', symptomId).eq('user_id', user.id)
      : await supabase.from(TABLES.symptoms).insert(payload);

    setSaving(false);
    if (saveError) {
      setError(saveError.message || t('error'));
      return;
    }
    if (source === 'voice') speech.speak(t('savedThanks'));
    setStep(STEP.SAVED);
  }

  if (loadingExisting) {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <TopBar title={t('symptomEntry')} />
        <LoadingBlock />
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: 0 }}>
      <TopBar title={t('symptomEntry')} />
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === STEP.EMERGENCY && (
          <div className="center-column">
            <div className="emergency-banner">
              <span aria-hidden="true">🚑</span>
              <span>{t('emergencyMessage')}</span>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginTop: 20 }}>
              {t('close')}
            </button>
          </div>
        )}

        {step === STEP.DESCRIBE && (
          <>
            <p style={{ color: 'var(--color-muted)' }}>{t('typeOrSpeak')}</p>

            {!isEditing && (
              <div className="center-column" style={{ padding: '20px 0' }}>
                <button
                  className={`mic-button ${speech.isListening ? 'listening' : ''}`}
                  onClick={startVoice}
                  aria-label={t('tapToSpeak')}
                  disabled={!speech.supported}
                >
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="2" width="6" height="12" rx="3" fill="#fff" />
                    <path d="M5 11a7 7 0 0014 0M12 18v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                  {speech.isListening ? t('micListening') : speech.supported ? t('tapToSpeak') : t('voiceNotSupported')}
                </p>
              </div>
            )}

            <div className="field">
              <label htmlFor="description">{t('symptom')}</label>
              <textarea
                id="description"
                rows={3}
                placeholder={t('symptomPlaceholder')}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSource('text');
                }}
              />
            </div>

            <Disclaimer>{t('symptomDisclaimer')}</Disclaimer>

            <div className="bottom-actions">
              <button className="btn btn-primary" onClick={handleDescribeNext} disabled={!description.trim()}>
                {t('next')}
              </button>
            </div>
          </>
        )}

        {step === STEP.DURATION && (
          <>
            <h3>{t('howManyDays')}</h3>
            <div className="field">
              <input
                type="text"
                placeholder={t('daysPlaceholder')}
                value={durationText}
                onChange={(e) => setDurationText(e.target.value)}
                autoFocus
              />
            </div>
            {speech.supported && (
              <button
                className="btn-text"
                onClick={() => captureField(setDurationText, STEP.DURATION)}
              >
                🎙 {t('tapToSpeak')}
              </button>
            )}
            <div className="bottom-actions">
              <button className="btn btn-primary" onClick={handleDurationNext} disabled={!durationText.trim()}>
                {t('next')}
              </button>
            </div>
          </>
        )}

        {step === STEP.MEDICINE_YN && (
          <>
            <h3>{t('takenMedicine')}</h3>
            <div className="row">
              <button className="btn btn-secondary" onClick={() => handleMedicineChoice(true)}>
                {t('yes')}
              </button>
              <button className="btn btn-secondary" onClick={() => handleMedicineChoice(false)}>
                {t('no')}
              </button>
            </div>
          </>
        )}

        {step === STEP.MEDICINE_NAME && (
          <>
            <h3>{t('whichMedicine')}</h3>
            <div className="field">
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                autoFocus
              />
            </div>
            {speech.supported && (
              <button className="btn-text" onClick={() => captureField(setMedicineName, STEP.MEDICINE_NAME)}>
                🎙 {t('tapToSpeak')}
              </button>
            )}
            <div className="bottom-actions">
              <button className="btn btn-primary" onClick={() => setStep(STEP.REVIEW)} disabled={!medicineName.trim()}>
                {t('next')}
              </button>
            </div>
          </>
        )}

        {step === STEP.REVIEW && (
          <>
            <h3>{t('summaryReadback')}</h3>
            <div className="card">
              <div className="field">
                <label>{t('symptom')}</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <label>{t('howManyDays')}</label>
                <input value={durationText} onChange={(e) => setDurationText(e.target.value)} />
              </div>
              <div className="field">
                <label>{t('whichMedicine')}</label>
                <input
                  value={medicineName}
                  placeholder={t('no')}
                  onChange={(e) => {
                    setMedicineName(e.target.value);
                    setTookMedicine(Boolean(e.target.value));
                  }}
                />
              </div>
            </div>

            {error && <p className="error-text" role="alert">{error}</p>}

            {/* Integrated Specialist Care & Map */}
            <SpecialistCareMap symptomText={description} />

            <Disclaimer>{t('symptomDisclaimer')}</Disclaimer>

            <div className="bottom-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? t('loading') : isEditing ? t('save') : t('shouldISave')}
              </button>
            </div>
          </>
        )}

        {step === STEP.SAVED && (
          <div className="center-column">
            <div style={{ fontSize: 40 }}>✅</div>
            <h3>{t('symptomSaved')}</h3>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => navigate('/symptom-history')}>
                {t('symptomHistory')}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
