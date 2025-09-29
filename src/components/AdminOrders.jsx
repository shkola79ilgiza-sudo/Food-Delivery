import React, { useState, useEffect, useCallback } from 'react';
// import { useLanguage } from '../contexts/LanguageContext';
import { safeSetClientOrders } from '../utils/safeStorage';
import { useToast } from '../contexts/ToastContext';
import { addTestOrders, clearTestData } from '../utils/testData';
import './AdminOrders.css';

const AdminOrders = () => {
  // const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = useCallback(() => {
    try {
      const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      setOrders(clientOrders.reverse()); // Новые заказы сверху
    } catch (error) {
      console.error('Error loading orders:', error);
      showError('Ошибка загрузки заказов');
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    );
    
    setOrders(updatedOrders);
    safeSetClientOrders(updatedOrders);
    showSuccess(`Статус заказа ${orderId} изменен на "${getStatusLabel(newStatus)}"`);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending_payment': 'Ожидает оплаты',
      'pending_confirmation': 'Ожидает подтверждения',
      'reserved': 'Зарезервирован',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending_payment': '#ff9800',
      'pending_confirmation': '#2196f3',
      'reserved': '#9c27b0',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colorMap[status] || '#666';
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="loading">Загрузка заказов...</div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <header className="admin-orders-header">
        <h1>Управление заказами</h1>
        <div className="admin-orders-actions">
          <button onClick={loadOrders} className="btn-refresh">
            🔄 Обновить
          </button>
          <button 
            onClick={() => {
              addTestOrders();
              loadOrders();
              showSuccess('Тестовые заказы добавлены!');
            }} 
            className="btn-test"
          >
            🧪 Добавить тестовые заказы
          </button>
          <button 
            onClick={() => {
              clearTestData();
              loadOrders();
              showSuccess('Все данные очищены!');
            }} 
            className="btn-clear"
          >
            🗑️ Очистить все
          </button>
        </div>
      </header>

      <div className="admin-orders-filters">
        <div className="filter-group">
          <label>Поиск по ID или имени:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Введите ID заказа или имя клиента..."
          />
        </div>
        <div className="filter-group">
          <label>Фильтр по статусу:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Все заказы</option>
            <option value="pending_payment">Ожидает оплаты</option>
            <option value="pending_confirmation">Ожидает подтверждения</option>
            <option value="reserved">Зарезервирован</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
      </div>

      <div className="admin-orders-stats">
        <div className="stat-card">
          <h3>Всего заказов</h3>
          <span className="stat-number">{orders.length}</span>
        </div>
        <div className="stat-card">
          <h3>Доставлено</h3>
          <span className="stat-number">{orders.filter(o => o.status === 'delivered').length}</span>
        </div>
        <div className="stat-card">
          <h3>В ожидании</h3>
          <span className="stat-number">{orders.filter(o => ['pending_payment', 'pending_confirmation'].includes(o.status)).length}</span>
        </div>
      </div>

      <div className="admin-orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>Заказы не найдены</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="admin-order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>#{order.id}</h3>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  {order.customerName && (
                    <span className="customer-name">Клиент: {order.customerName}</span>
                  )}
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="order-content">
                <div className="order-items">
                  <h4>Товары в заказе:</h4>
                  <ul>
                    {order.items.map(item => (
                      <li key={item.id} className="order-item">
                        <div className="item-image">
                          <img 
                            src={item.photo || item.image || '/api/placeholder/40/40'} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/api/placeholder/40/40';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">{item.price * item.quantity} ₽</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Сумма товаров:</span>
                    <span>{order.itemsTotal} ₽</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="summary-row">
                      <span>Скидка:</span>
                      <span>-{order.discount} ₽</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Доставка:</span>
                    <span>{order.deliveryFee > 0 ? `${order.deliveryFee} ₽` : 'Бесплатно'}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Итого:</span>
                    <span>{order.total} ₽</span>
                  </div>
                </div>

                {order.rating && (
                  <div className="order-rating">
                    <h4>Оценка клиента:</h4>
                    <div className="rating-display">
                      {'⭐'.repeat(order.rating)} ({order.rating}/5)
                    </div>
                  </div>
                )}

                <div className="order-actions">
                  <div className="status-actions">
                    <h4>Изменить статус:</h4>
                    <div className="status-buttons">
                      <button
                        className={`status-btn ${order.status === 'pending_payment' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order.id, 'pending_payment')}
                      >
                        Ожидает оплаты
                      </button>
                      <button
                        className={`status-btn ${order.status === 'pending_confirmation' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order.id, 'pending_confirmation')}
                      >
                        Ожидает подтверждения
                      </button>
                      <button
                        className={`status-btn ${order.status === 'reserved' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order.id, 'reserved')}
                      >
                        Зарезервирован
                      </button>
                      <button
                        className={`status-btn delivered ${order.status === 'delivered' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        ✅ Доставлен
                      </button>
                      <button
                        className={`status-btn cancelled ${order.status === 'cancelled' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        ❌ Отменен
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
