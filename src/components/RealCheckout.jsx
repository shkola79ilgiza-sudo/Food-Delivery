import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../api/backend';
import { useToast } from '../contexts/ToastContext';
import './RealCheckout.css';

const RealCheckout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Загрузка корзины
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);

    // Загружаем адрес из профиля клиента
    if (user?.client?.address) {
      setDeliveryAddress(user.client.address);
    }
  }, [user]);

  // Расчет суммы
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = subtotal * 0.1;
  const total = subtotal + platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError('Пожалуйста, войдите в систему');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      showError('Корзина пуста');
      return;
    }

    setLoading(true);

    try {
      // Создаем заказ через backend API
      const orderData = {
        items: cart.map(item => ({
          dishId: item.id,
          quantity: item.quantity,
          notes: item.notes || '',
        })),
        deliveryAddress,
        notes,
      };

      const order = await ordersAPI.create(orderData);

      // Очищаем корзину
      localStorage.removeItem('cart');
      setCart([]);

      showSuccess('Заказ успешно создан!');
      
      // Перенаправляем на страницу подтверждения
      navigate('/order-confirmation', {
        state: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            items: order.items,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
          },
        },
      });
    } catch (error) {
      console.error('Error creating order:', error);
      showError(error.message || 'Ошибка при создании заказа');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>🛒 Корзина пуста</h2>
          <p>Добавьте блюда из меню</p>
          <button onClick={() => navigate('/client/menu')}>
            Перейти в меню
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1>🛒 Оформление заказа</h1>

        {/* Список блюд */}
        <div className="order-items">
          <h2>Ваш заказ:</h2>
          {cart.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>Количество: {item.quantity}</p>
                {item.notes && <p className="item-notes">Примечание: {item.notes}</p>}
              </div>
              <div className="item-price">
                {item.price * item.quantity}₽
              </div>
            </div>
          ))}
        </div>

        {/* Форма доставки */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Адрес доставки:</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="ул. Пушкина, д. 10, кв. 5"
              required
            />
          </div>

          <div className="form-group">
            <label>Комментарий к заказу:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Позвоните за 10 минут до доставки..."
              rows="3"
            />
          </div>

          {/* Итого */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Сумма заказа:</span>
              <span>{subtotal}₽</span>
            </div>
            <div className="summary-row">
              <span>Комиссия платформы (10%):</span>
              <span>{platformFee.toFixed(0)}₽</span>
            </div>
            <div className="summary-row total">
              <span>Итого:</span>
              <span>{total.toFixed(0)}₽</span>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RealCheckout;

