import { useState, useEffect, useCallback } from 'react';
import { safeSetClientOrders } from '../utils/safeStorage';
import { useWebSocket } from '../contexts/WebSocketContext';

export const useNotifications = (type = 'chef') => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket, connected, emit, on, off } = useWebSocket();

  // Загрузка уведомлений из localStorage
  const loadNotifications = useCallback(() => {
    try {
      setLoading(true);
      const key = type === 'chef' ? 'chefNotifications' : 'clientNotifications';
      const savedNotifications = localStorage.getItem(key);
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        const unread = parsedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error(`Error loading ${type} notifications:`, error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Сохранение уведомлений в localStorage
  const saveNotifications = useCallback((newNotifications) => {
    try {
      const key = type === 'chef' ? 'chefNotifications' : 'clientNotifications';
      localStorage.setItem(key, JSON.stringify(newNotifications));
    } catch (error) {
      console.error(`Error saving ${type} notifications:`, error);
    }
  }, [type]);

  // Добавление нового уведомления
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Ограничиваем до 50 уведомлений
      saveNotifications(updated);
      return updated;
    });

    setUnreadCount(prev => prev + 1);
  }, [saveNotifications]);

  // Отметка уведомления как прочитанного
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });

    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [saveNotifications]);

  // Отметка всех уведомлений как прочитанных
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });

    setUnreadCount(0);
  }, [saveNotifications]);

  // Очистка всех уведомлений
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    saveNotifications([]);
  }, [saveNotifications]);

  // Подключение к WebSocket комнате
  const joinRoom = useCallback((roomId) => {
    if (connected && emit) {
      emit('joinRoom', { room: `${type}-${roomId}` });
    }
  }, [connected, emit, type]);

  // Отключение от WebSocket комнаты
  const leaveRoom = useCallback((roomId) => {
    if (connected && emit) {
      emit('leaveRoom', { room: `${type}-${roomId}` });
    }
  }, [connected, emit, type]);

  // Отправка события через WebSocket
  const sendEvent = useCallback((event, data) => {
    if (connected && emit) {
      emit(event, data);
    }
  }, [connected, emit]);

  // Инициализация при монтировании
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Подписка на WebSocket события
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log(`New ${type} notification:`, data);
      addNotification(data);
    };

    const handleOrderUpdate = (data) => {
      console.log(`Order update for ${type}:`, data);
      
      // Создаем уведомление об обновлении заказа
      const notification = {
        type: 'orderUpdate',
        title: 'Обновление заказа',
        message: `Статус заказа #${data.orderId} изменен на: ${data.status}`,
        orderId: data.orderId,
        status: data.status,
        timestamp: data.timestamp
      };
      
      addNotification(notification);
    };

    const handleStatusUpdate = (data) => {
      console.log(`Status update for ${type}:`, data);
      
      // Обновляем локальные данные
      if (type === 'client') {
        // Обновляем заказы клиента
        const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
        const updatedOrders = clientOrders.map(order => 
          order.id === data.orderId 
            ? { ...order, status: data.status, updatedAt: data.timestamp }
            : order
        );
        safeSetClientOrders(updatedOrders);
      }
    };

    // Подписываемся на события
    on('newNotification', handleNewNotification);
    on('orderUpdate', handleOrderUpdate);
    on('statusUpdate', handleStatusUpdate);

    // Очистка подписок
    return () => {
      off('newNotification', handleNewNotification);
      off('orderUpdate', handleOrderUpdate);
      off('statusUpdate', handleStatusUpdate);
    };
  }, [socket, on, off, addNotification, type]);

  // Слушаем изменения в localStorage (для совместимости)
  useEffect(() => {
    const handleStorageChange = (e) => {
      const key = type === 'chef' ? 'chefNotifications' : 'clientNotifications';
      if (e.key === key) {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadNotifications, type]);

  // Слушаем кастомные события уведомлений
  useEffect(() => {
    const handleCustomNotification = (event) => {
      if (event.detail && event.detail.type) {
        addNotification(event.detail);
      }
    };

    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    const eventName = type === 'chef' ? 'chefNotificationAdded' : 'clientNotificationAdded';
    const updateEventName = type === 'chef' ? 'chefNotificationsUpdated' : 'clientNotificationsUpdated';

    window.addEventListener(eventName, handleCustomNotification);
    window.addEventListener(updateEventName, handleNotificationsUpdated);

    return () => {
      window.removeEventListener(eventName, handleCustomNotification);
      window.removeEventListener(updateEventName, handleNotificationsUpdated);
    };
  }, [addNotification, loadNotifications, type]);

  return {
    notifications,
    unreadCount,
    loading,
    connected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    joinRoom,
    leaveRoom,
    sendEvent,
    reload: loadNotifications
  };
};

export default useNotifications;
