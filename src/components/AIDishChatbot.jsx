import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import aiChatbot from '../utils/aiChatbot';

const AIDishChatbot = ({ dish, userProfile = {}, onEscalateToChef, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { t } = useLanguage();
  const { showSuccess } = useToast();

  useEffect(() => {
    // Приветственное сообщение
    const welcomeMessage = {
      text: `👋 Привет! Я AI-помощник. Задайте любой вопрос о блюде "${dish.name}", и я отвечу мгновенно!\n\nНапример:\n• Сколько калорий?\n• Подходит для диабетиков?\n• Можно после тренировки?`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      confidence: 100
    };
    setMessages([welcomeMessage]);

    // Генерируем предложенные вопросы
    const suggestions = aiChatbot.generateSuggestedQuestions(dish, userProfile);
    setSuggestedQuestions(suggestions);
  }, [dish, userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Добавляем сообщение пользователя
    const userMessage = {
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Получаем ответ от AI
      const response = await aiChatbot.answerQuestion(text, dish, userProfile);
      
      // Симулируем задержку для более естественного ответа
      await new Promise(resolve => setTimeout(resolve, 800));

      // Добавляем ответ AI
      const aiMessage = {
        text: response.answer,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        source: response.source,
        data: response.data
      };
      setMessages(prev => [...prev, aiMessage]);

      // Если нужна эскалация, показываем кнопку
      if (aiChatbot.shouldEscalate(response)) {
        const escalationMessage = {
          text: '💡 Хотите уточнить детали у живого повара?',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isEscalation: true,
          originalQuestion: text,
          aiResponse: response
        };
        setMessages(prev => [...prev, escalationMessage]);
      }
    } catch (error) {
      console.error('❌ Chatbot error:', error);
      const errorMessage = {
        text: 'Извините, произошла ошибка. Попробуйте переформулировать вопрос. 😔',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEscalate = (message) => {
    if (onEscalateToChef) {
      onEscalateToChef({
        dish: dish,
        question: message.originalQuestion,
        aiResponse: message.aiResponse
      });
      showSuccess('Вопрос отправлен повару! Он ответит в ближайшее время.');
      if (onClose) onClose();
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4caf50';
    if (confidence >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '20px',
        borderBottom: '2px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white'
      }}>
        <div>
          <h3 style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤖 AI-Дежурный
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
            О блюде: {dish.name}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Область сообщений */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        background: '#f8f9fa'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            {message.sender === 'ai' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                🤖
              </div>
            )}
            
            <div style={{
              maxWidth: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <div
                style={{
                  background: message.sender === 'user' ? 
                    'linear-gradient(135deg, #667eea, #764ba2)' : 
                    'white',
                  color: message.sender === 'user' ? 'white' : '#333',
                  padding: '12px 16px',
                  borderRadius: message.sender === 'user' ? 
                    '15px 15px 0 15px' : 
                    '15px 15px 15px 0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {message.text}
              </div>
              
              {/* Кнопка эскалации */}
              {message.isEscalation && (
                <button
                  onClick={() => handleEscalate(message)}
                  style={{
                    background: 'linear-gradient(135deg, #4caf50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    alignSelf: 'flex-start'
                  }}
                >
                  👨‍🍳 Связаться с поваром
                </button>
              )}
              
              {/* Индикатор уверенности */}
              {message.sender === 'ai' && message.confidence !== undefined && !message.isEscalation && (
                <div style={{
                  fontSize: '11px',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '4px',
                    background: '#e0e0e0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${message.confidence}%`,
                      height: '100%',
                      background: getConfidenceColor(message.confidence),
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <span>{message.confidence}% уверенности</span>
                </div>
              )}
            </div>

            {message.sender === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                👤
              </div>
            )}
          </div>
        ))}

        {/* Индикатор печатания */}
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🤖
            </div>
            <div style={{
              background: 'white',
              padding: '12px 16px',
              borderRadius: '15px 15px 15px 0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              gap: '5px'
            }}>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Предложенные вопросы */}
      {suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #e0e0e0',
          background: '#f8f9fa'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
            💡 Популярные вопросы:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                style={{
                  background: 'white',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  color: '#333'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e3f2fd';
                  e.target.style.borderColor = '#2196f3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                💬 {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div style={{
        padding: '15px 20px',
        borderTop: '2px solid #e0e0e0',
        background: 'white',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Задайте вопрос о блюде..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '25px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isTyping}
          style={{
            background: inputMessage.trim() && !isTyping ? 
              'linear-gradient(135deg, #667eea, #764ba2)' : 
              '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            flexShrink: 0
          }}
        >
          ➤
        </button>
      </div>

      {/* CSS для анимации печати */}
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AIDishChatbot;
