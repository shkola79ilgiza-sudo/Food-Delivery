import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import '../App.css';

const ChefSelection = ({ onChefSelect, onClose }) => {
  const { showSuccess, showError } = useToast();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, busy, offline

  useEffect(() => {
    loadChefs();
  }, []);

  const loadChefs = () => {
    try {
      // Загружаем поваров из localStorage
      const savedChefs = JSON.parse(localStorage.getItem('registeredChefs') || '[]');
      
      // Если поваров нет, создаем демо-поваров
      if (savedChefs.length === 0) {
        const demoChefs = [
          {
            id: 'chef-1',
            name: 'Анна Петрова',
            email: 'anna@chef.com',
            phone: '+7 (999) 123-45-67',
            specialties: ['Русская кухня', 'Выпечка', 'Десерты'],
            rating: 4.8,
            reviews: 127,
            experience: '5 лет',
            location: 'Москва, центр',
            status: 'available', // available, busy, offline
            avatar: '👩‍🍳',
            description: 'Специализируюсь на традиционной русской кухне и домашней выпечке',
            priceRange: '$$',
            deliveryTime: '30-45 мин',
            cuisines: ['Русская', 'Европейская', 'Десерты'],
            dishes: ['Борщ', 'Пельмени', 'Блины', 'Торт Наполеон'],
            workingHours: '9:00 - 22:00',
            lastActive: new Date().toISOString()
          },
          {
            id: 'chef-2',
            name: 'Махмуд Алиев',
            email: 'mahmud@chef.com',
            phone: '+7 (999) 234-56-78',
            specialties: ['Узбекская кухня', 'Плов', 'Шашлык'],
            rating: 4.9,
            reviews: 89,
            experience: '8 лет',
            location: 'Москва, юг',
            status: 'available',
            avatar: '👨‍🍳',
            description: 'Мастер узбекской кухни, готовлю аутентичный плов и шашлык',
            priceRange: '$$$',
            deliveryTime: '45-60 мин',
            cuisines: ['Узбекская', 'Среднеазиатская', 'Мясные блюда'],
            dishes: ['Плов', 'Шашлык', 'Манты', 'Самса'],
            workingHours: '10:00 - 23:00',
            lastActive: new Date().toISOString()
          },
          {
            id: 'chef-3',
            name: 'Мария Сидорова',
            email: 'maria@chef.com',
            phone: '+7 (999) 345-67-89',
            specialties: ['Итальянская кухня', 'Паста', 'Пицца'],
            rating: 4.7,
            reviews: 156,
            experience: '6 лет',
            location: 'Москва, запад',
            status: 'busy',
            avatar: '👩‍🍳',
            description: 'Итальянская кухня с любовью, свежие ингредиенты и традиционные рецепты',
            priceRange: '$$',
            deliveryTime: '25-40 мин',
            cuisines: ['Итальянская', 'Средиземноморская'],
            dishes: ['Паста Карбонара', 'Пицца Маргарита', 'Ризотто', 'Тирамису'],
            workingHours: '11:00 - 24:00',
            lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 минут назад
          },
          {
            id: 'chef-4',
            name: 'Дмитрий Козлов',
            email: 'dmitry@chef.com',
            phone: '+7 (999) 456-78-90',
            specialties: ['Японская кухня', 'Суши', 'Роллы'],
            rating: 4.6,
            reviews: 203,
            experience: '4 года',
            location: 'Москва, восток',
            status: 'offline',
            avatar: '👨‍🍳',
            description: 'Японская кухня высшего качества, свежие морепродукты',
            priceRange: '$$$$',
            deliveryTime: '40-55 мин',
            cuisines: ['Японская', 'Азиатская'],
            dishes: ['Суши', 'Роллы', 'Сашими', 'Рамен'],
            workingHours: '12:00 - 02:00',
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 часа назад
          }
        ];
        
        localStorage.setItem('registeredChefs', JSON.stringify(demoChefs));
        setChefs(demoChefs);
      } else {
        setChefs(savedChefs);
      }
    } catch (error) {
      console.error('Error loading chefs:', error);
      showError('Ошибка загрузки поваров');
    } finally {
      setLoading(false);
    }
  };

  const filteredChefs = chefs.filter(chef => {
    const matchesSearch = chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chef.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         chef.cuisines.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || chef.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#28a745';
      case 'busy': return '#ffc107';
      case 'offline': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'busy': return 'Занят';
      case 'offline': return 'Офлайн';
      default: return 'Неизвестно';
    }
  };

  const getPriceRangeText = (priceRange) => {
    switch (priceRange) {
      case '$': return 'Бюджетно';
      case '$$': return 'Средне';
      case '$$$': return 'Дорого';
      case '$$$$': return 'Премиум';
      default: return 'Средне';
    }
  };

  const handleChefSelect = (chef) => {
    setSelectedChef(chef);
    if (onChefSelect) {
      onChefSelect(chef);
    }
    showSuccess(`Выбран повар: ${chef.name}`);
  };

  if (loading) {
    return (
      <div className="chef-selection-overlay">
        <div className="chef-selection-modal">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Загружаем поваров...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-selection-overlay" onClick={onClose}>
      <div className="chef-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chef-selection-header">
          <h3>👨‍🍳 Выберите повара</h3>
          <button onClick={onClose} className="back-button">✕</button>
        </div>

        <div className="chef-selection-content">
          {/* Поиск и фильтры */}
          <div className="chef-selection-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Поиск по имени, специализации или кухне..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                Все ({chefs.length})
              </button>
              <button 
                className={filter === 'available' ? 'active' : ''}
                onClick={() => setFilter('available')}
              >
                Доступны ({chefs.filter(c => c.status === 'available').length})
              </button>
              <button 
                className={filter === 'busy' ? 'active' : ''}
                onClick={() => setFilter('busy')}
              >
                Заняты ({chefs.filter(c => c.status === 'busy').length})
              </button>
              <button 
                className={filter === 'offline' ? 'active' : ''}
                onClick={() => setFilter('offline')}
              >
                Офлайн ({chefs.filter(c => c.status === 'offline').length})
              </button>
            </div>
          </div>

          {/* Список поваров */}
          <div className="chefs-list">
            {filteredChefs.length === 0 ? (
              <div className="empty-state">
                <p>Повары не найдены</p>
              </div>
            ) : (
              filteredChefs.map(chef => (
                <div key={chef.id} className="chef-card">
                  <div className="chef-card-header">
                    <div className="chef-avatar">{chef.avatar}</div>
                    <div className="chef-info">
                      <h4>{chef.name}</h4>
                      <p className="chef-location">{chef.location}</p>
                    </div>
                    <div className="chef-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(chef.status) }}
                      >
                        {getStatusText(chef.status)}
                      </span>
                    </div>
                  </div>

                  <div className="chef-card-body">
                    <p className="chef-description">{chef.description}</p>
                    
                    <div className="chef-specialties">
                      <strong>Специализация:</strong>
                      <div className="specialties-tags">
                        {chef.specialties.map((specialty, index) => (
                          <span key={index} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    </div>

                    <div className="chef-details">
                      <div className="detail-row">
                        <span>⭐ Рейтинг: {chef.rating} ({chef.reviews} отзывов)</span>
                        <span>💰 {getPriceRangeText(chef.priceRange)}</span>
                      </div>
                      <div className="detail-row">
                        <span>⏱️ Доставка: {chef.deliveryTime}</span>
                        <span>🕒 Работает: {chef.workingHours}</span>
                      </div>
                    </div>

                    <div className="chef-dishes">
                      <strong>Популярные блюда:</strong>
                      <div className="dishes-tags">
                        {chef.dishes.slice(0, 4).map((dish, index) => (
                          <span key={index} className="dish-tag">{dish}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="chef-card-actions">
                    <button 
                      className="select-chef-btn"
                      onClick={() => handleChefSelect(chef)}
                      disabled={chef.status === 'offline'}
                    >
                      {chef.status === 'offline' ? 'Недоступен' : 'Выбрать повара'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefSelection;
