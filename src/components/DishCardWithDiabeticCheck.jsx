import React, { useState, useEffect } from 'react';
import { checkDiabeticRestrictions, calculateDishGI } from '../utils/diabeticRestrictions';

const DishCardWithDiabeticCheck = ({ dish, onAddToCart, onViewDetails }) => {
  const [diabeticStatus, setDiabeticStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showFullInfo, setShowFullInfo] = useState(false);

  // Автоматическая проверка блюда при загрузке
  useEffect(() => {
    if (dish.ingredients) {
      setIsChecking(true);
      
      // Даем небольшую задержку для имитации AI-проверки
      setTimeout(() => {
        const restrictions = checkDiabeticRestrictions(dish.ingredients);
        const giCheck = calculateDishGI(dish.ingredients);
        
        setDiabeticStatus({
          isDiabeticFriendly: restrictions.isDiabeticFriendly,
          gi: giCheck.gi,
          giLevel: giCheck.level,
          warnings: restrictions.warnings,
          forbiddenCount: restrictions.forbiddenCount,
          limitedCount: restrictions.limitedCount
        });
        
        setIsChecking(false);
      }, 300); // 300мс задержка
    } else {
      setDiabeticStatus({
        isDiabeticFriendly: false,
        gi: null,
        warnings: ['Ингредиенты не указаны'],
        forbiddenCount: 0,
        limitedCount: 0
      });
      setIsChecking(false);
    }
  }, [dish.ingredients]);

  const getGIColor = (level) => {
    switch (level) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#999';
    }
  };

  const getGILabel = (level) => {
    switch (level) {
      case 'low': return 'Низкий ГИ';
      case 'medium': return 'Средний ГИ';
      case 'high': return 'Высокий ГИ';
      default: return 'Не определен';
    }
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '15px',
      backgroundColor: '#fff',
      position: 'relative',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      {/* AI-проверка - бейджи сверху */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        zIndex: 10
      }}>
        {isChecking ? (
          <div style={{
            padding: '5px 10px',
            backgroundColor: '#2196f3',
            color: 'white',
            borderRadius: '15px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span className="spinner" style={{
              width: '10px',
              height: '10px',
              border: '2px solid white',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></span>
            AI проверка...
          </div>
        ) : (
          <>
            {/* Основной бейдж: подходит/не подходит */}
            <div style={{
              padding: '5px 10px',
              backgroundColor: diabeticStatus?.isDiabeticFriendly ? '#4caf50' : '#f44336',
              color: 'white',
              borderRadius: '15px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
            onClick={() => setShowFullInfo(!showFullInfo)}
            title="Кликните для подробностей"
            >
              {diabeticStatus?.isDiabeticFriendly ? '✅' : '❌'}
              {diabeticStatus?.isDiabeticFriendly ? 'Диабетик OK' : 'Не для диабетиков'}
            </div>

            {/* Бейдж ГИ */}
            {diabeticStatus?.gi !== null && (
              <div style={{
                padding: '5px 10px',
                backgroundColor: getGIColor(diabeticStatus?.giLevel),
                color: 'white',
                borderRadius: '15px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📊 ГИ: {diabeticStatus?.gi}
              </div>
            )}
          </>
        )}
      </div>

      {/* Фото блюда */}
      {dish.image && (
        <div style={{
          width: '100%',
          height: '180px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '12px',
          backgroundImage: `url(${dish.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer'
        }}
        onClick={() => onViewDetails && onViewDetails(dish)}
        />
      )}

      {/* Название блюда */}
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        cursor: 'pointer'
      }}
      onClick={() => onViewDetails && onViewDetails(dish)}
      >
        {dish.name}
      </h3>

      {/* Описание */}
      {dish.description && (
        <p style={{
          margin: '0 0 10px 0',
          fontSize: '13px',
          color: '#666',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {dish.description}
        </p>
      )}

      {/* Подробная информация о диабетической проверке */}
      {showFullInfo && diabeticStatus && !isChecking && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: diabeticStatus.isDiabeticFriendly ? '#e8f5e8' : '#ffebee',
          borderRadius: '8px',
          border: `2px solid ${diabeticStatus.isDiabeticFriendly ? '#4caf50' : '#f44336'}`,
          fontSize: '12px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            🤖 AI-проверка завершена:
          </div>

          {/* ГИ детально */}
          {diabeticStatus.gi !== null && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Гликемический индекс:</span>
              <div style={{
                display: 'inline-block',
                marginLeft: '5px',
                padding: '2px 8px',
                backgroundColor: getGIColor(diabeticStatus.giLevel),
                color: 'white',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {diabeticStatus.gi} - {getGILabel(diabeticStatus.giLevel)}
              </div>
            </div>
          )}

          {/* Статистика */}
          {(diabeticStatus.forbiddenCount > 0 || diabeticStatus.limitedCount > 0) && (
            <div style={{ marginBottom: '8px', fontSize: '11px' }}>
              {diabeticStatus.forbiddenCount > 0 && (
                <div style={{ color: '#d32f2f' }}>
                  ❌ Запрещенных ингредиентов: {diabeticStatus.forbiddenCount}
                </div>
              )}
              {diabeticStatus.limitedCount > 0 && (
                <div style={{ color: '#f57c00' }}>
                  ⚠️ Ограниченных ингредиентов: {diabeticStatus.limitedCount}
                </div>
              )}
            </div>
          )}

          {/* Предупреждения */}
          {diabeticStatus.warnings && diabeticStatus.warnings.length > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '3px', color: '#d32f2f' }}>
                ⚠️ Предупреждения:
              </div>
              {diabeticStatus.warnings.slice(0, 3).map((warning, index) => (
                <div key={index} style={{
                  fontSize: '11px',
                  marginBottom: '2px',
                  paddingLeft: '10px',
                  color: '#666'
                }}>
                  • {warning}
                </div>
              ))}
              {diabeticStatus.warnings.length > 3 && (
                <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>
                  ... и еще {diabeticStatus.warnings.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Рекомендация */}
          <div style={{
            marginTop: '8px',
            padding: '6px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: '4px',
            fontSize: '11px',
            fontStyle: 'italic',
            color: '#555'
          }}>
            💡 {diabeticStatus.isDiabeticFriendly 
              ? 'Это блюдо подходит для людей с диабетом. Низкий ГИ и безопасный состав.'
              : 'Не рекомендуется для диабетиков. Содержит запрещенные ингредиенты или высокий ГИ.'
            }
          </div>
        </div>
      )}

      {/* Цена и кнопка */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#2e7d32'
        }}>
          {dish.price}₽
        </div>

        <button
          onClick={() => onAddToCart && onAddToCart(dish)}
          style={{
            padding: '8px 16px',
            backgroundColor: diabeticStatus?.isDiabeticFriendly ? '#4caf50' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = diabeticStatus?.isDiabeticFriendly ? '#45a049' : '#1976d2';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = diabeticStatus?.isDiabeticFriendly ? '#4caf50' : '#2196f3';
            e.target.style.transform = 'scale(1)';
          }}
        >
          🛒 В корзину
        </button>
      </div>

      {/* Кнопка "Подробнее" */}
      {!showFullInfo && (
        <button
          onClick={() => setShowFullInfo(true)}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid #2196f3',
            color: '#2196f3',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2196f3';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#2196f3';
          }}
        >
          🔍 Подробнее о диабетической проверке
        </button>
      )}

      {/* CSS для анимации спиннера */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DishCardWithDiabeticCheck;

