import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import HelpGuestChat from './HelpGuestChat';
import HelpGuestBidding from './HelpGuestBidding';

const ChefHelpGuestRequests = ({ onClose }) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected, completed
  const [chatRequestId, setChatRequestId] = useState(null);
  const [biddingRequest, setBiddingRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  // Эффект для прокрутки к запросу после загрузки
  useEffect(() => {
    if (requests.length > 0) {
      const highlightRequestId = localStorage.getItem('highlightHelpRequestId');
      const openChatId = localStorage.getItem('openHelpGuestChat');
      
      if (highlightRequestId) {
        // Удаляем ID из localStorage
        localStorage.removeItem('highlightHelpRequestId');
        
        // Ищем запрос по ID
        const requestElement = document.getElementById(`help-request-${highlightRequestId}`);
        if (requestElement) {
          // Прокручиваем к запросу с анимацией
          requestElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Подсвечиваем запрос
          requestElement.style.backgroundColor = '#fff3cd';
          requestElement.style.border = '2px solid #ffc107';
          requestElement.style.borderRadius = '8px';
          requestElement.style.transition = 'all 0.3s ease';
          
          // Убираем подсветку через 3 секунды
          setTimeout(() => {
            requestElement.style.backgroundColor = '';
            requestElement.style.border = '';
            requestElement.style.borderRadius = '';
          }, 3000);
        }
      }
      
      if (openChatId) {
        // Удаляем ID из localStorage
        localStorage.removeItem('openHelpGuestChat');
        // Открываем чат
        setChatRequestId(openChatId);
      }
    }
  }, [requests]);

  const loadRequests = () => {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('helpGuestRequests') || '[]');
      
      // Если нет запросов, создаем демо-данные
      if (savedRequests.length === 0) {
        const demoRequests = [
          {
            id: 'demo-help-1',
            clientName: 'Анна Петрова',
            eventDate: new Date().toISOString(),
            eventTime: '19:00',
            numberOfGuests: 8,
            eventType: 'День рождения',
            budget: 15000,
            contactPhone: '+7 (999) 123-45-67',
            address: 'ул. Ленина, д. 10, кв. 5',
            dietaryRestrictions: 'Вегетарианское меню',
            preferredCuisine: 'Европейская',
            servingStyle: 'Фуршет',
            specialRequests: 'Нужна помощь в приготовлении торта',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-help-2',
            clientName: 'Михаил Иванов',
            eventDate: new Date(Date.now() + 86400000).toISOString(), // завтра
            eventTime: '18:30',
            numberOfGuests: 12,
            eventType: 'Корпоратив',
            budget: 25000,
            contactPhone: '+7 (999) 987-65-43',
            address: 'пр. Победы, д. 25',
            dietaryRestrictions: 'Без ограничений',
            preferredCuisine: 'Русская',
            servingStyle: 'Банкет',
            specialRequests: 'Нужна помощь в сервировке',
            status: 'accepted',
            createdAt: new Date(Date.now() - 86400000).toISOString() // вчера
          }
        ];
        
        setRequests(demoRequests);
        localStorage.setItem('helpGuestRequests', JSON.stringify(demoRequests));
      } else {
        setRequests(savedRequests);
      }
    } catch (error) {
      console.error('Error loading help guest requests:', error);
      showError('Ошибка загрузки запросов');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = (requestId, newStatus) => {
    try {
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus, updatedAt: new Date().toISOString() }
          : request
      );
      
      setRequests(updatedRequests);
      localStorage.setItem('helpGuestRequests', JSON.stringify(updatedRequests));

      // Отправляем уведомление клиенту
      const request = requests.find(r => r.id === requestId);
      if (request) {
        const clientNotification = {
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'help_guest_update',
          title: getStatusText(newStatus),
          message: getStatusMessage(newStatus, request),
          requestId: requestId,
          orderId: requestId,
          timestamp: new Date().toISOString(),
          read: false
        };

        const clientNotifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
        const updatedClientNotifications = [clientNotification, ...clientNotifications].slice(0, 50);
        localStorage.setItem('clientNotifications', JSON.stringify(updatedClientNotifications));

        window.dispatchEvent(new CustomEvent('clientNotificationAdded', { 
          detail: clientNotification 
        }));
        window.dispatchEvent(new CustomEvent('clientNotificationsUpdated'));
      }

      showSuccess(`Запрос ${getStatusText(newStatus).toLowerCase()}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      showError('Ошибка обновления статуса');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает',
      accepted: 'Принят',
      rejected: 'Отклонен',
      completed: 'Завершен'
    };
    return statusMap[status] || status;
  };

  const getStatusMessage = (status, request) => {
    const statusMessages = {
      pending: 'Ваш запрос на помощь в готовке ожидает рассмотрения',
      accepted: `Повар принял ваш запрос на помощь в готовке на ${request.eventDate} в ${request.eventTime}`,
      rejected: 'К сожалению, повар не может выполнить ваш запрос на помощь в готовке',
      completed: 'Помощь в готовке завершена! Спасибо за использование наших услуг'
    };
    return statusMessages[status] || 'Статус запроса обновлен';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#ffc107',
      accepted: '#28a745',
      rejected: '#dc3545',
      completed: '#6c757d'
    };
    return colorMap[status] || '#6c757d';
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>Загрузка запросов...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #fad0c4 75%, #ffd1ff 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Декоративные элементы фона */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 182, 193, 0.15)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 218, 185, 0.1)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      
      {/* Эмодзи элементы */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '30px',
        opacity: 0.3,
        zIndex: 0
      }}>🍽️</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        fontSize: '25px',
        opacity: 0.3,
        zIndex: 0
      }}>👨‍🍳</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        fontSize: '28px',
        opacity: 0.3,
        zIndex: 0
      }}>🥘</div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '15%',
        fontSize: '22px',
        opacity: 0.3,
        zIndex: 0
      }}>🍴</div>
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '3%',
        fontSize: '20px',
        opacity: 0.3,
        zIndex: 0
      }}>👩‍🍳</div>
      <div style={{
        position: 'absolute',
        top: '70%',
        right: '5%',
        fontSize: '24px',
        opacity: 0.3,
        zIndex: 0
      }}>🍳</div>
      
      {/* Основной контент */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '15px 20px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
          >
            ← Назад
          </button>
          <h2 style={{ 
            margin: 0, 
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🍽️ Запросы на помощь в готовке
          </h2>
        </div>
        
        {/* Фильтры */}
        <div style={{ 
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '2px solid rgba(255, 107, 107, 0.3)',
              fontSize: '14px',
              fontWeight: 'bold',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#2c3e50',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <option value="all">Все запросы</option>
            <option value="pending">Ожидают</option>
            <option value="accepted">Приняты</option>
            <option value="rejected">Отклонены</option>
            <option value="completed">Завершены</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          color: '#2c3e50',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>🍽️</div>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Нет запросов на помощь в готовке
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '16px', 
            opacity: 0.7,
            color: '#666'
          }}>
            Клиенты еще не отправляли запросы на помощь в приготовлении блюд
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRequests.map(request => (
            <div
              key={request.id}
              id={`help-request-${request.id}`}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>
                    {request.clientName}
                  </h3>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    📅 {formatDate(request.eventDate)} в {request.eventTime}
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: getStatusColor(request.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {getStatusText(request.status)}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px' }}>
                  <div><strong>👥 Гостей:</strong> {request.numberOfGuests}</div>
                  <div><strong>🎉 Тип события:</strong> {request.eventType}</div>
                  <div><strong>💰 Бюджет:</strong> {request.budget} ₽</div>
                </div>
              </div>

              {request.specialRequests && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#333' }}>Особые пожелания:</strong>
                  <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                    {request.specialRequests}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Кнопка подробнее */}
                <button
                  onClick={() => setSelectedRequest(request)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  👁️ Подробнее
                </button>

                {/* Кнопка чата - всегда доступна */}
                <button
                  onClick={() => setChatRequestId(request.id)}
                  style={{
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  💬 Чат
                </button>

                {/* Кнопка торгов - для новых запросов */}
                {request.status === 'pending' && (
                  <button
                    onClick={() => setBiddingRequest(request)}
                    style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    💰 Подать заявку
                  </button>
                )}

                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'accepted')}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Принять
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ❌ Отклонить
                    </button>
                  </>
                )}
                {request.status === 'accepted' && (
                  <button
                    onClick={() => updateRequestStatus(request.id, 'completed')}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Завершить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с деталями запроса */}
      {selectedRequest && (
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
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Детали запроса</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <strong>Клиент:</strong> {selectedRequest.clientName}
              </div>
              <div>
                <strong>Дата и время:</strong> {formatDate(selectedRequest.eventDate)} в {selectedRequest.eventTime}
              </div>
              <div>
                <strong>Количество гостей:</strong> {selectedRequest.numberOfGuests}
              </div>
              <div>
                <strong>Тип события:</strong> {selectedRequest.eventType}
              </div>
              <div>
                <strong>Бюджет:</strong> {selectedRequest.budget} ₽
              </div>
              <div>
                <strong>Телефон:</strong> {selectedRequest.contactPhone}
              </div>
              <div>
                <strong>Адрес:</strong> {selectedRequest.address}
              </div>
              {selectedRequest.dietaryRestrictions && (
                <div>
                  <strong>Диетические ограничения:</strong> {selectedRequest.dietaryRestrictions}
                </div>
              )}
              {selectedRequest.preferredCuisine && (
                <div>
                  <strong>Предпочитаемая кухня:</strong> {selectedRequest.preferredCuisine}
                </div>
              )}
              {selectedRequest.servingStyle && (
                <div>
                  <strong>Стиль подачи:</strong> {selectedRequest.servingStyle}
                </div>
              )}
              {selectedRequest.specialRequests && (
                <div>
                  <strong>Особые пожелания:</strong> {selectedRequest.specialRequests}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Чат */}
      {chatRequestId && (
        <HelpGuestChat
          requestId={chatRequestId}
          onClose={() => setChatRequestId(null)}
          isChef={true}
        />
      )}

      {/* Торги */}
      {biddingRequest && (
        <HelpGuestBidding
          request={biddingRequest}
          onClose={() => setBiddingRequest(null)}
          isChef={true}
        />
      )}
      </div>
    </div>
  );
};

export default ChefHelpGuestRequests;
