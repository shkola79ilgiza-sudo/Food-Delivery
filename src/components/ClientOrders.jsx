import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { safeSetClientOrders } from '../utils/safeStorage';
import OrderHistory from './OrderHistory';
import FeedbackModal from './FeedbackModal';
import CourierTracking from './CourierTracking';

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Загружаем заказы и запросы на приготовление
  const loadOrdersAndRequests = useCallback(() => {
    try {
      // Загружаем обычные заказы
      const savedOrders = localStorage.getItem('clientOrders');
      let orders = [];
      if (savedOrders) {
        orders = JSON.parse(savedOrders);
      }

      // Загружаем запросы на приготовление
      const savedRequests = localStorage.getItem('cookingRequests');
      let cookingRequests = [];
      if (savedRequests) {
        cookingRequests = JSON.parse(savedRequests);
      }

      // Преобразуем запросы на приготовление в формат заказов
      const convertedRequests = cookingRequests.map(request => ({
        id: `cooking-${request.id}`,
        dishes: request.dishes || [],
        totalPrice: request.budget || 0,
        status: request.status || 'pending',
        createdAt: request.createdAt,
        deliveryAddress: request.address || '',
        deliveryTime: request.preferredTime || '',
        notes: request.specialRequests || '',
        type: 'cooking_request',
        originalRequest: request
      }));

      // Объединяем заказы и запросы
      const allOrders = [...orders, ...convertedRequests];
      
      // Сортируем по дате создания (новые сверху)
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      showError('Ошибка загрузки заказов');
    }
  }, [showError]);

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
      return;
    }

    // Загрузка заказов и запросов на приготовление
    loadOrdersAndRequests();

    // Загрузка уведомлений
    loadNotifications();
    
    setLoading(false);
  }, [navigate, loadOrdersAndRequests]);

  // Эффект для прокрутки к заказу после загрузки
  useEffect(() => {
    if (orders.length > 0) {
      const highlightOrderId = localStorage.getItem('highlightOrderId');
      if (highlightOrderId) {
        // Удаляем ID из localStorage
        localStorage.removeItem('highlightOrderId');
        
        // Ищем заказ по ID
        const orderElement = document.getElementById(`order-${highlightOrderId}`);
        if (orderElement) {
          // Прокручиваем к заказу с анимацией
          orderElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Подсвечиваем заказ
          orderElement.style.backgroundColor = '#fff3cd';
          orderElement.style.border = '2px solid #ffc107';
          orderElement.style.borderRadius = '8px';
          orderElement.style.transition = 'all 0.3s ease';
          
          // Убираем подсветку через 3 секунды
          setTimeout(() => {
            orderElement.style.backgroundColor = '';
            orderElement.style.border = '';
            orderElement.style.borderRadius = '';
          }, 3000);
        }
      }
    }
  }, [orders]);

  const loadNotifications = () => {
    try {
      const savedNotifications = localStorage.getItem('clientNotifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        const unread = parsedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const checkForDeliveredOrders = useCallback(() => {
    try {
      const deliveredOrders = orders.filter(order => 
        order.status === 'delivered' && 
        !order.feedbackGiven
      );
      
      if (deliveredOrders.length > 0) {
        const latestOrder = deliveredOrders[0];
        setFeedbackOrderId(latestOrder.id);
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Ошибка проверки доставленных заказов:', error);
    }
  }, [orders]);

  // Слушаем изменения уведомлений и запросов на приготовление
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'clientNotifications') {
        loadNotifications();
      } else if (e.key === 'cookingRequests') {
        loadOrdersAndRequests();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadOrdersAndRequests]);

  // Проверяем доставленные заказы для показа фидбека
  useEffect(() => {
    if (orders.length > 0) {
      checkForDeliveredOrders();
    }
  }, [orders, checkForDeliveredOrders]);

  // Функции для работы с рейтингами и отзывами
  const handleRateOrder = (orderId, rating) => {
    console.log('⭐ RATING ORDER:', orderId, 'with rating:', rating);
    
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, rating, ratedAt: new Date().toISOString(), chefId: 'chef-1' }
        : order
    );
    setOrders(updatedOrders);
    safeSetClientOrders(updatedOrders);
    
    console.log('⭐ Updated orders:', updatedOrders);
    console.log('⭐ Order rated:', orderId, 'Rating:', rating);
    
    // Принудительно проверяем сохранение
    const savedData = localStorage.getItem('clientOrders');
    console.log('⭐ Saved to localStorage:', savedData);
    const parsedData = JSON.parse(savedData || '[]');
    console.log('⭐ Parsed from localStorage:', parsedData);
    
    // Отправляем событие для обновления рейтинга повара
    const event = new CustomEvent('orderRated', { 
      detail: { orderId, rating, chefId: 'chef-1' } 
    });
    console.log('⭐ Dispatching orderRated event:', event);
    window.dispatchEvent(event);
    
    // Дополнительно отправляем событие storage для принудительного обновления
    const storageEvent = new StorageEvent('storage', {
      key: 'clientOrders',
      newValue: JSON.stringify(updatedOrders)
    });
    console.log('⭐ Dispatching storage event:', storageEvent);
    window.dispatchEvent(storageEvent);
  };

  const handleAddReview = (orderId, review) => {
    console.log('💬 ADDING REVIEW to order:', orderId, review);
    
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            reviews: [...(order.reviews || []), review]
          }
        : order
    );
    
    console.log('💬 Updated orders with review:', updatedOrders);
    setOrders(updatedOrders);
    safeSetClientOrders(updatedOrders);
    
    // Отправляем событие для обновления рейтинга повара
    const event = new CustomEvent('reviewAdded', { 
      detail: { orderId, review, chefId: 'chef-1' } 
    });
    console.log('💬 Dispatching reviewAdded event:', event);
    window.dispatchEvent(event);
    
    // Дополнительно отправляем событие storage для принудительного обновления
    const storageEvent = new StorageEvent('storage', {
      key: 'clientOrders',
      newValue: JSON.stringify(updatedOrders)
    });
    console.log('💬 Dispatching storage event:', storageEvent);
    window.dispatchEvent(storageEvent);
  };

  const handleUpdateReview = (orderId, updatedReview) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            reviews: order.reviews?.map(review => 
              review.id === updatedReview.id ? updatedReview : review
            ) || []
          }
        : order
    );
    setOrders(updatedOrders);
    safeSetClientOrders(updatedOrders);
  };

  const handleDeleteReview = (orderId, reviewId) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            reviews: order.reviews?.filter(review => review.id !== reviewId) || []
          }
        : order
    );
    setOrders(updatedOrders);
    safeSetClientOrders(updatedOrders);
  };

  // Функция повторного заказа
  const handleReorder = (order) => {
    // Добавляем все блюда из заказа в корзину
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const newCartItems = order.items.map(item => ({
      ...item,
      id: `${item.id}-${Date.now()}`, // Уникальный ID для нового заказа
      quantity: item.quantity
    }));
    
    const updatedCart = [...cart, ...newCartItems];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Показываем уведомление об успехе
    showSuccess(t.reorderSuccess);
    
    // Переходим в корзину
    navigate('/client/cart');
  };

  const handleTrackCourier = (orderId) => {
    setTrackingOrderId(orderId);
    setShowTracking(true);
  };

  if (loading) {
    return (
      <div className="client-orders-container">
        <div className="loading">{t.loading}...</div>
      </div>
    );
  }

  return (
    <div className="client-orders-container">
      <header className="orders-header">
        <h1>
          {t.myOrders}
          {unreadCount > 0 && (
            <span className="notification-badge" style={{
              background: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginLeft: '10px',
              display: 'inline-block',
              minWidth: '20px',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}>
              🔔 {unreadCount}
            </span>
          )}
        </h1>
        <div className="orders-actions">
          <Link to="/client/menu" className="back-to-menu">← {t.backToMenu}</Link>
        </div>
      </header>

      <OrderHistory
        orders={orders}
        onRateOrder={handleRateOrder}
        onAddReview={handleAddReview}
        onUpdateReview={handleUpdateReview}
        onDeleteReview={handleDeleteReview}
        onReorder={handleReorder}
        onTrackCourier={handleTrackCourier}
      />

      {showFeedback && (
        <FeedbackModal
          orderId={feedbackOrderId}
          onClose={() => {
            setShowFeedback(false);
            setFeedbackOrderId(null);
          }}
          onSubmit={(feedback) => {
            // Помечаем заказ как получивший фидбек
            const updatedOrders = orders.map(order => 
              order.id === feedbackOrderId 
                ? { ...order, feedbackGiven: true }
                : order
            );
            setOrders(updatedOrders);
            
            // Сохраняем в localStorage
            safeSetClientOrders(updatedOrders);
          }}
        />
      )}

      {showTracking && (
        <CourierTracking
          orderId={trackingOrderId}
          onClose={() => {
            setShowTracking(false);
            setTrackingOrderId(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientOrders;