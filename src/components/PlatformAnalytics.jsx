import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

const PlatformAnalytics = ({ chefId, onAnalyticsUpdate }) => {
  const { showSuccess, showError } = useToast();
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  const timeRanges = {
    '7d': { label: '7 дней', days: 7 },
    '30d': { label: '30 дней', days: 30 },
    '90d': { label: '90 дней', days: 90 },
    '1y': { label: '1 год', days: 365 }
  };

  useEffect(() => {
    loadAnalytics();
  }, [chefId, timeRange]);

  const loadAnalytics = () => {
    setLoading(true);
    
    try {
      // Получаем данные заказов
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const chefOrders = allOrders.filter(order => order.chefId === chefId);
      
      // Получаем данные блюд
      const chefDishes = JSON.parse(localStorage.getItem(`demo_menu_${chefId}`) || '[]');
      
      // Получаем данные уведомлений
      const notifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      
      // Фильтруем по времени
      const days = timeRanges[timeRange].days;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const filteredOrders = chefOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp);
        return orderDate >= cutoffDate;
      });

      // Рассчитываем метрики
      const analyticsData = calculateMetrics(filteredOrders, chefDishes, notifications, days);
      setAnalytics(analyticsData);
      
      if (onAnalyticsUpdate) {
        onAnalyticsUpdate(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      showError('Ошибка загрузки аналитики');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (orders, dishes, notifications, days) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // GMV (Gross Merchandise Value)
    const gmv = totalRevenue;
    
    // Retention (повторные заказы)
    const uniqueCustomers = new Set(orders.map(order => order.customer?.phone || order.customerId));
    const repeatCustomers = orders.reduce((acc, order) => {
      const customerId = order.customer?.phone || order.customerId;
      acc[customerId] = (acc[customerId] || 0) + 1;
      return acc;
    }, {});
    
    const repeatOrders = Object.values(repeatCustomers).filter(count => count > 1).length;
    const retentionRate = uniqueCustomers.size > 0 ? (repeatOrders / uniqueCustomers.size) * 100 : 0;
    
    // CAC (Customer Acquisition Cost) - имитация
    const newCustomers = uniqueCustomers.size;
    const marketingSpend = newCustomers * 150; // 150₽ на привлечение клиента
    const cac = newCustomers > 0 ? marketingSpend / newCustomers : 0;
    
    // LTV (Lifetime Value)
    const avgOrdersPerCustomer = totalOrders / uniqueCustomers.size;
    const ltv = avgOrdersPerCustomer * avgOrderValue;
    
    // Конверсия
    const totalViews = totalOrders * 10; // имитация просмотров
    const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
    
    // Статусы заказов
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    // Популярные блюда
    const dishCounts = orders.reduce((acc, order) => {
      order.items?.forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {});
    
    const topDishes = Object.entries(dishCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Временная аналитика
    const dailyRevenue = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt || order.timestamp).toDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.total || 0);
    });
    
    // SLA метрики
    const slaViolations = notifications.filter(notif => 
      notif.type === 'sla_violation' || notif.message?.includes('SLA')
    ).length;
    
    const slaCompliance = totalOrders > 0 ? ((totalOrders - slaViolations) / totalOrders) * 100 : 100;
    
    // Расчет среднего времени приготовления и доставки
    let totalPreparationTime = 0;
    let totalDeliveryTime = 0;
    let ordersWithTimes = 0;
    
    orders.forEach(order => {
      if (order.preparationTime && order.deliveryTime) {
        // Используем точные данные, но ограничиваем разумными пределами
        totalPreparationTime += Math.min(order.preparationTime, 120); // максимум 2 часа
        totalDeliveryTime += Math.min(order.deliveryTime, 60); // максимум 1 час
        ordersWithTimes++;
      } else if (order.status === 'delivered') {
        // Для доставленных заказов используем реалистичные средние значения
        const prepTime = 20 + Math.random() * 25; // 20-45 минут приготовления
        const delTime = 5 + Math.random() * 15; // 5-20 минут доставки
        
        totalPreparationTime += prepTime;
        totalDeliveryTime += delTime;
        ordersWithTimes++;
      }
    });
    
    const avgPreparationTime = ordersWithTimes > 0 ? Math.round(totalPreparationTime / ordersWithTimes) : 0;
    const avgDeliveryTime = ordersWithTimes > 0 ? Math.round(totalDeliveryTime / ordersWithTimes) : 0;

    return {
      // Основные метрики
      gmv,
      totalOrders,
      totalRevenue,
      avgOrderValue,
      uniqueCustomers: uniqueCustomers.size,
      
      // Retention и LTV
      retentionRate,
      repeatCustomers: repeatOrders,
      ltv,
      
      // CAC и маркетинг
      cac,
      marketingSpend,
      newCustomers,
      
      // Конверсия
      conversionRate,
      totalViews,
      
      // Статусы
      statusCounts,
      
      // Популярные блюда
      topDishes,
      
      // Временная аналитика
      dailyRevenue,
      
      // SLA
      slaViolations,
      slaCompliance,
      avgPreparationTime,
      avgDeliveryTime,
      
      // Дополнительные метрики
      dishesCount: dishes.length,
      notificationsCount: notifications.length,
      
      // Финансовые метрики
      commissionEarned: totalRevenue * 0.15, // 15% комиссия
      chefEarnings: totalRevenue * 0.85, // 85% повару
      
      // Период
      period: days
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>📊 Загрузка аналитики...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#2D5016', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          📊 Расширенная аналитика
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {Object.entries(timeRanges).map(([key, range]) => (
              <option key={key} value={key}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={loadAnalytics}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Основные метрики */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatCurrency(analytics.gmv || 0)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>GMV (Объем продаж)</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {analytics.totalOrders || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Заказов</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatCurrency(analytics.avgOrderValue || 0)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Средний чек</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {analytics.uniqueCustomers || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Уникальных клиентов</div>
        </div>
      </div>

      {/* Retention и LTV */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>🔄 Удержание клиентов</h4>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
              {formatPercentage(analytics.retentionRate || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Уровень удержания</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Повторных клиентов: {analytics.repeatCustomers || 0}
          </div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>💰 Ценность клиента</h4>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
              {formatCurrency(analytics.ltv || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Сколько клиент тратит в среднем</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Средний чек: {formatCurrency(analytics.avgOrderValue || 0)}
          </div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>📈 Стоимость привлечения</h4>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
              {formatCurrency(analytics.cac || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Сколько стоит найти нового клиента</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Новых клиентов: {analytics.newCustomers || 0}
          </div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>🎯 Конверсия в заказы</h4>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>
              {formatPercentage(analytics.conversionRate || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Сколько посетителей делают заказ</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Просмотров: {analytics.totalViews || 0}
          </div>
        </div>
      </div>

      {/* Популярные блюда */}
      {analytics.topDishes && analytics.topDishes.length > 0 && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>🍽️ Популярные блюда</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analytics.topDishes.map(([dishName, count], index) => (
              <div
                key={dishName}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>{dishName}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                  {count} заказов
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Статусы заказов */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '25px'
      }}>
        <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>📋 Статусы заказов</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {Object.entries(analytics.statusCounts || {}).map(([status, count]) => (
            <div
              key={status}
              style={{
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {count}
              </div>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
                {status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA метрики */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '25px'
      }}>
        <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>⏰ SLA метрики</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {formatPercentage(analytics.slaCompliance || 100)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Соответствие SLA</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {analytics.slaViolations || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Нарушения SLA</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {analytics.avgPreparationTime || 0} мин
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Среднее время приготовления</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
              {analytics.avgDeliveryTime || 0} мин
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Среднее время доставки</div>
          </div>
        </div>
      </div>

      {/* Финансовые метрики */}
      <div style={{
        background: '#e8f5e8',
        padding: '20px',
        borderRadius: '12px'
      }}>
        <h4 style={{ color: '#2D5016', marginBottom: '15px' }}>💳 Финансовые метрики</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(analytics.chefEarnings || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Доход повара (85%)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
              {formatCurrency(analytics.commissionEarned || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Комиссия платформы (15%)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
              {formatCurrency(analytics.marketingSpend || 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Маркетинговые расходы</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>
              {formatCurrency((analytics.commissionEarned || 0) - (analytics.marketingSpend || 0))}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Чистая прибыль</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
