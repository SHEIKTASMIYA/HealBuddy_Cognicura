import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function CreateProfile() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(language);
  const [location, setLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [currentMedicines, setCurrentMedicines] = useState('');

  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim() || !dob || !gender || !location.trim()) {
      setError(t('requiredField'));
      return;
    }
    setError('');
    setLoading(true);

    const { error: upsertError } = await supabase.from(TABLES.profiles).upsert({
      id: user.id,
      full_name: fullName.trim(),
      date_of_birth: dob,
      gender,
      preferred_language: preferredLanguage,
      location: location.trim(),
      emergency_contact: emergencyContact.trim() || null,
      existing_conditions: existingConditions.trim()
        ? existingConditions.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
      allergies: allergies.trim()
        ? allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
      current_medicines: currentMedicines.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    });

    setLoading(false);
    if (upsertError) {
      setError(upsertError.message || t('error'));
      return;
    }
    setLanguage(preferredLanguage);
    await refreshProfile();
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="screen">
      <h1 style={{ marginTop: 8 }}>{t('createProfile')}</h1>
      <p style={{ color: 'var(--color-muted)' }}>{t('profileIntro')}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <div className="field">
          <label htmlFor="fullName">{t('fullName')} *</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="dob">{t('dob')} *</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="gender">{t('gender')} *</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="" disabled>—</option>
            <option value="female">{t('genderFemale')}</option>
            <option value="male">{t('genderMale')}</option>
            <option value="other">{t('genderOther')}</option>
            <option value="prefer_not_to_say">{t('genderPreferNot')}</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="preferredLanguage">{t('preferredLanguage')} *</label>
          <div className="lang-toggle">
            <button
              type="button"
              className={preferredLanguage === 'en' ? 'active' : ''}
              onClick={() => setPreferredLanguage('en')}
            >
              {t('english')}
            </button>
            <button
              type="button"
              className={preferredLanguage === 'te' ? 'active' : ''}
              onClick={() => setPreferredLanguage('te')}
            >
              {t('telugu')}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="location">{t('location')} *</label>
          <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <button
          type="button"
          className="btn-text"
          onClick={() => setShowOptional((v) => !v)}
          aria-expanded={showOptional}
        >
          {showOptional ? '−' : '+'} {t('optionalDetails')}
        </button>

        {showOptional && (
          <div style={{ marginTop: 8 }}>
            <div className="field">
              <label htmlFor="emergencyContact">{t('emergencyContact')}</label>
              <input
                id="emergencyContact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="existingConditions">{t('existingConditions')}</label>
              <textarea
                id="existingConditions"
                rows={2}
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="allergies">{t('allergies')}</label>
              <textarea
                id="allergies"
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="currentMedicines">{t('currentMedicines')}</label>
              <textarea
                id="currentMedicines"
                rows={2}
                value={currentMedicines}
                onChange={(e) => setCurrentMedicines(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && <p className="error-text" role="alert">{error}</p>}

        <div className="bottom-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('loading') : t('saveProfile')}
          </button>
        </div>
      </form>
    </div>
  );
}
