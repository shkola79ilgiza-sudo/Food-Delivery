import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { getPriorityColor } from '../utils/priorityColors';

const SmartNotifications = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { notifications, markAsRead, clearAll, getUnreadCount } = useNotifications();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'chef': return '👨‍🍳';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '📢';
    }
  };

  const unreadCount = getUnreadCount();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '400px'
    }}>
      {/* Индикатор подключения */}
      <div style={{
        padding: '8px 12px',
        marginBottom: '10px',
        borderRadius: '6px',
        backgroundColor: isOnline ? '#4caf50' : '#f44336',
        color: 'white',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>{isOnline ? '🟢' : '🔴'}</span>
        {isOnline ? 'Онлайн' : 'Офлайн'}
      </div>

      {/* Счетчик уведомлений */}
      {unreadCount > 0 && (
        <div style={{
          position: 'relative',
          display: 'inline-block'
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </div>
        </div>
      )}

      {/* Список уведомлений */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0'
      }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#666'
          }}>
            Нет уведомлений
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: notification.read ? '#f9f9f9' : 'white',
                cursor: 'pointer',
                opacity: notification.read ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              onClick={() => markAsRead(notification.id)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {getTypeIcon(notification.type)}
                </span>
                <div style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: notification.read ? 'normal' : 'bold'
                }}>
                  {notification.message}
                </div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getPriorityColor(notification.priority)
                }} />
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginLeft: '26px'
              }}>
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Кнопка очистки */}
      {notifications.length > 0 && (
        <button
          onClick={clearAll}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            width: '100%'
          }}
        >
          Очистить все
        </button>
      )}
    </div>
  );
};

export default SmartNotifications;
