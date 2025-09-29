import React, { useState, useEffect, useCallback } from 'react';

const AIRecommendations = ({ dishes, onDishSelect }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    cuisine: 'all',
    priceRange: 'all',
    cookingTime: 'all',
    dietary: 'all'
  });

  const analyzeUserPreferences = (orders) => {
    if (orders.length === 0) {
      return {
        favoriteCuisines: ['tatar', 'russian'],
        averagePrice: 500,
        preferredCookingTime: 45,
        dietaryRestrictions: [],
        favoriteIngredients: ['мясо', 'овощи', 'специи']
      };
    }

    // Анализируем кухни
    const cuisineCount = {};
    const priceSum = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    const cookingTimeSum = orders.reduce((sum, order) => sum + (order.cookingTime || 30), 0);
    
    orders.forEach(order => {
      if (order.category) {
        cuisineCount[order.category] = (cuisineCount[order.category] || 0) + 1;
      }
    });

    const favoriteCuisines = Object.keys(cuisineCount)
      .sort((a, b) => cuisineCount[b] - cuisineCount[a])
      .slice(0, 3);

    return {
      favoriteCuisines,
      averagePrice: priceSum / orders.length,
      preferredCookingTime: cookingTimeSum / orders.length,
      dietaryRestrictions: [],
      favoriteIngredients: ['мясо', 'овощи', 'специи'] // Упрощенный анализ
    };
  };

  const generateAIReason = (dish, preferences, rank) => {
    const reasons = [
      `Подходит вашим предпочтениям по кухне ${dish.category}`,
      `Цена в вашем комфортном диапазоне (${dish.price}₽)`,
      `Время приготовления ${dish.cookingTime || 30} мин соответствует вашим предпочтениям`,
      `Высокий рейтинг (${(dish.rating || 0).toFixed(1)}⭐)`,
      `Популярное блюдо среди похожих пользователей`,
      `Содержит ваши любимые ингредиенты`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const generateAIRecommendations = useCallback((dishes, preferences) => {
    // Фильтруем блюда по предпочтениям
    let filteredDishes = dishes.filter(dish => {
      // Фильтр по кухне
      if (preferences.favoriteCuisines.length > 0 && 
          !preferences.favoriteCuisines.includes(dish.category)) {
        return false;
      }

      // Фильтр по цене (в пределах 50% от средней)
      const priceRange = preferences.averagePrice * 0.5;
      if (Math.abs(dish.price - preferences.averagePrice) > priceRange) {
        return false;
      }

      // Фильтр по времени приготовления (в пределах 30 минут)
      const timeDiff = Math.abs((dish.cookingTime || 30) - preferences.preferredCookingTime);
      if (timeDiff > 30) {
        return false;
      }

      return true;
    });

    // Сортируем по рейтингу и популярности
    filteredDishes = filteredDishes.sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

    // Добавляем AI-обоснования
    return filteredDishes.slice(0, 6).map((dish, index) => ({
      ...dish,
      aiReason: generateAIReason(dish, preferences, index + 1)
    }));
  }, []);

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    
    try {
      // Получаем историю заказов из localStorage
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const recentOrders = orderHistory.slice(-10); // Последние 10 заказов
      
      // Анализируем предпочтения пользователя
      const preferences = analyzeUserPreferences(recentOrders);
      
      // Генерируем рекомендации на основе предпочтений
      const aiRecommendations = generateAIRecommendations(dishes, preferences);
      
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Ошибка при генерации рекомендаций:', error);
    } finally {
      setLoading(false);
    }
  }, [dishes, generateAIRecommendations]);

  // Анализируем историю заказов для рекомендаций
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handlePreferenceChange = (key, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        margin: '20px 0'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
        <div>AI анализирует ваши предпочтения...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '15px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>🤖 AI Рекомендации</h3>
        <button
          onClick={generateRecommendations}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Обновить
        </button>
      </div>

      {/* Настройки предпочтений */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '10px'
      }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>
            Кухня:
          </label>
          <select
            value={userPreferences.cuisine}
            onChange={(e) => handlePreferenceChange('cuisine', e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '12px'
            }}
          >
            <option value="all">Любая</option>
            <option value="tatar">Татарская</option>
            <option value="russian">Русская</option>
            <option value="european">Европейская</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>
            Цена:
          </label>
          <select
            value={userPreferences.priceRange}
            onChange={(e) => handlePreferenceChange('priceRange', e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '12px'
            }}
          >
            <option value="all">Любая</option>
            <option value="budget">До 300₽</option>
            <option value="medium">300-600₽</option>
            <option value="premium">600₽+</option>
          </select>
        </div>
      </div>

      {/* Список рекомендаций */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '15px'
      }}>
        {recommendations.map((dish, index) => (
          <div
            key={dish.id}
            onClick={() => onDishSelect && onDishSelect(dish)}
            style={{
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              border: '2px solid #e8f4f8',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e8f4f8';
            }}
          >
            {/* AI Badge */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              AI #{index + 1}
            </div>

            <h4 style={{ 
              margin: '0 0 8px 0', 
              color: '#2c3e50',
              fontSize: '16px'
            }}>
              {dish.name}
            </h4>
            
            <p style={{ 
              margin: '0 0 10px 0', 
              color: '#666',
              fontSize: '12px',
              lineHeight: '1.4'
            }}>
              {dish.description}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2e7d32'
              }}>
                {dish.price}₽
              </span>
              <span style={{
                fontSize: '12px',
                color: '#666'
              }}>
                ⏰ {dish.cookingTime || 30} мин
              </span>
            </div>

            <div style={{
              background: 'rgba(102, 126, 234, 0.1)',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#2c3e50',
              fontStyle: 'italic'
            }}>
              💡 {dish.aiReason}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🤖</div>
          <div>AI пока не может найти подходящие рекомендации</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Попробуйте изменить настройки предпочтений
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;