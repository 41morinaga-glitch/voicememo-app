import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { STRINGS, type Locale } from './strings';

const KEY = 'voicememo:locale';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof STRINGS)[Locale];
};

const I18nContext = createContext<Ctx | null>(null);

function readStored(): Locale {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'ja' || v === 'en') return v;
  } catch {}
  return 'ja';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, locale);
    } catch {}
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const value = useMemo<Ctx>(() => ({ locale, setLocale, t: STRINGS[locale] }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
