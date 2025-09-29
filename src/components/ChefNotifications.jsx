import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import ChefOrderDetails from './ChefOrderDetails';

const ChefNotifications = ({ onUpdateCount, onClose, onNavigateToTab }) => {
  const { t } = useLanguage();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // Используем новый хук для уведомлений
  const {
    notifications,
    unreadCount,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
    joinRoom,
    leaveRoom,
    reload
  } = useNotifications('chef');

  // Подключаемся к комнате повара при монтировании
  useEffect(() => {
    const chefId = localStorage.getItem('chefId') || 'demo-chef-1';
    joinRoom(chefId);
    
    return () => {
      leaveRoom(chefId);
    };
  }, [joinRoom, leaveRoom]);

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

  // Обновляем счетчик уведомлений при изменении
  useEffect(() => {
    if (onUpdateCount) {
      onUpdateCount(unreadCount);
    }
  }, [unreadCount, onUpdateCount]);

  // Слушаем события обновления уведомлений
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      // Перезагружаем уведомления при обновлении
      reload();
    };

    window.addEventListener('chefNotificationsUpdated', handleNotificationsUpdated);
    return () => window.removeEventListener('chefNotificationsUpdated', handleNotificationsUpdated);
  }, [reload]);

  const getNotificationStyle = (notification) => {
    return {
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      opacity: notification.read ? 0.7 : 1,
      transition: 'all 0.3s ease'
    };
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      newOrder: t.chefNotifications.types?.newOrder || 'ЗАКАЗ',
      orderConfirmed: t.chefNotifications.types?.orderConfirmed || 'ПОДТВЕРЖДЕН',
      orderCompleted: t.chefNotifications.types?.orderCompleted || 'ЗАВЕРШЕН',
      dishHit: t.chefNotifications.types?.dishHit || 'ПОПУЛЯРНО',
      ratingUpdate: t.chefNotifications.types?.ratingUpdate || 'РЕЙТИНГ',
      orderCancelled: t.chefNotifications.types?.orderCancelled || 'ОТМЕНЕН',
      orderUpdate: t.chefNotifications.types?.orderUpdate || 'ОБНОВЛЕНИЕ',
      help_guest_request: 'ПОМОЩЬ ГОСТЯМ',
      help_guest_chat: 'ЧАТ',
      cooking_request_update: 'ГОТОВКА'
    };
    return typeLabels[type] || 'УВЕДОМЛЕНИЕ';
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        return 'недавно';
      }
      
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) { // Меньше минуты
        return 'только что';
      } else if (diff < 3600000) { // Меньше часа
        const minutes = Math.floor(diff / 60000);
        return `${minutes} мин назад`;
      } else if (diff < 86400000) { // Меньше дня
        const hours = Math.floor(diff / 3600000);
        return `${hours} ч назад`;
      } else {
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'недавно';
    }
  };

  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const closeOrderDetails = () => {
    setSelectedOrderId(null);
  };

  const handleOrderStatusUpdate = (orderId, newStatus) => {
    // Обновляем уведомления после изменения статуса заказа
    // Хук автоматически обновит данные через WebSocket
    closeOrderDetails();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.type === 'help_guest_request') {
      // Переходим на вкладку помощи гостям
      onClose && onClose();
      // Сохраняем ID запроса для перехода
      localStorage.setItem('highlightHelpRequestId', notification.requestId);
      // Переходим на вкладку помощи гостям
      if (onNavigateToTab) {
        onNavigateToTab('help-guest-requests');
      }
    } else if (notification.type === 'help_guest_chat') {
      // Переходим на вкладку помощи гостям и открываем чат
      onClose && onClose();
      // Сохраняем ID запроса для перехода
      localStorage.setItem('highlightHelpRequestId', notification.requestId);
      localStorage.setItem('openHelpGuestChat', notification.requestId);
      // Переходим на вкладку помощи гостям
      if (onNavigateToTab) {
        onNavigateToTab('help-guest-requests');
      }
    } else if (notification.orderId) {
      openOrderDetails(notification.orderId);
    }
  };

  if (loading) {
    return (
      <div className="chef-notifications-modal-overlay" onClick={onClose}>
        <div className="chef-notifications-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chef-notifications-header">
            <h2>🔔 Уведомления</h2>
            <button className="back-button" onClick={onClose}>✕</button>
          </div>
          <div className="chef-notifications-content">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Загрузка уведомлений...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="chef-notifications-modal-overlay" onClick={onClose}>
        <div className="chef-notifications-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chef-notifications-header">
            <h2>
              🔔 Уведомления 
              {!connected && <span style={{ color: '#ff6b6b', fontSize: '12px', marginLeft: '10px' }}>
                (офлайн)
              </span>}
            </h2>
            <button className="back-button" onClick={onClose}>✕</button>
          </div>
          
          <div className="chef-notifications-content">
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔔</div>
                <p>Нет новых уведомлений</p>
              </div>
            ) : (
              <>
                <div className="chef-notifications-actions">
                  <button 
                    onClick={markAllAsRead}
                    className="mark-all-read-btn"
                    disabled={unreadCount === 0}
                  >
                    Отметить все как прочитанные
                  </button>
                  <button 
                    onClick={clearAll}
                    className="clear-all-btn"
                  >
                    Очистить все
                  </button>
                </div>
                
                <div className="chef-notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="notification-item"
                      style={getNotificationStyle(notification)}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-header">
                        <span className="notification-type-label">
                          {getTypeLabel(notification.type)}
                        </span>
                        <span className="notification-time">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                      </div>
                      
                      {notification.orderId && (
                        <div className="notification-actions">
                          <button 
                            className="view-order-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDetails(notification.orderId);
                            }}
                          >
                            👁️ Посмотреть заказ
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedOrderId && (
        <ChefOrderDetails
          orderId={selectedOrderId}
          onClose={closeOrderDetails}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </>
  );
};

export default ChefNotifications;