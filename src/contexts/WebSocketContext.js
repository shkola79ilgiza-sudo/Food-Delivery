import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket connection logic would go here
    // For now, we'll just simulate a connection
    setIsConnected(true);
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const value = {
    socket,
    isConnected,
    sendMessage: (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
