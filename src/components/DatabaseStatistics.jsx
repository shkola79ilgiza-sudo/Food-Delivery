// Компонент статистики базы данных калорийности
// Показывает информацию о доступных продуктах и категориях

import React, { useState, useEffect } from 'react';
import { getDatabaseStatistics, searchProducts } from '../utils/calorizatorInspiredDatabase';
import '../App.css';

const DatabaseStatistics = ({ onProductSelect }) => {
  const [statistics, setStatistics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Загрузка статистики базы данных
  useEffect(() => {
    const stats = getDatabaseStatistics();
    setStatistics(stats);
  }, []);

  // Поиск продуктов
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const results = searchProducts(searchQuery);
      setSearchResults(results.slice(0, 10)); // Показываем только первые 10 результатов
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Обработка выбора продукта
  const handleProductSelect = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  // Обработка поиска
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    }
  };

  if (!statistics) {
    return <div>Загрузка статистики базы данных...</div>;
  }

  return (
    <div className="database-statistics-container" style={{ padding: '20px' }}>
      {/* Заголовок */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>📊 База данных калорийности</h2>
        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          background: '#f8f9fa',
          padding: '8px 12px',
          borderRadius: '6px'
        }}>
          Всего продуктов: <strong>{statistics.totalProducts}</strong>
        </div>
      </div>

      {/* Поиск */}
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск продуктов (например: курица, яблоко, рис)..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔍 Поиск
          </button>
        </form>

        {/* Результаты поиска */}
        {showSearchResults && (
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
              Результаты поиска ({searchResults.length})
            </h4>
            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((product, index) => (
                  <div
                    key={index}
                    onClick={() => handleProductSelect(product)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#e3f2fd';
                      e.target.style.borderColor = '#2196F3';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {product.category}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#2196F3' }}>
                        {product.calories} ккал
                      </div>
                      <div style={{ color: '#666' }}>
                        Б: {product.protein}г Ж: {product.fat}г У: {product.carbs}г
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                Продукты не найдены
              </div>
            )}
          </div>
        )}
      </div>

      {/* Статистика по категориям */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        {Object.entries(statistics.categoryStats).map(([category, count]) => (
          <div
            key={category}
            style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translateY(0)';
            }}
            onClick={() => setSelectedCategory(category)}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {getCategoryIcon(category)}
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '4px'
            }}>
              {getCategoryName(category)}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              marginBottom: '8px'
            }}>
              {count} продуктов
            </div>
            <div style={{
              background: selectedCategory === category ? '#2196F3' : '#f0f0f0',
              color: selectedCategory === category ? 'white' : '#666',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {selectedCategory === category ? 'Выбрано' : 'Выбрать'}
            </div>
          </div>
        ))}
      </div>

      {/* Информация о базе данных */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          ℹ️ О базе данных
        </h4>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            База данных содержит <strong>{statistics.totalProducts}</strong> продуктов питания 
            с детальной информацией о калорийности и БЖУ.
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            Данные основаны на структуре <strong>Calorizator.ru</strong> - одной из самых 
            полных таблиц калорийности продуктов в России.
          </p>
          <p style={{ margin: '0' }}>
            Все значения указаны на 100 грамм продукта и регулярно обновляются.
          </p>
        </div>
      </div>
    </div>
  );
};

// Функция получения иконки категории
const getCategoryIcon = (category) => {
  const icons = {
    meat: '🥩',
    fish: '🐟',
    vegetables: '🥕',
    fruits: '🍎',
    dairy: '🥛',
    cheese: '🧀',
    cereals: '🌾',
    bread: '🍞',
    pasta: '🍝',
    oils: '🫒',
    nuts: '🥜',
    eggs: '🥚',
    diabetic: '🍯',
    seafood: '🦐',
    dried_fruits: '🍇',
    sweetener: '🍯',
    mushrooms: '🍄',
    sausages: '🌭',
    cereals_extended: '🌾',
    oils_extended: '🫒',
    dairy_extended: '🥛',
    vegetables_extended: '🥬',
    nuts_dried_fruits_extended: '🥜',
    fish_seafood_extended: '🐟',
    snacks_extended: '🍿',
    cheese_curd_extended: '🧀',
    ingredients_spices_extended: '🌶️',
    fruits_extended: '🍎',
    bakery_extended: '🥖',
    berries_extended: '🍓',
    eggs_extended: '🥚',
    confectionery_extended: '🍰',
    cakes_extended: '🎂',
    beverages_extended: '🥤',
    juices_compotes_extended: '🧃',
    salads_extended: '🥗',
    soups_extended: '🍲'
  };
  return icons[category] || '📦';
};

// Функция получения названия категории
const getCategoryName = (category) => {
  const names = {
    meat: 'Мясные продукты',
    fish: 'Рыба',
    vegetables: 'Овощи',
    fruits: 'Фрукты',
    dairy: 'Молочные продукты',
    cheese: 'Сыры',
    cereals: 'Крупы',
    bread: 'Хлеб',
    pasta: 'Макароны',
    oils: 'Масла',
    nuts: 'Орехи',
    eggs: 'Яйца',
    diabetic: 'Диабетические',
    seafood: 'Морепродукты',
    dried_fruits: 'Сухофрукты',
    sweetener: 'Заменители сахара',
    mushrooms: 'Грибы',
    sausages: 'Колбасные изделия',
    cereals_extended: 'Крупы и каши (расширенные)',
    oils_extended: 'Масла и жиры (расширенные)',
    dairy_extended: 'Молочные продукты (расширенные)',
    vegetables_extended: 'Овощи и зелень (расширенные)',
    nuts_dried_fruits_extended: 'Орехи и сухофрукты (расширенные)',
    fish_seafood_extended: 'Рыба и морепродукты (расширенные)',
    snacks_extended: 'Снэки (расширенные)',
    cheese_curd_extended: 'Сыры и творог (расширенные)',
    ingredients_spices_extended: 'Сырье и приправы (расширенные)',
    fruits_extended: 'Фрукты (расширенные)',
    bakery_extended: 'Хлебобулочные изделия (расширенные)',
    berries_extended: 'Ягоды (расширенные)',
    eggs_extended: 'Яйца (расширенные)',
    confectionery_extended: 'Кондитерские изделия (расширенные)',
    cakes_extended: 'Торты (расширенные)',
    beverages_extended: 'Напитки безалкогольные (расширенные)',
    juices_compotes_extended: 'Соки и компоты (расширенные)',
    salads_extended: 'Салаты (расширенные)',
    soups_extended: 'Первые блюда (расширенные)'
  };
  return names[category] || category;
};

export default DatabaseStatistics;
