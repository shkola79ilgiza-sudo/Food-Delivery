import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

const SimpleNavigation = () => {
  const { t } = useLanguage();

  return (
    <nav className="simple-nav">
      <div className="simple-nav-content">
        <Link to="/" className="home-link">
          {typeof t.home === 'string' ? t.home : t.home?.title || 'Главная'}
        </Link>
        
        <div className="simple-nav-controls">
          <ThemeToggle size="small" showLabels={false} />
          <LanguageToggle size="small" showFlags={true} />
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation;
