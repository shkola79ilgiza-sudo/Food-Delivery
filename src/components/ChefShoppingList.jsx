import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import '../App.css';

const ChefShoppingList = ({ onClose }) => {
  const { showSuccess, showError } = useToast();
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, purchased, pending

  const loadShoppingList = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('chefShoppingList') || '[]');
      setShoppingList(saved);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      showError('Ошибка загрузки списка покупок');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadShoppingList();
  }, [loadShoppingList]);

  const markAsPurchased = (id) => {
    try {
      const updated = shoppingList.map(item => 
        item.id === id ? { ...item, purchased: !item.purchased } : item
      );
      setShoppingList(updated);
      localStorage.setItem('chefShoppingList', JSON.stringify(updated));
      
      const item = shoppingList.find(i => i.id === id);
      showSuccess(`${item.name} ${item.purchased ? 'удален из' : 'добавлен в'} список покупок`);
    } catch (error) {
      console.error('Error updating item:', error);
      showError('Ошибка обновления элемента');
    }
  };

  const removeItem = (id) => {
    try {
      const updated = shoppingList.filter(item => item.id !== id);
      setShoppingList(updated);
      localStorage.setItem('chefShoppingList', JSON.stringify(updated));
      
      const item = shoppingList.find(i => i.id === id);
      showSuccess(`${item.name} удален из списка покупок`);
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Ошибка удаления элемента');
    }
  };

  const updateQuantity = (id, newAmount) => {
    try {
      const updated = shoppingList.map(item => 
        item.id === id ? { 
          ...item, 
          suggestedAmount: Math.max(1, newAmount),
          estimatedCost: Math.max(1, newAmount) * (item.estimatedCost / item.suggestedAmount)
        } : item
      );
      setShoppingList(updated);
      localStorage.setItem('chefShoppingList', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError('Ошибка обновления количества');
    }
  };

  const clearPurchased = () => {
    try {
      const updated = shoppingList.filter(item => !item.purchased);
      setShoppingList(updated);
      localStorage.setItem('chefShoppingList', JSON.stringify(updated));
      showSuccess('Купленные товары удалены из списка');
    } catch (error) {
      console.error('Error clearing purchased:', error);
      showError('Ошибка очистки списка');
    }
  };

  const clearAll = () => {
    try {
      setShoppingList([]);
      localStorage.setItem('chefShoppingList', JSON.stringify([]));
      showSuccess('Список покупок очищен');
    } catch (error) {
      console.error('Error clearing all:', error);
      showError('Ошибка очистки списка');
    }
  };

  const getFilteredList = () => {
    switch (filter) {
      case 'purchased':
        return shoppingList.filter(item => item.purchased);
      case 'pending':
        return shoppingList.filter(item => !item.purchased);
      default:
        return shoppingList;
    }
  };

  const getTotalCost = () => {
    return shoppingList
      .filter(item => !item.purchased)
      .reduce((sum, item) => sum + item.estimatedCost, 0);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="chef-shopping-modal-overlay">
        <div className="chef-shopping-modal">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Загружаем список покупок...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredList = getFilteredList();

  return (
    <div className="chef-shopping-modal-overlay" onClick={onClose}>
      <div className="chef-shopping-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chef-shopping-header">
          <h3>🛒 Список покупок</h3>
          <button onClick={onClose} className="back-button">✕</button>
        </div>

        <div className="chef-shopping-content">
          {/* Статистика */}
          <div className="shopping-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{shoppingList.length}</div>
                <div className="stat-label">Всего товаров</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{shoppingList.filter(item => !item.purchased).length}</div>
                <div className="stat-label">К покупке</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{getTotalCost()}₽</div>
                <div className="stat-label">Общая стоимость</div>
              </div>
            </div>
          </div>

          {/* Фильтры */}
          <div className="shopping-filters">
            <h4>🔍 Фильтры</h4>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                Все ({shoppingList.length})
              </button>
              <button 
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                К покупке ({shoppingList.filter(item => !item.purchased).length})
              </button>
              <button 
                className={filter === 'purchased' ? 'active' : ''}
                onClick={() => setFilter('purchased')}
              >
                Куплено ({shoppingList.filter(item => item.purchased).length})
              </button>
            </div>
          </div>

          {/* Действия */}
          <div className="shopping-actions">
            <button 
              className="clear-purchased-btn"
              onClick={clearPurchased}
              disabled={shoppingList.filter(item => item.purchased).length === 0}
            >
              🗑️ Удалить купленные
            </button>
            <button 
              className="clear-all-btn"
              onClick={clearAll}
              disabled={shoppingList.length === 0}
            >
              🗑️ Очистить все
            </button>
          </div>

          {/* Список товаров */}
          <div className="shopping-list">
            <h4>📋 Товары</h4>
            {filteredList.length === 0 ? (
              <div className="empty-list">
                <p>Список покупок пуст</p>
                <p>Добавьте товары через AI Планировщик закупок</p>
              </div>
            ) : (
              <div className="shopping-items">
                {filteredList.map(item => (
                  <div 
                    key={item.id} 
                    className={`shopping-item ${item.purchased ? 'purchased' : ''}`}
                  >
                    <div className="item-header">
                      <div className="item-icon">{item.icon}</div>
                      <div className="item-info">
                        <h5>{item.name}</h5>
                        <p className="item-reason">{item.reason}</p>
                      </div>
                      <div className="item-priority">
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(item.priority) }}
                        >
                          {getPriorityText(item.priority)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="item-details">
                      <div className="detail-item">
                        <strong>Количество:</strong>
                        <input
                          type="number"
                          value={item.suggestedAmount}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          min="1"
                          className="quantity-input"
                        />
                        <span>{item.unit}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Стоимость:</strong> {item.estimatedCost}₽
                      </div>
                      <div className="detail-item">
                        <strong>Добавлено:</strong> {new Date(item.addedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className={`purchase-btn ${item.purchased ? 'purchased' : ''}`}
                        onClick={() => markAsPurchased(item.id)}
                      >
                        {item.purchased ? '✅ Куплено' : '🛒 Купить'}
                      </button>
                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefShoppingList;
