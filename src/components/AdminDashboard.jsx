import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChefs: 0,
    totalClients: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCommission: 0,
    activeOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Загружаем статистику из localStorage
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
    
    const chefs = users.filter(user => user.role === 'chef');
    const clients = users.filter(user => user.role === 'client');
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.payment?.total || 0), 0);
    const totalCommission = orders.reduce((sum, order) => sum + (order.payment?.commission || 0), 0);
    const activeOrders = orders.filter(order => ['pending', 'confirmed', 'preparing', 'delivering'].includes(order.status)).length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    
    setStats({
      totalUsers: users.length,
      totalChefs: chefs.length,
      totalClients: clients.length,
      totalOrders: orders.length,
      totalRevenue,
      totalCommission,
      activeOrders,
      completedOrders
    });

    // Последние 5 заказов
    setRecentOrders(orders.slice(-5).reverse());
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'preparing': '#9c27b0',
      'delivering': '#3f51b5',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает',
      'confirmed': 'Подтвержден',
      'preparing': 'Готовится',
      'delivering': 'В доставке',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Панель управления</h1>
        <div className="dashboard-actions">
          <button onClick={loadDashboardData} className="refresh-button">
            🔄 Обновить
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('role');
              navigate('/admin/login');
            }} 
            className="logout-button"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Всего пользователей</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <div className="stat-breakdown">
              <span>Повара: {stats.totalChefs}</span>
              <span>Клиенты: {stats.totalClients}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Заказы</h3>
            <p className="stat-number">{stats.totalOrders}</p>
            <div className="stat-breakdown">
              <span>Активные: {stats.activeOrders}</span>
              <span>Завершенные: {stats.completedOrders}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Общая выручка</h3>
            <p className="stat-number">{stats.totalRevenue.toLocaleString()} ₽</p>
            <div className="stat-breakdown">
              <span>Комиссия: {stats.totalCommission.toLocaleString()} ₽</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Конверсия</h3>
            <p className="stat-number">
              {stats.totalUsers > 0 ? Math.round((stats.totalOrders / stats.totalUsers) * 100) : 0}%
            </p>
            <div className="stat-breakdown">
              <span>Заказов на пользователя</span>
            </div>
          </div>
        </div>
      </div>

      {/* Последние заказы */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>🕒 Последние заказы</h2>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="view-all-button"
          >
            Все заказы →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="no-data">
            <p>Заказов пока нет</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>ID заказа</th>
                  <th>Клиент</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer?.name || 'Не указано'}</td>
                    <td>{order.payment?.total || 0} ₽</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <button 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="view-button"
                      >
                        Просмотр
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Быстрые действия */}
      <div className="dashboard-section">
        <h2>⚡ Быстрые действия</h2>
        <div className="quick-actions">
          <button 
            onClick={() => navigate('/admin/users')}
            className="quick-action-button"
          >
            👥 Управление пользователями
          </button>
          <button 
            onClick={() => navigate('/admin/chefs')}
            className="quick-action-button"
          >
            👨‍🍳 Управление поварами
          </button>
          <button 
            onClick={() => navigate('/admin/finance')}
            className="quick-action-button"
          >
            💰 Финансовые отчеты
          </button>
          <button 
            onClick={() => navigate('/admin/settings')}
            className="quick-action-button"
          >
            ⚙️ Настройки системы
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
