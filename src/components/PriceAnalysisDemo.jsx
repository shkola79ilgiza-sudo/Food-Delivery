// Демонстрационный компонент для показа возможностей системы реальных цен
// Показывает как работает анализ конкурентных цен

import React, { useState, useEffect } from 'react';
import { realPriceProvider } from '../utils/realPriceDataProvider';
import { competitivePriceAnalyzer } from '../utils/competitivePriceAnalyzer';

const PriceAnalysisDemo = () => {
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDish, setSelectedDish] = useState('борщ');

  // Инициализация анализаторов
  useEffect(() => {
    competitivePriceAnalyzer.setPriceProvider(realPriceProvider);
  }, []);

  // Демонстрационные блюда
  const demoDishes = [
    { name: 'борщ', category: 'супы', ingredients: 'говядина, свекла, капуста, морковь, лук, томатная паста' },
    { name: 'цезарь', category: 'салаты', ingredients: 'курица, салат, помидоры, сыр пармезан, сухарики, соус' },
    { name: 'плов', category: 'горячие блюда', ingredients: 'рис, баранина, морковь, лук, специи' },
    { name: 'паста карбонара', category: 'паста', ingredients: 'макароны, бекон, яйца, сыр пармезан, сливки' }
  ];

  const runDemo = async () => {
    setLoading(true);
    
    try {
      const dish = demoDishes.find(d => d.name === selectedDish);
      if (!dish) return;

      // Получаем данные о ценах
      const priceData = await realPriceProvider.getProductPrices(dish.name);
      
      // Анализируем конкурентную ситуацию
      const analysis = await competitivePriceAnalyzer.analyzeCompetitivePricing({
        name: dish.name,
        ingredients: dish.ingredients,
        category: dish.category,
        currentPrice: 200, // Демо цена
        quality: 'medium'
      });

      setDemoData({
        dish,
        priceData,
        analysis
      });
    } catch (error) {
      console.error('Demo error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDemo();
  }, [selectedDish]);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '12px'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        marginBottom: '30px',
        fontSize: '28px'
      }}>
        🏪 Демонстрация системы реальных цен
      </h2>

      {/* Выбор блюда */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
          Выберите блюдо для анализа:
        </h3>
        <select
          value={selectedDish}
          onChange={(e) => setSelectedDish(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            background: 'white'
          }}
        >
          {demoDishes.map(dish => (
            <option key={dish.name} value={dish.name}>
              {dish.name.charAt(0).toUpperCase() + dish.name.slice(1)} ({dish.category})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #007bff',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ margin: '15px 0 0 0', color: '#6c757d' }}>
            Анализируем цены в реальном времени...
          </p>
        </div>
      )}

      {demoData && !loading && (
        <div>
          {/* Общая информация */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
              📊 Анализ: {demoData.dish.name.charAt(0).toUpperCase() + demoData.dish.name.slice(1)}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Ресторанов</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {demoData.analysis.competitors.restaurants.count}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Магазинов</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {demoData.analysis.competitors.stores.count}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Общий балл</div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: demoData.analysis.overallScore >= 70 ? '#28a745' : 
                         demoData.analysis.overallScore >= 50 ? '#ffc107' : '#dc3545'
                }}>
                  {demoData.analysis.overallScore}/100
                </div>
              </div>
            </div>
          </div>

          {/* Цены в магазинах */}
          {demoData.priceData.storePrices.data.length > 0 && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
                🛒 Цены в магазинах (за 100г ингредиентов)
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px'
              }}>
                {demoData.priceData.storePrices.data.map((store, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: store.price === demoData.priceData.storePrices.min ? '2px solid #28a745' : '1px solid #dee2e6'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                      {store.store}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {store.price}₽
                    </div>
                    {store.price === demoData.priceData.storePrices.min && (
                      <div style={{ fontSize: '10px', color: '#28a745', marginTop: '2px' }}>
                        🏆 Лучшая цена
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#e9ecef',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#495057'
              }}>
                Средняя цена: {demoData.priceData.storePrices.average}₽ • 
                Диапазон: {demoData.priceData.storePrices.min}₽ - {demoData.priceData.storePrices.max}₽
              </div>
            </div>
          )}

          {/* Цены в ресторанах */}
          {demoData.priceData.restaurantPrices.data.length > 0 && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
                🍽️ Цены в ресторанах
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {demoData.priceData.restaurantPrices.data.map((restaurant, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                      {restaurant.restaurant}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {restaurant.price}₽
                    </div>
                    <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
                      ⭐ {restaurant.rating}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#e9ecef',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#495057'
              }}>
                Средняя цена: {demoData.priceData.restaurantPrices.average}₽ • 
                Диапазон: {demoData.priceData.restaurantPrices.min}₽ - {demoData.priceData.restaurantPrices.max}₽
              </div>
            </div>
          )}

          {/* Рекомендации */}
          {demoData.analysis.recommendations.length > 0 && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
                💡 AI Рекомендации
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {demoData.analysis.recommendations.map((rec, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    background: rec.impact === 'positive' ? '#d4edda' :
                               rec.impact === 'warning' ? '#fff3cd' :
                               rec.impact === 'critical' ? '#f8d7da' : '#e2e3e5',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '16px', 
                        marginRight: '8px',
                        color: rec.impact === 'positive' ? '#28a745' :
                               rec.impact === 'warning' ? '#ffc107' :
                               rec.impact === 'critical' ? '#dc3545' : '#6c757d'
                      }}>
                        {rec.impact === 'positive' ? '✅' :
                         rec.impact === 'warning' ? '⚠️' :
                         rec.impact === 'critical' ? '🚨' : 'ℹ️'}
                      </span>
                      <strong style={{ color: '#2c3e50', fontSize: '14px' }}>
                        {rec.title}
                      </strong>
                    </div>
                    
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#495057',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {rec.message}
                    </p>
                    
                    {rec.suggestedPrice && (
                      <div style={{
                        background: 'rgba(0,0,0,0.05)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        Рекомендуемая цена: {rec.suggestedPrice}₽
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceAnalysisDemo;
