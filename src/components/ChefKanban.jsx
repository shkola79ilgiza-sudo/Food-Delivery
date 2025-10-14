import React, { useState, useEffect, useCallback } from 'react';
// import { useLanguage } from '../contexts/LanguageContext';
import { safeSetClientOrders } from '../utils/safeStorage';
import { useToast } from '../contexts/ToastContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import ChefOrderDetails from './ChefOrderDetails';
import SLATimers from './SLATimers';

const ChefKanban = ({ onClose }) => {
  // const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { emit } = useWebSocket();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Статусы заказов для колонок
  const statusColumns = [
    { id: 'pending_confirmation', title: 'Ожидает подтверждения', color: '#ffc107' },
    { id: 'confirmed', title: 'Подтвержден', color: '#17a2b8' },
    { id: 'preparing', title: 'Готовится', color: '#fd7e14' },
    { id: 'ready', title: 'Готово', color: '#28a745' },
    { id: 'delivering', title: 'В доставке', color: '#6f42c1' },
    { id: 'delivered', title: 'Доставлено', color: '#6c757d' }
  ];

  const loadOrders = useCallback(() => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const chefId = localStorage.getItem('chefId') || 'demo-chef-1';
      
      console.log('All orders:', allOrders);
      console.log('Chef ID:', chefId);
      
      // Фильтруем заказы для текущего повара
      // Проверяем разные возможные структуры данных
      const chefOrders = allOrders.filter(order => {
        console.log('Checking order:', order.id, 'chefId:', order.chefId, 'items:', order.items);
        
        // Проверяем, есть ли chefId в самом заказе
        if (order.chefId === chefId) {
          console.log('Order matches by order.chefId');
          return true;
        }
        
        // Проверяем, есть ли items с chefId
        if (order.items && order.items.some(item => item.chefId === chefId)) {
          console.log('Order matches by item.chefId');
          return true;
        }
        
        // Если нет chefId, считаем заказ принадлежащим демо-повару
        if (!order.chefId && chefId === 'demo-chef-1') {
          console.log('Order matches by default demo-chef-1');
          return true;
        }
        
        console.log('Order does not match');
        return false;
      });
      
      console.log('Chef orders:', chefOrders);
      setOrders(chefOrders);
      
      // Обновляем счетчик неподтвержденных заказов
      const pendingCount = chefOrders.filter(order => 
        order.status === 'pending_confirmation' || 
        order.status === 'pending' || 
        order.status === 'pending_payment'
      ).length;
      setPendingOrdersCount(pendingCount);
      localStorage.setItem('pendingOrdersCount', pendingCount.toString());
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      showError('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createTestOrders = useCallback(() => {
    try {
      const chefId = localStorage.getItem('chefId') || 'demo-chef-1';
      
      // Создаем заказ точно в том же формате, что и реальные заказы
      const testOrders = [
        {
          id: 'order-1758908629072',
          chefId: chefId,
          status: 'pending_confirmation',
          createdAt: new Date().toISOString(),
          customer: {
            name: 'Клиент',
            phone: '+7 (999) 123-45-67',
            address: 'вптыяет'
          },
          items: [
            { 
              id: 'dish-1', 
              name: 'Борщ украинский', 
              price: 350, 
              quantity: 1, 
              chefId: chefId 
            }
          ],
          total: 0, // Как в реальном заказе
          payment: {
            method: 'cash',
            total: 0,
            commission: 0,
            chefAmount: 0
          },
          delivery: {
            method: 'delivery',
            date: '2025-09-26',
            time: '15:30',
            address: 'вптыяет'
          },
          subtotal: 350,
          deliveryCost: 0,
          discount: 0
        },
        {
          id: 'test-order-2',
          chefId: chefId,
          status: 'confirmed',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          customer: {
            name: 'Мария Сидорова',
            phone: '+7 (999) 234-56-78'
          },
          items: [
            { id: 'dish-3', name: 'Плов', price: 300, quantity: 2, chefId: chefId }
          ],
          total: 600,
          payment: {
            method: 'card',
            total: 600,
            commission: 60,
            chefAmount: 540
          },
          delivery: {
            method: 'pickup'
          },
          subtotal: 600,
          deliveryCost: 0,
          discount: 0
        }
      ];
      
      localStorage.setItem('clientOrders', JSON.stringify(testOrders));
      console.log('Созданы тестовые заказы:', testOrders);
      showSuccess('Созданы тестовые заказы!');
    } catch (error) {
      console.error('Ошибка создания тестовых заказов:', error);
      showError('Ошибка создания тестовых заказов');
    }
  }, [showError, showSuccess]);

  const createTestOrdersIfNeeded = useCallback(() => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      
      if (allOrders.length === 0) {
        createTestOrders();
      }
    } catch (error) {
      console.error('Ошибка проверки тестовых заказов:', error);
    }
  }, [createTestOrders]);

  useEffect(() => {
    // Создаем тестовые заказы, если их нет
    createTestOrdersIfNeeded();
    
    // Затем загружаем заказы
    loadOrders();
  }, [loadOrders, createTestOrdersIfNeeded]);

  // Обновляем время каждую секунду для таймеров
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Функция для обновления счетчика неподтвержденных заказов
  const updatePendingOrdersCount = () => {
    const pendingCount = orders.filter(order => 
      order.status === 'pending_confirmation' || 
      order.status === 'pending' || 
      order.status === 'pending_payment'
    ).length;
    setPendingOrdersCount(pendingCount);
    
    // Сохраняем счетчик в localStorage для использования в других компонентах
    localStorage.setItem('pendingOrdersCount', pendingCount.toString());
  };

  // Функция для расчета оставшегося времени приготовления
  const getRemainingTime = (order) => {
    if (!order.cookingStartTime) return null;
    
    try {
      const startTime = new Date(order.cookingStartTime);
      const cookingDuration = order.cookingDuration || order.estimatedPreparationTime || 30; // 30 минут по умолчанию
      const endTime = new Date(startTime.getTime() + cookingDuration * 60000);
      const remainingMs = endTime.getTime() - currentTime.getTime();
      
      if (remainingMs <= 0) return 0;
      
      return Math.ceil(remainingMs / 60000); // возвращаем минуты
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return null;
    }
  };

  // Функция для определения горящего заказа
  const isUrgentOrder = (order) => {
    const remainingTime = getRemainingTime(order);
    return remainingTime !== null && remainingTime <= 10 && remainingTime > 0;
  };

  // Функция для определения просроченного заказа
  const isOverdueOrder = (order) => {
    const remainingTime = getRemainingTime(order);
    return remainingTime !== null && remainingTime <= 0;
  };

  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    
    if (!draggedOrder) return;

    const newStatus = targetStatus;
    const orderId = draggedOrder.id;

    try {
      // Обновляем статус заказа
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Сохраняем в localStorage
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      safeSetClientOrders(updatedAllOrders);

      // Создаем уведомление для клиента
      createClientNotification(orderId, newStatus);

      // Отправляем WebSocket событие
      emit('orderStatusUpdate', {
        orderId,
        status: newStatus,
        chefId: draggedOrder.items?.[0]?.chefId || 'unknown',
        clientId: draggedOrder.customer?.id || 'unknown',
        timestamp: new Date().toISOString()
      });

      showSuccess(`Заказ перемещен в "${getStatusTitle(newStatus)}"`);
      
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showError('Ошибка обновления статуса');
      loadOrders(); // Восстанавливаем исходное состояние
    } finally {
      setDraggedOrder(null);
    }
  };

  const createClientNotification = (orderId, status) => {
    try {
      const notifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
      
      const statusMessages = {
        'pending_confirmation': 'Заказ ожидает подтверждения повара',
        'confirmed': 'Повар принял ваш заказ',
        'preparing': 'Повар начал готовить ваш заказ',
        'ready': 'Ваш заказ готов к выдаче',
        'delivering': 'Ваш заказ в пути',
        'delivered': 'Ваш заказ доставлен'
      };

      const notification = {
        id: `client-notification-${Date.now()}`,
        type: 'orderStatusUpdate',
        title: 'Обновление заказа',
        message: statusMessages[status] || 'Статус заказа изменен',
        orderId: orderId,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      notifications.unshift(notification);
      const limitedNotifications = notifications.slice(0, 50);
      localStorage.setItem('clientNotifications', JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('Error creating client notification:', error);
    }
  };

  const getStatusTitle = (status) => {
    const column = statusColumns.find(col => col.id === status);
    return column ? column.title : status;
  };

  // const getStatusColor = (status) => {
  //   const column = statusColumns.find(col => col.id === status);
  //   return column ? column.color : '#6c757d';
  // };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const closeOrderDetails = () => {
    setSelectedOrderId(null);
  };

  const handleOrderStatusUpdate = (orderId, newStatus) => {
    loadOrders(); // Перезагружаем заказы
    closeOrderDetails();
  };

  // Функция для обновления статуса заказа
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Обновляем статус заказа
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Сохраняем в localStorage
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      safeSetClientOrders(updatedAllOrders);

      // Создаем уведомление для клиента
      createClientNotification(orderId, newStatus);

      // Отправляем WebSocket событие
      emit('orderStatusUpdate', {
        orderId,
        status: newStatus,
        chefId: localStorage.getItem('chefId') || 'demo-chef-1',
        clientId: 'unknown',
        timestamp: new Date().toISOString()
      });

      showSuccess(`Заказ перемещен в "${getStatusTitle(newStatus)}"`);
      
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showError('Ошибка обновления статуса');
    }
  };

  // Упрощенные действия повара
  const confirmOrder = (orderId) => {
    try {
      // Обновляем статус заказа напрямую
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'confirmed', updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Сохраняем в localStorage
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'confirmed', updatedAt: new Date().toISOString() }
          : order
      );
      safeSetClientOrders(updatedAllOrders);

      // Создаем уведомление для клиента
      createClientNotification(orderId, 'confirmed');

      showSuccess('Заказ подтвержден!');
      
      // Обновляем счетчик неподтвержденных заказов
      setTimeout(() => {
        const pendingCount = updatedOrders.filter(order => 
          order.status === 'pending_confirmation' || 
          order.status === 'pending' || 
          order.status === 'pending_payment'
        ).length;
        setPendingOrdersCount(pendingCount);
        localStorage.setItem('pendingOrdersCount', pendingCount.toString());
      }, 100);
      
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showError('Ошибка обновления статуса');
    }
  };

  const startCooking = (orderId) => {
    try {
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'preparing',
              cookingStartTime: new Date().toISOString(),
              cookingDuration: order.estimatedPreparationTime || 30, // Используем оценку времени или 30 минут
              preparationStartTime: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : order
      );
      setOrders(updatedOrders);
      
      // Сохраняем в localStorage
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'preparing',
              cookingStartTime: new Date().toISOString(),
              cookingDuration: order.estimatedPreparationTime || 30,
              preparationStartTime: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : order
      );
      safeSetClientOrders(updatedAllOrders);
      
      createClientNotification(orderId, 'preparing');
      showSuccess('Начали готовить заказ!');
    } catch (error) {
      console.error('Error starting cooking:', error);
      showError('Ошибка при начале приготовления');
    }
  };

  const markAsReady = (orderId) => {
    try {
      // Обновляем статус заказа напрямую
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'ready', updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Сохраняем в localStorage
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'ready', updatedAt: new Date().toISOString() }
          : order
      );
      safeSetClientOrders(updatedAllOrders);

      // Создаем уведомление для клиента
      createClientNotification(orderId, 'ready');

      showSuccess('Заказ готов!');
      
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showError('Ошибка обновления статуса');
    }
  };

  const rejectOrder = (orderId) => {
    try {
      // Обновляем статус заказа напрямую
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'rejected', updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Сохраняем в localStorage
      const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'rejected', updatedAt: new Date().toISOString() }
          : order
      );
      safeSetClientOrders(updatedAllOrders);

      // Создаем уведомление для клиента
      createClientNotification(orderId, 'rejected');

      showSuccess('Заказ отклонен');
      
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showError('Ошибка обновления статуса');
    }
  };

  if (loading) {
    return (
      <div className="chef-kanban-modal-overlay" onClick={onClose}>
        <div className="chef-kanban-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chef-kanban-header">
            <h2>📋 Доска заказов ({orders.length} заказов)</h2>
            <div className="header-actions">
              <button 
                className="test-data-btn" 
                onClick={() => {
                  createTestOrders();
                  loadOrders();
                }}
                title="Создать тестовые заказы"
              >
                📝
              </button>
              <button 
                className="refresh-btn" 
                onClick={loadOrders}
                title="Обновить заказы"
              >
                🔄
              </button>
              <button 
                className="debug-btn" 
                onClick={() => {
                  const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
                  console.log('Все заказы в localStorage:', allOrders);
                  console.log('Текущий chefId:', localStorage.getItem('chefId') || 'demo-chef-1');
                  loadOrders();
                }}
                title="Отладка заказов"
              >
                🔍
              </button>
              <button 
                className="clear-btn" 
                onClick={() => {
                  localStorage.removeItem('clientOrders');
                  loadOrders();
                  showSuccess('Все заказы удалены!');
                }}
                title="Очистить все заказы"
              >
                🗑️
              </button>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="chef-kanban-modal-overlay" onClick={onClose}>
        <div className="chef-kanban-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chef-kanban-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2>📋 Доска заказов ({orders.length} заказов)</h2>
              {pendingOrdersCount > 0 && (
                <div className="pending-orders-badge" style={{
                  background: '#ff4444',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  animation: 'pulse 2s infinite'
                }}>
                  {pendingOrdersCount}
                </div>
              )}
            </div>
            <div className="header-actions">
              <button 
                className="test-data-btn" 
                onClick={() => {
                  createTestOrders();
                  loadOrders();
                }}
                title="Создать тестовые заказы"
              >
                📝
              </button>
              <button 
                className="refresh-btn" 
                onClick={loadOrders}
                title="Обновить заказы"
              >
                🔄
              </button>
              <button 
                className="debug-btn" 
                onClick={() => {
                  const allOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
                  console.log('Все заказы в localStorage:', allOrders);
                  console.log('Текущий chefId:', localStorage.getItem('chefId') || 'demo-chef-1');
                  loadOrders();
                }}
                title="Отладка заказов"
              >
                🔍
              </button>
              <button 
                className="clear-btn" 
                onClick={() => {
                  localStorage.removeItem('clientOrders');
                  loadOrders();
                  showSuccess('Все заказы удалены!');
                }}
                title="Очистить все заказы"
              >
                🗑️
              </button>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>
          </div>
          
          <div className="chef-kanban-content">
            <div className="kanban-board">
              {statusColumns.map(column => (
                <div 
                  key={column.id}
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div 
                    className="column-header"
                    style={{ backgroundColor: column.color }}
                  >
                    <h3>{column.title}</h3>
                    <span className="order-count">
                      {getOrdersByStatus(column.id).length}
                    </span>
                  </div>
                  
                  <div className="column-content">
                    {getOrdersByStatus(column.id).length === 0 && (
                      <div className="empty-column">
                        <span>Нет заказов</span>
                      </div>
                    )}
                    {getOrdersByStatus(column.id).map(order => {
                      const remainingTime = getRemainingTime(order);
                      const isUrgent = isUrgentOrder(order);
                      const isOverdue = isOverdueOrder(order);
                      
                      return (
                        <div
                          key={order.id}
                          className={`order-card ${isUrgent ? 'urgent-order' : ''} ${isOverdue ? 'overdue-order' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order)}
                          onClick={() => openOrderDetails(order.id)}
                          style={{
                            border: isUrgent ? '2px solid #ff4444' : isOverdue ? '2px solid #ff0000' : '1px solid #ddd',
                            backgroundColor: isUrgent ? '#fff5f5' : isOverdue ? '#ffe6e6' : 'white',
                            animation: isUrgent ? 'pulse 2s infinite' : 'none'
                          }}
                        >
                          <div className="order-card-header">
                            <span className="order-id">#{order.id.slice(-6)}</span>
                            <span className="order-time">
                              {formatTime(order.createdAt || order.timestamp)}
                            </span>
                          </div>
                          
                          {/* Таймер для заказов в приготовлении */}
                          {order.status === 'preparing' && remainingTime !== null && (
                            <div className="cooking-timer" style={{
                              background: isOverdue ? '#ff0000' : isUrgent ? '#ff4444' : '#28a745',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              margin: '5px 0'
                            }}>
                              {isOverdue ? '⚠ ПРОСРОЧЕН!' : `⏰ Осталось ${remainingTime} мин`}
                            </div>
                          )}
                          
                          <div className="order-card-body">
                            <div className="customer-info">
                              <strong>{order.customer?.name || 'Клиент'}</strong>
                              <span className="customer-phone">
                                {order.customer?.phone || '+7 (999) 123-45-67'}
                              </span>
                            </div>
                            
                            <div className="order-items">
                              {order.items?.slice(0, 2).map((item, index) => (
                                <div key={index} className="order-item">
                                  {item.quantity}x {item.name}
                                </div>
                              ))}
                              {order.items?.length > 2 && (
                                <div className="order-item-more">
                                  +{order.items.length - 2} еще
                                </div>
                              )}
                            </div>
                            
                            <div className="order-total">
                              {order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
                            </div>
                          </div>
                          
                          {/* Кнопки действий в зависимости от статуса */}
                          <div className="order-actions" onClick={(e) => e.stopPropagation()}>
                            {order.status === 'pending_confirmation' && (
                              <>
                                <button 
                                  className="action-btn confirm-btn"
                                  onClick={() => confirmOrder(order.id)}
                                  style={{
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginRight: '5px'
                                  }}
                                >
                                  ✅ Подтвердить
                                </button>
                                <button 
                                  className="action-btn reject-btn"
                                  onClick={() => rejectOrder(order.id)}
                                  style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ❌ Отклонить
                                </button>
                              </>
                            )}
                            
                            {order.status === 'confirmed' && (
                              <button 
                                className="action-btn start-cooking-btn"
                                onClick={() => startCooking(order.id)}
                                style={{
                                  background: '#fd7e14',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  width: '100%'
                                }}
                              >
                                👨‍🍳 Начать готовку
                              </button>
                            )}
                            
                            {order.status === 'preparing' && (
                              <button 
                                className="action-btn ready-btn"
                                onClick={() => markAsReady(order.id)}
                                style={{
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  width: '100%'
                                }}
                              >
                                ✅ Готово
                              </button>
                            )}
                          </div>
                          
                          {order.delivery?.method === 'delivery' && (
                            <div className="delivery-badge">
                              🚚 Доставка
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedOrderId && (
        <ChefOrderDetails
          orderId={selectedOrderId}
          onClose={closeOrderDetails}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}

      {/* SLA Мониторинг для всех активных заказов */}
      {orders.filter(order => ['pending_confirmation', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status)).map(order => (
        <SLATimers
          key={`sla-${order.id}`}
          order={order}
          onSLAViolation={(violation) => {
            console.log('SLA Violation:', violation);
            showError(`Нарушение SLA: ${violation.message}`);
          }}
          onCompensation={(compensation) => {
            console.log('Compensation applied:', compensation);
            showSuccess(`Компенсация ${compensation.amount}₽ применена`);
          }}
        />
      ))}
    </>
  );
};

export default ChefKanban;
