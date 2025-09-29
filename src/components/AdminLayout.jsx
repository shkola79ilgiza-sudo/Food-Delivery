import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Панель управления', key: 'dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Пользователи', key: 'users' },
    { path: '/admin/chefs', icon: '👨‍🍳', label: 'Повара и меню', key: 'chefs' },
    { path: '/admin/orders', icon: '📦', label: 'Заказы', key: 'orders' },
    { path: '/admin/finance', icon: '💰', label: 'Финансы', key: 'finance' },
    { path: '/admin/messages', icon: '💬', label: 'Сообщения', key: 'messages' },
    { path: '/admin/settings', icon: '⚙️', label: 'Настройки', key: 'settings' },
    { path: '/admin/reports', icon: '📈', label: 'Отчеты', key: 'reports' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🔐 Админ-панель</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span className="nav-label">Выйти</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
