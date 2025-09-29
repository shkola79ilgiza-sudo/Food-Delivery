import React, { useState, useEffect, useCallback } from 'react';
// import { useLanguage } from '../contexts/LanguageContext';
import { safeSetClientOrders } from '../utils/safeStorage';
import { useToast } from '../contexts/ToastContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import ChefOrderDetails from './ChefOrderDetails';

const ChefKanban = ({ onClose }) => {
  // const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { emit } = useWebSocket();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [draggedOrder, setDraggedOrder] = useState(null);

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

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
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
                    {getOrdersByStatus(column.id).map(order => (
                      <div
                        key={order.id}
                        className="order-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, order)}
                        onClick={() => openOrderDetails(order.id)}
                      >
                        <div className="order-card-header">
                          <span className="order-id">#{order.id.slice(-6)}</span>
                          <span className="order-time">
                            {formatTime(order.createdAt || order.timestamp)}
                          </span>
                        </div>
                        
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
                        
                        {order.delivery?.method === 'delivery' && (
                          <div className="delivery-badge">
                            🚚 Доставка
                          </div>
                        )}
                      </div>
                    ))}
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
    </>
  );
};

export default ChefKanban;
