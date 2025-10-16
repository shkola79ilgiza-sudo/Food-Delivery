import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const OrderTracking = ({ order, onClose }) => {
  const { t } = useLanguage();
  const { socket } = useWebSocket();
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending');
  const [eta, setEta] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  // Статусы заказа
  const statuses = [
    { id: 'pending', name: 'Ожидает', icon: '⏳', color: '#FFA500' },
    { id: 'confirmed', name: 'Подтвержден', icon: '✅', color: '#4CAF50' },
    { id: 'preparing', name: 'Готовится', icon: '👨‍🍳', color: '#2196F3' },
    { id: 'ready', name: 'Готов', icon: '🍽️', color: '#9C27B0' },
    { id: 'delivering', name: 'В доставке', icon: '🚗', color: '#FF9800' },
    { id: 'delivered', name: 'Доставлен', icon: '🎉', color: '#4CAF50' }
  ];

  // Рассчитываем ETA
  useEffect(() => {
    if (order) {
      const orderTime = new Date(order.createdAt || Date.now());
      const prepTime = order.preparationTime || 30; // минуты
      const deliveryTime = order.deliveryTime || 20; // минуты
      
      const totalMinutes = prepTime + deliveryTime;
      const deliveryDate = new Date(orderTime.getTime() + totalMinutes * 60000);
      
      setEstimatedDelivery(deliveryDate);
      
      // Обновляем ETA каждую минуту
      const updateETA = () => {
        const now = new Date();
        const diff = deliveryDate - now;
        
        if (diff > 0) {
          const minutes = Math.floor(diff / 60000);
          setEta(minutes);
        } else {
          setEta(0);
        }
      };
      
      updateETA();
      const interval = setInterval(updateETA, 60000); // каждую минуту
      
      return () => clearInterval(interval);
    }
  }, [order]);

  // Слушаем обновления статуса через WebSocket
  useEffect(() => {
    if (socket && order) {
      const handleStatusUpdate = (data) => {
        if (data.orderId === order.id) {
          setCurrentStatus(data.status);
        }
      };

      socket.on('orderStatusUpdate', handleStatusUpdate);

      return () => {
        socket.off('orderStatusUpdate', handleStatusUpdate);
      };
    }
  }, [socket, order]);

  // Получаем текущий индекс статуса
  const getCurrentStatusIndex = () => {
    return statuses.findIndex(s => s.id === currentStatus);
  };

  // Форматирование времени
  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentStatusIndex = getCurrentStatusIndex();
  const currentStatusData = statuses[currentStatusIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#2D5016' }}>
            📦 Отслеживание заказа
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Номер заказа */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Заказ №</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {order?.id?.slice(-8).toUpperCase() || 'N/A'}
          </div>
        </div>

        {/* ETA - Расчетное время прибытия */}
        {currentStatus !== 'delivered' && eta !== null && (
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              ⏱️ Расчетное время прибытия
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {eta > 0 ? `~${eta} мин` : 'Скоро!'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
              Примерно в {formatTime(estimatedDelivery)}
            </div>
          </div>
        )}

        {/* Текущий статус */}
        <div style={{
          background: `linear-gradient(135deg, ${currentStatusData?.color}22, ${currentStatusData?.color}44)`,
          border: `2px solid ${currentStatusData?.color}`,
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {currentStatusData?.icon}
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: currentStatusData?.color 
          }}>
            {currentStatusData?.name}
          </div>
        </div>

        {/* Прогресс-бар */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            height: '6px',
            background: '#e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50, #45a049)',
              width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%`,
              transition: 'width 0.5s ease',
              borderRadius: '10px'
            }} />
          </div>

          {/* Все этапы */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px'
          }}>
            {statuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div
                  key={status.id}
                  style={{
                    padding: '15px 10px',
                    borderRadius: '12px',
                    background: isCompleted 
                      ? `linear-gradient(135deg, ${status.color}22, ${status.color}44)`
                      : '#f5f5f5',
                    border: isCurrent 
                      ? `2px solid ${status.color}` 
                      : '2px solid transparent',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    opacity: isCompleted ? 1 : 0.5
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '5px' }}>
                    {status.icon}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isCompleted ? status.color : '#666'
                  }}>
                    {status.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Детали заказа */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px',
            color: '#2D5016'
          }}>
            📝 Детали заказа
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Повар:</span>
              <span style={{ fontWeight: 'bold' }}>{order?.chefName || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Блюд:</span>
              <span style={{ fontWeight: 'bold' }}>{order?.items?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Сумма:</span>
              <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {order?.total || 0} ₽
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Время заказа:</span>
              <span style={{ fontWeight: 'bold' }}>
                {formatTime(new Date(order?.createdAt))}
              </span>
            </div>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #2D5016, #4A7C59)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;

