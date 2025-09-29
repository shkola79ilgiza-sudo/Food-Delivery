import React, { useState, useEffect } from 'react';
import { aiPricingAssistant } from '../utils/aiPricingAssistant';

const AIPricingAnalysis = ({ dishData, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState('moscow');

  // Запуск анализа при изменении данных блюда
  useEffect(() => {
    if (dishData && dishData.ingredients) {
      runAnalysis();
    }
  }, [dishData, userLocation]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiPricingAssistant.analyzePricing(dishData, userLocation);
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('AI Pricing Analysis Error:', err);
      // Показываем более детальную ошибку
      setError(`Ошибка при анализе ценообразования: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        borderRadius: '12px',
        margin: '20px 0'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          🤖 AI анализирует ценообразование...
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'white',
            animation: 'loading 2s infinite'
          }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        background: '#e74c3c',
        color: 'white',
        borderRadius: '8px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        ❌ {error}
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
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
        borderBottom: '2px solid rgba(255,255,255,0.3)'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>
          🤖 AI-анализ ценообразования
        </h2>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Уверенность: {Math.round(analysis.confidence * 100)}%
        </div>
      </div>

      {/* Настройки */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          📍 Местоположение:
        </div>
        <select
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '4px',
            background: 'white',
            color: '#333',
            fontSize: '14px'
          }}
        >
          <option value="moscow">Москва</option>
          <option value="spb">Санкт-Петербург</option>
          <option value="ekaterinburg">Екатеринбург</option>
        </select>
      </div>

      {/* Основные показатели */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* Рекомендуемая цена */}
        <div style={{
          padding: '15px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
            💰 Рекомендуемая цена
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {analysis.suggestedPrice}₽
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Диапазон: {analysis.priceRange.min}-{analysis.priceRange.max}₽
          </div>
        </div>

        {/* Анализ ингредиентов */}
        <div style={{
          padding: '15px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
            🥘 Стоимость ингредиентов
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {analysis.ingredientAnalysis.estimatedCost}₽
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Сложность: {analysis.ingredientAnalysis.complexity}
          </div>
        </div>

        {/* Анализ спроса */}
        <div style={{
          padding: '15px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
            📈 Прогноз спроса
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: analysis.demandForecast.isPopular ? '#2ecc71' : '#f39c12'
          }}>
            {analysis.demandForecast.isPopular ? 'Высокий' : 'Средний'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {analysis.demandForecast.season} • {analysis.demandForecast.timeOfDay}
          </div>
        </div>
      </div>

      {/* Анализ конкурентов */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
          🏪 Анализ конкурентов
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* Рестораны */}
          {analysis.competitorAnalysis.restaurants && (
            <div style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '6px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                🍽️ Рестораны
              </div>
              <div style={{ fontSize: '14px' }}>
                Средняя цена: {analysis.competitorAnalysis.restaurants.avg}₽
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Диапазон: {analysis.competitorAnalysis.restaurants.min}-{analysis.competitorAnalysis.restaurants.max}₽
              </div>
            </div>
          )}

          {/* Домашние повара */}
          {analysis.competitorAnalysis.homeChefs && (
            <div style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '6px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                👨‍🍳 Домашние повара
              </div>
              <div style={{ fontSize: '14px' }}>
                Средняя цена: {analysis.competitorAnalysis.homeChefs.avg}₽
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Диапазон: {analysis.competitorAnalysis.homeChefs.min}-{analysis.competitorAnalysis.homeChefs.max}₽
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Рекомендации */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div style={{
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
            💡 AI-рекомендации
          </h3>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {analysis.recommendations.map((rec, index) => (
              <div key={index} style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {getPriorityIcon(rec.priority)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: getPriorityColor(rec.priority)
                  }}>
                    {rec.type} • {rec.priority}
                  </span>
                </div>
                <div style={{ fontSize: '14px' }}>
                  {rec.message}
                </div>
                {rec.price && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: 'rgba(46, 204, 113, 0.3)',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    {rec.price}₽
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Детальная информация */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
          📊 Детальная информация
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              🥘 Ингредиенты
            </div>
            <div style={{ fontSize: '14px', marginBottom: '3px' }}>
              Распознано: {analysis.ingredientAnalysis.recognizedIngredients.length} шт.
            </div>
            <div style={{ fontSize: '14px', marginBottom: '3px' }}>
              Время приготовления: {analysis.ingredientAnalysis.preparationTime} мин.
            </div>
            <div style={{ fontSize: '14px' }}>
              Уровень навыков: {analysis.ingredientAnalysis.skillLevel}
            </div>
          </div>
          
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              📍 Рынок
            </div>
            <div style={{ fontSize: '14px', marginBottom: '3px' }}>
              Район: {analysis.marketAnalysis.location}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '3px' }}>
              Категория: {analysis.marketAnalysis.category}
            </div>
            <div style={{ fontSize: '14px' }}>
              Тренд: {analysis.marketAnalysis.marketTrend}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPricingAnalysis;
