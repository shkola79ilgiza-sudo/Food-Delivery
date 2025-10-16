import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSetClientOrders } from '../utils/safeStorage';
import { useToast } from '../contexts/ToastContext';

const OrderHistoryAnalysis = ({ clientId, role = 'client' }) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const loadOrderHistory = useCallback(() => {
    try {
      // Загружаем заказы из localStorage - пробуем разные ключи
      let allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      
      // Если заказы не найдены, пробуем другие ключи
      if (allOrders.length === 0) {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      }
      
      // Если все еще нет заказов, пробуем найти в других ключах
      if (allOrders.length === 0) {
        const allKeys = Object.keys(localStorage);
        console.log('📊 OrderHistoryAnalysis: All localStorage keys:', allKeys);
        
        // Ищем ключи, которые могут содержать заказы
        const orderKeys = allKeys.filter(key => 
          key.includes('order') || key.includes('Order') || key.includes('заказ')
        );
        console.log('📊 OrderHistoryAnalysis: Potential order keys:', orderKeys);
        
        // Пробуем загрузить из найденных ключей
        for (const key of orderKeys) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(data) && data.length > 0) {
              console.log(`📊 OrderHistoryAnalysis: Found orders in key "${key}":`, data);
              allOrders = data;
              break;
            }
          } catch (e) {
            console.log(`📊 OrderHistoryAnalysis: Error parsing key "${key}":`, e);
          }
        }
      }
      
      // Фильтруем заказы по clientId (если нужно)
      const clientOrders = allOrders.filter(order => 
        !clientId || order.clientId === clientId || order.clientId === 'demo_client' || !order.clientId
      );
      
      console.log('📊 OrderHistoryAnalysis: Final loaded orders:', clientOrders);
      console.log('📊 OrderHistoryAnalysis: Orders count:', clientOrders.length);
      setOrderHistory(clientOrders);
    } catch (error) {
      console.error('Error loading order history:', error);
      showError('Ошибка загрузки истории заказов');
    }
  }, [clientId, showError]);

  // Загрузка истории заказов
  useEffect(() => {
    loadOrderHistory();
  }, [loadOrderHistory]);

  // Создание демо-заказов для тестирования
  const createDemoOrders = () => {
    const demoOrders = [
      {
        id: 'demo-order-1',
        clientId: clientId || 'demo_client',
        createdAt: new Date().toISOString(),
        total: 610,
        status: 'delivered',
        items: [
          { name: 'Жареная курица', category: 'fried', calories: 450, price: 350, quantity: 1 },
          { name: 'Картофель фри', category: 'fried', calories: 320, price: 180, quantity: 1 },
          { name: 'Кока-кола', category: 'drinks', calories: 140, price: 80, quantity: 1 }
        ]
      },
      {
        id: 'demo-order-2',
        clientId: clientId || 'demo_client',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Вчера
        total: 700,
        status: 'delivered',
        items: [
          { name: 'Салат Цезарь', category: 'vegetables', calories: 280, price: 250, quantity: 1 },
          { name: 'Пицца Маргарита', category: 'baked', calories: 520, price: 450, quantity: 1 }
        ]
      },
      {
        id: 'demo-order-3',
        clientId: clientId || 'demo_client',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 дня назад
        total: 470,
        status: 'delivered',
        items: [
          { name: 'Жареные крылышки', category: 'fried', calories: 380, price: 320, quantity: 1 },
          { name: 'Салат из свежих овощей', category: 'vegetables', calories: 120, price: 150, quantity: 1 }
        ]
      }
    ];
    
    // Сохраняем демо-заказы в localStorage
    safeSetClientOrders(demoOrders);
    setOrderHistory(demoOrders);
    showSuccess('Демо-заказы созданы! Теперь вы можете проанализировать их.');
    console.log('📊 OrderHistoryAnalysis: Demo orders created:', demoOrders);
  };

  // Анализ предпочтений клиента
  const analyzePreferences = (orders) => {
    const preferences = {
      favoriteCategories: {},
      favoriteDishes: {},
      averageOrderValue: 0,
      orderFrequency: 0,
      dietaryPreferences: {
        halal: 0,
        diabetic: 0,
        vegetarian: 0
      },
      timePatterns: {
        morning: 0,
        afternoon: 0,
        evening: 0
      },
      seasonalPreferences: {
        spring: 0,
        summer: 0,
        autumn: 0,
        winter: 0
      }
    };

    if (orders.length === 0) {
      return preferences;
    }

    let totalValue = 0;
    const dishCount = {};
    const categoryCount = {};
    const timeCount = { morning: 0, afternoon: 0, evening: 0 };
    const seasonCount = { spring: 0, summer: 0, autumn: 0, winter: 0 };

    orders.forEach(order => {
      totalValue += order.total || 0;
      
      // Анализ времени заказа
      const orderDate = new Date(order.createdAt || order.date);
      const hour = orderDate.getHours();
      if (hour >= 6 && hour < 12) timeCount.morning++;
      else if (hour >= 12 && hour < 18) timeCount.afternoon++;
      else timeCount.evening++;

      // Анализ сезона
      const month = orderDate.getMonth();
      if (month >= 2 && month <= 4) seasonCount.spring++;
      else if (month >= 5 && month <= 7) seasonCount.summer++;
      else if (month >= 8 && month <= 10) seasonCount.autumn++;
      else seasonCount.winter++;

      // Анализ блюд
      if (order.items) {
        order.items.forEach(item => {
          // Подсчет блюд
          dishCount[item.name] = (dishCount[item.name] || 0) + item.quantity;
          
          // Подсчет категорий
          const category = item.category || 'other';
          categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
          
          // Анализ диетических предпочтений
          if (item.halal) preferences.dietaryPreferences.halal++;
          if (item.diabeticFriendly) preferences.dietaryPreferences.diabetic++;
          if (item.vegetarian) preferences.dietaryPreferences.vegetarian++;
        });
      }
    });

    // Вычисляем средние значения
    preferences.averageOrderValue = Math.round(totalValue / orders.length);
    preferences.orderFrequency = orders.length;

    // Находим самые популярные блюда и категории
    preferences.favoriteDishes = Object.entries(dishCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [dish, count]) => {
        obj[dish] = count;
        return obj;
      }, {});

    preferences.favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .reduce((obj, [category, count]) => {
        obj[category] = count;
        return obj;
      }, {});

    // Временные паттерны
    const totalTimeOrders = timeCount.morning + timeCount.afternoon + timeCount.evening;
    if (totalTimeOrders > 0) {
      preferences.timePatterns.morning = Math.round((timeCount.morning / totalTimeOrders) * 100);
      preferences.timePatterns.afternoon = Math.round((timeCount.afternoon / totalTimeOrders) * 100);
      preferences.timePatterns.evening = Math.round((timeCount.evening / totalTimeOrders) * 100);
    }

    // Сезонные предпочтения
    const totalSeasonOrders = Object.values(seasonCount).reduce((a, b) => a + b, 0);
    if (totalSeasonOrders > 0) {
      preferences.seasonalPreferences.spring = Math.round((seasonCount.spring / totalSeasonOrders) * 100);
      preferences.seasonalPreferences.summer = Math.round((seasonCount.summer / totalSeasonOrders) * 100);
      preferences.seasonalPreferences.autumn = Math.round((seasonCount.autumn / totalSeasonOrders) * 100);
      preferences.seasonalPreferences.winter = Math.round((seasonCount.winter / totalSeasonOrders) * 100);
    }

    return preferences;
  };

  // Генерация персонализированных рекомендаций
  const generatePersonalizedRecommendations = (preferences, orders) => {
    const recommendations = [];

    // Рекомендации на основе любимых блюд
    const favoriteDishes = Object.keys(preferences.favoriteDishes);
    if (favoriteDishes.length > 0) {
      recommendations.push({
        type: 'favorite_dishes',
        title: 'Ваши любимые блюда',
        description: `Вы часто заказываете: ${favoriteDishes.slice(0, 3).join(', ')}`,
        dishes: favoriteDishes.slice(0, 3),
        priority: 'high'
      });
    }

    // Рекомендации на основе категорий
    const favoriteCategories = Object.keys(preferences.favoriteCategories);
    if (favoriteCategories.includes('салаты')) {
      recommendations.push({
        type: 'category_suggestion',
        title: 'Попробуйте новые салаты',
        description: 'Вы любите салаты! Рекомендуем попробовать новые варианты',
        dishes: ['Салат "Цезарь"', 'Греческий салат', 'Салат с авокадо'],
        priority: 'medium'
      });
    }

    // Рекомендации на основе времени
    const mostActiveTime = Object.entries(preferences.timePatterns)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostActiveTime && mostActiveTime[1] > 50) {
      const timeName = mostActiveTime[0] === 'morning' ? 'утром' : 
                      mostActiveTime[0] === 'afternoon' ? 'днем' : 'вечером';
      recommendations.push({
        type: 'time_based',
        title: `Рекомендации для ${timeName}`,
        description: `Вы чаще всего заказываете ${timeName}. Вот что может вам понравиться:`,
        dishes: mostActiveTime[0] === 'morning' ? ['Омлет', 'Каша', 'Блины'] :
                mostActiveTime[0] === 'afternoon' ? ['Суп', 'Салат', 'Сэндвич'] :
                ['Ужин', 'Десерт', 'Напиток'],
        priority: 'medium'
      });
    }

    // Рекомендации на основе диетических предпочтений
    const dietaryPrefs = preferences.dietaryPreferences;
    if (dietaryPrefs.halal > 0) {
      recommendations.push({
        type: 'dietary',
        title: 'Халяльные блюда',
        description: 'Мы видим, что вы предпочитаете халяльную кухню',
        dishes: ['Плов халяль', 'Манты халяль', 'Самса халяль'],
        priority: 'high'
      });
    }

    if (dietaryPrefs.diabetic > 0) {
      recommendations.push({
        type: 'dietary',
        title: 'Диабетическое меню',
        description: 'Для вас доступны специальные диабетические блюда',
        dishes: ['Диабетический торт', 'Низкоуглеводный салат', 'Безсахарный компот'],
        priority: 'high'
      });
    }

    // Рекомендации на основе сезона
    const currentSeason = getCurrentSeason();
    const seasonPercentage = preferences.seasonalPreferences[currentSeason];
    if (seasonPercentage > 30) {
      const seasonDishes = {
        spring: ['Свежие салаты', 'Зеленые супы', 'Весенние овощи'],
        summer: ['Холодные супы', 'Свежие фрукты', 'Летние напитки'],
        autumn: ['Тыквенные блюда', 'Грибные супы', 'Осенние салаты'],
        winter: ['Горячие супы', 'Согревающие напитки', 'Зимние десерты']
      };
      
      recommendations.push({
        type: 'seasonal',
        title: `${getSeasonName(currentSeason)}ние рекомендации`,
        description: `В ${getSeasonName(currentSeason).toLowerCase()} вы особенно активны в заказах`,
        dishes: seasonDishes[currentSeason],
        priority: 'medium'
      });
    }

    return recommendations;
  };

  // Вспомогательные функции
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const getSeasonName = (season) => {
    const names = {
      spring: 'Весен',
      summer: 'Летн',
      autumn: 'Осенн',
      winter: 'Зимн'
    };
    return names[season] || 'Сезонн';
  };

  // Основная функция анализа
  const performAnalysis = () => {
    console.log('📊 OrderHistoryAnalysis: Starting analysis...');
    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        // Анализируем предпочтения
        const clientPreferences = analyzePreferences(orderHistory);
        console.log('📊 OrderHistoryAnalysis: Preferences analyzed:', clientPreferences);

        // Генерируем рекомендации
        const personalizedRecommendations = generatePersonalizedRecommendations(clientPreferences, orderHistory);
        console.log('📊 OrderHistoryAnalysis: Recommendations generated:', personalizedRecommendations);

        // Создаем итоговый анализ
        const analysisResult = {
          preferences: clientPreferences,
          recommendations: personalizedRecommendations,
          totalOrders: orderHistory.length,
          analysisDate: new Date().toISOString(),
          insights: generateInsights(clientPreferences, orderHistory)
        };

        setAnalysis(analysisResult);
        setPreferences(clientPreferences);
        setIsAnalyzing(false);
        
        showSuccess(`Анализ завершен! Найдено ${personalizedRecommendations.length} рекомендаций`);
      } catch (error) {
        console.error('Error during analysis:', error);
        setIsAnalyzing(false);
        showError('Ошибка при анализе данных');
      }
    }, 2000);
  };

  // Генерация инсайтов
  const generateInsights = (preferences, orders) => {
    const insights = [];

    if (preferences.orderFrequency > 10) {
      insights.push({
        type: 'loyalty',
        message: 'Вы наш постоянный клиент! Спасибо за доверие.',
        icon: '⭐'
      });
    }

    if (preferences.averageOrderValue > 1000) {
      insights.push({
        type: 'value',
        message: 'Вы цените качество и готовы платить за хорошую еду.',
        icon: '💰'
      });
    }

    const mostActiveTime = Object.entries(preferences.timePatterns)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostActiveTime && mostActiveTime[1] > 60) {
      const timeName = mostActiveTime[0] === 'morning' ? 'утром' : 
                      mostActiveTime[0] === 'afternoon' ? 'днем' : 'вечером';
      insights.push({
        type: 'pattern',
        message: `Вы предпочитаете заказывать ${timeName} (${mostActiveTime[1]}% заказов)`,
        icon: '🕐'
      });
    }

    return insights;
  };

  return (
    <div className="order-history-analysis" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div className="analysis-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => { try { window.history.pushState({}, '', '/client/menu'); window.location.assign('/client/menu'); } catch (e) { window.location.assign('/client/menu'); } }}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #495057)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
            }}
          >
            ← {t.common.back}
          </button>
          <h3 style={{ margin: 0, color: '#333' }}>
            📊 {role === 'chef' ? 'Аналитика заказов' : 'Анализ ваших заказов'}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {orderHistory.length === 0 && (
            <button
              onClick={createDemoOrders}
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🎯 Создать демо-заказы
            </button>
          )}
          <button
            onClick={performAnalysis}
            disabled={isAnalyzing || orderHistory.length === 0}
            style={{
              background: isAnalyzing ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isAnalyzing ? '🔄 Анализирую...' : '🧠 Анализировать заказы'}
          </button>
        </div>
      </div>

      {orderHistory.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Нет истории заказов</div>
          <div style={{ fontSize: '14px' }}>Сделайте первый заказ, чтобы получить персонализированные рекомендации</div>
        </div>
      ) : (
        <div className="analysis-content">
          <div className="order-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{orderHistory.length}</div>
              <div style={{ fontSize: '14px' }}>Всего заказов</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {preferences ? `${preferences.averageOrderValue}₽` : '—'}
              </div>
              <div style={{ fontSize: '14px' }}>Средний чек</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {preferences ? Object.keys(preferences.favoriteDishes).length : '—'}
              </div>
              <div style={{ fontSize: '14px' }}>Любимых блюд</div>
            </div>
          </div>

          {analysis && (
            <div className="analysis-results">
              {/* Инсайты */}
              {analysis.insights && analysis.insights.length > 0 && (
                <div className="insights-section" style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ color: '#333', marginBottom: '15px' }}>💡 Инсайты о ваших предпочтениях:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysis.insights.map((insight, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: '20px' }}>{insight.icon}</span>
                        <span style={{ fontSize: '14px' }}>{insight.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Рекомендации */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="recommendations-section">
                  <h4 style={{ color: '#333', marginBottom: '15px' }}>🎯 Персонализированные рекомендации:</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px'
                  }}>
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} style={{
                        background: rec.priority === 'high' ? 
                          'linear-gradient(135deg, #ff6b6b, #ff8e53)' :
                          'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        border: rec.priority === 'high' ? '2px solid #ff4757' : 'none'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
                          {rec.description}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <strong>Рекомендуем:</strong> {rec.dishes.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryAnalysis;
