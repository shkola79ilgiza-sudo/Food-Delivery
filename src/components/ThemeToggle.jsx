import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import './ThemeToggle.css';

const ThemeToggle = ({ size = 'medium', showLabels = true }) => {
  const { theme, setLightTheme, setDarkTheme, setAutoTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`theme-toggle theme-toggle-${size}`}>
      {showLabels && (
        <span className="theme-label">{t.language}:</span>
      )}
      
      <div className="theme-options">
        <button
          className={`theme-option ${theme === 'light' ? 'active' : ''}`}
          onClick={setLightTheme}
          title={t.lightTheme}
        >
          ☀️
        </button>
        
        <button
          className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          onClick={setDarkTheme}
          title={t.darkTheme}
        >
          🌙
        </button>
        
        <button
          className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
          onClick={setAutoTheme}
          title={t.autoTheme}
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
