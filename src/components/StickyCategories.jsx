import React from 'react';

const StickyCategories = ({ categories, selectedCategory, onCategorySelect }) => {
  const categoryIcons = {
    'main': '🍽️',
    'salads': '🥗',
    'soups': '🍲',
    'desserts': '🍰',
    'beverages': '🥤',
    'bakery': '🥖',
    'semi-finished': '🥟',
    'tatar': '🥘',
    'halal': '🕌',
    'diet': '🥗',
    'client_cook': '👨‍🍳',
    'master_class': '🎓',
    'help_guest': '🤝',
    'preparations': '🥘',
    'brand-products': '⭐'
  };

  return (
    <div className="sticky-categories">
      <button 
        className={`category-btn ${!selectedCategory ? 'active' : ''}`}
        onClick={() => onCategorySelect(null)}
      >
        <span className="category-icon">🍽️</span>
        Все блюда
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => onCategorySelect(category.id)}
        >
          <span className="category-icon">
            {categoryIcons[category.id] || '🍽️'}
          </span>
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default StickyCategories;
