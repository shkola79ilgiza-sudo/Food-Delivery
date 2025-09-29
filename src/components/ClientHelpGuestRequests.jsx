import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import HelpGuestChat from './HelpGuestChat';
import HelpGuestBidding from './HelpGuestBidding';

const ClientHelpGuestRequests = () => {
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

  const loadRequests = () => {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('helpGuestRequests') || '[]');
      const clientId = localStorage.getItem('clientId') || 'demo_client';
      let clientRequests = savedRequests.filter(request => request.clientId === clientId);
      
      // Создаем тестовые запросы если их нет
      if (clientRequests.length === 0) {
        const testRequests = [
          {
            id: `help_${Date.now()}_1`,
            clientId: clientId,
            clientName: 'Иван Петров',
            eventDate: '2025-09-30',
            eventTime: '05:00-20:00',
            numberOfGuests: 10,
            eventType: 'birthday',
            budget: 5000,
            specialRequests: 'нет',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: `help_${Date.now()}_2`,
            clientId: clientId,
            clientName: 'Мария Сидорова',
            eventDate: '2025-09-30',
            eventTime: '05:00-18:00',
            numberOfGuests: 6,
            eventType: 'birthday',
            budget: 4999,
            specialRequests: 'что было вкусно',
            status: 'accepted',
            createdAt: new Date().toISOString()
          }
        ];
        
        // Сохраняем тестовые запросы
        const allRequests = [...savedRequests, ...testRequests];
        localStorage.setItem('helpGuestRequests', JSON.stringify(allRequests));
        clientRequests = testRequests;
      }
      
      setRequests(clientRequests);
      console.log('Загружены запросы:', clientRequests);
    } catch (error) {
      console.error('Error loading help guest requests:', error);
      showError('Ошибка загрузки запросов');
    } finally {
      setLoading(false);
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

  console.log('Фильтрация запросов:', {
    totalRequests: requests.length,
    filter,
    filteredCount: filteredRequests.length,
    requests: requests.map(r => ({ id: r.id, status: r.status }))
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

  console.log('ClientHelpGuestRequests рендерится:', { 
    requests: requests.length, 
    selectedRequest: selectedRequest?.id, 
    chatRequestId, 
    biddingRequest: biddingRequest?.id 
  });

  return (
    <div style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100%'
    }}>
      <div style={{ marginBottom: '20px' }}>
        
        
        {/* Фильтры */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              Фильтр:
            </label>
            <select
              value={filter}
              onChange={(e) => {
                console.log('Фильтр изменен на:', e.target.value);
                setFilter(e.target.value);
              }}
              onClick={(e) => {
                console.log('Клик по dropdown фильтра');
                e.stopPropagation();
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white',
                position: 'relative',
                zIndex: 100
              }}
            >
              <option value="all">Все запросы</option>
              <option value="pending">Ожидают</option>
              <option value="accepted">Приняты</option>
              <option value="rejected">Отклонены</option>
              <option value="completed">Завершены</option>
            </select>
            <span style={{ 
              fontSize: '12px', 
              color: '#666',
              background: '#f0f0f0',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Показано: {filteredRequests.length} из {requests.length}
            </span>
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
          <div>У вас нет запросов на помощь в готовке</div>
          <div style={{ fontSize: '14px', marginTop: '8px', color: '#888' }}>
            Создайте запрос, выбрав блюдо с иконкой 🍽️
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRequests.map(request => (
            <div
              key={request.id}
              onClick={(e) => {
                console.log('Клик по карточке запроса:', request.id, e.target);
              }}
              style={{
                border: '2px solid #e8f4f8',
                borderRadius: '15px',
                padding: '25px',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1,
                backdropFilter: 'blur(10px)',
                borderLeft: '5px solid #667eea'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#2c3e50', 
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    📋 Запрос #{request.id.slice(-6)}
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

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 100,
                pointerEvents: 'auto'
              }}>
                {/* Кнопка подробнее */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Кнопка "Подробнее" нажата для запроса:', request.id);
                    setSelectedRequest(request);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    e.target.style.background = '#5a6268';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    e.target.style.background = '#6c757d';
                  }}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    zIndex: 200,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'auto',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                >
                  👁️ Подробнее
                </button>

                {/* Кнопка чата - всегда доступна */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Кнопка "Чат" нажата для запроса:', request.id);
                    setChatRequestId(request.id);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    e.target.style.background = '#138496';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    e.target.style.background = '#17a2b8';
                  }}
                  style={{
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    zIndex: 200,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'auto',
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}
                >
                  💬 Чат с поваром
                </button>

                {/* Кнопка торгов - всегда доступна */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Кнопка "Торги" нажата для запроса:', request.id);
                    setBiddingRequest(request);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    e.target.style.background = 'linear-gradient(135deg, #218838, #1e7e34)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    e.target.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    zIndex: 200,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'auto',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                >
                  💰 Торги
                </button>

                {request.status === 'accepted' && (
                  <div style={{
                    padding: '8px 16px',
                    background: '#d4edda',
                    color: '#155724',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ✅ Повар готов помочь!
                  </div>
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
          zIndex: 9999
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
                onClick={() => setBiddingRequest(selectedRequest)}
                style={{
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💰 Торги
              </button>
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
        <div>
          {console.log('Рендерим HelpGuestChat с requestId:', chatRequestId)}
          <HelpGuestChat
            requestId={chatRequestId}
            onClose={() => {
              console.log('Закрываем чат');
              setChatRequestId(null);
            }}
            isChef={false}
          />
        </div>
      )}

      {/* Торги */}
      {biddingRequest && (
        <div>
          {console.log('Рендерим HelpGuestBidding с request:', biddingRequest)}
          <HelpGuestBidding
            request={biddingRequest}
            onClose={() => {
              console.log('Закрываем торги');
              setBiddingRequest(null);
            }}
            isChef={false}
          />
        </div>
      )}

    </div>
  );
};

export default ClientHelpGuestRequests;
