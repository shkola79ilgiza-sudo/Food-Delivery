import React, { useState } from 'react';

const ModernFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  isOpen,
  onToggle 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...localFilters,
      [filterType]: value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      cuisine: 'all',
      halal: false,
      diet: 'all',
      priceRange: { min: 0, max: 5000 },
      cookingTime: 'all',
      allergens: [],
      vegetarian: false,
      spicy: false,
      new: false
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const filterOptions = {
    cuisine: [
      { value: 'all', label: 'Все кухни', icon: '🌍' },
      { value: 'russian', label: 'Русская', icon: '🇷🇺' },
      { value: 'asian', label: 'Азиатская', icon: '🍜' },
      { value: 'european', label: 'Европейская', icon: '🍝' },
      { value: 'middle_eastern', label: 'Ближневосточная', icon: '🥙' }
    ],
    diet: [
      { value: 'all', label: 'Все', icon: '🍽️' },
      { value: 'vegetarian', label: 'Вегетарианское', icon: '🥗' },
      { value: 'vegan', label: 'Веганское', icon: '🌱' },
      { value: 'keto', label: 'Кето', icon: '🥑' },
      { value: 'low_carb', label: 'Низкоуглеводное', icon: '🥩' }
    ],
    cookingTime: [
      { value: 'all', label: 'Любое время', icon: '⏰' },
      { value: 'fast', label: 'Быстро (до 15 мин)', icon: '⚡' },
      { value: 'medium', label: 'Средне (15-30 мин)', icon: '🕐' },
      { value: 'slow', label: 'Долго (30+ мин)', icon: '🕑' }
    ]
  };

  const specialFilters = [
    { key: 'halal', label: 'Халяль', icon: '🕌' },
    { key: 'vegetarian', label: 'Вегетарианское', icon: '🥗' },
    { key: 'spicy', label: 'Острое', icon: '🌶️' },
    { key: 'new', label: 'Новинки', icon: '✨' }
  ];

  return (
    <>
      {/* Кнопка открытия фильтров */}
      <button 
        className="filter-toggle-btn"
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '15px 20px',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        🔍 Фильтры
      </button>

      {/* Панель фильтров */}
      {isOpen && (
        <div className="modern-filters" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 1001,
          animation: 'bounceIn 0.4s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>🔍 Фильтры</h3>
            <button 
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#95a5a6'
              }}
            >
              ✕
            </button>
          </div>

          {/* Кухня */}
          <div className="filter-group">
            <label className="filter-label">Кухня</label>
            <div className="filter-chips">
              {filterOptions.cuisine.map(option => (
                <button
                  key={option.value}
                  className={`filter-chip ${localFilters.cuisine === option.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('cuisine', option.value)}
                >
                  <span>{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Диета */}
          <div className="filter-group">
            <label className="filter-label">Тип питания</label>
            <div className="filter-chips">
              {filterOptions.diet.map(option => (
                <button
                  key={option.value}
                  className={`filter-chip ${localFilters.diet === option.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('diet', option.value)}
                >
                  <span>{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Время приготовления */}
          <div className="filter-group">
            <label className="filter-label">Время приготовления</label>
            <div className="filter-chips">
              {filterOptions.cookingTime.map(option => (
                <button
                  key={option.value}
                  className={`filter-chip ${localFilters.cookingTime === option.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('cookingTime', option.value)}
                >
                  <span>{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Специальные фильтры */}
          <div className="filter-group">
            <label className="filter-label">Особенности</label>
            <div className="filter-chips">
              {specialFilters.map(filter => (
                <button
                  key={filter.key}
                  className={`filter-chip ${localFilters[filter.key] ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filter.key, !localFilters[filter.key])}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ценовой диапазон */}
          <div className="filter-group">
            <label className="filter-label">
              Цена: {localFilters.priceRange.min} - {localFilters.priceRange.max} ₽
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={localFilters.priceRange.max}
              onChange={(e) => handleFilterChange('priceRange', {
                ...localFilters.priceRange,
                max: parseInt(e.target.value)
              })}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'linear-gradient(to right, #ff6b35, #f7931e)',
                outline: 'none'
              }}
            />
          </div>

          {/* Кнопки действий */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleClearFilters}
              style={{
                flex: 1,
                background: '#ecf0f1',
                color: '#7f8c8d',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Очистить
            </button>
            <button
              onClick={onToggle}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Применить
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
        />
      )}
    </>
  );
};

export default ModernFilters;
