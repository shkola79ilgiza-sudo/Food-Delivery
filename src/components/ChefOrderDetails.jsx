import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { updateOrderStatus } from '../api';
import '../App.css';

function ChefOrderDetails({ orderId, onClose, onStatusUpdate }) {
  const { showSuccess, showError } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Функция для отметки уведомления как прочитанного
  const markNotificationAsRead = useCallback((orderId) => {
    try {
      const notifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      const updatedNotifications = notifications.map(notification => {
        if (notification.orderId === orderId && !notification.read) {
          return { ...notification, read: true };
        }
        return notification;
      });
      localStorage.setItem('chefNotifications', JSON.stringify(updatedNotifications));
      
      // Отправляем событие об обновлении уведомлений
      window.dispatchEvent(new CustomEvent('chefNotificationsUpdated'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const loadOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ищем заказ в localStorage
      const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const foundOrder = clientOrders.find(o => o.id === orderId);
      
      if (foundOrder) {
        console.log('Загружен заказ:', foundOrder);
        console.log('Суммы заказа:', {
          itemsTotal: foundOrder.itemsTotal,
          subtotal: foundOrder.subtotal,
          deliveryFee: foundOrder.deliveryFee,
          deliveryCost: foundOrder.deliveryCost,
          total: foundOrder.total,
          transaction: foundOrder.transaction,
          payment: foundOrder.payment
        });
        console.log('Клиент:', foundOrder.customer);
        console.log('Доставка:', foundOrder.delivery);
        console.log('Комментарий:', foundOrder.comment);
        console.log('Промокод:', foundOrder.promo);
        console.log('Скидка:', foundOrder.discount);
        console.log('Статус:', foundOrder.status);
        console.log('Дата создания:', foundOrder.createdAt);
        setOrder(foundOrder);
        
        // Отмечаем уведомление как прочитанное при просмотре заказа
        markNotificationAsRead(orderId);
      } else {
        console.error('Заказ не найден:', orderId);
        console.log('Доступные заказы:', clientOrders.map(o => o.id));
        showError(`Заказ ${orderId} не найден`);
        onClose();
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      showError('Ошибка загрузки заказа');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [orderId, showError, markNotificationAsRead, onClose]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      
      // Используем функцию из api.js для обновления статуса
      await updateOrderStatus(orderId, newStatus, order?.items?.[0]?.chefId || 'unknown');
      
      // Обновляем локальное состояние
      setOrder(prev => ({ ...prev, status: newStatus }));
      
      showSuccess(`Статус заказа изменен на: ${getStatusText(newStatus)}`);
      
      if (onStatusUpdate) {
        onStatusUpdate(orderId, newStatus);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Ошибка обновления статуса');
    } finally {
      setUpdating(false);
    }
  };


  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает подтверждения',
      'pending_confirmation': 'Ожидает подтверждения',
      'pending_payment': 'Ожидает оплаты',
      'confirmed': 'Подтвержден',
      'preparing': 'Готовится',
      'ready': 'Готов к выдаче',
      'delivering': 'Доставляется',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': '#ff9800',
      'pending_confirmation': '#ff9800',
      'pending_payment': '#ff5722',
      'confirmed': '#2196f3',
      'preparing': '#ff5722',
      'ready': '#4caf50',
      'delivering': '#9c27b0',
      'delivered': '#8bc34a',
      'cancelled': '#f44336'
    };
    return colorMap[status] || '#666';
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Не указано';
    }
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Не указано';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return dateString;
    }
  };

  const getDeliveryUrgency = (deliveryDate, deliveryTime) => {
    if (!deliveryDate || !deliveryTime) return null;
    
    try {
      const now = new Date();
      const delivery = new Date(`${deliveryDate} ${deliveryTime}`);
      const diffHours = (delivery - now) / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        return <span className="urgency-urgent">🔥 СРОЧНО! Менее часа до доставки</span>;
      } else if (diffHours < 3) {
        return <span className="urgency-high">⚠️ Срочно! Менее 3 часов до доставки</span>;
      } else if (diffHours < 24) {
        return <span className="urgency-medium">⏰ Сегодня до {deliveryTime}</span>;
      } else {
        return <span className="urgency-low">📅 {formatDeliveryDate(deliveryDate)} в {deliveryTime}</span>;
      }
    } catch {
      return <span className="urgency-unknown">❓ Время доставки не определено</span>;
    }
  };

  // AI-подсказка с таймером
  const getAITimerHint = (deliveryDate, deliveryTime) => {
    if (!deliveryDate || !deliveryTime) return null;
    
    try {
      const now = new Date();
      const delivery = new Date(`${deliveryDate} ${deliveryTime}`);
      const diffMinutes = Math.round((delivery - now) / (1000 * 60));
      
      if (diffMinutes > 0 && diffMinutes < 60) {
        return (
          <div className="ai-timer-hint">
            <div className="ai-icon">🤖</div>
            <div className="ai-message">
              <strong>AI-подсказка:</strong> У вас осталось {diffMinutes} мин. на заказ #{order.id}
            </div>
          </div>
        );
      }
    } catch {
      return null;
    }
    return null;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'card': '💳 Банковская карта',
      'cash': '💵 Наличные при получении',
      'online': '🌐 Онлайн оплата',
      'apple_pay': '🍎 Apple Pay',
      'google_pay': '🤖 Google Pay'
    };
    return methods[method] || method || 'Не указано';
  };

  const getPaymentStatus = (status) => {
    const statuses = {
      'pending': '⏳ Ожидает оплаты',
      'paid': '✅ Оплачено',
      'failed': '❌ Ошибка оплаты',
      'refunded': '↩️ Возврат'
    };
    return statuses[status] || status || 'Не указано';
  };

  const getDeliveryReadinessStatus = (orderStatus) => {
    const statuses = {
      'pending': '⏳ Ожидает подтверждения',
      'confirmed': '👨‍🍳 Готовится',
      'preparing': '👨‍🍳 Готовится',
      'ready': '✅ Готов к выдаче',
      'delivering': '🚚 В пути',
      'delivered': '✅ Доставлен',
      'cancelled': '❌ Отменен'
    };
    return statuses[orderStatus] || 'Неизвестно';
  };

  if (loading) {
    return (
      <div className="chef-order-details-modal-overlay">
        <div className="chef-order-details-modal">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Загружаем детали заказа...</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              ID заказа: {orderId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="chef-order-details-modal-overlay">
        <div className="chef-order-details-modal">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Заказ не найден</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              ID заказа: {orderId}
            </p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              Проверьте консоль для отладочной информации
            </p>
            <button onClick={onClose} className="back-button">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-order-details-modal-overlay" onClick={onClose}>
      <div className="chef-order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chef-order-details-header">
          <h3>Детали заказа #{order.id}</h3>
          <button onClick={onClose} className="back-button">
            ✕
          </button>
        </div>

        <div className="chef-order-details-content">
          {/* Информация о клиенте */}
          <div className="order-section">
            <h4>👤 Информация о клиенте</h4>
            <div className="order-info-grid">
              <div className="info-item">
                <strong>Имя:</strong> {order.customer?.name || order.clientName || 'Не указано'}
              </div>
              <div className="info-item">
                <strong>Телефон:</strong> {order.customer?.phone || order.clientPhone || 'Не указано'}
              </div>
              <div className="info-item">
                <strong>Адрес доставки:</strong> {order.delivery?.address || order.deliveryAddress || (order.delivery?.type === 'pickup' ? 'Самовывоз' : 'Не указано')}
              </div>
              <div className="info-item">
                <strong>Время заказа:</strong> {formatTime(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Время доставки */}
          <div className="order-section">
            <h4>⏰ Время доставки</h4>
            <div className="delivery-time-info">
              <div className="delivery-time-main">
                <div className="delivery-date">
                  <strong>Дата доставки:</strong> {formatDeliveryDate(order.delivery?.date)}
                </div>
                <div className="delivery-time">
                  <strong>Время доставки:</strong> {order.delivery?.time || 'Не указано'}
                </div>
                <div className="delivery-type">
                  <strong>Тип доставки:</strong> {order.delivery?.type === 'pickup' ? 'Самовывоз' : 'Доставка'}
                </div>
              </div>
              <div className="delivery-urgency">
                {getDeliveryUrgency(order.delivery?.date, order.delivery?.time)}
              </div>
              {/* AI-подсказка с таймером */}
              {getAITimerHint(order.delivery?.date, order.delivery?.time)}
            </div>
          </div>

          {/* Способ оплаты */}
          <div className="order-section">
            <h4>💳 Способ оплаты</h4>
            <div className="payment-info">
              <div className="payment-method">
                <strong>Способ:</strong> {getPaymentMethodText(order.payment?.method)}
              </div>
              <div className="payment-status">
                <strong>Статус:</strong> {getPaymentStatus(order.payment?.status)}
              </div>
            </div>
          </div>

          {/* Комментарии и инструкции */}
          {(order.comment || order.specialInstructions) && (
            <div className="order-section">
              <h4>📝 Комментарии и инструкции</h4>
              <div className="comments-info">
                {order.comment && (
                  <div className="comment-item">
                    <strong>Комментарий клиента:</strong>
                    <p>{order.comment}</p>
                  </div>
                )}
                {order.specialInstructions && (
                  <div className="comment-item">
                    <strong>Специальные инструкции:</strong>
                    <p>{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Комментарий к заказу (если есть) */}
          {order.comment && (
            <div className="order-section">
              <h4>💬 Комментарий к заказу</h4>
              <div className="order-comment">
                <p>{order.comment}</p>
              </div>
            </div>
          )}

          {/* Информация для доставщика */}
          <div className="order-section">
            <h4>🚚 Информация для доставщика</h4>
            <div className="delivery-info">
              <div className="delivery-code">
                <strong>Код заказа:</strong> #{order.id}
              </div>
              <div className="delivery-address">
                <strong>Адрес:</strong> {order.delivery?.address || order.deliveryAddress || (order.delivery?.type === 'pickup' ? 'Самовывоз' : 'Не указано')}
              </div>
              <div className="delivery-contact">
                <strong>Контакт:</strong> {order.customer?.name || order.clientName || 'Не указано'} - {order.customer?.phone || order.clientPhone || 'Не указано'}
              </div>
              <div className="delivery-status">
                <strong>Статус готовности:</strong> {getDeliveryReadinessStatus(order.status)}
              </div>
            </div>
          </div>

          {/* Статус заказа */}
          <div className="order-section">
            <h4>📊 Статус заказа</h4>
            <div 
              className="order-status"
              style={{ 
                backgroundColor: getStatusColor(order.status),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                fontWeight: 'bold'
              }}
            >
              {getStatusText(order.status)}
            </div>
          </div>

          {/* Блюда в заказе */}
          <div className="order-section">
            <h4>🍽️ Блюда в заказе</h4>
            <div className="order-items">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-description">{item.description}</div>
                    </div>
                    <div className="item-details">
                      <div className="item-quantity">Количество: {item.quantity}</div>
                      <div className="item-price">{item.price}₽ за шт.</div>
                      <div className="item-total">Итого: {item.price * item.quantity}₽</div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет блюд в заказе</p>
              )}
            </div>
          </div>

          {/* Итоговая сумма */}
          <div className="order-section">
            <h4>💰 Итоговая сумма</h4>
            <div className="order-total">
              <div className="total-line">
                <span>Стоимость блюд:</span>
                <span>{order.itemsTotal || order.subtotal || (order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0)}₽</span>
              </div>
              <div className="total-line">
                <span>Доставка:</span>
                <span>{order.deliveryFee || order.deliveryCost || 0}₽</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="total-line discount">
                  <span>Скидка:</span>
                  <span>-{order.discount}₽</span>
                </div>
              )}
              {order.promo && (
                <div className="total-line promo">
                  <span>Промокод:</span>
                  <span>{order.promo}</span>
                </div>
              )}
              <div className="total-line final">
                <span><strong>Итого к оплате:</strong></span>
                <span><strong>{order.total || order.payment?.total || 0}₽</strong></span>
              </div>
            </div>
          </div>

          {/* Информация о транзакции */}
          <div className="order-section">
            <h4>💳 Информация о транзакции</h4>
            <div className="transaction-info">
              <div className="transaction-item">
                <strong>Общая сумма:</strong> {order.transaction?.totalAmount || order.payment?.total || order.total || 0}₽
              </div>
              <div className="transaction-item">
                <strong>Комиссия платформы (10%):</strong> {order.transaction?.commission || order.payment?.commission || Math.round((order.total || 0) * 0.1)}₽
              </div>
              <div className="transaction-item">
                <strong>К получению поваром:</strong> {order.transaction?.chefAmount || order.payment?.chefAmount || Math.round((order.total || 0) * 0.9)}₽
              </div>
              <div className="transaction-item">
                <strong>Статус платежа:</strong> {order.transaction?.status === 'reserved' ? 'Зарезервировано' : order.transaction?.status || 'Ожидает оплаты'}
              </div>
              <div className="transaction-item">
                <strong>Способ оплаты:</strong> {order.payment?.method || 'Не указано'}
              </div>
            </div>
          </div>

          {/* Действия повара */}
          <div className="order-section">
            <h4>⚡ Действия</h4>
            <div className="chef-actions">
              {(order.status === 'pending' || order.status === 'pending_confirmation' || order.status === 'pending_payment') && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={updating}
                    className="action-btn confirm-btn"
                  >
                    ✅ Принять заказ
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="action-btn cancel-btn"
                  >
                    ❌ Отклонить заказ
                  </button>
                </>
              )}
              
              {order.status === 'confirmed' && (
                <button 
                  onClick={() => handleStatusUpdate('preparing')}
                  disabled={updating}
                  className="action-btn preparing-btn"
                >
                  👨‍🍳 Начать приготовление
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button 
                  onClick={() => handleStatusUpdate('ready')}
                  disabled={updating}
                  className="action-btn ready-btn"
                >
                  ✅ Готово к выдаче
                </button>
              )}
              
              {order.status === 'ready' && (
                <button 
                  onClick={() => handleStatusUpdate('delivering')}
                  disabled={updating}
                  className="action-btn delivering-btn"
                >
                  🚚 Отправить на доставку
                </button>
              )}
              
              {order.status === 'delivering' && (
                <button 
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updating}
                  className="action-btn delivered-btn"
                >
                  ✅ Завершить доставку
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefOrderDetails;
