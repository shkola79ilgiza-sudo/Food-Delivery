// Компонент геймификации с прогресс-барами и ачивками
// Мотивирует пользователей к здоровому питанию через игровые элементы

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../App.css';

const Gamification = ({ userOrderHistory = [], userProfile = {} }) => {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [showAchievement, setShowAchievement] = useState(null);

  // Конфигурация уровней
  const levelConfig = {
    1: { name: 'Новичок', xpRequired: 0, color: '#9E9E9E', icon: '🌱' },
    2: { name: 'Любитель', xpRequired: 100, color: '#4CAF50', icon: '🍎' },
    3: { name: 'Знаток', xpRequired: 300, color: '#2196F3', icon: '🥗' },
    4: { name: 'Эксперт', xpRequired: 600, color: '#FF9800', icon: '👨‍🍳' },
    5: { name: 'Мастер', xpRequired: 1000, color: '#9C27B0', icon: '🏆' },
    6: { name: 'Легенда', xpRequired: 1500, color: '#F44336', icon: '👑' }
  };

  // Конфигурация ачивок
  const achievementConfig = [
    {
      id: 'first_order',
      name: 'Первый заказ',
      description: 'Сделайте свой первый заказ',
      icon: '🎉',
      xpReward: 50,
      condition: (history) => history.length >= 1,
      unlocked: false
    },
    {
      id: 'healthy_week',
      name: 'Неделя здоровья',
      description: 'Заказывайте здоровые блюда 7 дней подряд',
      icon: '💪',
      xpReward: 100,
      condition: (history) => {
        const last7Days = history.slice(-7);
        return last7Days.length >= 7 && last7Days.every(order => 
          order.category === 'healthy' || order.category === 'salads' || order.category === 'diet'
        );
      },
      unlocked: false
    },
    {
      id: 'no_fastfood_week',
      name: 'Неделя без фастфуда',
      description: '7 дней без заказа фастфуда',
      icon: '🏅',
      xpReward: 150,
      condition: (history) => {
        const last7Days = history.slice(-7);
        return last7Days.length >= 7 && !last7Days.some(order => order.category === 'fast_food');
      },
      unlocked: false
    },
    {
      id: 'diabetic_friendly',
      name: 'Диабетическое меню',
      description: 'Попробуйте диабетические блюда',
      icon: '🍯',
      xpReward: 75,
      condition: (history) => history.some(order => order.diabeticFriendly),
      unlocked: false
    },
    {
      id: 'variety_master',
      name: 'Мастер разнообразия',
      description: 'Закажите блюда из 5 разных категорий',
      icon: '🌈',
      xpReward: 120,
      condition: (history) => {
        const categories = new Set(history.map(order => order.category));
        return categories.size >= 5;
      },
      unlocked: false
    },
    {
      id: 'calorie_balance',
      name: 'Баланс калорий',
      description: 'Поддерживайте баланс калорий 3 дня подряд',
      icon: '⚖️',
      xpReward: 80,
      condition: (history) => {
        const last3Days = history.slice(-3);
        return last3Days.length >= 3 && last3Days.every(order => 
          order.calories >= 1200 && order.calories <= 2000
        );
      },
      unlocked: false
    },
    {
      id: 'early_bird',
      name: 'Ранняя пташка',
      description: 'Закажите завтрак 5 раз',
      icon: '🌅',
      xpReward: 60,
      condition: (history) => {
        const breakfastOrders = history.filter(order => 
          order.category === 'breakfast' || order.timeOfDay === 'morning'
        );
        return breakfastOrders.length >= 5;
      },
      unlocked: false
    },
    {
      id: 'loyal_customer',
      name: 'Постоянный клиент',
      description: 'Сделайте 50 заказов',
      icon: '💎',
      xpReward: 200,
      condition: (history) => history.length >= 50,
      unlocked: false
    },
    {
      id: 'monthly_champion',
      name: 'Чемпион месяца',
      description: 'Сделайте 20 заказов за месяц',
      icon: '🏆',
      xpReward: 180,
      condition: (history) => {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthlyOrders = history.filter(order => 
          new Date(order.date || order.createdAt) >= monthAgo
        );
        return monthlyOrders.length >= 20;
      },
      unlocked: false
    },
    {
      id: 'perfect_week',
      name: 'Идеальная неделя',
      description: 'Закажите здоровые блюда каждый день недели',
      icon: '⭐',
      xpReward: 300,
      condition: (history) => {
        const last7Days = history.slice(-7);
        if (last7Days.length < 7) return false;
        
        const days = new Set();
        last7Days.forEach(order => {
          const day = new Date(order.date || order.createdAt).toDateString();
          days.add(day);
        });
        
        return days.size >= 7 && last7Days.every(order => 
          order.category === 'healthy' || order.category === 'salads' || order.category === 'diet'
        );
      },
      unlocked: false
    }
  ];

  // Проверка и разблокировка ачивок
  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements = achievementConfig.map(achievement => ({
        ...achievement,
        unlocked: achievement.condition(userOrderHistory)
      }));

      // Проверяем новые ачивки
      const newlyUnlocked = newAchievements.filter(achievement => 
        achievement.unlocked && !achievements.find(a => a.id === achievement.id)?.unlocked
      );

      if (newlyUnlocked.length > 0) {
        setAchievements(newAchievements);
        
        // Показываем уведомление о новой ачивке
        const latestAchievement = newlyUnlocked[newlyUnlocked.length - 1];
        setShowAchievement(latestAchievement);
        
        // Добавляем опыт
        const totalXp = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
        setExperience(prev => prev + totalXp);
        
        // Скрываем уведомление через 5 секунд
        setTimeout(() => setShowAchievement(null), 5000);
      } else {
        setAchievements(newAchievements);
      }
    };

    checkAchievements();
  }, [userOrderHistory, achievements]);

  // Расчет текущего уровня
  useEffect(() => {
    const currentLevel = Object.keys(levelConfig).reverse().find(level => 
      experience >= levelConfig[level].xpRequired
    );
    setLevel(parseInt(currentLevel) || 1);
  }, [experience]);

  // Расчет текущей серии
  useEffect(() => {
    const calculateStreak = () => {
      let streak = 0;
      const now = new Date();
      
      for (let i = 0; i < userOrderHistory.length; i++) {
        const order = userOrderHistory[i];
        const orderDate = new Date(order.date || order.createdAt);
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
      
      setCurrentStreak(streak);
    };

    calculateStreak();
  }, [userOrderHistory]);

  // Прогресс до следующего уровня
  const nextLevelProgress = useMemo(() => {
    const currentLevelData = levelConfig[level];
    const nextLevelData = levelConfig[level + 1];
    
    if (!nextLevelData) return { progress: 100, xpNeeded: 0 };
    
    const xpInCurrentLevel = experience - currentLevelData.xpRequired;
    const xpNeededForNext = nextLevelData.xpRequired - currentLevelData.xpRequired;
    const progress = (xpInCurrentLevel / xpNeededForNext) * 100;
    
    return {
      progress: Math.min(100, Math.max(0, progress)),
      xpNeeded: nextLevelData.xpRequired - experience
    };
  }, [level, experience]);

  // Статистика пользователя
  const userStats = useMemo(() => {
    const totalOrders = userOrderHistory.length;
    const totalXp = experience;
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const totalAchievements = achievements.length;
    
    return {
      totalOrders,
      totalXp,
      unlockedAchievements,
      totalAchievements,
      completionRate: Math.round((unlockedAchievements / totalAchievements) * 100)
    };
  }, [userOrderHistory, experience, achievements]);

  return (
    <div className="gamification-container" style={{ padding: '20px' }}>
      {/* Уведомление о новой ачивке */}
      {showAchievement && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'slideInFromRight 0.5s ease-out',
          maxWidth: '300px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>{showAchievement.icon}</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Ачивка разблокирована!</div>
              <div style={{ fontSize: '14px' }}>{showAchievement.name}</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            {showAchievement.description}
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            color: '#FFD700'
          }}>
            +{showAchievement.xpReward} XP
          </div>
        </div>
      )}

      {/* Заголовок */}
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>🎮 Ваш прогресс</h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Карточка уровня */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {levelConfig[level].icon}
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: levelConfig[level].color }}>
            {levelConfig[level].name}
          </h3>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Уровень {level}
          </div>
          
          {/* Прогресс-бар уровня */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '5px',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>Опыт: {experience} XP</span>
              <span>{nextLevelProgress.xpNeeded > 0 ? `До следующего уровня: ${nextLevelProgress.xpNeeded} XP` : 'Максимальный уровень!'}</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${nextLevelProgress.progress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${levelConfig[level].color}, ${levelConfig[level + 1]?.color || levelConfig[level].color})`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Карточка серии */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔥</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#FF5722' }}>
            Текущая серия
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF5722', marginBottom: '10px' }}>
            {currentStreak}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {currentStreak === 0 ? 'Начните новую серию!' : 
             currentStreak === 1 ? '1 день подряд' : 
             `${currentStreak} дней подряд`}
          </div>
          
          {/* Мотивационные сообщения */}
          {currentStreak > 0 && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: '#FFF3E0', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#E65100'
            }}>
              {currentStreak >= 7 ? '🏆 Невероятно! Вы на правильном пути!' :
               currentStreak >= 3 ? '💪 Отличная работа! Продолжайте в том же духе!' :
               '🌱 Хорошее начало! Еще немного и будете на вершине!'}
            </div>
          )}
        </div>

        {/* Статистика */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Статистика</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px' }}>Всего заказов:</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{userStats.totalOrders}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px' }}>Общий опыт:</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>
                {userStats.totalXp} XP
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px' }}>Ачивки:</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {userStats.unlockedAchievements}/{userStats.totalAchievements}
              </span>
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '5px',
                fontSize: '12px',
                color: '#666'
              }}>
                <span>Прогресс ачивок</span>
                <span>{userStats.completionRate}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#f0f0f0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${userStats.completionRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Список ачивок */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🏆 Ачивки</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '15px' 
        }}>
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              style={{
                background: achievement.unlocked ? 'white' : '#f5f5f5',
                borderRadius: '12px',
                padding: '15px',
                boxShadow: achievement.unlocked ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                border: achievement.unlocked ? '2px solid #4CAF50' : '2px solid #e0e0e0',
                opacity: achievement.unlocked ? 1 : 0.6,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{achievement.icon}</span>
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: achievement.unlocked ? '#333' : '#999'
                  }}>
                    {achievement.name}
                  </div>
                  {achievement.unlocked && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#4CAF50',
                      fontWeight: 'bold'
                    }}>
                      +{achievement.xpReward} XP
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: achievement.unlocked ? '#666' : '#999',
                lineHeight: '1.3'
              }}>
                {achievement.description}
              </div>
              
              {achievement.unlocked && (
                <div style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  background: '#4CAF50',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  ✓ РАЗБЛОКИРОВАНО
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
