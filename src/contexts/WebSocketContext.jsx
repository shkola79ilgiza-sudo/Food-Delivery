import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);

  useEffect(() => {
    // В демо-режиме создаем виртуальный socket
    if (!process.env.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL === '') {
      console.log('DEMO: WebSocket simulation mode');
      const mockSocket = createMockSocket();
      setSocket(mockSocket);
      setConnected(true);
      return;
    }

    // Реальное WebSocket соединение
    const token = localStorage.getItem('auth_token');
    
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      auth: {
        token: token,
      },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      setReconnectAttempts(0);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
      
      if (reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts(prev => prev + 1);
        setTimeout(() => {
          newSocket.connect();
        }, 2000 * (reconnectAttempts + 1));
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      setReconnectAttempts(0);
    });

    // Слушаем события заказов от backend
    newSocket.on('order:new', (data) => {
      console.log('📦 Новый заказ:', data);
      // Можно показать уведомление
    });

    newSocket.on('order:status-updated', (data) => {
      console.log('📊 Статус заказа обновлен:', data);
      // Можно обновить UI
    });

    newSocket.on('order:ready', (data) => {
      console.log('✅ Заказ готов:', data);
      // Показать уведомление клиенту
    });

    newSocket.on('order:delivered', (data) => {
      console.log('🚚 Заказ доставлен:', data);
      // Показать уведомление клиенту
    });

    newSocket.on('order:cancelled', (data) => {
      console.log('❌ Заказ отменен:', data);
      // Показать уведомление
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [reconnectAttempts, maxReconnectAttempts]);

  // Функция для отправки событий
  const emit = (event, data) => {
    try {
      if (socket && connected) {
        socket.emit(event, data);
        console.log('WebSocket event sent:', event, data);
      } else {
        console.warn('WebSocket not connected, event not sent:', event, data);
        // В демо-режиме все равно отправляем событие
        if (socket && socket.emit) {
          socket.emit(event, data);
        }
      }
    } catch (error) {
      console.error('Error emitting WebSocket event:', error);
    }
  };

  // Функция для подписки на события
  const on = (event, callback) => {
    try {
      if (socket) {
        socket.on(event, callback);
        console.log('WebSocket listener added:', event);
      }
    } catch (error) {
      console.error('Error adding WebSocket listener:', error);
    }
  };

  // Функция для отписки от событий
  const off = (event, callback) => {
    try {
      if (socket) {
        socket.off(event, callback);
        console.log('WebSocket listener removed:', event);
      }
    } catch (error) {
      console.error('Error removing WebSocket listener:', error);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
    reconnectAttempts,
    maxReconnectAttempts
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Мок-сокет для демо-режима
const createMockSocket = () => {
  const listeners = {};
  
  const mockSocket = {
    connected: true,
    id: 'demo-socket-' + Date.now(),
    
    emit: (event, data) => {
      try {
        console.log('DEMO WebSocket emit:', event, data);
        
        // Симулируем ответы на события
        setTimeout(() => {
          try {
            if (event === 'joinRoom' && data.room) {
              mockSocket.trigger('roomJoined', { room: data.room, success: true });
            }
            if (event === 'orderStatusUpdate') {
              mockSocket.trigger('orderUpdated', { 
                orderId: data.orderId, 
                status: data.status,
                timestamp: new Date().toISOString()
              });
            }
            if (event === 'newNotification') {
              mockSocket.trigger('notificationReceived', data);
            }
          } catch (error) {
            console.error('Error in mock socket trigger:', error);
          }
        }, 100);
      } catch (error) {
        console.error('Error in mock socket emit:', error);
      }
    },
    
    on: (event, callback) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },
    
    off: (event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    },
    
    trigger: (event, data) => {
      if (listeners[event]) {
        listeners[event].forEach(callback => callback(data));
      }
    },
    
    close: () => {
      console.log('DEMO WebSocket closed');
    }
  };

  return mockSocket;
};

export default WebSocketContext;
