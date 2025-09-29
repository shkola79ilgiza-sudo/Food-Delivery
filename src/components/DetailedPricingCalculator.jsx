import React, { useState, useEffect } from 'react';
import { enhancedPricingCalculator } from '../utils/enhancedPricingCalculator';

const DetailedPricingCalculator = ({ dishData, onPriceChange }) => {
  const [calculation, setCalculation] = useState(null);
  const [customPrice, setCustomPrice] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Настройки по умолчанию
  const [settings, setSettings] = useState({
    chefLevel: 'опытный',
    energyType: 'газ',
    packagingType: 'контейнер пластиковый',
    deliveryType: 'доставка_средне',
    platformType: 'mid-range',
    preparationTime: 30,
    servingSize: 1
  });

  // Пересчет при изменении данных
  useEffect(() => {
    if (dishData && dishData.ingredients) {
      const fullCalculation = enhancedPricingCalculator.calculateFullPrice({
        ...dishData,
        ...settings
      });
      setCalculation(fullCalculation);
      setCustomPrice(fullCalculation.recommendedPrice);
      
      if (onPriceChange) {
        onPriceChange(fullCalculation);
      }
    }
  }, [dishData, settings, onPriceChange]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCustomPriceChange = (price) => {
    setCustomPrice(price);
    if (calculation) {
      const newMargin = Math.round(((price - calculation.totalCost) / price) * 100);
      setCalculation(prev => ({
        ...prev,
        recommendedPrice: price,
        profitMargin: newMargin
      }));
    }
  };

  if (!calculation) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        Введите ингредиенты для расчета цены
      </div>
    );
  }

  const getMarginColor = (margin) => {
    if (margin >= 40) return '#4CAF50';
    if (margin >= 25) return '#FF9800';
    return '#F44336';
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
      borderRadius: '12px',
      margin: '20px 0',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #3498db'
      }}>
        <h2 style={{ color: '#2c3e50', margin: 0, fontSize: '24px' }}>
          💰 Детальный расчет цены блюда
        </h2>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showBreakdown ? 'Скрыть детали' : 'Показать детали'}
        </button>
      </div>

      {/* Настройки */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
            Уровень повара:
          </label>
          <select
            value={settings.chefLevel}
            onChange={(e) => handleSettingChange('chefLevel', e.target.value)}
            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="новичок">Новичок (200₽/час)</option>
            <option value="опытный">Опытный (400₽/час)</option>
            <option value="профессионал">Профессионал (600₽/час)</option>
            <option value="шеф-повар">Шеф-повар (1000₽/час)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
            Энергия:
          </label>
          <select
            value={settings.energyType}
            onChange={(e) => handleSettingChange('energyType', e.target.value)}
            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="газ">Газ (15₽/час)</option>
            <option value="электричество">Электричество (25₽/час)</option>
            <option value="индукция">Индукция (20₽/час)</option>
            <option value="микроволновка">Микроволновка (10₽/час)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
            Упаковка:
          </label>
          <select
            value={settings.packagingType}
            onChange={(e) => handleSettingChange('packagingType', e.target.value)}
            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="контейнер пластиковый">Пластиковый (15₽)</option>
            <option value="контейнер картонный">Картонный (8₽)</option>
            <option value="контейнер биоразлагаемый">Биоразлагаемый (25₽)</option>
            <option value="упаковка премиум">Премиум (50₽)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
            Доставка:
          </label>
          <select
            value={settings.deliveryType}
            onChange={(e) => handleSettingChange('deliveryType', e.target.value)}
            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="самовывоз">Самовывоз (0₽)</option>
            <option value="доставка_близко">Близко (50₽)</option>
            <option value="доставка_средне">Средне (100₽)</option>
            <option value="доставка_далеко">Далеко (150₽)</option>
            <option value="доставка_срочная">Срочная (200₽)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
            Время приготовления (мин):
          </label>
          <input
            type="number"
            value={settings.preparationTime}
            onChange={(e) => handleSettingChange('preparationTime', parseInt(e.target.value))}
            min="5"
            max="180"
            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
            Количество порций:
          </label>
          <input
            type="number"
            value={settings.servingSize}
            onChange={(e) => handleSettingChange('servingSize', parseInt(e.target.value))}
            min="1"
            max="10"
            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Основные показатели */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* Себестоимость */}
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            Себестоимость
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
            {Math.round(calculation.totalCost)}₽
          </div>
        </div>

        {/* Рекомендуемая цена */}
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            Рекомендуемая цена
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
            {calculation.recommendedPrice}₽
          </div>
        </div>

        {/* Маржа */}
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            Маржа
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: getMarginColor(calculation.profitMargin)
          }}>
            {calculation.profitMargin}%
          </div>
        </div>

        {/* Прибыль */}
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            Прибыль
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8e44ad' }}>
            {calculation.recommendedPrice - calculation.totalCost}₽
          </div>
        </div>
      </div>

      {/* Пользовательская цена */}
      <div style={{
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          🎯 Установить свою цену:
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            value={customPrice}
            onChange={(e) => handleCustomPriceChange(parseInt(e.target.value))}
            style={{
              padding: '8px',
              border: '2px solid #3498db',
              borderRadius: '4px',
              fontSize: '16px',
              width: '120px'
            }}
          />
          <span style={{ color: '#666' }}>₽</span>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Маржа: {Math.round(((customPrice - calculation.totalCost) / customPrice) * 100)}%
          </div>
        </div>
      </div>

      {/* Детальная разбивка */}
      {showBreakdown && (
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            📊 Детальная разбивка затрат
          </h3>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {/* Ингредиенты */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#ecf0f1',
              borderRadius: '4px'
            }}>
              <span>🥘 Ингредиенты:</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(calculation.ingredients.total)}₽</span>
            </div>

            {/* Упаковка */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#ecf0f1',
              borderRadius: '4px'
            }}>
              <span>📦 Упаковка:</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(calculation.packaging.total)}₽</span>
            </div>

            {/* Энергия */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#ecf0f1',
              borderRadius: '4px'
            }}>
              <span>⚡ Энергия:</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(calculation.energy.total)}₽</span>
            </div>

            {/* Труд повара */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#ecf0f1',
              borderRadius: '4px'
            }}>
              <span>👨‍🍳 Труд повара:</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(calculation.labor.total)}₽</span>
            </div>

            {/* Доставка */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#ecf0f1',
              borderRadius: '4px'
            }}>
              <span>🚚 Доставка:</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(calculation.delivery.total)}₽</span>
            </div>

            {/* Комиссия платформы */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#e8f4fd',
              borderRadius: '4px',
              border: '1px solid #3498db'
            }}>
              <span>🏢 Комиссия платформы ({Math.round(calculation.platformCommission.rate * 100)}%):</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(calculation.platformCommission.amount)}₽</span>
            </div>

            {/* Итого */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '15px',
              background: '#2c3e50',
              color: 'white',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              <span>ИТОГО СЕБЕСТОИМОСТЬ:</span>
              <span>{Math.round(calculation.totalCost)}₽</span>
            </div>
          </div>
        </div>
      )}

      {/* Рекомендации */}
      {calculation.recommendations && calculation.recommendations.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '10px' }}>
            💡 Рекомендации:
          </h4>
          {calculation.recommendations.map((rec, index) => (
            <div key={index} style={{
              padding: '8px',
              marginBottom: '5px',
              background: rec.type === 'warning' ? '#f8d7da' : 
                         rec.type === 'success' ? '#d4edda' : '#d1ecf1',
              borderRadius: '4px',
              fontSize: '14px',
              color: rec.type === 'warning' ? '#721c24' : 
                     rec.type === 'success' ? '#155724' : '#0c5460'
            }}>
              {rec.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailedPricingCalculator;
