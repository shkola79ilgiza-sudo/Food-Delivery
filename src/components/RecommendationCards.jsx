// Компонент карточек рекомендаций для клиентов
// Показывает AI-советы по питанию в стиле "Совет дня"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../App.css';

const RecommendationCards = ({ userOrderHistory = [], userPreferences = {} }) => {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Генерация AI-рекомендаций на основе истории заказов
  useEffect(() => {
    const generateRecommendations = () => {
      const recs = [];
      
      // Анализируем историю заказов
      const recentOrders = userOrderHistory.slice(-10);
      const totalCalories = recentOrders.reduce((sum, order) => sum + (order.calories || 0), 0);
      const avgCalories = totalCalories / recentOrders.length || 0;
      
      // Анализируем категории блюд
      const categoryCount = {};
      recentOrders.forEach(order => {
        if (order.category) {
          categoryCount[order.category] = (categoryCount[order.category] || 0) + 1;
        }
      });
      
      const mostOrderedCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, 'main'
      );
      
      // Рекомендация 1: Баланс калорий
      if (avgCalories > 800) {
        recs.push({
          id: 1,
          type: 'calorie_balance',
          icon: '🥗',
          title: 'Баланс калорий',
          message: `Вы часто заказываете калорийные блюда (${Math.round(avgCalories)} ккал). Попробуйте этот салат для баланса!`,
          action: 'Показать салаты',
          color: '#4CAF50',
          priority: 'high'
        });
      }
      
      // Рекомендация 2: Разнообразие
      if (Object.keys(categoryCount).length < 3) {
        recs.push({
          id: 2,
          type: 'variety',
          icon: '🌈',
          title: 'Больше разнообразия',
          message: 'Попробуйте новые категории блюд! У нас есть отличные веганские и диетические варианты.',
          action: 'Исследовать меню',
          color: '#FF9800',
          priority: 'medium'
        });
      }
      
      // Рекомендация 3: Диабетическое меню
      if (userPreferences.diabeticFriendly) {
        recs.push({
          id: 3,
          type: 'diabetic',
          icon: '🍯',
          title: 'Диабетическое меню',
          message: 'Для вас доступны специальные блюда с низким гликемическим индексом и заменителями сахара.',
          action: 'Открыть диабетическое меню',
          color: '#9C27B0',
          priority: 'high'
        });
      }
      
      // Рекомендация 4: Сезонные предложения
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 5 && currentMonth <= 8) { // Лето
        recs.push({
          id: 4,
          type: 'seasonal',
          icon: '☀️',
          title: 'Летние предложения',
          message: 'Свежие овощи и легкие блюда идеально подходят для жаркой погоды!',
          action: 'Посмотреть летнее меню',
          color: '#FF5722',
          priority: 'medium'
        });
      }
      
      // Рекомендация 5: Популярные блюда
      recs.push({
        id: 5,
        type: 'popular',
        icon: '🔥',
        title: 'Популярно сегодня',
        message: 'Борщ с говядиной и салат Цезарь - самые заказываемые блюда сегодня!',
        action: 'Заказать сейчас',
        color: '#F44336',
        priority: 'low'
      });
      
      // Рекомендация 6: Здоровое питание
      const unhealthyCount = recentOrders.filter(order => 
        order.category === 'fast_food' || order.category === 'desserts'
      ).length;
      
      if (unhealthyCount > recentOrders.length * 0.5) {
        recs.push({
          id: 6,
          type: 'healthy',
          icon: '💪',
          title: 'Здоровый выбор',
          message: 'Попробуйте наши блюда на пару и запеченные варианты для более здорового питания.',
          action: 'Здоровые блюда',
          color: '#8BC34A',
          priority: 'high'
        });
      }
      
      setRecommendations(recs);
    };
    
    generateRecommendations();
  }, [userOrderHistory, userPreferences]);

  // Автоматическая смена карточек
  useEffect(() => {
    if (recommendations.length > 1) {
      const interval = setInterval(() => {
        setCurrentCard((prev) => (prev + 1) % recommendations.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [recommendations.length]);

  // Обработка действий
  const handleAction = (recommendation) => {
    console.log('Action clicked:', recommendation.action);
    // Здесь можно добавить логику для выполнения действий
  };

  // Закрытие карточки
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  const currentRec = recommendations[currentCard];

  return (
    <div className="recommendation-cards-container">
      {/* Основная карточка рекомендации */}
      <div 
        className="recommendation-card"
        style={{
          background: `linear-gradient(135deg, ${currentRec.color}15, ${currentRec.color}05)`,
          border: `2px solid ${currentRec.color}30`,
          borderRadius: '16px',
          padding: '20px',
          margin: '10px 0',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInFromRight 0.5s ease-out'
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        {/* Заголовок с иконкой */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>
            {currentRec.icon}
          </span>
          <h3 style={{ 
            margin: 0, 
            color: currentRec.color, 
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {currentRec.title}
          </h3>
          {/* Индикатор приоритета */}
          <div style={{
            marginLeft: 'auto',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: currentRec.priority === 'high' ? '#F44336' : 
                           currentRec.priority === 'medium' ? '#FF9800' : '#4CAF50'
          }} />
        </div>

        {/* Сообщение */}
        <p style={{ 
          margin: '0 0 16px 0', 
          color: '#333', 
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {currentRec.message}
        </p>

        {/* Кнопка действия */}
        <button
          onClick={() => handleAction(currentRec)}
          style={{
            background: currentRec.color,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 2px 8px ${currentRec.color}40`
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 4px 12px ${currentRec.color}60`;
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 2px 8px ${currentRec.color}40`;
          }}
        >
          {currentRec.action}
        </button>

        {/* Индикаторы других карточек */}
        {recommendations.length > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '16px',
            gap: '6px'
          }}>
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentCard ? currentRec.color : '#ddd',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Дополнительные карточки (мини-версии) */}
      {recommendations.length > 1 && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: '10px',
          overflowX: 'auto',
          paddingBottom: '5px'
        }}>
          {recommendations
            .filter((_, index) => index !== currentCard)
            .slice(0, 3)
            .map((rec, index) => (
              <div
                key={rec.id}
                onClick={() => setCurrentCard(recommendations.indexOf(rec))}
                style={{
                  minWidth: '120px',
                  padding: '12px',
                  background: `linear-gradient(135deg, ${rec.color}10, ${rec.color}05)`,
                  border: `1px solid ${rec.color}20`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 8px ${rec.color}30`;
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {rec.icon}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  color: rec.color,
                  marginBottom: '4px'
                }}>
                  {rec.title}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#666',
                  lineHeight: '1.2'
                }}>
                  {rec.message.substring(0, 50)}...
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationCards;
