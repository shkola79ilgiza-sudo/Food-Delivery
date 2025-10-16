import React, { useState, useEffect } from 'react';
import { checkDiabeticRestrictions, calculateDishGI, generateDiabeticRecommendations, calculateBreadUnits } from '../utils/diabeticRestrictions';

const DiabeticChecker = ({ ingredients, onDiabeticStatusChange }) => {
  const [restrictions, setRestrictions] = useState(null);
  const [gi, setGI] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [breadUnits, setBreadUnits] = useState(null);

  useEffect(() => {
    if (ingredients && ingredients.trim().length > 0) {
      const restrictionCheck = checkDiabeticRestrictions(ingredients);
      const giCheck = calculateDishGI(ingredients);
      const breadUnitsCheck = calculateBreadUnits(ingredients);
      const aiRecommendations = generateDiabeticRecommendations(ingredients, giCheck, restrictionCheck.isDiabeticFriendly);

      setRestrictions(restrictionCheck);
      setGI(giCheck);
      setBreadUnits(breadUnitsCheck);
      setRecommendations(aiRecommendations);

      // Передаем статус родительскому компоненту
      if (onDiabeticStatusChange) {
        onDiabeticStatusChange({
          isDiabeticFriendly: restrictionCheck.isDiabeticFriendly,
          gi: giCheck.gi,
          breadUnits: breadUnitsCheck.totalXE,
          warnings: restrictionCheck.warnings,
          recommendations: aiRecommendations
        });
      }
    } else {
      setRestrictions(null);
      setGI(null);
      setBreadUnits(null);
      setRecommendations([]);
    }
  }, [ingredients, onDiabeticStatusChange]);

  if (!restrictions || !gi || !breadUnits) {
    return null;
  }

  return (
    <div style={{
      marginTop: '15px',
      padding: '15px',
      borderRadius: '8px',
      border: restrictions.isDiabeticFriendly ? '2px solid #4caf50' : '2px solid #f44336',
      backgroundColor: restrictions.isDiabeticFriendly ? '#e8f5e8' : '#ffebee'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        {restrictions.isDiabeticFriendly ? (
          <>
            <span style={{ marginRight: '8px', fontSize: '20px' }}>✅</span>
            <span style={{ color: '#2e7d32' }}>Подходит для диабетиков</span>
          </>
        ) : (
          <>
            <span style={{ marginRight: '8px', fontSize: '20px' }}>❌</span>
            <span style={{ color: '#c62828' }}>Не подходит для диабетиков</span>
          </>
        )}
      </div>

      {/* Гликемический индекс */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Гликемический индекс:</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: gi.level === 'low' ? '#4caf50' : gi.level === 'medium' ? '#ff9800' : '#f44336',
            color: 'white'
          }}>
            {gi.gi} ({gi.level === 'low' ? 'Низкий' : gi.level === 'medium' ? 'Средний' : 'Высокий'})
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {gi.description}
        </div>
      </div>

      {/* Хлебные единицы */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Хлебные единицы (ХЕ):</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: breadUnits.totalXE <= 1 ? '#4caf50' : breadUnits.totalXE <= 2 ? '#ff9800' : '#f44336',
            color: 'white'
          }}>
            {breadUnits.totalXE} ХЕ
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Всего углеводов: {breadUnits.totalCarbohydrates}г • На порцию: {breadUnits.xePerPortion} ХЕ
        </div>
        
        {/* Детали по ингредиентам */}
        {breadUnits.details.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px', color: '#555' }}>
              📊 Детали по ингредиентам:
            </div>
            {breadUnits.details.map((detail, index) => (
              <div key={index} style={{
                padding: '3px 6px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                marginBottom: '2px',
                fontSize: '10px'
              }}>
                <span style={{ fontWeight: 'bold' }}>{detail.ingredient}</span> - 
                {detail.carbsInIngredient}г углеводов ({detail.xeInIngredient} ХЕ)
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Статистика проверки */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '10px',
        fontSize: '12px'
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Ингредиентов:</span> {restrictions.ingredientCount}
        </div>
        <div style={{ color: '#f44336' }}>
          <span style={{ fontWeight: 'bold' }}>Запрещенных:</span> {restrictions.forbiddenCount}
        </div>
        <div style={{ color: '#ff9800' }}>
          <span style={{ fontWeight: 'bold' }}>Ограниченных:</span> {restrictions.limitedCount}
        </div>
      </div>

      {/* Предупреждения */}
      {restrictions.warnings.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#d32f2f' }}>
            ⚠️ Предупреждения:
          </div>
          {restrictions.warnings.map((warning, index) => (
            <div key={index} style={{
              fontSize: '12px',
              marginBottom: '3px',
              padding: '5px',
              backgroundColor: '#fff3e0',
              borderRadius: '4px',
              borderLeft: '3px solid #ff9800'
            }}>
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Рекомендации */}
      {recommendations.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1976d2' }}>
            💡 AI-рекомендации:
          </div>
          {recommendations.map((rec, index) => (
            <div key={index} style={{
              fontSize: '12px',
              marginBottom: '3px',
              padding: '5px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              borderLeft: '3px solid #2196f3'
            }}>
              {rec}
            </div>
          ))}
        </div>
      )}

      {/* Рекомендации по ХЕ */}
      {breadUnits.recommendations.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#ff5722' }}>
            🍞 Рекомендации по ХЕ:
          </div>
          {breadUnits.recommendations.map((rec, index) => (
            <div key={index} style={{
              fontSize: '12px',
              marginBottom: '3px',
              padding: '5px',
              backgroundColor: '#fff3e0',
              borderRadius: '4px',
              borderLeft: '3px solid #ff9800'
            }}>
              {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiabeticChecker;
