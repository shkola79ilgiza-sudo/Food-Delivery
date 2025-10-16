import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const ClientChefChat = ({ chefId, chefName, onClose }) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { socket } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const clientId = localStorage.getItem('clientId') || 'demo_client';

  // Загрузка истории сообщений
  useEffect(() => {
    const chatKey = `chat_${clientId}_${chefId}`;
    const savedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
    setMessages(savedMessages);
  }, [clientId, chefId]);

  // Сохранение сообщений
  useEffect(() => {
    if (messages.length > 0) {
      const chatKey = `chat_${clientId}_${chefId}`;
      localStorage.setItem(chatKey, JSON.stringify(messages));
    }
  }, [messages, clientId, chefId]);

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket обработчики
  useEffect(() => {
    if (socket) {
      // Присоединяемся к комнате чата
      socket.emit('joinChatRoom', { clientId, chefId });

      // Слушаем входящие сообщения
      const handleNewMessage = (data) => {
        if (data.from === chefId) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: data.message,
            from: 'chef',
            timestamp: new Date().toISOString(),
            image: data.image
          }]);
          setIsTyping(false);
        }
      };

      // Слушаем индикатор печати
      const handleTyping = (data) => {
        if (data.from === chefId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      };

      socket.on('chatMessage', handleNewMessage);
      socket.on('typing', handleTyping);

      return () => {
        socket.off('chatMessage', handleNewMessage);
        socket.off('typing', handleTyping);
        socket.emit('leaveChatRoom', { clientId, chefId });
      };
    }
  }, [socket, clientId, chefId]);

  // Отправка сообщения
  const sendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      from: 'client',
      timestamp: new Date().toISOString(),
      image: selectedImage
    };

    setMessages(prev => [...prev, message]);

    // Отправляем через WebSocket
    if (socket) {
      socket.emit('sendChatMessage', {
        to: chefId,
        from: clientId,
        message: newMessage.trim(),
        image: selectedImage
      });
    }

    setNewMessage('');
    setSelectedImage(null);
    showSuccess('Сообщение отправлено');
  };

  // Обработка отправки печати
  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { to: chefId, from: clientId });
    }
  };

  // Загрузка изображения
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Можно загружать только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Размер файла не должен превышать 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Форматирование времени
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Заголовок */}
      <div style={{
        background: 'linear-gradient(135deg, #2D5016, #4A7C59)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ← Назад
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            👨‍🍳 {chefName || 'Повар'}
          </div>
          {isTyping && (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              печатает...
            </div>
          )}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Сообщения */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              Начните общение
            </div>
            <div style={{ fontSize: '14px' }}>
              Задайте вопрос повару о блюдах или заказе
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {messages.map((msg) => {
              const isClient = msg.from === 'client';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isClient ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: isClient ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isClient
                      ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                      : 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
                    color: isClient ? 'white' : '#333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Вложение"
                        style={{
                          width: '100%',
                          borderRadius: '12px',
                          marginBottom: '8px'
                        }}
                      />
                    )}
                    {msg.text && (
                      <div style={{ 
                        marginBottom: '6px',
                        wordWrap: 'break-word'
                      }}>
                        {msg.text}
                      </div>
                    )}
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Превью изображения */}
      {selectedImage && (
        <div style={{
          padding: '10px 20px',
          background: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <img
              src={selectedImage}
              alt="Превью"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Форма отправки */}
      <div style={{
        padding: '15px 20px',
        background: 'white',
        borderTop: '2px solid #e0e0e0',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end'
      }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Прикрепить изображение"
        >
          📎
        </button>
        <textarea
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Напишите сообщение..."
          rows="1"
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '22px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            resize: 'none',
            maxHeight: '120px',
            overflow: 'auto'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() && !selectedImage}
          style={{
            background: newMessage.trim() || selectedImage
              ? 'linear-gradient(135deg, #4CAF50, #45a049)'
              : '#e0e0e0',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: newMessage.trim() || selectedImage ? 'pointer' : 'not-allowed',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.3s ease'
          }}
        >
          📤
        </button>
      </div>
    </div>
  );
};

export default ClientChefChat;

