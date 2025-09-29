import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = ({ size = 'medium', showFlags = true }) => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`language-toggle language-toggle-${size}`}>
      <button
        className="language-current"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        {showFlags && currentLanguage?.flag && (
          <span className="language-flag">{currentLanguage.flag}</span>
        )}
        <span className="language-name">{currentLanguage?.name}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {showFlags && <span className="language-flag">{lang.flag}</span>}
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
