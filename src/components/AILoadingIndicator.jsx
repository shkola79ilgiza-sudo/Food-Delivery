/**
 * Улучшенный индикатор загрузки AI-функций
 * Интерактивные сообщения и анимации
 * @author Food Delivery Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';

const AILoadingIndicator = ({ 
  type = 'menu', // 'menu', 'promo', 'photo'
  isGenerating = false,
  progress = 0,
  onCancel = null
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [dots, setDots] = useState('');

  // Сообщения для разных типов AI-функций
  const messages = {
    menu: [
      "🤖 AI анализирует ваши блюда...",
      "🎨 Создаем праздничное меню...",
      "🍽️ Подбираем идеальные сочетания...",
      "✨ Финализируем детали...",
      "🎉 Почти готово!"
    ],
    promo: [
      "📝 AI изучает ваше блюдо...",
      "💭 Придумываем продающий текст...",
      "🎯 Адаптируем под праздник...",
      "📱 Оптимизируем для соцсетей...",
      "🚀 Готово к публикации!"
    ],
    photo: [
      "📸 Анализируем фотографию...",
      "🔍 Определяем ингредиенты...",
      "📊 Рассчитываем калории...",
      "🏷️ Генерируем описание...",
      "✅ Анализ завершен!"
    ]
  };

  const currentMessages = messages[type] || messages.menu;

  // Анимация точек
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Смена сообщений
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % currentMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating, currentMessages.length]);

  if (!isGenerating) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'fadeInUp 0.5s ease-out'
      }}>
        {/* Анимированный логотип AI */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            animation: 'pulse 2s infinite',
            boxShadow: '0 0 30px rgba(76, 175, 80, 0.5)'
          }}>
            🤖
          </div>
          
          {/* Крутящиеся элементы */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '-10px',
            right: '-10px',
            bottom: '-10px',
            border: '3px solid transparent',
            borderTop: '3px solid #4CAF50',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite'
          }} />
        </div>

        {/* Сообщение */}
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#333',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {currentMessages[currentMessage]}
          {dots}
        </h3>

        {/* Прогресс бар */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#f0f0f0',
          borderRadius: '3px',
          margin: '20px 0',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
            animation: progress > 0 ? 'none' : 'shimmer 2s infinite'
          }} />
        </div>

        {/* Статистика */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          margin: '20px 0',
          fontSize: '14px',
          color: '#666'
        }}>
          <div>
            <div style={{ fontWeight: '600', color: '#4CAF50' }}>AI</div>
            <div>Активно</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#2196F3' }}>{progress}%</div>
            <div>Готово</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#FF9800' }}>~30с</div>
            <div>Осталось</div>
          </div>
        </div>

        {/* Кнопка отмены */}
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.borderColor = '#bbb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#ddd';
            }}
          >
            Отменить генерацию
          </button>
        )}

        {/* Подсказка */}
        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#999',
          fontStyle: 'italic'
        }}>
          💡 AI работает над вашим запросом...
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AILoadingIndicator;
