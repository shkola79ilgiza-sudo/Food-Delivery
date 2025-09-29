import React, { useState } from 'react';
import IconSystem from './IconSystem';
import AnimatedIcon from './AnimatedIcon';
import ThemedIcon from './ThemedIcon';

const IconShowcase = () => {
  const [selectedAnimation, setSelectedAnimation] = useState('bounce');
  const [selectedSize, setSelectedSize] = useState(32);

  const animations = [
    { name: 'bounce', label: 'Прыжок' },
    { name: 'pulse', label: 'Пульсация' },
    { name: 'rotate', label: 'Вращение' },
    { name: 'shake', label: 'Тряска' },
    { name: 'glow', label: 'Свечение' },
    { name: 'float', label: 'Плавание' }
  ];

  const categories = [
    'tatar', 'russian', 'european', 'asian', 'desserts', 'beverages',
    'soups', 'salads', 'meat', 'fish', 'vegetarian', 'vegan'
  ];

  const icons = [
    'home', 'menu', 'orders', 'notifications', 'profile', 'settings',
    'search', 'filter', 'chat', 'ai', 'cooking', 'chef', 'kitchen',
    'shopping', 'delivery', 'pickup', 'pending', 'confirmed', 'preparing',
    'ready', 'delivered', 'cancelled', 'completed', 'card', 'cash',
    'refresh', 'edit', 'delete', 'add', 'remove', 'close', 'back',
    'next', 'up', 'down', 'info', 'warning', 'error', 'success'
  ];

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '30px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🎨 Современная система иконок
        </h1>

        {/* Настройки */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>⚙️ Настройки</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Анимация:</label>
              <select
                value={selectedAnimation}
                onChange={(e) => setSelectedAnimation(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'white',
                  color: '#333'
                }}
              >
                {animations.map(anim => (
                  <option key={anim.name} value={anim.name}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Размер:</label>
              <input
                type="range"
                min="16"
                max="64"
                value={selectedSize}
                onChange={(e) => setSelectedSize(parseInt(e.target.value))}
                style={{ width: '150px' }}
              />
              <span style={{ marginLeft: '10px' }}>{selectedSize}px</span>
            </div>
          </div>
        </div>

        {/* Базовые иконки */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>🔤 Базовые иконки</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px'
          }}>
            {icons.slice(0, 20).map(iconName => (
              <div key={iconName} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '15px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <IconSystem name={iconName} size={selectedSize} />
                <div style={{ fontSize: '12px', marginTop: '8px' }}>{iconName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Анимированные иконки */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>✨ Анимированные иконки</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px'
          }}>
            {icons.slice(0, 12).map(iconName => (
              <div key={iconName} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '15px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <AnimatedIcon 
                  name={iconName} 
                  size={selectedSize} 
                  animation={selectedAnimation}
                />
                <div style={{ fontSize: '12px', marginTop: '8px' }}>{iconName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Тематические иконки */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>🎨 Тематические иконки</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            {categories.map(category => (
              <div key={category} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              >
                <ThemedIcon category={category} size={selectedSize} animated />
                <div style={{ fontSize: '14px', marginTop: '10px', fontWeight: 'bold' }}>
                  {category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Интерактивные примеры */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>🎯 Интерактивные примеры</h3>
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
            >
              <AnimatedIcon name="heart" size={20} animation="pulse" />
              Мне нравится
            </button>

            <button style={{
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
            }}
            >
              <AnimatedIcon name="star" size={20} animation="glow" />
              Добавить в избранное
            </button>

            <button style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
            >
              <AnimatedIcon name="shopping" size={20} animation="bounce" />
              Добавить в корзину
            </button>
          </div>
        </div>

        {/* Информация */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>ℹ️ Информация</h3>
          <p style={{ marginBottom: '10px' }}>
            Эта система иконок включает в себя:
          </p>
          <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <li>🎨 <strong>100+ иконок</strong> для всех категорий и действий</li>
            <li>✨ <strong>6 типов анимаций</strong>: bounce, pulse, rotate, shake, glow, float</li>
            <li>🎯 <strong>Тематические картинки</strong> с градиентами для категорий</li>
            <li>🎪 <strong>Интерактивные эффекты</strong> при наведении и клике</li>
            <li>📱 <strong>Адаптивный дизайн</strong> для всех устройств</li>
            <li>🎨 <strong>Настраиваемые размеры</strong> и цвета</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IconShowcase;
