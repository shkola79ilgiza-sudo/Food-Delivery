import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ClientOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
      return;
    }

    // Загрузка данных заказа
    const fetchOrder = async () => {
      try {
        // Здесь будет API запрос для получения заказа
        // const response = await fetch(`api/client/orders/${orderId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.message || 'Ошибка при загрузке заказа');
        // setOrder(data);

        // Временные данные для демонстрации
        const mockOrder = {
          id: orderId || 'ORD-12345',
          date: '2023-06-15T10:30:00',
          status: 'delivering',
          items: [
            { name: 'Борщ', quantity: 1, price: 350 },
            { name: 'Пельмени', quantity: 2, price: 450 },
            { name: 'Компот', quantity: 1, price: 150 }
          ],
          subtotal: 1250,
          discount: 100,
          deliveryCost: 200,
          payment: {
            method: 'card',
            total: 1350
          },
          customer: {
            name: 'Иван Петров',
            phone: '+7 (999) 123-45-67',
            address: 'ул. Пушкина, д. 10, кв. 5'
          },
          delivery: {
            date: '2023-06-15',
            time: '12:30-13:00'
          },
          chef: {
            id: 1,
            name: 'Мария Иванова',
            rating: 4.8
          },
          comment: 'Позвоните за 10 минут до доставки'
        };
        
        setOrder(mockOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Произошла ошибка при загрузке заказа');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // Форматирование даты заказа
  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Форматирование времени доставки
  const formatDeliveryTime = (date, time) => {
    if (!date || !time) return 'Не указано';
    
    const deliveryDate = new Date(date);
    const day = deliveryDate.getDate().toString().padStart(2, '0');
    const month = (deliveryDate.getMonth() + 1).toString().padStart(2, '0');
    const year = deliveryDate.getFullYear();
    
    return `${day}.${month}.${year} в ${time}`;
  };

  // Форматирование статуса заказа
  const formatStatus = (status) => {
    const statusMap = {
      'new': 'Новый',
      'processing': 'В обработке',
      'cooking': 'Готовится',
      'delivering': 'В пути',
      'completed': 'Доставлен',
      'cancelled': 'Отменен'
    };
    
    return statusMap[status] || status;
  };

  // Форматирование способа оплаты
  const formatPaymentMethod = (method) => {
    const methodMap = {
      'cash': 'Наличными при получении',
      'card': 'Картой при получении',
      'online': 'Онлайн оплата'
    };
    
    return methodMap[method] || method;
  };

  // Обработчик отмены заказа
  const handleCancelOrder = async () => {
    if (!window.confirm('Вы уверены, что хотите отменить заказ?')) return;
    
    setLoading(true);
    try {
      // Здесь будет API запрос для отмены заказа
      // const response = await fetch(`api/client/orders/${orderId}/cancel`, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Ошибка при отмене заказа');
      
      // Имитация успешной отмены
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
      alert('Заказ успешно отменен');
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Произошла ошибка при отмене заказа');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик повторного заказа
  const handleReorder = () => {
    // Сохраняем товары из заказа в корзину
    const cartItems = order.items.map(item => ({
      id: Math.random().toString(36).substr(2, 9), // Временный ID
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/client/cart');
  };

  if (loading) {
    return <div className="loading">Загрузка информации о заказе...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Заказ не найден</h2>
        <p>Запрошенный заказ не существует или был удален</p>
        <Link to="/client/orders" className="back-button">Вернуться к списку заказов</Link>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <h1>Заказ #{order.id}</h1>
        <div className="order-date">
          от {formatOrderDate(order.date)}
        </div>
      </div>

      <div className="order-status-card">
        <div className="status-icon">
          {order.status === 'new' && '🆕'}
          {order.status === 'processing' && '⏳'}
          {order.status === 'cooking' && '👨‍🍳'}
          {order.status === 'delivering' && '🚚'}
          {order.status === 'completed' && '✅'}
          {order.status === 'cancelled' && '❌'}
        </div>
        <div className="status-info">
          <h3>Статус заказа</h3>
          <p className={`status ${order.status}`}>{formatStatus(order.status)}</p>
        </div>
      </div>

      <div className="order-details-content">
        <div className="order-section">
          <h2>Информация о доставке</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Получатель:</span>
              <span className="info-value">{order.customer.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Телефон:</span>
              <span className="info-value">{order.customer.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Адрес:</span>
              <span className="info-value">{order.customer.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Время доставки:</span>
              <span className="info-value">{formatDeliveryTime(order.delivery.date, order.delivery.time)}</span>
            </div>
          </div>
        </div>

        <div className="order-section">
          <h2>Состав заказа</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-quantity">{item.quantity} ×</div>
                <div className="item-name">{item.name}</div>
                <div className="item-price">{item.price * item.quantity} ₽</div>
              </div>
            ))}
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Сумма товаров:</span>
              <span>{order.subtotal} ₽</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row discount">
                <span>Скидка:</span>
                <span>-{order.discount} ₽</span>
              </div>
            )}
            <div className="summary-row">
              <span>Доставка:</span>
              <span>{order.deliveryCost > 0 ? `${order.deliveryCost} ₽` : 'Бесплатно'}</span>
            </div>
            <div className="summary-row total">
              <span>Итого:</span>
              <span>{order.payment.total} ₽</span>
            </div>
          </div>
        </div>

        <div className="order-section">
          <h2>Информация об оплате</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Способ оплаты:</span>
              <span className="info-value">{formatPaymentMethod(order.payment.method)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Сумма:</span>
              <span className="info-value">{order.payment.total} ₽</span>
            </div>
          </div>
        </div>

        {order.chef && (
          <div className="order-section">
            <h2>Информация о поваре</h2>
            <div className="chef-card">
              <div className="chef-avatar">👨‍🍳</div>
              <div className="chef-info">
                <div className="chef-name">{order.chef.name}</div>
                <div className="chef-rating">⭐ {order.chef.rating}</div>
              </div>
              <Link to="/client/chat" className="contact-chef-button">
                Связаться
              </Link>
            </div>
          </div>
        )}

        {order.comment && (
          <div className="order-section">
            <h2>Комментарий к заказу</h2>
            <div className="order-comment">
              {order.comment}
            </div>
          </div>
        )}

        <div className="order-actions">
          {(order.status === 'new' || order.status === 'processing') && (
            <button 
              onClick={handleCancelOrder} 
              className="cancel-order-button"
              disabled={loading}
            >
              Отменить заказ
            </button>
          )}
          
          {order.status === 'completed' && (
            <button 
              onClick={handleReorder} 
              className="reorder-button"
            >
              Повторить заказ
            </button>
          )}
          
          <Link to="/client/orders" className="back-button">
            Вернуться к списку заказов
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientOrderDetails;