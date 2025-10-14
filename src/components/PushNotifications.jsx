import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Проверяем поддержку Push API
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkPermission();
    }
  }, []);

  const checkPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      // Регистрируем Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Проверяем поддержку push уведомлений
      if (!registration.pushManager) {
        throw new Error('Push Manager не поддерживается');
      }

      // Подписываемся на push уведомления (без VAPID ключа для демо)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });

      setSubscription(subscription);
      
      // Сохраняем подписку локально
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      
      console.log('Push subscription successful:', subscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      // Если не получается подписаться, просто разрешаем уведомления
      setSubscription({ demo: true });
    }
  };

  const sendSubscriptionToServer = async (subscription) => {
    try {
      // В реальном приложении здесь будет отправка на сервер
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('role');
      
      if (token && role) {
        // Сохраняем подписку локально
        localStorage.setItem('pushSubscription', JSON.stringify(subscription));
        
        // Здесь можно отправить на сервер
        console.log('Subscription saved locally:', subscription);
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        localStorage.removeItem('pushSubscription');
        console.log('Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      try {
        // Сначала пробуем через Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('🍽️ Food Delivery', {
            body: 'Новый заказ поступил! Проверьте панель повара.',
            icon: '/logo192.png',
            badge: '/logo192.png',
            tag: 'new-order',
            requireInteraction: true
          });
          console.log('Test notification sent via Service Worker');
        } else {
          // Fallback к обычным уведомлениям
          const notification = new Notification('🍽️ Food Delivery', {
            body: 'Новый заказ поступил! Проверьте панель повара.',
            icon: '/logo192.png',
            badge: '/logo192.png',
            tag: 'new-order',
            requireInteraction: true
          });

          // Обработка клика по уведомлению
          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Автоматически закрываем через 5 секунд
          setTimeout(() => {
            notification.close();
          }, 5000);

          console.log('Test notification sent via Notification API');
        }
      } catch (error) {
        console.error('Error sending test notification:', error);
        alert('Ошибка отправки уведомления: ' + error.message);
      }
    } else {
      alert('Уведомления не разрешены. Разрешите их в настройках браузера.');
    }
  };

  if (!isSupported) {
    return (
      <div style={{
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        margin: '10px 0'
      }}>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
          ⚠️ Push уведомления не поддерживаются в вашем браузере
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '0',
      background: 'transparent',
      borderRadius: '15px',
      border: 'none',
      margin: '20px 0'
    }}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}
      >
        <span style={{ fontWeight: 600, color: '#2D5016' }}>🔔 Push уведомления</span>
        <span style={{ opacity: 0.8 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
      <div style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        marginTop: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)'
      }}>

      <div style={{ marginBottom: '15px' }}>
        <p style={{
          margin: '0 0 10px 0',
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          Получайте уведомления о новых заказах, статусе доставки и специальных предложениях.
        </p>
      </div>

      {permission === 'default' && (
        <button
          onClick={requestPermission}
          style={{
            background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)',
            marginRight: '10px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
          }}
        >
          🔔 Включить уведомления
        </button>
      )}

      {permission === 'granted' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <span style={{ color: '#28a745', fontSize: '16px' }}>✅</span>
            <span style={{ color: '#28a745', fontSize: '14px', fontWeight: '500' }}>
              Уведомления включены
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={sendTestNotification}
              style={{
                background: 'transparent',
                color: '#2D5016',
                border: '2px solid #2D5016',
                borderRadius: '25px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2D5016';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#2D5016';
              }}
            >
              🧪 Тестовое уведомление
            </button>

            <button
              onClick={unsubscribeFromPush}
              style={{
                background: 'transparent',
                color: '#dc3545',
                border: '2px solid #dc3545',
                borderRadius: '25px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#dc3545';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#dc3545';
              }}
            >
              🔕 Отключить
            </button>
          </div>
        </div>
      )}

      {permission === 'denied' && (
        <div style={{
          padding: '15px',
          background: '#f8d7da',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            ❌ Уведомления заблокированы. Разрешите их в настройках браузера.
          </p>
        </div>
      )}
      </div>
      )}
    </div>
  );
};

export default PushNotifications;
