import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSetClientOrders } from '../utils/safeStorage';

const ChefStats = ({ onClose }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    topDishes: [],
    monthlyIncome: 0,
    totalOrders: 0,
    averageRating: 0,
    repeatOrders: 0,
    loading: true
  });

  useEffect(() => {
    loadChefStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createDemoData = () => {
    const chefEmail = localStorage.getItem('chefEmail') || 'rustam_isaev_84@mail.ru';
    const currentDate = new Date();
    
    // Создаем демо-заказы
    const demoOrders = [
      {
        id: 'demo-order-1',
        chefEmail: chefEmail,
        clientEmail: 'client1@example.com',
        items: [
          { id: 'dish-1', name: 'Борщ украинский', price: 250, quantity: 2, chefId: chefEmail },
          { id: 'dish-2', name: 'Плов с бараниной', price: 350, quantity: 1, chefId: chefEmail }
        ],
        total: 850,
        createdAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4.5
      },
      {
        id: 'demo-order-2',
        chefEmail: chefEmail,
        clientEmail: 'client2@example.com',
        items: [
          { id: 'dish-3', name: 'Салат Цезарь', price: 200, quantity: 1, chefId: chefEmail },
          { id: 'dish-4', name: 'Пицца Маргарита', price: 400, quantity: 1, chefId: chefEmail }
        ],
        total: 600,
        createdAt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4.8
      },
      {
        id: 'demo-order-3',
        chefEmail: chefEmail,
        clientEmail: 'client1@example.com', // Повторный заказ
        items: [
          { id: 'dish-1', name: 'Борщ украинский', price: 250, quantity: 1, chefId: chefEmail }
        ],
        total: 250,
        createdAt: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5.0
      }
    ];
    
    return demoOrders;
  };


  const loadChefStats = () => {
    try {
      // Получаем данные из localStorage
      const savedDishes = JSON.parse(localStorage.getItem('chefDishes') || '[]');
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      
      // Получаем email повара из localStorage
      const chefEmail = localStorage.getItem('chefEmail') || 'rustam_isaev_84@mail.ru';
      
      // Если нет заказов, создаем демо-данные только один раз
      let allOrders = [...savedOrders, ...clientOrders];
      if (allOrders.length === 0) {
        allOrders = createDemoData();
        // Сохраняем демо-данные
        localStorage.setItem('clientOrders', JSON.stringify(allOrders));
      } else {
        // Безопасно ограничиваем количество заказов
        allOrders = safeSetClientOrders(allOrders);
      }
      
      // Фильтруем заказы для текущего повара
      const chefOrders = allOrders.filter(order => 
        order.chefEmail === chefEmail || order.chefId === chefEmail
      );
      
      console.log('🔍 Chef Stats Debug:', {
        chefEmail,
        allOrdersCount: allOrders.length,
        chefOrdersCount: chefOrders.length,
        savedDishesCount: savedDishes.length,
        allOrders: allOrders,
        chefOrders: chefOrders
      });
      
      // Рассчитываем статистику
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Заказы за текущий месяц
      const monthlyOrders = chefOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      
      // Топ-5 блюд по количеству заказов
      const dishStats = {};
      chefOrders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            if (item.chefId === chefEmail || item.chefEmail === chefEmail) {
              if (!dishStats[item.id]) {
                dishStats[item.id] = {
                  id: item.id,
                  name: item.name,
                  orders: 0,
                  revenue: 0,
                  rating: item.rating || 0
                };
              }
              dishStats[item.id].orders += item.quantity || 1;
              dishStats[item.id].revenue += (item.price || 0) * (item.quantity || 1);
            }
          });
        }
      });
      
      const topDishes = Object.values(dishStats)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);
      
      // Доход за месяц
      const monthlyIncome = monthlyOrders.reduce((total, order) => {
        return total + (order.total || 0);
      }, 0);
      
      // Общее количество заказов
      const totalOrders = chefOrders.length;
      
      // Средний рейтинг
      const ratings = chefOrders
        .filter(order => order.rating)
        .map(order => order.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      // Повторные заказы (заказы от одних и тех же клиентов)
      const clientOrderCounts = {};
      chefOrders.forEach(order => {
        if (order.clientEmail) {
          if (!clientOrderCounts[order.clientEmail]) {
            clientOrderCounts[order.clientEmail] = 0;
          }
          clientOrderCounts[order.clientEmail]++;
        }
      });
      const repeatOrders = Object.values(clientOrderCounts).filter(count => count > 1).length;
      
      setStats({
        topDishes,
        monthlyIncome,
        totalOrders,
        averageRating: Math.round(averageRating * 10) / 10,
        repeatOrders,
        loading: false
      });
      
    } catch (error) {
      console.error('Error loading chef stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="chef-stats-container">
        <div className="chef-stats-loading">
          <div className="loading-spinner"></div>
          <p>{t.chefStats.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-stats-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#2c2c2c',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 1)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            ← {t.common.back}
          </button>
          <h2 className="chef-stats-title" style={{ margin: 0 }}>{t.chefStats.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#2c2c2c',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            ✕ Закрыть
          </button>
          <button
            onClick={() => {
              createDemoData();
              loadChefStats();
            }}
            style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
          }}
        >
          🎯 Создать демо-данные
        </button>
      </div>
      </div>
      
      <div className="chef-stats-grid">
        {/* Топ-5 блюд */}
        <div className="chef-stats-card">
          <h3 className="chef-stats-card-title">{t.chefStats.topDishes}</h3>
          {stats.topDishes.length > 0 ? (
            <div className="top-dishes-list">
              {stats.topDishes.map((dish, index) => (
                <div key={dish.id} className="top-dish-item">
                  <div className="dish-rank">#{index + 1}</div>
                  <div className="dish-info">
                    <div className="dish-name">{dish.name}</div>
                    <div className="dish-stats">
                      <span className="dish-orders">{dish.orders} {t.chefStats.ordersCount.toLowerCase()}</span>
                      <span className="dish-revenue">{dish.revenue} ₽</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{t.chefStats.noData}</p>
          )}
        </div>

        {/* Доход за месяц */}
        <div className="chef-stats-card">
          <h3 className="chef-stats-card-title">{t.chefStats.monthlyIncome}</h3>
          <div className="income-display">
            <div className="income-amount">{stats.monthlyIncome} ₽</div>
            <div className="income-period">{t.chefStats.thisMonth}</div>
          </div>
        </div>

        {/* Общая статистика */}
        <div className="chef-stats-card">
          <h3 className="chef-stats-card-title">{t.chefStats.totalOrders}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">{t.chefStats.totalOrders}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.averageRating}</div>
              <div className="stat-label">{t.chefStats.averageRating}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.repeatOrders}</div>
              <div className="stat-label">{t.chefStats.repeatOrders}</div>
            </div>
          </div>
        </div>

        {/* Кнопка очистки localStorage для отладки */}
        <div className="chef-stats-card">
          <h3 className="chef-stats-card-title">Отладка</h3>
          <button 
            onClick={() => {
              localStorage.removeItem('clientOrders');
              localStorage.removeItem('chefDishes');
              localStorage.removeItem('orders');
              alert('localStorage очищен! Перезагрузите страницу.');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Очистить localStorage
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChefStats;
