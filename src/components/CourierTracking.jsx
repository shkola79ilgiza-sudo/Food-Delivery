import React, { useState, useEffect, useRef, useCallback } from 'react';

const CourierTracking = ({ orderId, onClose }) => {
  const mapRef = useRef(null);
  const [courierLocation, setCourierLocation] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateRoutePoints = useCallback((start, end, count) => {
    const points = [];
    for (let i = 0; i <= count; i++) {
      const ratio = i / count;
      const lat = start.lat + (end.lat - start.lat) * ratio + (Math.random() - 0.5) * 0.01;
      const lng = start.lng + (end.lng - start.lng) * ratio + (Math.random() - 0.5) * 0.01;
      
      points.push({
        lat,
        lng,
        timestamp: new Date(Date.now() - (count - i) * 2 * 60 * 1000), // 2 минуты между точками
        status: i === 0 ? 'restaurant' : i === count ? 'delivered' : 'en_route'
      });
    }
    return points;
  }, []);

  const generateDemoRoute = useCallback((order) => {
    // Координаты для демо (Казань)
    const restaurantCoords = { lat: 55.8304, lng: 49.0661 };
    const clientCoords = { lat: 55.7961, lng: 49.1064 };
    
    // Генерируем промежуточные точки маршрута
    const routePoints = generateRoutePoints(restaurantCoords, clientCoords, 8);
    
    setTrackingHistory(routePoints);
    setCourierLocation(routePoints[0]);
    
    // Рассчитываем примерное время прибытия
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 15 + Math.random() * 10);
    setEstimatedArrival(estimatedTime);
  }, [generateRoutePoints]);

  const loadOrderDetails = useCallback(() => {
    try {
      const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        setOrderDetails(order);
        
        // Генерируем примерный маршрут для демо
        generateDemoRoute(order);
      }
    } catch (error) {
      console.error('Ошибка загрузки деталей заказа:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, generateDemoRoute]);

  const startTracking = useCallback(() => {
    // Симуляция отслеживания курьера
    const trackingInterval = setInterval(() => {
      // Генерируем случайное местоположение курьера
      const lat = 55.7558 + (Math.random() - 0.5) * 0.01;
      const lng = 37.6176 + (Math.random() - 0.5) * 0.01;
      
      setCourierLocation({ lat, lng });
      
      // Обновляем историю отслеживания
      setTrackingHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        location: { lat, lng },
        status: 'en_route'
      }]);
    }, 5000);
    
    return trackingInterval;
  }, []);

  const stopTracking = useCallback(() => {
    // Остановка отслеживания
    console.log('Отслеживание остановлено');
  }, []);

  useEffect(() => {
    loadOrderDetails();
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, [orderId, loadOrderDetails, startTracking, stopTracking]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'restaurant': 'В ресторане',
      'en_route': 'В пути',
      'nearby': 'Рядом с вами',
      'delivered': 'Доставлено'
    };
    return statusTexts[status] || 'Неизвестно';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'restaurant': '#ffc107',
      'en_route': '#007bff',
      'nearby': '#28a745',
      'delivered': '#6c757d'
    };
    return statusColors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="courier-tracking-modal-overlay" onClick={onClose}>
        <div className="courier-tracking-modal" onClick={(e) => e.stopPropagation()}>
          <div className="courier-tracking-header">
            <h2>🚚 Отслеживание курьера</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="courier-tracking-content">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Загрузка данных...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courier-tracking-modal-overlay" onClick={onClose}>
      <div className="courier-tracking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="courier-tracking-header">
          <h2>🚚 Отслеживание курьера</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="courier-tracking-content">
          {/* Карта */}
          <div className="tracking-map-container">
            <div className="demo-map" ref={mapRef}>
              <div className="map-placeholder">
                <div className="map-icon">🗺️</div>
                <h3>Карта доставки</h3>
                <p>В реальном приложении здесь будет интерактивная карта</p>
                
                {/* Демо-маршрут */}
                <div className="demo-route">
                  <div className="route-point restaurant">
                    <div className="point-icon">🍽️</div>
                    <div className="point-label">Ресторан</div>
                  </div>
                  
                  <div className="route-line">
                    {courierLocation && (
                      <div 
                        className="courier-marker"
                        style={{
                          left: `${(trackingHistory.findIndex(p => p.lat === courierLocation.lat) / (trackingHistory.length - 1)) * 100}%`
                        }}
                      >
                        🚚
                      </div>
                    )}
                  </div>
                  
                  <div className="route-point client">
                    <div className="point-icon">🏠</div>
                    <div className="point-label">Ваш адрес</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Информация о курьере */}
          <div className="courier-info">
            <div className="courier-status">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(courierLocation?.status) }}
              >
                <div className="status-pulse"></div>
              </div>
              <div className="status-details">
                <h3>{getStatusText(courierLocation?.status)}</h3>
                <p>
                  {courierLocation?.status === 'delivered' 
                    ? 'Заказ доставлен' 
                    : `Примерное время прибытия: ${formatTime(estimatedArrival)}`
                  }
                </p>
              </div>
            </div>

            {/* Детали заказа */}
            {orderDetails && (
              <div className="order-details">
                <h4>Детали заказа</h4>
                <div className="detail-item">
                  <span>Номер заказа:</span>
                  <span>#{orderId.slice(-6)}</span>
                </div>
                <div className="detail-item">
                  <span>Курьер:</span>
                  <span>Иван Петров</span>
                </div>
                <div className="detail-item">
                  <span>Телефон:</span>
                  <span>+7 (999) 123-45-67</span>
                </div>
                <div className="detail-item">
                  <span>Адрес доставки:</span>
                  <span>{orderDetails.customer?.address || 'Не указан'}</span>
                </div>
              </div>
            )}

            {/* История отслеживания */}
            <div className="tracking-history">
              <h4>История движения</h4>
              <div className="history-timeline">
                {trackingHistory.slice().reverse().map((point, index) => (
                  <div 
                    key={index}
                    className={`timeline-item ${point === courierLocation ? 'current' : ''}`}
                  >
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">
                        {formatTime(point.timestamp)}
                      </div>
                      <div className="timeline-status">
                        {getStatusText(point.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierTracking;
