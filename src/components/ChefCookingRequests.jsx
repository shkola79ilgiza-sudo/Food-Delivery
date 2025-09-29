import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import '../App.css';

const ChefCookingRequests = ({ onClose }) => {
  const { showSuccess, showError } = useToast();
  const [cookingRequests, setCookingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Загружаем запросы на приготовление
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
  }, [loadCookingRequests]);

  // Обновляем статус запроса
  const updateRequestStatus = (requestId, newStatus) => {
    try {
      const requests = JSON.parse(localStorage.getItem('cookingRequests') || '[]');
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus, updatedAt: new Date().toISOString() }
          : request
      );
      localStorage.setItem('cookingRequests', JSON.stringify(updatedRequests));
      setCookingRequests(updatedRequests);
      showSuccess(`Статус запроса обновлен на "${getStatusText(newStatus)}"`);
      
      // Отправляем уведомление клиенту
      console.log('Sending notification to client for request:', requestId, 'status:', newStatus);
      sendNotificationToClient(requestId, newStatus);
    } catch (error) {
      console.error('Error updating request status:', error);
      showError('Ошибка обновления статуса запроса');
    }
  };

  // Отправляем уведомление клиенту о изменении статуса
  const sendNotificationToClient = (requestId, newStatus) => {
    try {
      // Получаем существующие уведомления клиента
      const clientNotifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
      
      // Создаем новое уведомление
      const notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'cooking_request_update',
        title: getStatusText(newStatus),
        message: getStatusMessage(newStatus),
        requestId: requestId,
        orderId: requestId, // Добавляем orderId для навигации
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Добавляем уведомление в начало списка
      const updatedNotifications = [notification, ...clientNotifications].slice(0, 50);
      
      // Сохраняем уведомления
      localStorage.setItem('clientNotifications', JSON.stringify(updatedNotifications));
      
      // Отправляем событие для обновления уведомлений в реальном времени
      window.dispatchEvent(new CustomEvent('clientNotificationAdded', { 
        detail: notification 
      }));
      
      // Также отправляем событие для обновления счетчика
      window.dispatchEvent(new CustomEvent('clientNotificationsUpdated'));
      
      console.log('Notification sent to client:', notification);
      console.log('Total client notifications now:', updatedNotifications.length);
    } catch (error) {
      console.error('Error sending notification to client:', error);
    }
  };

  // Получаем сообщение о статусе для уведомления
  const getStatusMessage = (status) => {
    const messageMap = {
      'pending': 'Ваш запрос отправлен и ожидает рассмотрения поваром',
      'accepted': 'Повар принял ваш запрос! Скоро начнется приготовление',
      'in_progress': 'Повар готовит ваше блюдо! Это может занять некоторое время',
      'completed': 'Ваше блюдо готово! Можете забрать заказ',
      'rejected': 'К сожалению, повар не может выполнить ваш запрос'
    };
    return messageMap[status] || 'Статус запроса изменен';
  };

  // Получаем текст статуса
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает',
      'accepted': 'Принят',
      'in_progress': 'В работе',
      'completed': 'Завершен',
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

  return (
    <div className="chef-cooking-requests" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="chef-cooking-requests-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #495057)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
            }}
          >
            ← Назад
          </button>
          <h2>👨‍🍳 Запросы на приготовление</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Всего запросов: {cookingRequests.length}
          </span>
          <button
            onClick={loadCookingRequests}
            style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {cookingRequests.length === 0 ? (
        <div className="no-requests">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍽️</div>
            <h3>Нет запросов на приготовление</h3>
            <p>Клиенты еще не отправляли запросы на приготовление блюд из своих продуктов</p>
          </div>
        </div>
      ) : (
        <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cookingRequests.map(request => (
            <div key={request.id} className="request-card" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
              padding: '25px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px'
            }}>
              <div className="request-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #e9ecef'
              }}>
                <div className="request-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#2c3e50', 
                    fontSize: '18px', 
                    fontWeight: 'bold' 
                  }}>
                    Запрос #{request.id.split('-').pop()}
                  </h3>
                  <span 
                    className="request-status"
                    style={{ 
                      backgroundColor: getStatusColor(request.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>
                <div className="request-date" style={{
                  color: '#6c757d',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {formatDate(request.createdAt)}
                </div>
              </div>

              <div className="request-content" style={{ marginBottom: '20px' }}>
                <div className="request-section" style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#495057', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📝 Описание продуктов:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#2c3e50', 
                    fontSize: '14px', 
                    lineHeight: '1.6',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    {request.productsDescription}
                  </p>
                </div>

                <div className="request-section" style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#495057', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🍽️ Желаемое блюдо:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#2c3e50', 
                    fontSize: '14px', 
                    lineHeight: '1.6',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    {request.desiredDish}
                  </p>
                </div>

                {request.specialInstructions && (
                  <div className="request-section" style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 10px 0', 
                      color: '#495057', 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📋 Особые указания:
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: '#2c3e50', 
                      fontSize: '14px', 
                      lineHeight: '1.6',
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      {request.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="request-section" style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#495057', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    💰 Предлагаемая стоимость:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#28a745', 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
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
                paddingTop: '20px',
                borderTop: '2px solid #e9ecef'
              }}>
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'accepted')}
                      style={{
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
                      }}
                    >
                      ✅ Принять
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                      style={{
                        background: 'linear-gradient(135deg, #dc3545, #c82333)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 12px rgba(220, 53, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                      }}
                    >
                      ❌ Отклонить
                    </button>
                  </>
                )}

                {request.status === 'accepted' && (
                  <button
                    onClick={() => updateRequestStatus(request.id, 'in_progress')}
                    style={{
                      background: 'linear-gradient(135deg, #007bff, #0056b3)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}
                    >
                    🔄 Начать готовить
                  </button>
                )}

                {request.status === 'in_progress' && (
                  <button
                    onClick={() => updateRequestStatus(request.id, 'completed')}
                    style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}
                  >
                    ✅ Завершить
                  </button>
                )}

                <button
                  onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                  style={{
                    background: 'linear-gradient(135deg, #6c757d, #495057)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(108, 117, 125, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.3)';
                  }}
                >
                  {selectedRequest === request.id ? '📝 Скрыть детали' : '👁️ Показать детали'}
                </button>
              </div>

              {selectedRequest === request.id && (
                <div className="request-details">
                  <div className="request-meta">
                    <p><strong>ID запроса:</strong> {request.id}</p>
                    <p><strong>Создан:</strong> {formatDate(request.createdAt)}</p>
                    {request.updatedAt && (
                      <p><strong>Обновлен:</strong> {formatDate(request.updatedAt)}</p>
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

export default ChefCookingRequests;
