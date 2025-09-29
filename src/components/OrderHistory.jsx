import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import Rating from './Rating';
import Reviews from './Reviews';
import './OrderHistory.css';

const OrderHistory = ({ 
  orders = [], 
  onRateOrder, 
  onAddReview, 
  onUpdateReview, 
  onDeleteReview,
  onReorder,
  onTrackCourier
}) => {
  const { t } = useLanguage();
  const { showSuccess } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const statusOptions = [
    { value: 'all', label: t.allOrders },
    { value: 'pending_payment', label: t.pendingPayment },
    { value: 'pending_confirmation', label: t.pendingConfirmation },
    { value: 'reserved', label: t.reserved },
    { value: 'delivered', label: t.delivered },
    { value: 'cancelled', label: t.cancelled },
    { value: 'pending', label: 'Ожидает рассмотрения' },
    { value: 'accepted', label: 'Принят поваром' },
    { value: 'in_progress', label: 'Готовится' },
    { value: 'completed', label: 'Готово' },
    { value: 'rejected', label: 'Отклонен' }
  ];

  const sortOptions = [
    { value: 'date', label: t.sortByDate },
    { value: 'status', label: t.sortByStatus },
    { value: 'total', label: t.sortByTotal }
  ];

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    // Для запросов на приготовление используем статус из requestData
    if (order.type === 'cooking_request' && order.requestData) {
      return order.requestData.status === filterStatus;
    }
    return order.status === filterStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        const dateA = a.createdAt || a.requestData?.createdAt || a.date;
        const dateB = b.createdAt || b.requestData?.createdAt || b.date;
        return new Date(dateB) - new Date(dateA);
      case 'status':
        const statusA = a.type === 'cooking_request' ? a.requestData?.status : a.status;
        const statusB = b.type === 'cooking_request' ? b.requestData?.status : b.status;
        return statusA.localeCompare(statusB);
      case 'total':
        return b.total - a.total;
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
        return '#ff9800';
      case 'pending_confirmation':
        return '#2196f3';
      case 'pending':
        return '#ffc107';
      case 'accepted':
        return '#17a2b8';
      case 'in_progress':
        return '#007bff';
      case 'completed':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      case 'confirmed':
        return '#2196f3';
      case 'preparing':
        return '#ff5722';
      case 'ready':
        return '#4caf50';
      case 'delivering':
        return '#9c27b0';
      case 'reserved':
        return '#4caf50';
      case 'delivered':
        return '#8bc34a';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_payment':
        return t.pendingPayment;
      case 'pending_confirmation':
        return t.pendingConfirmation;
      case 'pending':
        return 'Ожидает рассмотрения';
      case 'accepted':
        return 'Принят поваром';
      case 'in_progress':
        return 'Готовится';
      case 'completed':
        return 'Готово';
      case 'rejected':
        return 'Отклонен';
      case 'confirmed':
        return t.confirmed;
      case 'preparing':
        return t.preparing;
      case 'ready':
        return t.ready;
      case 'delivering':
        return t.delivering;
      case 'reserved':
        return t.reserved;
      case 'delivered':
        return t.delivered;
      case 'cancelled':
        return t.cancelled;
      default:
        return status;
    }
  };

  const handleRateOrder = (orderId, rating) => {
    onRateOrder(orderId, rating);
    showSuccess(t.orderRated);
  };

  const handleViewReviews = (order) => {
    setSelectedOrder(order);
    setShowReviews(true);
  };

  const handleCloseReviews = () => {
    setShowReviews(false);
    setSelectedOrder(null);
  };

  const canRateOrder = (order) => {
    return order.status === 'delivered' && !order.rating;
  };

  const canReviewOrder = (order) => {
    return order.status === 'delivered';
  };

  // Функция для расчета сумм заказа
  const calculateOrderTotals = (order) => {
    const itemsTotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryFee = order.deliveryFee || 0;
    const discount = order.discount || 0;
    const total = itemsTotal + deliveryFee - discount;
    
    return {
      itemsTotal: Math.round(itemsTotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  if (orders.length === 0) {
    return (
      <div className="order-history">
        <div className="no-orders">
          <h3>{t.noOrders}</h3>
          <p>{t.noOrdersDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="order-history-header">
        <h2>{t.orderHistory}</h2>
        <div className="order-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">{t.filterByStatus}:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="sort-filter">{t.sortByLabel}:</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="orders-list">
        {sortedOrders.map(order => {
          const totals = calculateOrderTotals(order);
          return (
            <div key={order.id} id={`order-${order.id}`} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>#{order.id}</h3>
                  <span className="order-date">
                    {new Date(order.createdAt || order.requestData?.createdAt || order.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.type === 'cooking_request' ? order.requestData?.status : order.status) }}
                  >
                    {getStatusLabel(order.type === 'cooking_request' ? order.requestData?.status : order.status)}
                  </span>
                </div>
              </div>

              <div className="order-content">
                <div className="order-items">
                  <h4>{t.orderItems}:</h4>
                  <ul>
                    {order.items?.map(item => (
                      <li key={item.id} className="order-item">
                        <div className="item-image">
                          <img 
                            src={item.photo || item.image || '/api/placeholder/60/60'} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/api/placeholder/60/60';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">{item.price * item.quantity} ₽</span>
                        </div>
                      </li>
                    )) || []}
                  </ul>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>{t.itemsTotal}:</span>
                    <span>{totals.itemsTotal} ₽</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="summary-row">
                      <span>{t.discount}:</span>
                      <span>-{totals.discount} ₽</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>{t.delivery}:</span>
                    <span>{totals.deliveryFee > 0 ? `${totals.deliveryFee} ₽` : t.free}</span>
                  </div>
                  <div className="summary-row total">
                    <span>{t.total}:</span>
                    <span>{totals.total} ₽</span>
                  </div>
                </div>

                {order.rating && (
                  <div className="order-rating">
                    <h4>{t.yourRating}:</h4>
                    <Rating 
                      rating={order.rating} 
                      readOnly={true} 
                      size="small" 
                      showValue={true}
                    />
                  </div>
                )}

                <div className="order-actions">
                  {canRateOrder(order) && (
                    <div className="rate-order">
                      <h4>{t.rateOrder}:</h4>
                      <Rating
                        rating={0}
                        onRatingChange={(rating) => handleRateOrder(order.id, rating)}
                        readOnly={false}
                        size="medium"
                        showValue={true}
                      />
                    </div>
                  )}

                  {canReviewOrder(order) && (
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewReviews(order)}
                    >
                      {t.viewReviews}
                    </button>
                  )}

                  {onReorder && order.type !== 'cooking_request' && (
                    <button 
                      className="btn-primary reorder-btn"
                      onClick={() => onReorder(order)}
                      title={t.reorderTooltip}
                    >
                      🔄 {t.reorder}
                    </button>
                  )}
                  
                  {order.type === 'cooking_request' && (
                    <div className="cooking-request-info" style={{
                      padding: '10px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      marginTop: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                        🍳 Запрос на приготовление блюда
                      </p>
                      {order.requestData?.description && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#495057' }}>
                          {order.requestData.description}
                        </p>
                      )}
                    </div>
                  )}

                  {onTrackCourier && (order.status === 'delivering' || order.status === 'ready') && (
                    <button 
                      className="btn-success track-btn"
                      onClick={() => onTrackCourier(order.id)}
                      title="Отследить курьера"
                    >
                      🚚 Отследить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reviews Modal */}
      {showReviews && selectedOrder && (
        <div className="reviews-modal">
          <div className="reviews-modal-content">
            <div className="reviews-modal-header">
              <h3>{t.reviewsForOrder} #{selectedOrder.id}</h3>
              <button 
                className="close-btn"
                onClick={handleCloseReviews}
              >
                ×
              </button>
            </div>
            <div className="reviews-modal-body">
              <Reviews
                key={refreshKey}
                dishId={selectedOrder.items[0]?.id || 'order-' + selectedOrder.id}
                chefId={selectedOrder.chefId || 'chef-1'}
                reviews={selectedOrder.reviews || []}
                onAddReview={(review) => {
                  console.log('💬 Adding review from OrderHistory:', review);
                  onAddReview(selectedOrder.id, review);
                  // Принудительно обновляем selectedOrder
                  const updatedOrder = orders.find(o => o.id === selectedOrder.id);
                  if (updatedOrder) {
                    setSelectedOrder(updatedOrder);
                  }
                  // Принудительно обновляем компонент
                  setRefreshKey(prev => prev + 1);
                }}
                onUpdateReview={(review) => {
                  console.log('✏️ Updating review from OrderHistory:', review);
                  onUpdateReview(selectedOrder.id, review);
                  // Принудительно обновляем selectedOrder
                  const updatedOrder = orders.find(o => o.id === selectedOrder.id);
                  if (updatedOrder) {
                    setSelectedOrder(updatedOrder);
                  }
                }}
                onDeleteReview={(reviewId) => {
                  console.log('🗑️ Deleting review from OrderHistory:', reviewId);
                  onDeleteReview(selectedOrder.id, reviewId);
                  // Принудительно обновляем selectedOrder
                  const updatedOrder = orders.find(o => o.id === selectedOrder.id);
                  if (updatedOrder) {
                    setSelectedOrder(updatedOrder);
                  }
                }}
                canAddReview={true}
                canEditReview={true}
                canDeleteReview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
