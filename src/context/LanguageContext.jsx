import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, TABLES } from '../supabaseClient';
import { t as translate } from '../i18n/translations';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

const LOCAL_KEY = 'healbuddy_lang_pref'; // pre-login only, e.g. during signup flow

export function LanguageProvider({ children }) {
  const { user, profile, refreshProfile } = useAuth();
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(LOCAL_KEY) || 'en'
  );

  // Once a profile loads, its saved preference is the source of truth.
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  const setLanguage = useCallback(
    async (lang) => {
      setLanguageState(lang);
      localStorage.setItem(LOCAL_KEY, lang);
      if (user?.id && profile) {
        await supabase
          .from(TABLES.profiles)
          .update({ preferred_language: lang })
          .eq('id', user.id);
        refreshProfile();
      }
    },
    [user, profile, refreshProfile]
  );

  const t = useCallback((key, vars) => translate(language, key, vars), [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
