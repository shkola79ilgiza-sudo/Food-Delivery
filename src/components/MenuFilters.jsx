import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const MenuFilters = ({ onFiltersChange, dishes = [] }) => {
  const [filters, setFilters] = useState({
    diet: 'all',
    mealType: 'all',
    priceRange: 'all',
    rating: 'all',
    chef: 'all',
    verifiedOnly: false
  });
  const { t } = useLanguage();

  const dietOptions = [
    { value: 'all', label: 'Все диеты' },
    { value: 'vegetarian', label: '🌱 Вегетарианское' },
    { value: 'vegan', label: '🌿 Веганское' },
    { value: 'halal', label: '🕌 Халяль' },
    { value: 'diabetic', label: '🍯 Диабетическое' },
    { value: 'gluten-free', label: '🌾 Без глютена' },
    { value: 'keto', label: '🥑 Кето' },
    { value: 'low-calorie', label: '⚖️ Низкокалорийное' }
  ];

  const mealTypeOptions = [
    { value: 'all', label: 'Все типы' },
    { value: 'breakfast', label: '🌅 Завтрак' },
    { value: 'lunch', label: '🌞 Обед' },
    { value: 'dinner', label: '🌙 Ужин' },
    { value: 'snack', label: '🍎 Перекус' },
    { value: 'dessert', label: '🍰 Десерт' },
    { value: 'drink', label: '🥤 Напитки' }
  ];

  const priceRangeOptions = [
    { value: 'all', label: 'Любая цена' },
    { value: '0-200', label: '💰 До 200₽' },
    { value: '200-400', label: '💰💰 200-400₽' },
    { value: '400-600', label: '💰💰💰 400-600₽' },
    { value: '600+', label: '💰💰💰💰 От 600₽' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'Любой рейтинг' },
    { value: '4.5+', label: '⭐ 4.5+ звезд' },
    { value: '4.0+', label: '⭐ 4.0+ звезд' },
    { value: '3.5+', label: '⭐ 3.5+ звезд' },
    { value: '3.0+', label: '⭐ 3.0+ звезд' }
  ];

  // Получаем уникальных поваров из блюд
  const chefOptions = [
    { value: 'all', label: 'Все повара' },
    ...Array.from(new Set(dishes.map(dish => dish.chef))).map(chef => ({
      value: chef,
      label: `👨‍🍳 ${chef}`
    }))
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Применяем фильтры к блюдам
    const filteredDishes = applyFilters(dishes, newFilters);
    
    // Уведомляем родительский компонент об изменении
    if (onFiltersChange) {
      onFiltersChange(filteredDishes, newFilters);
    }
  };

  const applyFilters = (dishes, filters) => {
    return dishes.filter(dish => {
      // Фильтр по диете
      if (filters.diet !== 'all' && dish.diet !== filters.diet) {
        return false;
      }

      // Фильтр по типу блюда
      if (filters.mealType !== 'all' && dish.mealType !== filters.mealType) {
        return false;
      }

      // Фильтр по цене
      if (filters.priceRange !== 'all') {
        const price = dish.price;
        switch (filters.priceRange) {
          case '0-200':
            if (price > 200) return false;
            break;
          case '200-400':
            if (price < 200 || price > 400) return false;
            break;
          case '400-600':
            if (price < 400 || price > 600) return false;
            break;
          case '600+':
            if (price < 600) return false;
            break;
        }
      }

      // Фильтр по рейтингу
      if (filters.rating !== 'all') {
        const rating = dish.rating || 0;
        const minRating = parseFloat(filters.rating);
        if (rating < minRating) return false;
      }

      // Фильтр по повару
      if (filters.chef !== 'all' && dish.chef !== filters.chef) {
        return false;
      }

      // Фильтр проверенных поваров
      if (filters.verifiedOnly && dish.chefData) {
        const chef = dish.chefData;
        const isVerified = chef.verification && (
          chef.verification.phoneVerified ||
          chef.verification.idVerified ||
          chef.verification.sanitaryVerified ||
          chef.verification.kitchenVerified ||
          chef.verification.businessVerified ||
          chef.verification.topChef
        );
        if (!isVerified) return false;
      }

      return true;
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      diet: 'all',
      mealType: 'all',
      priceRange: 'all',
      rating: 'all',
      chef: 'all',
      verifiedOnly: false
    };
    setFilters(clearedFilters);
    
    if (onFiltersChange) {
      onFiltersChange(dishes, clearedFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all' && filter !== false);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '25px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: '#2D5016',
          fontSize: '18px',
          fontWeight: '600',
          margin: 0
        }}>
          🔍 Фильтры меню
        </h3>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              background: 'transparent',
              color: '#dc3545',
              border: '1px solid #dc3545',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#dc3545';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#dc3545';
            }}
          >
            🗑️ Очистить все
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {/* Фильтр по диете */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#2D5016',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🥗 Диета
          </label>
          <select
            value={filters.diet}
            onChange={(e) => handleFilterChange('diet', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2D5016'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            {dietOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по типу блюда */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#2D5016',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🍽️ Тип блюда
          </label>
          <select
            value={filters.mealType}
            onChange={(e) => handleFilterChange('mealType', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2D5016'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            {mealTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по цене */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#2D5016',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            💰 Цена
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2D5016'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            {priceRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по рейтингу */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#2D5016',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ⭐ Рейтинг
          </label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2D5016'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            {ratingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по повару */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#2D5016',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            👨‍🍳 Повар
          </label>
          <select
            value={filters.chef}
            onChange={(e) => handleFilterChange('chef', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2D5016'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            {chefOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр проверенных поваров */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 15px',
          background: 'rgba(45, 80, 22, 0.05)',
          borderRadius: '25px',
          border: '2px solid #e0e0e0',
          transition: 'all 0.3s ease'
        }}>
          <input
            type="checkbox"
            id="verifiedOnly"
            checked={filters.verifiedOnly}
            onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#2D5016'
            }}
          />
          <label
            htmlFor="verifiedOnly"
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#2D5016',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🛡️</span>
            Только проверенные повара
          </label>
        </div>
      </div>

      {/* Статистика фильтров */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '15px',
          padding: '10px 15px',
          background: 'rgba(45, 80, 22, 0.1)',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#2D5016'
        }}>
          <span style={{ fontWeight: '500' }}>
            📊 Активные фильтры: 
          </span>
          {Object.entries(filters)
            .filter(([key, value]) => value !== 'all' && value !== false)
            .map(([key, value]) => {
              const labels = {
                diet: dietOptions.find(opt => opt.value === value)?.label,
                mealType: mealTypeOptions.find(opt => opt.value === value)?.label,
                priceRange: priceRangeOptions.find(opt => opt.value === value)?.label,
                rating: ratingOptions.find(opt => opt.value === value)?.label,
                chef: chefOptions.find(opt => opt.value === value)?.label,
                verifiedOnly: 'Только проверенные повара'
              };
              return labels[key];
            })
            .join(', ')
          }
        </div>
      )}
    </div>
  );
};

export default MenuFilters;
