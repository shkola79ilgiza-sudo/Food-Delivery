import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

const HelpGuestChat = ({ requestId, onClose, isChef = false }) => {
  const { showSuccess } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [request, setRequest] = useState(null);

  const loadRequest = useCallback(() => {
    try {
      const requests = JSON.parse(localStorage.getItem('helpGuestRequests') || '[]');
      const foundRequest = requests.find(r => r.id === requestId);
      if (foundRequest) {
        setRequest(foundRequest);
      }
    } catch (error) {
      console.error('Ошибка загрузки запроса:', error);
    }
  }, [requestId]);

  const loadMessages = useCallback(() => {
    try {
      const savedMessages = JSON.parse(localStorage.getItem(`helpGuestChat_${requestId}`) || '[]');
      setMessages(savedMessages);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
    loadMessages();
  }, [requestId, loadMessages, loadRequest]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveMessages = (messagesToSave) => {
    try {
      const chatKey = `helpGuestChat_${requestId}`;
      localStorage.setItem(chatKey, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newMessage.trim(),
      sender: isChef ? 'chef' : 'client',
      senderName: isChef ? 'Повар' : (request?.clientName || 'Клиент'),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');

    // Отправляем уведомление получателю
    const notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'help_guest_chat',
      title: 'Новое сообщение в чате',
      message: `${message.senderName}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
      requestId: requestId,
      orderId: requestId,
      timestamp: new Date().toISOString(),
      read: false
    };

    const targetNotifications = isChef ? 'clientNotifications' : 'chefNotifications';
    const existingNotifications = JSON.parse(localStorage.getItem(targetNotifications) || '[]');
    const updatedNotifications = [notification, ...existingNotifications].slice(0, 50);
    localStorage.setItem(targetNotifications, JSON.stringify(updatedNotifications));

    // Отправляем событие для обновления уведомлений
    const eventName = isChef ? 'clientNotificationAdded' : 'chefNotificationAdded';
    window.dispatchEvent(new CustomEvent(eventName, { detail: notification }));
    window.dispatchEvent(new CustomEvent('clientNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('chefNotificationsUpdated'));

    setIsLoading(false);
    showSuccess('Сообщение отправлено');
  };

  const sendQuickMessage = (messageText) => {
    setNewMessage(messageText);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  if (!request) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>Загрузка чата...</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Заголовок чата */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
              💬 Чат по запросу помощи
            </h3>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {request.clientName} • {formatDate(request.eventDate)} в {request.eventTime}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Информация о запросе */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#e3f2fd',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            📋 Детали запроса:
          </div>
          <div style={{ color: '#666' }}>
            👥 {request.numberOfGuests} гостей • 🎉 {request.eventType} • 💰 {request.budget} ₽
          </div>
          {request.specialRequests && (
            <div style={{ color: '#666', marginTop: '4px' }}>
              💭 {request.specialRequests}
            </div>
          )}
        </div>

        {/* Сообщения */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '40px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div>Начните обсуждение деталей заказа</div>
              {isChef && (
                <div style={{ fontSize: '14px', marginTop: '8px', color: '#888' }}>
                  Предложите свое меню и обсудите предпочтения клиента
                </div>
              )}
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.sender === (isChef ? 'chef' : 'client');
              const showDate = index === 0 || 
                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      color: '#888',
                      fontSize: '12px',
                      margin: '16px 0 8px 0',
                      padding: '4px 8px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '12px',
                      display: 'inline-block',
                      alignSelf: 'center'
                    }}>
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      backgroundColor: isOwnMessage ? '#007bff' : '#f1f3f4',
                      color: isOwnMessage ? 'white' : '#333',
                      position: 'relative'
                    }}>
                      <div style={{ marginBottom: '4px' }}>
                        {message.text}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        textAlign: 'right'
                      }}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Быстрые сообщения для повара */}
        {isChef && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Быстрые ответы:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'Привет! Я готов помочь с вашим мероприятием',
                'Какие блюда вы предпочитаете?',
                'Есть ли аллергии или диетические ограничения?',
                'Предлагаю следующее меню:',
                'Когда удобно обсудить детали?'
              ].map((quickMsg, index) => (
                <button
                  key={index}
                  onClick={() => sendQuickMessage(quickMsg)}
                  style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: '1px solid #bbdefb',
                    borderRadius: '16px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#bbdefb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#e3f2fd';
                  }}
                >
                  {quickMsg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Поле ввода */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={isChef ? 'Предложите меню или задайте вопрос...' : 'Напишите сообщение...'}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '24px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              style={{
                background: newMessage.trim() ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                fontSize: '18px',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuestChat;
