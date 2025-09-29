import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const ClientNotifications = ({ onClose, onSwitchToSection }) => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  
  // Используем хук для уведомлений
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification
  } = useNotifications('client');

  // Обработка клавиши Escape для закрытия модального окна
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const getTypeLabel = (type) => {
    const typeLabels = {
      newOrder: 'ЗАКАЗ',
      orderConfirmed: 'ПОДТВЕРЖДЕН',
      orderCompleted: 'ЗАВЕРШЕН',
      orderCancelled: 'ОТМЕНЕН',
      orderUpdate: 'ОБНОВЛЕНИЕ',
      help_guest_request: 'ПОМОЩЬ ГОСТЯМ',
      help_guest_update: 'ПОМОЩЬ ГОСТЯМ',
      help_guest_chat: 'ЧАТ',
      cooking_request_update: 'ГОТОВКА'
    };
    return typeLabels[type] || 'УВЕДОМЛЕНИЕ';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      newOrder: '#007bff',
      orderConfirmed: '#28a745',
      orderCompleted: '#6c757d',
      orderCancelled: '#dc3545',
      orderUpdate: '#ffc107',
      help_guest_request: '#17a2b8',
      help_guest_update: '#17a2b8',
      help_guest_chat: '#6f42c1',
      cooking_request_update: '#fd7e14'
    };
    return colorMap[type] || '#6c757d';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // меньше минуты
      return 'только что';
    } else if (diff < 3600000) { // меньше часа
      const minutes = Math.floor(diff / 60000);
      return `${minutes} мин назад`;
    } else if (diff < 86400000) { // меньше дня
      const hours = Math.floor(diff / 3600000);
      return `${hours} ч назад`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days} дн назад`;
    }
  };

  // Функция для создания тестового уведомления
  const createTestNotification = () => {
    const testNotification = {
      type: 'orderConfirmed',
      title: 'Заказ подтвержден',
      message: 'Повар подтвердил ваш заказ #12345. Приготовление начнется в ближайшее время.',
      orderId: '12345',
      timestamp: new Date().toISOString()
    };
    
    addNotification(testNotification);
    showSuccess('Тестовое уведомление создано');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Обработка разных типов уведомлений
    if (notification.type === 'help_guest_request' || notification.type === 'help_guest_update') {
      // Переходим к запросам на помощь
      onClose && onClose();
      if (onSwitchToSection) {
        onSwitchToSection('help-guest-requests');
      }
      localStorage.setItem('highlightHelpRequestId', notification.requestId);
      showSuccess('Переход к запросам на помощь');
    } else if (notification.type === 'help_guest_chat') {
      // Переходим к чату
      onClose && onClose();
      if (onSwitchToSection) {
        onSwitchToSection('help-guest-requests');
      }
      localStorage.setItem('highlightHelpRequestId', notification.requestId);
      localStorage.setItem('openHelpGuestChat', notification.requestId);
      showSuccess('Открытие чата');
    } else if (notification.orderId) {
      // Переходим к заказу через переключение секции
      onClose && onClose();
      if (onSwitchToSection) {
        onSwitchToSection('orders');
      }
      localStorage.setItem('highlightOrderId', notification.orderId);
      showSuccess(`Переход к заказу ${notification.orderId}`);
    } else if (notification.type === 'cooking_request_update') {
      // Переходим к запросам на готовку
      onClose && onClose();
      if (onSwitchToSection) {
        onSwitchToSection('cooking-requests');
      }
      localStorage.setItem('highlightCookingRequestId', notification.requestId);
      showSuccess('Переход к запросам на готовку');
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div>Загрузка уведомлений...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Заголовок */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            🔔 Уведомления
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* Кнопки действий */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={createTestNotification}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Создать тестовое уведомление
          </button>
          <button
            onClick={markAllAsRead}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Отметить все как прочитанные
          </button>
          <button
            onClick={clearAll}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Очистить все
          </button>
        </div>

        {/* Список уведомлений */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <div>Нет уведомлений</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  backgroundColor: notification.read ? '#f9f9f9' : '#fff3cd',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = notification.read ? '#f0f0f0' : '#ffeaa7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = notification.read ? '#f9f9f9' : '#fff3cd';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getTypeColor(notification.type),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getTypeLabel(notification.type)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#888'
                    }}>
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>
                    {notification.title}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {notification.message}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '8px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Просмотреть
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientNotifications;
