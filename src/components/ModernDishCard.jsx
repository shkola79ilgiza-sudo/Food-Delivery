import React, { useState } from 'react';

const ModernDishCard = ({ dish, onAddToCart, onRemoveFromCart, cartQuantity = 0 }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(dish);
      // Анимация успеха
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      setIsAdding(false);
    }
  };

  const handleRemoveFromCart = () => {
    onRemoveFromCart(dish.id);
  };

  const getBadgeText = () => {
    if (dish.isNew) return 'Новинка';
    if (dish.isPopular) return 'Популярное';
    if (dish.isSpicy) return 'Острое';
    if (dish.isVegetarian) return 'Вегетарианское';
    return null;
  };

  const badgeText = getBadgeText();

  return (
    <div className="modern-dish-card">
      {/* Изображение блюда */}
      <div className="dish-image-container">
        <img 
          src={dish.image || '/images/default-dish.jpg'} 
          alt={dish.name}
          className="dish-image"
        />
        {badgeText && (
          <div className="dish-badge">
            {badgeText}
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="dish-content">
        <h3 className="dish-title">{dish.name}</h3>
        <p className="dish-description">{dish.description}</p>
        
        {/* Мета-информация */}
        <div className="dish-meta">
          <span className="dish-price">{dish.price} ₽</span>
          <span className="dish-weight">{dish.weight || '300г'}</span>
        </div>

        {/* Рейтинг */}
        {dish.rating && (
          <div className="dish-rating">
            <span className="rating-stars">
              {'★'.repeat(Math.floor(dish.rating))}
              {'☆'.repeat(5 - Math.floor(dish.rating))}
            </span>
            <span className="rating-count">({dish.reviewsCount || 0})</span>
          </div>
        )}

        {/* Действия */}
        <div className="dish-actions">
          {cartQuantity > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="quantity-btn"
                onClick={handleRemoveFromCart}
              >
                −
              </button>
              <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                {cartQuantity}
              </span>
              <button 
                className="quantity-btn"
                onClick={handleAddToCart}
              >
                +
              </button>
            </div>
          ) : (
            <button 
              className={`add-to-cart-btn ${isAdding ? 'pulse-animation' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <span className="cart-icon">🛒</span>
              {isAdding ? 'Добавлено!' : 'В корзину'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernDishCard;
