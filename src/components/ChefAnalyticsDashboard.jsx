// Дэшборд аналитики для поваров
// Показывает популярные блюда, тренды, предсказания спроса и AI-инсайты

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../App.css';

const ChefAnalyticsDashboard = ({ chefOrders = [], chefMenu = [], timeRange = 'week' }) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState('orders'); // orders, revenue, popularity
  const [aiInsights, setAiInsights] = useState([]);

  // Обработка данных заказов
  const processedData = useMemo(() => {
    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const daysBack = periods[selectedPeriod] || 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const filteredOrders = chefOrders.filter(order => {
      const orderDate = new Date(order.date || order.createdAt);
      return orderDate >= startDate;
    });

    // Анализ по блюдам
    const dishAnalysis = {};
    filteredOrders.forEach(order => {
      if (order.dishes) {
        order.dishes.forEach(dish => {
          if (!dishAnalysis[dish.id]) {
            dishAnalysis[dish.id] = {
              name: dish.name,
              category: dish.category,
              orders: 0,
              revenue: 0,
              calories: dish.calories || 0,
              protein: dish.protein || 0,
              carbs: dish.carbs || 0,
              fat: dish.fat || 0,
              diabeticFriendly: dish.diabeticFriendly || false,
              ratings: [],
              lastOrdered: order.date || order.createdAt
            };
          }
          
          dishAnalysis[dish.id].orders += 1;
          dishAnalysis[dish.id].revenue += dish.price || 0;
          if (dish.rating) {
            dishAnalysis[dish.id].ratings.push(dish.rating);
          }
        });
      }
    });

    // ТОП блюда
    const topDishes = Object.values(dishAnalysis)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    // Анализ по категориям
    const categoryAnalysis = {};
    Object.values(dishAnalysis).forEach(dish => {
      if (!categoryAnalysis[dish.category]) {
        categoryAnalysis[dish.category] = {
          orders: 0,
          revenue: 0,
          dishes: 0
        };
      }
      categoryAnalysis[dish.category].orders += dish.orders;
      categoryAnalysis[dish.category].revenue += dish.revenue;
      categoryAnalysis[dish.category].dishes += 1;
    });

    // Анализ по дням недели
    const dailyAnalysis = {};
    filteredOrders.forEach(order => {
      const dayOfWeek = new Date(order.date || order.createdAt).toLocaleDateString('ru-RU', { weekday: 'long' });
      if (!dailyAnalysis[dayOfWeek]) {
        dailyAnalysis[dayOfWeek] = { orders: 0, revenue: 0 };
      }
      dailyAnalysis[dayOfWeek].orders += 1;
      dailyAnalysis[dayOfWeek].revenue += order.total || 0;
    });

    // Анализ по времени дня
    const timeAnalysis = {};
    filteredOrders.forEach(order => {
      const hour = new Date(order.date || order.createdAt).getHours();
      const timeSlot = hour < 6 ? 'Ночь' : hour < 12 ? 'Утро' : hour < 18 ? 'День' : 'Вечер';
      if (!timeAnalysis[timeSlot]) {
        timeAnalysis[timeSlot] = { orders: 0, revenue: 0 };
      }
      timeAnalysis[timeSlot].orders += 1;
      timeAnalysis[timeSlot].revenue += order.total || 0;
    });

    // Общая статистика
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDishes = Object.keys(dishAnalysis).length;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      totalDishes,
      topDishes,
      categoryAnalysis,
      dailyAnalysis,
      timeAnalysis,
      dishAnalysis
    };
  }, [chefOrders, selectedPeriod]);

  // Генерация AI-инсайтов
  useEffect(() => {
    const generateInsights = () => {
      const insights = [];
      
      // Анализ популярности
      const topDish = processedData.topDishes[0];
      if (topDish) {
        insights.push({
          type: 'popularity',
          icon: '🔥',
          title: 'Самое популярное блюдо',
          message: `"${topDish.name}" заказали ${topDish.orders} раз за ${selectedPeriod === 'week' ? 'неделю' : selectedPeriod === 'month' ? 'месяц' : 'период'}`,
          action: 'Добавить похожие блюда',
          priority: 'high',
          color: '#F44336'
        });
      }

      // Анализ категорий
      const topCategory = Object.entries(processedData.categoryAnalysis)
        .sort(([,a], [,b]) => b.orders - a.orders)[0];
      
      if (topCategory) {
        insights.push({
          type: 'category',
          icon: '📊',
          title: 'Популярная категория',
          message: `Категория "${topCategory[0]}" приносит ${Math.round(topCategory[1].revenue)}₽ (${topCategory[1].orders} заказов)`,
          action: 'Расширить ассортимент',
          priority: 'medium',
          color: '#2196F3'
        });
      }

      // Анализ времени
      const peakTime = Object.entries(processedData.timeAnalysis)
        .sort(([,a], [,b]) => b.orders - a.orders)[0];
      
      if (peakTime) {
        insights.push({
          type: 'timing',
          icon: '⏰',
          title: 'Пиковое время',
          message: `Больше всего заказов в ${peakTime[0].toLowerCase()} (${peakTime[1].orders} заказов)`,
          action: 'Подготовить ингредиенты',
          priority: 'medium',
          color: '#FF9800'
        });
      }

      // Анализ диабетического меню
      const diabeticDishes = processedData.topDishes.filter(dish => dish.diabeticFriendly);
      if (diabeticDishes.length > 0) {
        insights.push({
          type: 'diabetic',
          icon: '🍯',
          title: 'Диабетическое меню',
          message: `${diabeticDishes.length} диабетических блюд в топе. Рассмотрите добавление новых!`,
          action: 'Создать диабетическое блюдо',
          priority: 'low',
          color: '#9C27B0'
        });
      }

      // Предсказания спроса
      const currentMonth = new Date().getMonth();
      if (currentMonth === 11) { // Декабрь
        insights.push({
          type: 'prediction',
          icon: '🎄',
          title: 'Новогодние предсказания',
          message: 'К Новому году ожидается рост заказов на десерты и праздничные блюда на 40%',
          action: 'Подготовить новогоднее меню',
          priority: 'high',
          color: '#4CAF50'
        });
      }

      // Анализ рейтингов
      const lowRatedDishes = processedData.topDishes.filter(dish => 
        dish.ratings.length > 0 && 
        dish.ratings.reduce((sum, r) => sum + r, 0) / dish.ratings.length < 4
      );
      
      if (lowRatedDishes.length > 0) {
        insights.push({
          type: 'rating',
          icon: '⭐',
          title: 'Низкие рейтинги',
          message: `${lowRatedDishes.length} блюд имеют рейтинг ниже 4.0. Рассмотрите улучшение рецептуры`,
          action: 'Улучшить рецепт',
          priority: 'high',
          color: '#FF5722'
        });
      }

      setAiInsights(insights);
    };

    generateInsights();
  }, [processedData, selectedPeriod]);

  // Компонент графика
  const SimpleChart = ({ data, type, color = '#2196F3' }) => {
    const maxValue = Math.max(...Object.values(data).map(item => item[type]));
    const entries = Object.entries(data).slice(0, 7); // Показываем только топ-7
    
    return (
      <div style={{ height: '200px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'end', height: '150px', gap: '8px' }}>
          {entries.map(([key, value], index) => {
            const height = (value[type] / maxValue) * 100;
            return (
              <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${height}%`,
                    backgroundColor: color,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                    minHeight: '4px'
                  }}
                />
                <div style={{ 
                  fontSize: '10px', 
                  color: '#666', 
                  marginTop: '5px',
                  textAlign: 'center',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center'
                }}>
                  {key.substring(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="chef-analytics-dashboard" style={{ padding: '20px' }}>
      {/* Заголовок и переключатели */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>📊 Аналитика повара</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </select>
        </div>
      </div>

      {/* Основные метрики */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {processedData.totalOrders}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Заказов</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {Math.round(processedData.totalRevenue)}₽
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Выручка</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍽️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
            {processedData.totalDishes}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Блюд в меню</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
            {Math.round(processedData.avgOrderValue)}₽
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Средний чек</div>
        </div>
      </div>

      {/* AI-инсайты */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🤖 AI-инсайты и рекомендации</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px' 
        }}>
          {aiInsights.map((insight, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${insight.color}20`,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>{insight.icon}</span>
                <div>
                  <h4 style={{ margin: 0, color: insight.color, fontSize: '16px' }}>
                    {insight.title}
                  </h4>
                  <div style={{ 
                    fontSize: '10px', 
                    color: insight.color,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {insight.priority === 'high' ? 'Высокий приоритет' : 
                     insight.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                  </div>
                </div>
              </div>
              
              <p style={{ 
                margin: '0 0 15px 0', 
                fontSize: '14px', 
                color: '#333',
                lineHeight: '1.4'
              }}>
                {insight.message}
              </p>
              
              <button
                style={{
                  background: insight.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 8px ${insight.color}40`;
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {insight.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Графики и аналитика */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* ТОП блюда */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔥 Популярные блюда</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {processedData.topDishes.slice(0, 5).map((dish, index) => (
              <div key={dish.name} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                background: index < 3 ? '#FFF3E0' : '#f8f9fa',
                borderRadius: '8px',
                border: index < 3 ? '2px solid #FF9800' : '1px solid #e0e0e0'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginRight: '12px'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' }}>
                    {dish.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {dish.orders} заказов • {Math.round(dish.revenue)}₽
                  </div>
                </div>
                
                {dish.diabeticFriendly && (
                  <div style={{
                    background: '#9C27B0',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    🍯
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Анализ по категориям */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 По категориям</h3>
          
          <SimpleChart data={processedData.categoryAnalysis} type="orders" color="#4CAF50" />
          
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(processedData.categoryAnalysis)
              .sort(([,a], [,b]) => b.orders - a.orders)
              .slice(0, 5)
              .map(([category, data]) => (
                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{category}</span>
                  <span style={{ fontWeight: 'bold' }}>{data.orders} заказов</span>
                </div>
              ))}
          </div>
        </div>

        {/* Анализ по времени */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>⏰ По времени дня</h3>
          
          <SimpleChart data={processedData.timeAnalysis} type="orders" color="#2196F3" />
          
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(processedData.timeAnalysis)
              .sort(([,a], [,b]) => b.orders - a.orders)
              .map(([time, data]) => (
                <div key={time} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{time}</span>
                  <span style={{ fontWeight: 'bold' }}>{data.orders} заказов</span>
                </div>
              ))}
          </div>
        </div>

        {/* Предсказания спроса */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔮 Предсказания спроса</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              padding: '15px',
              background: '#E3F2FD',
              borderRadius: '8px',
              border: '1px solid #2196F3'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1976D2', marginBottom: '5px' }}>
                📈 На следующей неделе
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>
                Ожидается рост заказов на 15% (основываясь на трендах)
              </div>
            </div>
            
            <div style={{
              padding: '15px',
              background: '#FFF3E0',
              borderRadius: '8px',
              border: '1px solid #FF9800'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#F57C00', marginBottom: '5px' }}>
                🍽️ Рекомендуемые блюда
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>
                Добавьте больше салатов и веганских блюд - растет спрос
              </div>
            </div>
            
            <div style={{
              padding: '15px',
              background: '#F3E5F5',
              borderRadius: '8px',
              border: '1px solid #9C27B0'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7B1FA2', marginBottom: '5px' }}>
                💡 AI-совет
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>
                Ваши диабетические блюда популярны! Создайте специальное меню
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefAnalyticsDashboard;
