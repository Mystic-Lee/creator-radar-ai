import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppSettings } from '../../shared/types';

interface AppContextValue {
  settings:           AppSettings;
  updateSettings:     (patch: Partial<AppSettings>) => Promise<void>;
  isLoading:          boolean;
  onboardingComplete: boolean;
  completeOnboarding: (initial: Partial<AppSettings>) => Promise<void>;
}

const DEFAULT: AppSettings = { companyName:'', logoPath:undefined, themeColor:'#6366f1', darkMode:true, onboardingComplete:false };
const AppContext = createContext<AppContextValue|null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);

  const applyTheme = useCallback((s: Partial<AppSettings>) => {
    if (s.themeColor) document.documentElement.style.setProperty('--brand-color', s.themeColor);
    if (s.darkMode !== undefined) document.documentElement.setAttribute('data-theme', s.darkMode ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await window.electronAPI.getAppSettings();
        if (saved) { const m = { ...DEFAULT, ...saved }; setSettings(m); applyTheme(m); }
        else applyTheme(DEFAULT);
      } catch { applyTheme(DEFAULT); }
      finally { setIsLoading(false); }
    })();
  }, [applyTheme]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next: AppSettings = { ...settings, ...patch };
    if (patch.logoPath === undefined && settings.logoPath) next.logoPath = settings.logoPath;
    if (patch.logoPath === null) next.logoPath = undefined;
    setSettings(next); applyTheme(next);
    try { await window.electronAPI.saveAppSettings(next); }
    catch { setSettings(settings); }
  }, [settings, applyTheme]);

  const completeOnboarding = useCallback(async (initial: Partial<AppSettings>) => {
    await updateSettings({ ...initial, onboardingComplete: true });
  }, [updateSettings]);

  return (
    <AppContext.Provider value={{ settings, updateSettings, isLoading, onboardingComplete: settings.onboardingComplete, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
