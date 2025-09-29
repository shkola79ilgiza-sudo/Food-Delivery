import React from 'react';

const EnhancedAccuracyDisplay = ({ nutrition, recognizedIngredients = [], totalCost = 0 }) => {
  if (!nutrition) return null;

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return '#4CAF50'; // Зеленый
    if (accuracy >= 85) return '#FF9800'; // Оранжевый
    if (accuracy >= 70) return '#FF5722'; // Красный
    return '#F44336'; // Темно-красный
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy >= 95) return 'Отличная точность';
    if (accuracy >= 85) return 'Хорошая точность';
    if (accuracy >= 70) return 'Удовлетворительная точность';
    return 'Низкая точность';
  };

  return (
    <div style={{
      padding: '15px',
      background: 'linear-gradient(135deg, #E8F5E8, #F0F8F0)',
      borderRadius: '12px',
      border: '2px solid #4CAF50',
      marginBottom: '15px',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #4CAF50'
      }}>
        <span style={{ fontSize: '20px' }}>🎯</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#2E7D32'
        }}>
          Улучшенная точность расчета
        </span>
      </div>

      {/* Основные показатели точности */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
      }}>
        {/* Общая точность */}
        <div style={{
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          border: `3px solid ${getAccuracyColor(nutrition.overallAccuracy || 0)}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: getAccuracyColor(nutrition.overallAccuracy || 0),
            marginBottom: '5px'
          }}>
            {nutrition.overallAccuracy || 0}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            fontWeight: 'bold'
          }}>
            {getAccuracyLabel(nutrition.overallAccuracy || 0)}
          </div>
        </div>

        {/* Распознанные ингредиенты */}
        <div style={{
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          border: '2px solid #2196F3',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1976D2',
            marginBottom: '5px'
          }}>
            {nutrition.totalIngredients - (nutrition.unrecognizedCount || 0)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666'
          }}>
            Распознано из {nutrition.totalIngredients || 0}
          </div>
        </div>

        {/* Стоимость ингредиентов */}
        {totalCost > 0 && (
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            border: '2px solid #FF9800',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#F57C00',
              marginBottom: '5px'
            }}>
              {totalCost}₽
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666'
            }}>
              Стоимость ингредиентов
            </div>
          </div>
        )}
      </div>

      {/* Детальная информация о распознанных ингредиентах */}
      {recognizedIngredients && recognizedIngredients.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#2E7D32',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>✅</span>
            Распознанные ингредиенты:
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {recognizedIngredients.map((ingredient, index) => (
              <div key={index} style={{
                padding: '8px',
                background: '#E8F5E8',
                borderRadius: '6px',
                border: '1px solid #4CAF50',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  {ingredient.name} ({ingredient.quantity}{ingredient.unit})
                </div>
                <div style={{ color: '#666', marginTop: '2px' }}>
                  {ingredient.calories} ккал • {ingredient.protein}г белка • {ingredient.carbs}г углеводов • {ingredient.fat}г жиров
                </div>
                {ingredient.cost && (
                  <div style={{ color: '#F57C00', fontSize: '11px', marginTop: '2px' }}>
                    Стоимость: {ingredient.cost}₽
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Неопознанные ингредиенты */}
      {nutrition.unrecognized && nutrition.unrecognized.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#F44336',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>❌</span>
            Неопознанные ингредиенты:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px'
          }}>
            {nutrition.unrecognized.map((ingredient, index) => (
              <span key={index} style={{
                padding: '4px 8px',
                background: '#FFEBEE',
                color: '#C62828',
                borderRadius: '4px',
                fontSize: '11px',
                border: '1px solid #F44336'
              }}>
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Рекомендации по улучшению точности */}
      {nutrition.overallAccuracy < 95 && (
        <div style={{
          padding: '10px',
          background: '#FFF3E0',
          borderRadius: '6px',
          border: '1px solid #FF9800',
          fontSize: '12px',
          color: '#E65100'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            💡 Рекомендации для повышения точности:
          </div>
          <ul style={{ margin: 0, paddingLeft: '15px' }}>
            <li>Используйте стандартные названия ингредиентов</li>
            <li>Указывайте количество и единицы измерения (г, мл, шт)</li>
            <li>Разделяйте ингредиенты запятыми</li>
            <li>Избегайте сокращений и сленга</li>
          </ul>
        </div>
      )}

      {/* Прогресс-бар точности */}
      <div style={{ marginTop: '15px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
            Общая точность распознавания
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: getAccuracyColor(nutrition.overallAccuracy || 0)
          }}>
            {nutrition.overallAccuracy || 0}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#E0E0E0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${nutrition.overallAccuracy || 0}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getAccuracyColor(nutrition.overallAccuracy || 0)}, ${getAccuracyColor(nutrition.overallAccuracy || 0)}80)`,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedAccuracyDisplay;
