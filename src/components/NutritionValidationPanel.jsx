import React, { useState, useEffect } from 'react';
import { aiNutritionValidator } from '../utils/aiNutritionValidator';

const NutritionValidationPanel = ({ manualData, ingredients, onValidationComplete, onAutoFill }) => {
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Автоматическая валидация при изменении данных
    if (manualData && ingredients && ingredients.length > 0) {
      validateNutrition();
    }
  }, [manualData, ingredients]);

  const validateNutrition = async () => {
    setIsValidating(true);
    try {
      const result = await aiNutritionValidator.validateNutrition(manualData, ingredients);
      setValidationResult(result);
      
      // Автоматически заполняем поля AI-расчетами
      if (result && result.autoCalculated && onAutoFill) {
        const aiData = result.autoCalculated;
        onAutoFill({
          calories: Math.round(aiData.calories || 0),
          protein: Math.round(aiData.protein || 0),
          carbs: Math.round(aiData.carbs || 0),
          fat: Math.round(aiData.fat || 0)
        });
      }
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }
    } catch (error) {
      console.error('Ошибка валидации:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  if (isValidating) {
    return (
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
        <div>AI проверяет ваши расчеты...</div>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  const formatted = aiNutritionValidator.formatValidationResult(validationResult);

  return (
    <div style={{
      padding: '20px',
      background: validationResult.isValid 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '12px',
      color: 'white',
      marginTop: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
              {formatted.title}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {formatted.message}
            </div>
          </div>
        </div>
        {validationResult.confidence && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {validationResult.confidence}% точность
          </div>
        )}
      </div>

      {/* Сравнительная таблица */}
      {validationResult.differences && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <div style={{ fontWeight: 'bold' }}>Сравнение данных</div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showDetails ? 'Скрыть' : 'Показать'} детали
            </button>
          </div>

          {showDetails && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.keys(validationResult.differences).map(field => {
                const diff = validationResult.differences[field];
                const fieldNames = {
                  calories: 'Калории',
                  protein: 'Белки',
                  carbs: 'Углеводы',
                  fat: 'Жиры'
                };

                return (
                  <div
                    key={field}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '10px',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${getStatusColor(diff.status)}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {getStatusIcon(diff.status)} {fieldNames[field]}
                      </div>
                      {diff.deviationPercent > 0 && (
                        <div style={{
                          fontSize: '12px',
                          background: 'rgba(255,255,255,0.2)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          ±{diff.deviationPercent}%
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      fontSize: '14px'
                    }}>
                      <div>
                        <div style={{ opacity: 0.8, fontSize: '12px' }}>Ваш расчет:</div>
                        <div style={{ fontWeight: 'bold' }}>{diff.manual}</div>
                      </div>
                      <div>
                        <div style={{ opacity: 0.8, fontSize: '12px' }}>AI расчет:</div>
                        <div style={{ fontWeight: 'bold' }}>{diff.auto}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Рекомендации */}
      {validationResult.recommendations && validationResult.recommendations.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            💡 Рекомендации:
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {validationResult.recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <div style={{ marginBottom: '5px' }}>{rec.message}</div>
                {rec.suggestion && (
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    fontStyle: 'italic'
                  }}>
                    💡 {rec.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {validationResult.aiInsights && validationResult.aiInsights.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '10px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            🧠 AI-анализ:
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {validationResult.aiInsights.map((insight, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div style={{ textAlign: 'center', marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={validateNutrition}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            padding: '10px 20px',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔄 Проверить снова
        </button>
      </div>
    </div>
  );
};

export default NutritionValidationPanel;

