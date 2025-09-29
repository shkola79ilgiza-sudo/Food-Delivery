import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

const ChefLink = () => {
  const { t } = useLanguage();
  const chefId = localStorage.getItem("chefId");
  return chefId ? <Link to={`/chef/${encodeURIComponent(chefId)}/menu`}>{t.chefPage}</Link> : null;
};

const ClientLink = () => {
  const { t } = useLanguage();
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  return (token && role === "client") ? <Link to="/client/menu">{t.clientMenu}</Link> : null;
};

const AICoachLink = () => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  return (token && role === "client") ? <Link to="/client/ai-coach">🍎 Помощник по питанию</Link> : null;
};

const AIChefAssistantLink = () => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  return (token && role === "chef") ? <Link to="/chef/ai-assistant">🤖 AI-Помощник</Link> : null;
};

const IconShowcaseLink = () => {
  return <Link to="/icons">🎨 Демо иконок</Link>;
};

const LogoutButton = () => {
  const { t } = useLanguage();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("chefId");
    localStorage.removeItem("clientId");
    window.location.href = "/";
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      {t.logout}
    </button>
  );
};

const Navigation = () => {
  const { t } = useLanguage();

  return (
    <nav>
      <Link to="/">{t.home}</Link>
      <div className="nav-section">
        <span className="nav-label">{t.chefs}:</span>
        <Link to="/register">{t.register.title}</Link>
        <Link to="/login">{t.login.title}</Link>
        <ChefLink />
        <AIChefAssistantLink />
      </div>
      <div className="nav-section">
        <span className="nav-label">{t.clients}:</span>
        <Link to="/client/register">{t.register.title}</Link>
        <Link to="/client/login">{t.login.title}</Link>
        <ClientLink />
        <AICoachLink />
        <IconShowcaseLink />
      </div>
      <div className="nav-section">
        <span className="nav-label">{t.admin}:</span>
        <Link to="/admin/login">{t.adminPanel}</Link>
      </div>
      <div className="nav-controls">
        <ThemeToggle size="small" showLabels={false} />
        <LanguageToggle size="small" showFlags={true} />
      </div>
      <LogoutButton />
    </nav>
  );
};

export default Navigation;
