/**
 * Индикатор офлайн статуса
 * Показывает состояние подключения и синхронизации
 * @author Food Delivery Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    // Слушаем изменения статуса сети
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Проверяем Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_STATUS') {
          setPendingActions(event.data.count || 0);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Не показываем индикатор если онлайн и нет действий
  if (isOnline && !pendingActions && !showIndicator) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* Офлайн индикатор */}
      {!isOnline && (
        <div style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: 'pulse 2s infinite'
          }} />
          <span>Офлайн режим</span>
        </div>
      )}

      {/* Онлайн индикатор */}
      {isOnline && showIndicator && (
        <div style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'white'
          }} />
          <span>Подключение восстановлено</span>
        </div>
      )}

      {/* Индикатор синхронизации */}
      {isOnline && pendingActions > 0 && (
        <div style={{
          backgroundColor: '#FF9800',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Синхронизация: {pendingActions} действий</span>
        </div>
      )}

      {/* CSS анимации */}
      <style>{`
        @keyframes slideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;
