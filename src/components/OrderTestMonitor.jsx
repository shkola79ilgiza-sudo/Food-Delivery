import React, { useState, useEffect } from 'react';

const OrderTestMonitor = () => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(2000);

  // Загрузка данных
  const loadData = () => {
    try {
      // Загружаем заказы
      const ordersData = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      setOrders(ordersData);

      // Загружаем уведомления
      const notificationsData = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      setNotifications(notificationsData);

      // Загружаем корзину
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(cartData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Группировка заказов по статусу
  const ordersByStatus = orders.reduce((acc, order) => {
    const status = order.status || 'unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {});

  // Статистика
  const stats = {
    totalOrders: orders.length,
    testOrders: orders.filter(o => o.id.startsWith('test-order-')).length,
    unreadNotifications: notifications.filter(n => !n.read).length,
    cartItems: cart.length,
    cartTotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#2D5016', marginBottom: '20px' }}>
        📊 Мониторинг системы заказов
      </h1>

      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #2196f3',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📦 Всего заказов</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.totalOrders}
          </div>
        </div>

        <div style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>🧪 Тестовые заказы</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
            {stats.testOrders}
          </div>
        </div>

        <div style={{
          background: '#f8d7da',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #dc3545',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>🔔 Непрочитанные</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
            {stats.unreadNotifications}
          </div>
        </div>

        <div style={{
          background: '#d4edda',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #28a745',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>🛒 Корзина</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
            {stats.cartItems} товаров
          </div>
          <div style={{ fontSize: '14px', color: '#155724' }}>
            {stats.cartTotal}₽
          </div>
        </div>
      </div>

      {/* Настройки обновления */}
      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '10px' }}>⚙️ Настройки мониторинга</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Интервал обновления:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          >
            <option value={1000}>1 секунда</option>
            <option value={2000}>2 секунды</option>
            <option value={5000}>5 секунд</option>
            <option value={10000}>10 секунд</option>
          </select>
        </label>
      </div>

      {/* Заказы по статусам */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
          <div
            key={status}
            style={{
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{
              margin: '0 0 15px 0',
              padding: '8px 12px',
              background: getStatusColor(status),
              color: 'white',
              borderRadius: '5px',
              fontSize: '14px',
              textTransform: 'uppercase'
            }}>
              {getStatusName(status)} ({statusOrders.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {statusOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  style={{
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '5px',
                    border: '1px solid #e9ecef',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {order.id.startsWith('test-order-') ? '🧪 ' : '📦 '}
                    {order.id}
                  </div>
                  <div style={{ color: '#6c757d' }}>
                    <div>Клиент: {order.clientName}</div>
                    <div>Повар: {order.chefName}</div>
                    <div>Сумма: {order.total}₽</div>
                    <div>Создан: {new Date(order.createdAt).toLocaleString()}</div>
                    {order.cookingStartTime && (
                      <div>Готовка: {new Date(order.cookingStartTime).toLocaleString()}</div>
                    )}
                    {order.readyAt && (
                      <div>Готов: {new Date(order.readyAt).toLocaleString()}</div>
                    )}
                    {order.deliveredAt && (
                      <div>Доставлен: {new Date(order.deliveredAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {statusOrders.length > 5 && (
                <div style={{
                  textAlign: 'center',
                  color: '#6c757d',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  ... и еще {statusOrders.length - 5} заказов
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Уведомления */}
      {notifications.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>🔔 Последние уведомления</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.slice(0, 10).map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: '10px',
                  background: notification.read ? '#f8f9fa' : '#fff3cd',
                  borderRadius: '5px',
                  border: '1px solid',
                  borderColor: notification.read ? '#e9ecef' : '#ffc107',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {notification.read ? '✅' : '🔔'} {notification.title}
                </div>
                <div style={{ color: '#6c757d' }}>
                  {notification.message}
                </div>
                <div style={{ color: '#6c757d', fontSize: '11px', marginTop: '5px' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Корзина */}
      {cart.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '15px' }}>🛒 Текущая корзина</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cart.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '5px',
                  border: '1px solid #e9ecef',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ color: '#6c757d' }}>
                    {item.price}₽ × {item.quantity} = {item.price * item.quantity}₽
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                  {item.price * item.quantity}₽
                </div>
              </div>
            ))}
            <div style={{
              padding: '10px',
              background: '#e3f2fd',
              borderRadius: '5px',
              border: '1px solid #2196f3',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1976d2'
            }}>
              Итого: {stats.cartTotal}₽
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Вспомогательные функции
function getStatusColor(status) {
  const colors = {
    'pending_confirmation': '#ffc107',
    'confirmed': '#17a2b8',
    'preparing': '#fd7e14',
    'ready': '#28a745',
    'in_delivery': '#6f42c1',
    'delivered': '#20c997',
    'completed': '#6c757d',
    'cancelled': '#dc3545',
    'rejected': '#e83e8c',
    'unknown': '#6c757d'
  };
  return colors[status] || colors['unknown'];
}

function getStatusName(status) {
  const names = {
    'pending_confirmation': 'Ожидает подтверждения',
    'confirmed': 'Подтвержден',
    'preparing': 'Готовится',
    'ready': 'Готов',
    'in_delivery': 'В доставке',
    'delivered': 'Доставлен',
    'completed': 'Завершен',
    'cancelled': 'Отменен',
    'rejected': 'Отклонен',
    'unknown': 'Неизвестно'
  };
  return names[status] || names['unknown'];
}

export default OrderTestMonitor;
