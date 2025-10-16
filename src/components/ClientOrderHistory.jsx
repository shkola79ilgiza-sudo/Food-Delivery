import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import OrderTracking from './OrderTracking';

const ClientOrderHistory = ({ onClose }) => {
  const { t } = useLanguage();
  const { showSuccess } = useToast();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChef, setFilterChef] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(false);

  // Загрузка заказов
  useEffect(() => {
    const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
    setOrders(clientOrders);
    setFilteredOrders(clientOrders);
  }, []);

  // Фильтрация и сортировка
  useEffect(() => {
    let result = [...orders];

    // Фильтр по статусу
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    // Фильтр по повару
    if (filterChef !== 'all') {
      result = result.filter(order => order.chefId === filterChef);
    }

    // Сортировка
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'price-desc') return b.total - a.total;
      if (sortBy === 'price-asc') return a.total - b.total;
      return 0;
    });

    setFilteredOrders(result);
  }, [orders, filterStatus, filterChef, sortBy]);

  // Повторить заказ
  const repeatOrder = (order) => {
    const cart = order.items.map(item => ({
      ...item,
      quantity: item.quantity || 1
    }));
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartChanged'));
    showSuccess(`Заказ "${order.id.slice(-8)}" добавлен в корзину!`);
    onClose();
  };

  // Получить уникальных поваров
  const uniqueChefs = [...new Set(orders.map(o => o.chefId))];

  // Статусы
  const statuses = {
    'pending': { name: 'Ожидает', icon: '⏳', color: '#FFA500' },
    'confirmed': { name: 'Подтвержден', icon: '✅', color: '#4CAF50' },
    'preparing': { name: 'Готовится', icon: '👨‍🍳', color: '#2196F3' },
    'ready': { name: 'Готов', icon: '🍽️', color: '#9C27B0' },
    'delivering': { name: 'В доставке', icon: '🚗', color: '#FF9800' },
    'delivered': { name: 'Доставлен', icon: '🎉', color: '#4CAF50' },
    'cancelled': { name: 'Отменен', icon: '❌', color: '#f44336' }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        overflow: 'auto',
        padding: '20px'
      }}>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#2D5016'
            }}
          >
            ← Назад
          </button>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#2D5016' }}>
            📜 История заказов
          </h2>
          <div style={{ width: '40px' }} />
        </div>

        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {orders.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Всего заказов</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {orders.reduce((sum, o) => sum + (o.total || 0), 0)}₽
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Потрачено</div>
          </div>
        </div>

        {/* Фильтры */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {/* Фильтр по статусу */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#2D5016'
              }}>
                📊 Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              >
                <option value="all">Все статусы</option>
                {Object.entries(statuses).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.icon} {value.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по повару */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#2D5016'
              }}>
                👨‍🍳 Повар
              </label>
              <select
                value={filterChef}
                onChange={(e) => setFilterChef(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              >
                <option value="all">Все повара</option>
                {uniqueChefs.map(chefId => (
                  <option key={chefId} value={chefId}>
                    {orders.find(o => o.chefId === chefId)?.chefName || chefId}
                  </option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#2D5016'
              }}>
                🔄 Сортировка
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              >
                <option value="date-desc">Сначала новые</option>
                <option value="date-asc">Сначала старые</option>
                <option value="price-desc">Дороже → Дешевле</option>
                <option value="price-asc">Дешевле → Дороже</option>
              </select>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        {filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
            <div style={{ fontSize: '20px', marginBottom: '10px' }}>
              Заказов не найдено
            </div>
            <div style={{ fontSize: '14px' }}>
              Попробуйте изменить фильтры
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {filteredOrders.map((order) => {
              const status = statuses[order.status] || statuses.pending;
              const orderDate = new Date(order.createdAt);

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Заголовок заказа */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: '#2D5016',
                        marginBottom: '5px'
                      }}>
                        Заказ №{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {orderDate.toLocaleDateString('ru-RU')} в {orderDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      background: `${status.color}22`,
                      color: status.color,
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {status.icon} {status.name}
                    </div>
                  </div>

                  {/* Детали */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      👨‍🍳 {order.chefName || 'Повар'}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      🍽️ Блюд: {order.items?.length || 0}
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: '#4CAF50'
                    }}>
                      💰 {order.total || 0} ₽
                    </div>
                  </div>

                  {/* Действия */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowTracking(true);
                      }}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      📍 Отследить
                    </button>
                    <button
                      onClick={() => repeatOrder(order)}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      🔄 Повторить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модальное окно отслеживания */}
      {showTracking && selectedOrder && (
        <OrderTracking
          order={selectedOrder}
          onClose={() => setShowTracking(false)}
        />
      )}
    </>
  );
};

export default ClientOrderHistory;

