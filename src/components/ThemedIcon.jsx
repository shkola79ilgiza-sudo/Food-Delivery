import React from 'react';
import AnimatedIcon from './AnimatedIcon';

const ThemedIcon = ({ 
  category, 
  size = 48, 
  style = {},
  animated = true,
  onClick
}) => {
  const getCategoryImage = (category) => {
    const images = {
      // Категории блюд с красивыми картинками
      tatar: {
        emoji: '🥟',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        description: 'Татарская кухня'
      },
      russian: {
        emoji: '🥘',
        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        description: 'Русская кухня'
      },
      european: {
        emoji: '🍝',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        description: 'Европейская кухня'
      },
      asian: {
        emoji: '🍜',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        description: 'Азиатская кухня'
      },
      desserts: {
        emoji: '🍰',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        description: 'Десерты'
      },
      beverages: {
        emoji: '🥤',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        description: 'Напитки'
      },
      soups: {
        emoji: '🍲',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        description: 'Супы'
      },
      salads: {
        emoji: '🥗',
        background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)',
        description: 'Салаты'
      },
      meat: {
        emoji: '🥩',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        description: 'Мясные блюда'
      },
      fish: {
        emoji: '🐟',
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        description: 'Рыбные блюда'
      },
      vegetarian: {
        emoji: '🥬',
        background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
        description: 'Вегетарианские блюда'
      },
      vegan: {
        emoji: '🌱',
        background: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)',
        description: 'Веганские блюда'
      },
      
      // Навигационные иконки
      home: {
        emoji: '🏠',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        description: 'Главная'
      },
      menu: {
        emoji: '🍽️',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        description: 'Меню'
      },
      orders: {
        emoji: '📋',
        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        description: 'Заказы'
      },
      notifications: {
        emoji: '🔔',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        description: 'Уведомления'
      },
      profile: {
        emoji: '👤',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        description: 'Профиль'
      },
      settings: {
        emoji: '⚙️',
        background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
        description: 'Настройки'
      },
      
      // Действия
      search: {
        emoji: '🔍',
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        description: 'Поиск'
      },
      filter: {
        emoji: '🔧',
        background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
        description: 'Фильтры'
      },
      chat: {
        emoji: '💬',
        background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
        description: 'Чат'
      },
      ai: {
        emoji: '🤖',
        background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
        description: 'AI Рекомендации'
      },
      
      // Статусы
      pending: {
        emoji: '⏳',
        background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
        description: 'Ожидает'
      },
      confirmed: {
        emoji: '✅',
        background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
        description: 'Подтверждено'
      },
      preparing: {
        emoji: '👨‍🍳',
        background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
        description: 'Готовится'
      },
      ready: {
        emoji: '🍽️',
        background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
        description: 'Готово'
      },
      delivered: {
        emoji: '🚚',
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        description: 'Доставлено'
      }
    };

    return images[category] || {
      emoji: '❓',
      background: 'linear-gradient(135deg, #ddd 0%, #999 100%)',
      description: 'Неизвестная категория'
    };
  };

  const categoryData = getCategoryImage(category);

  const iconStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: categoryData.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.6,
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    border: '3px solid rgba(255,255,255,0.3)',
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    ...style
  };

  const handleMouseEnter = (e) => {
    if (onClick) {
      e.target.style.transform = 'scale(1.1) rotate(5deg)';
      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    }
  };

  const handleMouseLeave = (e) => {
    if (onClick) {
      e.target.style.transform = 'scale(1) rotate(0deg)';
      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    }
  };

  return (
    <div
      style={iconStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={categoryData.description}
    >
      {animated ? (
        <AnimatedIcon
          name={category}
          size={size * 0.6}
          animation="pulse"
          duration={2000}
        />
      ) : (
        <span style={{ fontSize: size * 0.6 }}>
          {categoryData.emoji}
        </span>
      )}
      
      {/* Декоративные элементы */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default ThemedIcon;
