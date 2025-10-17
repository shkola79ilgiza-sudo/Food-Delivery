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
  const label = typeof t.clientMenu === 'string' ? t.clientMenu : (t.clientMenu?.title || 'Меню');
  return (token && role === "client") ? <Link to="/client/menu">{label}</Link> : null;
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

const OrderTestLink = () => {
  return <Link to="/test/order-lifecycle">🧪 Тест заказов</Link>;
};

const OrderMonitorLink = () => {
  return <Link to="/test/monitor">📊 Мониторинг</Link>;
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
      Выйти
    </button>
  );
};

const Navigation = () => {
  const { t } = useLanguage();

  return (
    <nav className="top-nav">
      <div className="nav-track">
      <Link to="/">{typeof t.home === 'string' ? t.home : t.home?.title || 'Главная'}</Link>
      <div className="nav-section">
        <span className="nav-label">{typeof t.chefs === 'string' ? t.chefs : 'Повара'}:</span>
        <Link to="/register">{t.register?.title || 'Регистрация'}</Link>
        <Link to="/login">{t.login?.title || 'Вход'}</Link>
        <ChefLink />
        <AIChefAssistantLink />
      </div>
      <div className="nav-section">
        <span className="nav-label">{typeof t.clients === 'string' ? t.clients : 'Клиенты'}:</span>
        <Link to="/client/register">{t.register?.title || 'Регистрация'}</Link>
        <Link to="/client/login">{t.login?.title || 'Вход'}</Link>
        <Link to="/guest/menu">👀 Демо меню</Link>
        <ClientLink />
        <AICoachLink />
        <IconShowcaseLink />
        <OrderTestLink />
        <OrderMonitorLink />
      </div>
      <div className="nav-section">
        <span className="nav-label">{typeof t.admin === 'string' ? t.admin : 'Админ'}:</span>
        <Link to="/admin/login">{typeof t.adminPanel === 'string' ? t.adminPanel : 'Админ-панель'}</Link>
      </div>
      <div className="nav-controls">
        <ThemeToggle size="small" showLabels={false} />
        <LanguageToggle size="small" showFlags={true} />
      </div>
      <LogoutButton />
      </div>
    </nav>
  );
};

export default Navigation;
