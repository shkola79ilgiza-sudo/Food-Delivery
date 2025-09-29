import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { placeOrder } from '../api';

const QuickOrder = ({ dishes, onClose }) => {
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({
    method: 'delivery',
    address: '',
    date: '',
    time: '',
    comment: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Загружаем сохраненные данные из localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedDelivery = JSON.parse(localStorage.getItem('deliveryInfo') || '{}');
    const savedPayment = JSON.parse(localStorage.getItem('paymentInfo') || '{}');
    
    setSelectedDishes(savedCart);
    if (Object.keys(savedDelivery).length > 0) {
      setDeliveryInfo(prev => ({ ...prev, ...savedDelivery }));
    }
    if (Object.keys(savedPayment).length > 0) {
      setPaymentInfo(prev => ({ ...prev, ...savedPayment }));
    }
  }, []);

  // Сохраняем данные при изменении
  useEffect(() => {
    if (selectedDishes.length > 0) {
      localStorage.setItem('cart', JSON.stringify(selectedDishes));
    }
  }, [selectedDishes]);

  useEffect(() => {
    if (deliveryInfo.address) {
      localStorage.setItem('deliveryInfo', JSON.stringify(deliveryInfo));
    }
  }, [deliveryInfo]);

  useEffect(() => {
    if (paymentInfo.method) {
      localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
    }
  }, [paymentInfo]);

  const addToCart = (dish) => {
    setSelectedDishes(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => 
          item.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId) => {
    setSelectedDishes(prev => prev.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setSelectedDishes(prev => 
      prev.map(item => 
        item.id === dishId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    const subtotal = selectedDishes.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryInfo.method === 'delivery' ? 150 : 0;
    return subtotal + deliveryFee;
  };

  const handleOrder = async () => {
    if (selectedDishes.length === 0) {
      showError('Выберите хотя бы одно блюдо');
      return;
    }

    if (deliveryInfo.method === 'delivery' && !deliveryInfo.address) {
      showError('Укажите адрес доставки');
      return;
    }

    if (!deliveryInfo.date || !deliveryInfo.time) {
      showError('Выберите дату и время доставки');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: selectedDishes,
        customer: {
          name: 'Клиент',
          phone: '+7 (999) 123-45-67',
          address: deliveryInfo.method === 'delivery' ? deliveryInfo.address : 'Самовывоз'
        },
        delivery: {
          method: deliveryInfo.method,
          address: deliveryInfo.address,
          date: deliveryInfo.date,
          time: deliveryInfo.time
        },
        payment: {
          method: paymentInfo.method,
          status: paymentInfo.status
        },
        comment: deliveryInfo.comment,
        total: calculateTotal()
      };

      const result = await placeOrder(orderData);
      
      if (result.success) {
        // Очищаем корзину
        localStorage.removeItem('cart');
        localStorage.removeItem('deliveryInfo');
        localStorage.removeItem('paymentInfo');
        
        showSuccess('Заказ успешно оформлен!');
        navigate('/client/order-confirmation', { state: { order: result.order } });
      }
    } catch (error) {
      showError('Ошибка при оформлении заказа');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryTimeOptions = () => {
    const options = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' });
      
      options.push(
        <option key={dateStr} value={dateStr}>
          {dayName}, {date.toLocaleDateString('ru-RU')}
        </option>
      );
    }
    
    return options;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(
          <option key={timeStr} value={timeStr}>
            {timeStr}
          </option>
        );
      }
    }
    return slots;
  };

  return (
    <div className="quick-order">
      <div className="quick-order-header">
        <h2>🛒 Быстрый заказ</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="quick-order-content">
        {/* Выбор блюд */}
        <div className="dishes-section">
          <h3>🍽️ Выберите блюда</h3>
          <div className="dishes-grid">
            {dishes.slice(0, 6).map(dish => (
              <div key={dish.id} className="dish-card">
                <div className="dish-info">
                  <h4>{dish.name}</h4>
                  <p>{dish.description}</p>
                  <div className="dish-price">{dish.price} ₽</div>
                </div>
                <div className="dish-actions">
                  <button 
                    onClick={() => addToCart(dish)}
                    className="add-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Корзина */}
        {selectedDishes.length > 0 && (
          <div className="cart-section">
            <h3>🛒 Ваш заказ</h3>
            <div className="cart-items">
              {selectedDishes.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price} ₽</span>
                  </div>
                  <div className="item-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Доставка */}
        <div className="delivery-section">
          <h3>🚚 Способ получения</h3>
          <div className="delivery-options">
            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={deliveryInfo.method === 'delivery'}
                onChange={(e) => {
                  console.log('Delivery selected:', e.target.value);
                  setDeliveryInfo(prev => ({ ...prev, method: e.target.value }));
                }}
              />
              <span>Доставка (+150 ₽)</span>
            </label>
            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryInfo.method === 'pickup'}
                onChange={(e) => {
                  console.log('Pickup selected:', e.target.value);
                  setDeliveryInfo(prev => ({ ...prev, method: e.target.value }));
                }}
              />
              <span>Самовывоз</span>
            </label>
          </div>

          {deliveryInfo.method === 'delivery' && (
            <div className="delivery-form">
              <input
                type="text"
                placeholder="Адрес доставки"
                value={deliveryInfo.address}
                onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                className="address-input"
              />
            </div>
          )}

          <div className="time-selection">
            <div className="date-time-row">
              <select
                value={deliveryInfo.date}
                onChange={(e) => setDeliveryInfo(prev => ({ ...prev, date: e.target.value }))}
                className="date-select"
              >
                <option value="">Выберите дату</option>
                {getDeliveryTimeOptions()}
              </select>
              
              <select
                value={deliveryInfo.time}
                onChange={(e) => setDeliveryInfo(prev => ({ ...prev, time: e.target.value }))}
                className="time-select"
              >
                <option value="">Выберите время</option>
                {getTimeSlots()}
              </select>
            </div>
          </div>

          <textarea
            placeholder="Комментарий к заказу (необязательно)"
            value={deliveryInfo.comment}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, comment: e.target.value }))}
            className="comment-input"
          />
        </div>

        {/* Оплата */}
        <div className="payment-section">
          <h3>💳 Способ оплаты</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentInfo.method === 'card'}
                onChange={(e) => {
                  console.log('Card payment selected:', e.target.value);
                  setPaymentInfo(prev => ({ ...prev, method: e.target.value }));
                }}
              />
              <span>💳 Карта</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentInfo.method === 'cash'}
                onChange={(e) => {
                  console.log('Cash payment selected:', e.target.value);
                  setPaymentInfo(prev => ({ ...prev, method: e.target.value }));
                }}
              />
              <span>💵 Наличные</span>
            </label>
          </div>
        </div>

        {/* Итого и кнопка заказа */}
        <div className="order-summary">
          <div className="total-breakdown">
            <div className="total-line">
              <span>Сумма заказа:</span>
              <span>{selectedDishes.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽</span>
            </div>
            {deliveryInfo.method === 'delivery' && (
              <div className="total-line">
                <span>Доставка:</span>
                <span>150 ₽</span>
              </div>
            )}
            <div className="total-line total-final">
              <span>Итого:</span>
              <span>{calculateTotal()} ₽</span>
            </div>
          </div>
          
          <button 
            onClick={handleOrder}
            disabled={loading || selectedDishes.length === 0}
            className="order-button"
          >
            {loading ? 'Оформляем заказ...' : `Заказать за ${calculateTotal()} ₽`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickOrder;
