import React, { useState, useEffect } from 'react';

const RealTimeAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    activeUsers: 0,
    ordersToday: 0,
    revenue: 0,
    popularDishes: [],
    chefActivity: []
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Симуляция реального времени
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        ordersToday: prev.ordersToday + Math.floor(Math.random() * 2),
        revenue: prev.revenue + Math.floor(Math.random() * 500),
        popularDishes: [
          { name: 'Плов с бараниной', orders: 45 + Math.floor(Math.random() * 10) },
          { name: 'Манты', orders: 38 + Math.floor(Math.random() * 8) },
          { name: 'Лагман', orders: 32 + Math.floor(Math.random() * 6) },
          { name: 'Самса', orders: 28 + Math.floor(Math.random() * 5) }
        ].sort((a, b) => b.orders - a.orders),
        chefActivity: [
          { name: 'Анна Петрова', status: 'Готовит', dish: 'Плов' },
          { name: 'Мухаммад Алиев', status: 'Свободен', dish: null },
          { name: 'Елена Смирнова', status: 'Готовит', dish: 'Манты' }
        ]
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        📊
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '350px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid #e0e0e0',
      zIndex: 1000,
      maxHeight: '80vh',
      overflow: 'hidden'
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#2196f3',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>📊 Аналитика в реальном времени</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Контент */}
      <div style={{
        padding: '20px',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        {/* Основные метрики */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {analytics.activeUsers}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Активные пользователи</div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              {analytics.ordersToday}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Заказов сегодня</div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            textAlign: 'center',
            gridColumn: 'span 2'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {analytics.revenue.toLocaleString()} ₽
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Выручка сегодня</div>
          </div>
        </div>

        {/* Популярные блюда */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
            🍽️ Популярные блюда
          </h4>
          {analytics.popularDishes.map((dish, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ fontSize: '13px' }}>{dish.name}</span>
              <span style={{
                fontSize: '12px',
                backgroundColor: '#e3f2fd',
                padding: '2px 8px',
                borderRadius: '12px',
                color: '#1976d2'
              }}>
                {dish.orders}
              </span>
            </div>
          ))}
        </div>

        {/* Активность поваров */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
            👨‍🍳 Активность поваров
          </h4>
          {analytics.chefActivity.map((chef, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{chef.name}</div>
                {chef.dish && (
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    Готовит: {chef.dish}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: chef.status === 'Готовит' ? '#ffebee' : '#e8f5e8',
                color: chef.status === 'Готовит' ? '#d32f2f' : '#388e3c'
              }}>
                {chef.status}
              </span>
            </div>
          ))}
        </div>

        {/* Индикатор обновления */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '11px',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#4caf50',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          Обновляется каждые 5 сек
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RealTimeAnalytics;
