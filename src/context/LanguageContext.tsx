'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'uk' | 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  loading: boolean;
  translations: Record<string, Record<Language, string>>;
  showModal: boolean;
  closeModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uk');
  const [translations, setTranslations] = useState<Record<string, Record<Language, string>>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Set language cookie helper
  const setCookie = (name: string, value: string, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
  };

  useEffect(() => {
    // 1. Fetch translations from our API
    const fetchTranslations = async () => {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          setTranslations(data);
        }
      } catch (err) {
        console.error('Failed to load translations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();

    // 2. Check saved language preference
    const savedLang = localStorage.getItem('apex_language') as Language | null;
    if (savedLang && ['uk', 'ru', 'en'].includes(savedLang)) {
      setLanguageState(savedLang);
      setCookie('NEXT_LOCALE', savedLang);
    } else {
      // Force language chooser modal on first visit
      setShowModal(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('apex_language', lang);
    setCookie('NEXT_LOCALE', lang);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Translation helper function
  const t = (key: string): string => {
    if (!translations[key]) {
      // Return key as fallback if translation not found
      return key;
    }
    const val = translations[key][language];
    return val !== undefined && val !== '' ? val : translations[key]['uk'] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        loading,
        translations,
        showModal,
        closeModal,
      }}
    >
      {children}
      
      {/* Language Selection Modal Overlay */}
      {showModal && (
        <div className="lang-modal-overlay">
          <div className="lang-modal-card">
            <h2>Оберіть мову / Choose language</h2>
            <p>Будь ласка, оберіть зручну мову для роботи з сайтом Apex Force.</p>
            
            <div className="lang-buttons-grid">
              <button 
                className={`lang-btn-opt ${language === 'uk' ? 'active' : ''}`}
                onClick={() => setLanguage('uk')}
              >
                🇺🇦 Українська
              </button>
              <button 
                className={`lang-btn-opt ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                🇬🇧 English
              </button>
            </div>
            
            <button 
              className="lang-btn-opt lang-btn-subtle"
              onClick={() => setLanguage('ru')}
              style={{ opacity: language === 'ru' ? 1 : 0.5, border: language === 'ru' ? '2px solid var(--red)' : '1px solid var(--border-light)', fontSize: '14px', padding: '10px', marginTop: '-4px' }}
            >
              Русский
            </button>
            
            <button 
              className="lang-confirm-btn"
              onClick={closeModal}
            >
              Підтвердити / Confirm
            </button>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
