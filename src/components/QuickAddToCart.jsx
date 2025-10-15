import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const QuickAddToCart = ({ dish, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const handleQuickAdd = async (event) => {
    setIsAdding(true);
    
    try {
      // Получаем текущую корзину
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Проверяем, есть ли уже это блюдо в корзине
      const existingItemIndex = currentCart.findIndex(item => item.id === dish.id);
      
      if (existingItemIndex >= 0) {
        // Увеличиваем количество
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        // Добавляем новое блюдо
        currentCart.push({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: quantity,
          chef: dish.chef,
          image: dish.image,
          description: dish.description
        });
      }
      
      // Сохраняем обновлённую корзину
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      // Уведомляем другие компоненты об изменении
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Показываем уведомление
      showSuccess(`✅ ${dish.name} добавлено в корзину!`);
      
      // Вызываем callback если есть, передаем event для анимации
      if (onAdd) {
        onAdd(dish, quantity, event);
      }
      
      // Сбрасываем количество
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Ошибка при добавлении в корзину');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="quick-add-to-cart" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '10px'
    }}>
      {/* Счётчик количества */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '2px solid #e0e0e0',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'white'
      }}>
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          style={{
            border: 'none',
            background: '#f5f5f5',
            padding: '8px 12px',
            cursor: quantity > 1 ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            color: quantity > 1 ? '#2D5016' : '#ccc',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (quantity > 1) {
              e.target.style.background = '#e0e0e0';
            }
          }}
          onMouseLeave={(e) => {
            if (quantity > 1) {
              e.target.style.background = '#f5f5f5';
            }
          }}
        >
          −
        </button>
        
        <span style={{
          padding: '8px 16px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#2D5016',
          minWidth: '40px',
          textAlign: 'center'
        }}>
          {quantity}
        </span>
        
        <button
          onClick={() => setQuantity(quantity + 1)}
          style={{
            border: 'none',
            background: '#f5f5f5',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#2D5016',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f5f5f5';
          }}
        >
          +
        </button>
      </div>

      {/* Кнопка добавления */}
      <button
        onClick={(e) => handleQuickAdd(e)}
        disabled={isAdding}
        style={{
          background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: isAdding ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)',
          opacity: isAdding ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          if (!isAdding) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAdding) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
          }
        }}
      >
        {isAdding ? (
          <>
            <span>⏳</span>
            Добавляем...
          </>
        ) : (
          <>
            <span>🛒</span>
            В корзину
          </>
        )}
      </button>
    </div>
  );
};

export default QuickAddToCart;
