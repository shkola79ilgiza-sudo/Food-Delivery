import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { safeSetClientOrders } from '../utils/safeStorage';

const AdminOrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [chef, setChef] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { orderId } = useParams();

  const loadOrderDetails = useCallback(() => {
    setLoading(true);
    
    // Загружаем заказ
    const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
    const foundOrder = orders.find(o => o.id === orderId);
    
    if (!foundOrder) {
      setMessage('Заказ не найден');
      setLoading(false);
      return;
    }
    
    setOrder(foundOrder);
    
    // Загружаем данные повара и клиента
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const foundChef = users.find(u => u.email === foundOrder.chefId);
    const foundCustomer = users.find(u => u.email === foundOrder.customer?.email);
    
    setChef(foundChef);
    setCustomer(foundCustomer);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    loadOrderDetails();
  }, [navigate, orderId, loadOrderDetails]);

  const createChefNotification = (order, status) => {
    try {
      const notifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      
      let notification = null;
      const chefId = order.items && order.items.length > 0 ? order.items[0].chefId : 'unknown';
      
      switch (status) {
        case 'confirmed':
          notification = {
            id: `notification-${Date.now()}`,
            type: 'orderConfirmed',
            title: 'Заказ подтвержден',
            message: `Заказ #${order.id} подтвержден и готов к приготовлению`,
            time: new Date(),
            read: false,
            icon: '✅',
            orderId: order.id,
            chefId: chefId
          };
          break;
        case 'preparing':
          notification = {
            id: `notification-${Date.now()}`,
            type: 'orderPreparing',
            title: 'Начать приготовление',
            message: `Заказ #${order.id} готов к приготовлению`,
            time: new Date(),
            read: false,
            icon: '👨‍🍳',
            orderId: order.id,
            chefId: chefId
          };
          break;
        case 'delivering':
          notification = {
            id: `notification-${Date.now()}`,
            type: 'orderDelivering',
            title: 'Заказ в доставке',
            message: `Заказ #${order.id} передан курьеру`,
            time: new Date(),
            read: false,
            icon: '🚚',
            orderId: order.id,
            chefId: chefId
          };
          break;
        case 'delivered':
          notification = {
            id: `notification-${Date.now()}`,
            type: 'orderDelivered',
            title: 'Заказ доставлен',
            message: `Заказ #${order.id} успешно доставлен клиенту`,
            time: new Date(),
            read: false,
            icon: '🎉',
            orderId: order.id,
            chefId: chefId
          };
          break;
        case 'cancelled':
          notification = {
            id: `notification-${Date.now()}`,
            type: 'orderCancelled',
            title: 'Заказ отменен',
            message: `Заказ #${order.id} был отменен`,
            time: new Date(),
            read: false,
            icon: '❌',
            orderId: order.id,
            chefId: chefId
          };
          break;
        default:
          // Для неизвестных статусов не создаем уведомление
          break;
      }
      
      if (notification) {
        notifications.unshift(notification);
        const limitedNotifications = notifications.slice(0, 50);
        localStorage.setItem('chefNotifications', JSON.stringify(limitedNotifications));
        console.log('Created chef notification:', notification);
      }
    } catch (error) {
      console.error('Error creating chef notification:', error);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    setMessage('');
    
    try {
      const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedOrders = orders.map(o => 
        o.id === orderId 
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      );
      
      safeSetClientOrders(updatedOrders);
      setOrder(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
      
      // Создаем уведомление для повара
      createChefNotification(order, newStatus);
      
      setMessage('Статус заказа обновлен!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      setMessage('Ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
    }
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
      'pending': 'Ожидает подтверждения',
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

  const formatCurrency = (amount) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  if (loading) {
    return (
      <div className="admin-order-details">
        <div className="loading">Загрузка данных заказа...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-order-details">
        <div className="error-message">
          <h2>❌ Заказ не найден</h2>
          <p>Заказ с ID {orderId} не существует</p>
          <button onClick={() => navigate('/admin/orders')} className="back-button">
            ← Вернуться к заказам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-details">
      <div className="page-header">
        <button 
          onClick={() => navigate('/admin/orders')} 
          className="back-button"
        >
          ← Назад к заказам
        </button>
        <h1>📦 Детали заказа #{order.id}</h1>
        <div className="order-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="order-content">
        {/* Информация о заказе */}
        <div className="order-section">
          <h2>📋 Информация о заказе</h2>
          <div className="order-info-grid">
            <div className="info-item">
              <span className="label">ID заказа:</span>
              <span className="value">#{order.id}</span>
            </div>
            <div className="info-item">
              <span className="label">Дата создания:</span>
              <span className="value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">Дата обновления:</span>
              <span className="value">{formatDate(order.updatedAt || order.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">Общая сумма:</span>
              <span className="value">{formatCurrency(order.payment?.total || 0)}</span>
            </div>
            <div className="info-item">
              <span className="label">Комиссия:</span>
              <span className="value">{formatCurrency(order.payment?.commission || 0)}</span>
            </div>
            <div className="info-item">
              <span className="label">Сумма повару:</span>
              <span className="value">{formatCurrency((order.payment?.total || 0) - (order.payment?.commission || 0))}</span>
            </div>
          </div>
        </div>

        {/* Информация о клиенте */}
        <div className="order-section">
          <h2>👤 Информация о клиенте</h2>
          <div className="customer-info">
            <div className="info-item">
              <span className="label">Имя:</span>
              <span className="value">{customer?.name || order.customer?.name || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{customer?.email || order.customer?.email || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Телефон:</span>
              <span className="value">{customer?.phone || order.customer?.phone || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Адрес доставки:</span>
              <span className="value">{order.delivery?.address || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Комментарий к заказу:</span>
              <span className="value">{order.delivery?.comment || 'Нет комментариев'}</span>
            </div>
          </div>
        </div>

        {/* Информация о поваре */}
        <div className="order-section">
          <h2>👨‍🍳 Информация о поваре</h2>
          <div className="chef-info">
            <div className="info-item">
              <span className="label">Имя:</span>
              <span className="value">{chef?.name || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{chef?.email || order.chefId || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Специализация:</span>
              <span className="value">{chef?.specialization || 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="label">Опыт:</span>
              <span className="value">{chef?.experience || 'Не указано'} лет</span>
            </div>
          </div>
        </div>

        {/* Блюда в заказе */}
        <div className="order-section">
          <h2>🍽️ Блюда в заказе</h2>
          <div className="dishes-list">
            {order.items?.map((item, index) => (
              <div key={index} className="dish-item">
                <div className="dish-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="no-image">📷</div>
                  )}
                </div>
                <div className="dish-info">
                  <h4>{item.name}</h4>
                  <p className="dish-description">{item.description}</p>
                  <div className="dish-details">
                    <span className="quantity">Количество: {item.quantity}</span>
                    <span className="price">{formatCurrency(item.price)}</span>
                    <span className="total">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Управление статусом */}
        <div className="order-section">
          <h2>⚙️ Управление заказом</h2>
          <div className="status-controls">
            <div className="current-status">
              <span className="label">Текущий статус:</span>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusText(order.status)}
              </span>
            </div>
            
            <div className="status-buttons">
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateOrderStatus('confirmed')}
                  className="status-button confirm"
                  disabled={updating}
                >
                  ✅ Подтвердить заказ
                </button>
              )}
              
              {order.status === 'confirmed' && (
                <button 
                  onClick={() => updateOrderStatus('preparing')}
                  className="status-button preparing"
                  disabled={updating}
                >
                  👨‍🍳 Начать готовку
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button 
                  onClick={() => updateOrderStatus('delivering')}
                  className="status-button delivering"
                  disabled={updating}
                >
                  🚚 Начать доставку
                </button>
              )}
              
              {order.status === 'delivering' && (
                <button 
                  onClick={() => updateOrderStatus('delivered')}
                  className="status-button delivered"
                  disabled={updating}
                >
                  ✅ Завершить доставку
                </button>
              )}
              
              {!['delivered', 'cancelled'].includes(order.status) && (
                <button 
                  onClick={() => updateOrderStatus('cancelled')}
                  className="status-button cancel"
                  disabled={updating}
                >
                  ❌ Отменить заказ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
