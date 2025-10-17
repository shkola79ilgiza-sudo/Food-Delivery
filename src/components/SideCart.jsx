import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SideCart = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
    handleClose();
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="cart-overlay"
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* Side Cart */}
      <div className={`side-cart ${isOpen ? 'open' : ''} ${isAnimating ? 'slide-in-right' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">
            🛒 Корзина ({cart.length})
          </h2>
          <button className="cart-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#7f8c8d'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛒</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Корзина пуста</h3>
              <p style={{ margin: 0 }}>Добавьте блюда из меню</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item bounce-in">
                <img 
                  src={item.image || '/images/default-dish.jpg'} 
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">{item.price} ₽</p>
                </div>
                <div className="cart-item-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="cart-item-quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="total-label">Итого:</span>
              <span className="total-amount">{calculateTotal()} ₽</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              🚀 Оформить заказ
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default SideCart;
