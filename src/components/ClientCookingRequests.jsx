import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import '../App.css';

const ClientCookingRequests = () => {
  const { showError, showSuccess } = useToast();
  const [cookingRequests, setCookingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Загружаем запросы на приготовление клиента
  const loadCookingRequests = useCallback(() => {
    try {
      const requests = JSON.parse(localStorage.getItem('cookingRequests') || '[]');
      // Сортируем по дате создания (новые сверху)
      const sortedRequests = requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCookingRequests(sortedRequests);
    } catch (error) {
      console.error('Error loading cooking requests:', error);
      showError('Ошибка загрузки запросов на приготовление');
    }
  }, [showError]);

  useEffect(() => {
    loadCookingRequests();
  }, []);

  // Эффект для подсветки запроса после загрузки
  useEffect(() => {
    if (cookingRequests.length > 0) {
      const highlightRequestId = localStorage.getItem('highlightCookingRequestId');
      if (highlightRequestId) {
        localStorage.removeItem('highlightCookingRequestId');
        const requestElement = document.getElementById(`cooking-request-${highlightRequestId}`);
        if (requestElement) {
          requestElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          requestElement.style.backgroundColor = '#fff3cd';
          requestElement.style.border = '2px solid #ffc107';
          requestElement.style.borderRadius = '8px';
          requestElement.style.transition = 'all 0.3s ease';
          setTimeout(() => {
            requestElement.style.backgroundColor = '';
            requestElement.style.border = '';
            requestElement.style.borderRadius = '';
          }, 3000);
        }
      }
    }
  }, [cookingRequests]);

  useEffect(() => {
    // Слушаем изменения в localStorage для обновления в реальном времени
    const handleStorageChange = () => {
      loadCookingRequests();
    };
    
    // Слушаем события уведомлений
    const handleNotificationAdded = (event) => {
      console.log('Cooking request notification received:', event.detail);
      loadCookingRequests();
    };

    const handleNotificationsUpdated = () => {
      console.log('Cooking requests updated');
      loadCookingRequests();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('clientNotificationAdded', handleNotificationAdded);
    window.addEventListener('clientNotificationsUpdated', handleNotificationsUpdated);
    
    // Проверяем изменения каждые 5 секунд
    const interval = setInterval(loadCookingRequests, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clientNotificationAdded', handleNotificationAdded);
      window.removeEventListener('clientNotificationsUpdated', handleNotificationsUpdated);
      clearInterval(interval);
    };
  }, [loadCookingRequests]);

  // Получаем текст статуса
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает рассмотрения',
      'accepted': 'Принят поваром',
      'in_progress': 'Готовится',
      'completed': 'Готово',
      'rejected': 'Отклонен'
    };
    return statusMap[status] || status;
  };

  // Получаем цвет статуса
  const getStatusColor = (status) => {
    const colorMap = {
      'pending': '#ffc107',
      'accepted': '#17a2b8',
      'in_progress': '#007bff',
      'completed': '#28a745',
      'rejected': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  };

  // Получаем иконку статуса
  const getStatusIcon = (status) => {
    const iconMap = {
      'pending': '⏳',
      'accepted': '✅',
      'in_progress': '👨‍🍳',
      'completed': '🎉',
      'rejected': '❌'
    };
    return iconMap[status] || '❓';
  };

  // Форматируем дату
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получаем сообщение о статусе
  const getStatusMessage = (status) => {
    const messageMap = {
      'pending': 'Ваш запрос отправлен и ожидает рассмотрения поваром',
      'accepted': 'Повар принял ваш запрос! Скоро начнется приготовление',
      'in_progress': 'Повар готовит ваше блюдо! Это может занять некоторое время',
      'completed': 'Ваше блюдо готово! Можете забрать заказ',
      'rejected': 'К сожалению, повар не может выполнить ваш запрос'
    };
    return messageMap[status] || 'Неизвестный статус';
  };

  // Обработка создания нового запроса
  const handleCreateRequest = () => {
    // Здесь можно добавить логику создания нового запроса
    showSuccess('Функция создания запроса будет добавлена');
  };

  return (
    <div className="client-cooking-requests" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="client-cooking-requests-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ 
            margin: 0, 
            color: '#2c3e50', 
            fontSize: '24px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            👨‍🍳 Мои запросы на приготовление
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Всего запросов: {cookingRequests.length}
          </span>
          
          {/* Кнопка создания запроса */}
          <button
            onClick={handleCreateRequest}
            style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)';
            }}
          >
            ➕ Новый запрос
          </button>
          
          {/* Кнопка обновления */}
          <button
            onClick={loadCookingRequests}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #495057)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(108, 117, 125, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.3)';
            }}
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {cookingRequests.length === 0 ? (
        <div className="no-requests" style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Нет запросов на приготовление</h3>
          <p style={{ color: '#6c757d', fontSize: '16px' }}>
            Вы еще не отправляли запросы на приготовление блюд из своих продуктов
          </p>
        </div>
      ) : (
        <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cookingRequests.map(request => (
            <div 
              key={request.id} 
              id={`cooking-request-${request.id}`}
              className="request-card" 
              style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
              padding: '25px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px',
              position: 'relative'
            }}>
              {/* Статус-бейдж */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: getStatusColor(request.status),
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <span>{getStatusIcon(request.status)}</span>
                {getStatusText(request.status)}
              </div>

              <div className="request-header" style={{
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #e9ecef'
              }}>
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#2c3e50', 
                  fontSize: '18px', 
                  fontWeight: 'bold' 
                }}>
                  Запрос #{request.id.split('-').pop()}
                </h3>
                <div style={{
                  color: '#6c757d',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {formatDate(request.createdAt)}
                </div>
              </div>

              {/* Сообщение о статусе */}
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>{getStatusIcon(request.status)}</span>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#495057' 
                  }}>
                    Статус: {getStatusText(request.status)}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#6c757d', 
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {getStatusMessage(request.status)}
                </p>
              </div>

              <div className="request-content" style={{ marginBottom: '20px' }}>
                <div className="request-section" style={{
                  marginBottom: '15px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#495057', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📝 Описание продуктов:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#2c3e50', 
                    fontSize: '13px', 
                    lineHeight: '1.4',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    {request.productsDescription}
                  </p>
                </div>

                <div className="request-section" style={{
                  marginBottom: '15px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#495057', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🍽️ Желаемое блюдо:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#2c3e50', 
                    fontSize: '13px', 
                    lineHeight: '1.4',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    {request.desiredDish}
                  </p>
                </div>

                {request.specialInstructions && (
                  <div className="request-section" style={{
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#495057', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📋 Особые указания:
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: '#2c3e50', 
                      fontSize: '13px', 
                      lineHeight: '1.4',
                      backgroundColor: 'white',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6'
                    }}>
                      {request.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="request-section" style={{
                  marginBottom: '15px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#495057', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    💰 Стоимость приготовления:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#28a745', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center'
                  }}>
                    {request.estimatedPrice} ₽
                  </p>
                </div>
              </div>

              <div className="request-actions" style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                paddingTop: '15px',
                borderTop: '2px solid #e9ecef'
              }}>
                <button
                  onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                  style={{
                    background: 'linear-gradient(135deg, #6c757d, #495057)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(108, 117, 125, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.3)';
                  }}
                >
                  {selectedRequest === request.id ? '📝 Скрыть детали' : '👁️ Показать детали'}
                </button>
              </div>

              {selectedRequest === request.id && (
                <div className="request-details" style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div className="request-meta">
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#6c757d' }}>
                      <strong>ID запроса:</strong> {request.id}
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#6c757d' }}>
                      <strong>Создан:</strong> {formatDate(request.createdAt)}
                    </p>
                    {request.updatedAt && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>
                        <strong>Обновлен:</strong> {formatDate(request.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ClientCookingRequests;
