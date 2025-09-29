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
    const newSocket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [reconnectAttempts, maxReconnectAttempts]);

  // Функция для отправки событий
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, event not sent:', event, data);
    }
  };

  // Функция для подписки на события
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Функция для отписки от событий
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
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
      console.log('DEMO WebSocket emit:', event, data);
      
      // Симулируем ответы на события
      setTimeout(() => {
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
      }, 100);
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
