import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import '../App.css';

const ChefRatings = ({ onClose }) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [chefStats, setChefStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    loadChefStats();
  }, []);

  const loadChefStats = async () => {
    try {
      setLoading(true);
      const chefId = localStorage.getItem('chefId') || 'demo-chef-1';
      
      // Загружаем заказы повара
      const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const chefOrders = clientOrders.filter(order => 
        order.items?.some(item => item.chefId === chefId)
      );

      // Загружаем отзывы
      const reviews = JSON.parse(localStorage.getItem('chefReviews') || '[]');
      const chefReviews = reviews.filter(review => review.chefId === chefId);

      // Рассчитываем статистику
      const stats = calculateChefStats(chefOrders, chefReviews);
      setChefStats(stats);

      // Генерируем бейджи
      const generatedBadges = generateBadges(stats);
      setBadges(generatedBadges);

    } catch (error) {
      console.error('Error loading chef stats:', error);
      showError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const calculateChefStats = (orders, reviews) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Фильтруем заказы по периодам
    const ordersLastMonth = orders.filter(order => new Date(order.createdAt) >= lastMonth);
    const ordersLastWeek = orders.filter(order => new Date(order.createdAt) >= lastWeek);

    // Рассчитываем рейтинг
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Рассчитываем количество блюд
    const totalDishes = orders.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
    );

    // Рассчитываем выручку
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const monthlyRevenue = ordersLastMonth.reduce((sum, order) => sum + (order.total || 0), 0);

    // Рассчитываем время выполнения заказов
    const completedOrders = orders.filter(order => order.status === 'delivered');
    const avgCompletionTime = calculateAverageCompletionTime(completedOrders);

    // Рассчитываем стабильность (процент успешных заказов)
    const successfulOrders = orders.filter(order => 
      ['delivered', 'ready'].includes(order.status)
    );
    const stability = orders.length > 0 ? (successfulOrders.length / orders.length) * 100 : 0;

    return {
      totalOrders: orders.length,
      ordersLastMonth: ordersLastMonth.length,
      ordersLastWeek: ordersLastWeek.length,
      totalDishes,
      totalRevenue,
      monthlyRevenue,
      averageRating,
      totalReviews: reviews.length,
      avgCompletionTime,
      stability,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
    };
  };

  const calculateAverageCompletionTime = (orders) => {
    if (orders.length === 0) return 0;
    
    const totalTime = orders.reduce((sum, order) => {
      const createdAt = new Date(order.createdAt);
      const completedAt = new Date(order.updatedAt || order.createdAt);
      return sum + (completedAt - createdAt);
    }, 0);
    
    return Math.round(totalTime / orders.length / (1000 * 60)); // в минутах
  };

  const generateBadges = (stats) => {
    const badges = [];

    // Бейдж рейтинга
    if (stats.averageRating >= 4.8) {
      badges.push({
        id: 'rating-excellent',
        name: '5⭐ Стабильность',
        description: 'Отличный рейтинг 4.8+',
        icon: '⭐',
        color: '#f39c12',
        earned: true,
        progress: 100
      });
    } else if (stats.averageRating >= 4.5) {
      badges.push({
        id: 'rating-good',
        name: '4⭐ Качество',
        description: 'Хороший рейтинг 4.5+',
        icon: '⭐',
        color: '#27ae60',
        earned: true,
        progress: 100
      });
    }

    // Бейдж повара месяца
    if (stats.ordersLastMonth >= 50) {
      badges.push({
        id: 'chef-month',
        name: 'Повар месяца',
        description: '50+ заказов за месяц',
        icon: '👑',
        color: '#e74c3c',
        earned: true,
        progress: 100
      });
    } else {
      badges.push({
        id: 'chef-month',
        name: 'Повар месяца',
        description: '50+ заказов за месяц',
        icon: '👑',
        color: '#bdc3c7',
        earned: false,
        progress: (stats.ordersLastMonth / 50) * 100
      });
    }

    // Бейдж стабильности
    if (stats.stability >= 95) {
      badges.push({
        id: 'stability-excellent',
        name: 'Лучшие отзывы',
        description: '95%+ успешных заказов',
        icon: '🏆',
        color: '#9b59b6',
        earned: true,
        progress: 100
      });
    } else if (stats.stability >= 90) {
      badges.push({
        id: 'stability-good',
        name: 'Надежный повар',
        description: '90%+ успешных заказов',
        icon: '🛡️',
        color: '#3498db',
        earned: true,
        progress: 100
      });
    } else {
      badges.push({
        id: 'stability-good',
        name: 'Надежный повар',
        description: '90%+ успешных заказов',
        icon: '🛡️',
        color: '#bdc3c7',
        earned: false,
        progress: stats.stability
      });
    }

    // Бейдж скорости
    if (stats.avgCompletionTime <= 30) {
      badges.push({
        id: 'speed-fast',
        name: 'Скоростной повар',
        description: 'Среднее время готовки ≤30 мин',
        icon: '⚡',
        color: '#e67e22',
        earned: true,
        progress: 100
      });
    } else if (stats.avgCompletionTime <= 45) {
      badges.push({
        id: 'speed-good',
        name: 'Быстрый повар',
        description: 'Среднее время готовки ≤45 мин',
        icon: '⚡',
        color: '#f39c12',
        earned: true,
        progress: 100
      });
    } else {
      badges.push({
        id: 'speed-good',
        name: 'Быстрый повар',
        description: 'Среднее время готовки ≤45 мин',
        icon: '⚡',
        color: '#bdc3c7',
        earned: false,
        progress: Math.max(0, 100 - (stats.avgCompletionTime - 45) * 2)
      });
    }

    // Бейдж выручки
    if (stats.monthlyRevenue >= 100000) {
      badges.push({
        id: 'revenue-high',
        name: 'Топ-повар',
        description: '100k+ выручки за месяц',
        icon: '💰',
        color: '#27ae60',
        earned: true,
        progress: 100
      });
    } else if (stats.monthlyRevenue >= 50000) {
      badges.push({
        id: 'revenue-medium',
        name: 'Успешный повар',
        description: '50k+ выручки за месяц',
        icon: '💎',
        color: '#3498db',
        earned: true,
        progress: 100
      });
    } else {
      badges.push({
        id: 'revenue-medium',
        name: 'Успешный повар',
        description: '50k+ выручки за месяц',
        icon: '💎',
        color: '#bdc3c7',
        earned: false,
        progress: (stats.monthlyRevenue / 50000) * 100
      });
    }

    return badges;
  };

  const getBadgeStatus = (badge) => {
    if (badge.earned) {
      return 'earned';
    } else if (badge.progress > 0) {
      return 'in-progress';
    } else {
      return 'locked';
    }
  };

  if (loading || !chefStats) {
    return (
      <div className="chef-ratings-modal-overlay">
        <div className="chef-ratings-modal">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Загружаем рейтинги...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-ratings-modal-overlay" onClick={onClose}>
      <div className="chef-ratings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chef-ratings-header">
          <h3>🏆 Рейтинги и достижения</h3>
          <button onClick={onClose} className="back-button">✕</button>
        </div>

        <div className="chef-ratings-content">
          {/* Общая статистика */}
          <div className="chef-stats-section">
            <h4>📊 Ваша статистика</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <div className="stat-number">{chefStats.averageRating.toFixed(1)}</div>
                  <div className="stat-label">Средний рейтинг</div>
                  <div className="stat-detail">{chefStats.totalReviews} отзывов</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🍽️</div>
                <div className="stat-info">
                  <div className="stat-number">{chefStats.totalDishes}</div>
                  <div className="stat-label">Блюд приготовлено</div>
                  <div className="stat-detail">{chefStats.totalOrders} заказов</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-number">{chefStats.monthlyRevenue.toLocaleString()}₽</div>
                  <div className="stat-label">Выручка за месяц</div>
                  <div className="stat-detail">{chefStats.ordersLastMonth} заказов</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <div className="stat-number">{chefStats.avgCompletionTime} мин</div>
                  <div className="stat-label">Среднее время готовки</div>
                  <div className="stat-detail">{chefStats.stability.toFixed(1)}% успешных</div>
                </div>
              </div>
            </div>
          </div>

          {/* Бейджи и достижения */}
          <div className="badges-section">
            <h4>🏅 Достижения</h4>
            <div className="badges-grid">
              {badges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`badge-card ${getBadgeStatus(badge)}`}
                >
                  <div className="badge-icon" style={{ color: badge.color }}>
                    {badge.icon}
                  </div>
                  <div className="badge-info">
                    <h5 className="badge-name">{badge.name}</h5>
                    <p className="badge-description">{badge.description}</p>
                    {!badge.earned && (
                      <div className="badge-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${badge.progress}%`,
                              backgroundColor: badge.color
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">{badge.progress.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                  {badge.earned && (
                    <div className="badge-status">
                      <span className="earned-badge">✅</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Мотивационные сообщения */}
          <div className="motivation-section">
            <h4>💪 Мотивация</h4>
            <div className="motivation-messages">
              {chefStats.averageRating >= 4.5 && (
                <div className="motivation-card success">
                  <div className="motivation-icon">🎉</div>
                  <div className="motivation-text">
                    <strong>Отлично!</strong> Ваш рейтинг {chefStats.averageRating.toFixed(1)} - это результат качественной работы!
                  </div>
                </div>
              )}
              
              {chefStats.ordersLastMonth >= 30 && (
                <div className="motivation-card success">
                  <div className="motivation-icon">🚀</div>
                  <div className="motivation-text">
                    <strong>Активность!</strong> {chefStats.ordersLastMonth} заказов за месяц - вы на правильном пути!
                  </div>
                </div>
              )}
              
              {chefStats.stability >= 90 && (
                <div className="motivation-card success">
                  <div className="motivation-icon">🛡️</div>
                  <div className="motivation-text">
                    <strong>Надежность!</strong> {chefStats.stability.toFixed(1)}% успешных заказов - клиенты доверяют вам!
                  </div>
                </div>
              )}
              
              {chefStats.averageRating < 4.0 && (
                <div className="motivation-card warning">
                  <div className="motivation-icon">📈</div>
                  <div className="motivation-text">
                    <strong>Развивайтесь!</strong> Ваш рейтинг {chefStats.averageRating.toFixed(1)} - есть куда расти!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefRatings;
