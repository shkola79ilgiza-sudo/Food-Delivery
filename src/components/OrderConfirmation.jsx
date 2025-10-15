import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import FeedbackModal from './FeedbackModal';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Загружаем данные последнего заказа
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      try {
        setOrder(JSON.parse(lastOrder));
      } catch (err) {
        console.error('Error parsing last order:', err);
        navigate('/client/menu');
      }
    } else {
      navigate('/client/menu');
    }
    setLoading(false);
  }, [navigate]);

  const handleContinueShopping = () => {
    localStorage.removeItem('lastOrder');
    navigate('/client/menu');
  };

  const handleRateOrder = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = (feedback) => {
    // Сохраняем оценку заказа
    try {
      const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const orderIndex = orders.findIndex(o => o.id === order.id);
      
      if (orderIndex !== -1) {
        orders[orderIndex].rating = feedback.rating;
        orders[orderIndex].review = feedback.review;
        orders[orderIndex].ratedAt = new Date().toISOString();
        localStorage.setItem('clientOrders', JSON.stringify(orders));
      }
      
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error saving order rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">Заказ не найден</div>
        <Link to="/client/menu" className="continue-shopping">
          Вернуться в меню
        </Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-content">
        <div className="success-icon">✅</div>
        <h1>{t.orderPlaced}</h1>
        <p className="order-number">{t.orderNumber}: {order.id}</p>
        
        <div className="order-details">
          <h2>{t.orderDetails}</h2>
          
          <div className="order-info">
            <div className="info-section">
              <h3>{t.customer}</h3>
              <p><strong>{t.name}:</strong> {order.customer.name}</p>
              <p><strong>{t.phone}:</strong> {order.customer.phone}</p>
              <p><strong>{t.address}:</strong> {order.customer.address}</p>
            </div>
            
            <div className="info-section">
              <h3>{t.delivery}</h3>
              <p><strong>{t.date}:</strong> {new Date(order.delivery.date).toLocaleDateString('ru-RU')}</p>
              <p><strong>{t.time}:</strong> {order.delivery.time}</p>
              {order.comment && (
                <p><strong>{t.orderComment}:</strong> {order.comment}</p>
              )}
            </div>
            
            <div className="info-section">
              <h3>{t.payment}</h3>
              <p><strong>{t.method}:</strong> {
                order.payment.method === 'cash' ? t.cashOnDelivery :
                order.payment.method === 'card' ? t.cardOnline :
                order.payment.method === 'apple-pay' ? t.applePay :
                order.payment.method === 'google-pay' ? t.googlePay :
                t.onlinePayment
              }</p>
              <p><strong>{t.totalToPay}:</strong> {order.payment.total} ₽</p>
              {order.payment.commission && (
                <>
                  <p><strong>{t.serviceCommission}</strong> {order.payment.commission} ₽</p>
                  <p><strong>{t.chefWillReceive}</strong> {order.payment.chefAmount} ₽</p>
                </>
              )}
              <p><strong>{t.status}:</strong> {
                order.status === 'pending_payment' ? t.pendingPayment :
                order.status === 'pending_confirmation' ? t.pendingConfirmation :
                t.processed
              }</p>
            </div>
          </div>
          
          <div className="order-items">
            <h3>{t.itemsInOrder}</h3>
            {order.items.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-quantity">{item.quantity} ×</div>
                <div className="item-name">{item.name}</div>
                <div className="item-price">{item.price * item.quantity} ₽</div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>Сумма товаров:</span>
              <span>{order.subtotal} ₽</span>
            </div>
            {order.discount > 0 && (
              <div className="total-row discount">
                <span>Скидка:</span>
                <span>-{order.discount} ₽</span>
              </div>
            )}
            <div className="total-row">
              <span>Доставка:</span>
              <span>{order.deliveryCost > 0 ? `${order.deliveryCost} ₽` : 'Бесплатно'}</span>
            </div>
            
            {/* Информация о комиссии */}
            {order.payment.commission && (
              <div className="commission-breakdown">
                <div className="total-row">
                  <span>Комиссия сервиса (10%):</span>
                  <span className="commission-amount">{order.payment.commission} ₽</span>
                </div>
                <div className="total-row chef-amount">
                  <span>Повар получит:</span>
                  <span className="chef-amount-value">{order.payment.chefAmount} ₽</span>
                </div>
              </div>
            )}
            
            <div className="total-row final">
              <span>Итого к оплате:</span>
              <span>{order.payment.total} ₽</span>
            </div>
          </div>
        </div>
        
        <div className="confirmation-actions">
          <button onClick={handleRateOrder} className="rate-order-button">
            ⭐ Оценить заказ
          </button>
          <button onClick={handleContinueShopping} className="continue-shopping-button">
            Продолжить покупки
          </button>
          <Link to="/client/orders" className="view-orders-button">
            Мои заказы
          </Link>
        </div>
        
        <div className="contact-info">
          <h3>Нужна помощь?</h3>
          <p>Если у вас есть вопросы по заказу, свяжитесь с нами:</p>
          <p><strong>Телефон:</strong> +7 (999) 123-45-67</p>
          <p><strong>Email:</strong> support@fooddelivery.com</p>
        </div>
      </div>
      
      {/* Модальное окно оценки заказа */}
      {showFeedbackModal && (
        <FeedbackModal
          orderId={order.id}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default OrderConfirmation;