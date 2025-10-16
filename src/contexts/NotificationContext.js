import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { showSuccess, showError } = useToast();

  const addNotification = (type, message, priority = 'normal') => {
    const notification = {
      id: Date.now(),
      type,
      message,
      priority,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    if (priority === 'high') {
      showError(message);
    } else {
      showSuccess(message);
    }

    return notification.id;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
