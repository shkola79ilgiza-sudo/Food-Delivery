import React, { createContext, useContext, useState, useEffect } from 'react';
import { ru } from '../locales/ru';
import { en } from '../locales/en';
import { tt } from '../locales/tt';

const LanguageContext = createContext();

const translations = {
  ru,
  en,
  tt
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      return browserLang;
    }
    
    return 'ru'; // Default to Russian
  });

  const [t, setT] = useState(() => {
    // Создаем простой объект с переводами
    return translations[language];
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    setT(translations[language]);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: [
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'tt', name: 'Татарча', flag: '🏴' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
