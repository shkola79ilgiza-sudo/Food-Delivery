import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Прокрутка чата вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
      return;
    }

    // Загрузка списка поваров и истории сообщений
    const fetchData = async () => {
      try {
        // Здесь будет API запрос для получения списка поваров
        // const chefsResponse = await fetch('api/client/chefs', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const chefsData = await chefsResponse.json();
        // if (!chefsResponse.ok) throw new Error(chefsData.message || 'Ошибка при загрузке списка поваров');
        // setChefs(chefsData);

        // Временные данные для демонстрации
        const mockChefs = [
          { id: 1, name: 'Иван Иванов', avatar: '👨‍🍳', rating: 4.8 },
          { id: 2, name: 'Мария Петрова', avatar: '👩‍🍳', rating: 4.9 },
          { id: 3, name: 'Алексей Смирнов', avatar: '👨‍🍳', rating: 4.7 }
        ];
        
        setChefs(mockChefs);
        
        // Если есть сохраненный выбранный повар, загружаем историю сообщений
        const savedChefId = localStorage.getItem('selectedChefId');
        if (savedChefId) {
          const chef = mockChefs.find(c => c.id === parseInt(savedChefId));
          if (chef) {
            setSelectedChef(chef);
            loadMessages(chef.id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка истории сообщений для выбранного повара
  const loadMessages = async (chefId) => {
    setLoading(true);
    try {
      // Здесь будет API запрос для получения истории сообщений
      // const response = await fetch(`api/client/messages/${chefId}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Ошибка при загрузке сообщений');
      // setMessages(data);

      // Временные данные для демонстрации
      const mockMessages = [
        { id: 1, sender: 'chef', text: 'Здравствуйте! Чем могу помочь?', timestamp: '2023-06-20T10:30:00' },
        { id: 2, sender: 'client', text: 'Добрый день! Хотел уточнить по поводу моего заказа #12345', timestamp: '2023-06-20T10:31:00' },
        { id: 3, sender: 'chef', text: 'Конечно, ваш заказ сейчас готовится. Будет готов примерно через 20 минут.', timestamp: '2023-06-20T10:32:00' },
        { id: 4, sender: 'client', text: 'Отлично, спасибо! А можно добавить к заказу еще один десерт?', timestamp: '2023-06-20T10:33:00' },
        { id: 5, sender: 'chef', text: 'К сожалению, заказ уже в процессе приготовления. Но вы можете сделать дополнительный заказ.', timestamp: '2023-06-20T10:34:00' }
      ];
      
      setMessages(mockMessages);
      localStorage.setItem('selectedChefId', chefId);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Произошла ошибка при загрузке сообщений');
    } finally {
      setLoading(false);
    }
  };

  // Выбор повара для чата
  const handleSelectChef = (chef) => {
    setSelectedChef(chef);
    loadMessages(chef.id);
  };

  // Отправка нового сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChef) return;

    // Для реального API запроса
    // const messageData = {
    //   text: newMessage,
    //   chefId: selectedChef.id
    // };

    try {
      // Здесь будет API запрос для отправки сообщения
      // const response = await fetch('api/client/messages', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('authToken')}` 
      //   },
      //   body: JSON.stringify(messageData)
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Ошибка при отправке сообщения');

      // Временная имитация отправки сообщения
      const newMsg = {
        id: messages.length + 1,
        sender: 'client',
        text: newMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');

      // Имитация ответа от повара через 1 секунду
      setTimeout(() => {
        const chefReply = {
          id: messages.length + 2,
          sender: 'chef',
          text: 'Спасибо за ваше сообщение! Я скоро отвечу.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, chefReply]);
      }, 1000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Произошла ошибка при отправке сообщения');
    }
  };

  // Форматирование времени сообщения
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading && !selectedChef) {
    return <div className="loading">Загрузка чата...</div>;
  }

  if (error && !selectedChef) {
    return (
      <div className="error-container">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="client-chat-container">
      <h1>Чат с поваром</h1>
      
      <div className="chat-layout">
        <div className="chefs-sidebar">
          <h2>Повара</h2>
          <div className="chefs-list">
            {chefs.map((chef) => (
              <div 
                key={chef.id} 
                className={`chef-item ${selectedChef?.id === chef.id ? 'selected' : ''}`}
                onClick={() => handleSelectChef(chef)}
              >
                <div className="chef-avatar">{chef.avatar}</div>
                <div className="chef-info">
                  <div className="chef-name">{chef.name}</div>
                  <div className="chef-rating">⭐ {chef.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chat-main">
          {selectedChef ? (
            <>
              <div className="chat-header">
                <div className="chat-with">
                  <span>Чат с</span>
                  <strong>{selectedChef.name}</strong>
                </div>
                <div className="chef-status online">В сети</div>
              </div>
              
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>У вас пока нет сообщений с этим поваром</p>
                    <p>Напишите сообщение, чтобы начать общение</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`message ${message.sender === 'client' ? 'outgoing' : 'incoming'}`}
                      >
                        <div className="message-content">
                          <div className="message-text">{message.text}</div>
                          <div className="message-time">{formatMessageTime(message.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  required
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  Отправить
                </button>
              </form>
            </>
          ) : (
            <div className="select-chef-prompt">
              <div className="prompt-icon">💬</div>
              <h3>Выберите повара для начала общения</h3>
              <p>Выберите повара из списка слева, чтобы начать чат</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="chat-actions">
        <button 
          onClick={() => navigate('/client/menu')}
          className="back-to-menu-button"
        >
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default ClientChat;