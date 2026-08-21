import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import SpecialistCareMap from '../components/SpecialistCareMap';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [step, setStep] = useState('initial'); // 'initial' | 'confirm_transcript' | 'duration' | 'medicine' | 'summary' | 'emergency'
  const [duration, setDuration] = useState('');
  const [medicine, setMedicine] = useState('');
  const [saving, setSaving] = useState(false);

  let recognition = null;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-US';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setListening(false);
        checkRedFlags(text);
      };

      recognition.onerror = () => {
        setListening(false);
      };
      recognition.onend = () => {
        setListening(false);
      };
    }
  }, [language]);

  function checkRedFlags(text) {
    const lower = text.toLowerCase();
    if (lower.includes('chest pain') || lower.includes('breathing difficulty') || lower.includes('heart attack')) {
      setStep('emergency');
    } else {
      setStep('confirm_transcript');
    }
  }

  function startListening() {
    setListening(true);
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = language === 'te' ? 'te-IN' : 'en-US';
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        setListening(false);
        checkRedFlags(text);
      };
      rec.onerror = () => setListening(false);
      rec.start();
    } else {
      setTimeout(() => {
        const fallback = 'I have had stomach pain since yesterday.';
        setTranscript(fallback);
        setListening(false);
        checkRedFlags(fallback);
      }, 1500);
    }
  }

  async function handleSaveSymptom() {
    setSaving(true);
    await supabase.from(TABLES.symptoms).insert({
      user_id: user.id,
      description: transcript,
      duration_text: duration || '1 day',
      medicines_taken: medicine ? [medicine] : null,
      onset_date: new Date().toISOString().slice(0, 10),
      status: 'ongoing',
      input_method: 'voice'
    });
    setSaving(false);
    navigate('/symptom-history');
  }

  return (
    <div className="screen">
      <TopBar title="Voice Assistant" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>
          {t('micGreeting', { name: profile?.full_name?.split(' ')[0] || 'Friend' })}
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>
          {t('symptomDisclaimer')}
        </p>

        {step === 'emergency' ? (
          <div className="card emergency-banner" style={{ marginTop: 24, textWrap: 'wrap' }}>
            <span style={{ fontSize: 40 }}>🆘</span>
            <h3 style={{ color: '#d32f2f', margin: '8px 0' }}>Urgent Care Warning</h3>
            <p style={{ fontSize: 13 }}>
              {t('emergencyMessage')}
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <a href="tel:108" className="btn" style={{ background: '#d32f2f', color: '#fff', flex: 1, textDecoration: 'none' }}>
                📞 Call 108 (Emergency)
              </a>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep('initial')}>
                Back to Voice
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ margin: '36px 0' }}>
              <button
                className={`mic-hero-btn ${listening ? 'listening' : ''}`}
                onClick={startListening}
                disabled={listening}
              >
                🎙️
              </button>
              <p style={{ marginTop: 12, fontWeight: 600 }}>
                {listening ? t('micListening') : t('tapToSpeak')}
              </p>
            </div>

            {step === 'initial' && (
              <div className="card" style={{ textAlign: 'left' }}>
                <h4>Or type what you are experiencing:</h4>
                <div className="field">
                  <textarea
                    rows={2}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="e.g. Headache for 2 days..."
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={!transcript.trim()}
                  onClick={() => checkRedFlags(transcript)}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'confirm_transcript' && (
              <div className="card" style={{ textAlign: 'left' }}>
                <span className="tag accent">{t('micHeard')}</span>
                <p style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 16px' }}>"{transcript}"</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep('initial')}>
                    {t('tryAgain')}
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep('duration')}>
                    {t('confirm')}
                  </button>
                </div>
              </div>
            )}

            {step === 'duration' && (
              <div className="card" style={{ textAlign: 'left' }}>
                <h3>{t('askDuration')}</h3>
                <div className="field">
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 days"
                  />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep('medicine')}>
                  {t('next')}
                </button>
              </div>
            )}

            {step === 'medicine' && (
              <div className="card" style={{ textAlign: 'left' }}>
                <h3>{t('askMedicine')}</h3>
                <div className="field">
                  <input
                    value={medicine}
                    onChange={(e) => setMedicine(e.target.value)}
                    placeholder="e.g. Paracetamol or None"
                  />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep('summary')}>
                  Review Summary
                </button>
              </div>
            )}

            {step === 'summary' && (
              <div className="card" style={{ textAlign: 'left' }}>
                <h3>{t('summaryReadback')}</h3>
                <p><strong>Symptom:</strong> {transcript}</p>
                <p><strong>Duration:</strong> {duration || 'Not specified'}</p>
                <p><strong>Medicines taken:</strong> {medicine || 'None'}</p>

                <SpecialistCareMap symptomText={transcript} />

                <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={saving} onClick={handleSaveSymptom}>
                  {saving ? t('loading') : 'Save to Symptom History'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
