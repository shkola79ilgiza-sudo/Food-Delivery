import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DishDetails = ({ dish, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('composition');

  if (!isOpen || !dish) return null;

  const tabs = [
    { id: 'composition', label: '🥘 Состав', icon: '🥘' },
    { id: 'nutrition', label: '📊 Пищевая ценность', icon: '📊' },
    { id: 'allergens', label: '⚠️ Аллергены', icon: '⚠️' },
    { id: 'info', label: 'ℹ️ Информация', icon: 'ℹ️' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Заголовок */}
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            {dish.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>
        </div>

        {/* Изображение блюда */}
        <div style={{
          height: '200px',
          background: `url(${dish.image || '/images/tatar.jpg'}) center/cover`,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 15px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {dish.weight || '350г'} • {dish.price}₽
          </div>
        </div>

        {/* Табы */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0',
          background: '#f8f9fa'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '15px 10px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#2D5016' : '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #2D5016' : '3px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Контент табов */}
        <div style={{
          padding: '25px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {activeTab === 'composition' && (
            <div>
              <h3 style={{ color: '#2D5016', marginBottom: '15px', fontSize: '18px' }}>
                🥘 Состав блюда
              </h3>
              
              {/* Ингредиенты */}
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '15px'
              }}>
                <h4 style={{ color: '#2D5016', marginBottom: '10px', fontSize: '16px' }}>
                  📝 Ингредиенты:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(dish.ingredients || ['Свёкла', 'капуста', 'говядина', 'картофель', 'морковь', 'лук', 'томатная паста', 'сметана', 'зелень', 'специи']).map((ingredient, index) => (
                    <span key={index} style={{
                      background: '#e8f5e8',
                      color: '#2D5016',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Вес и порция */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  background: '#fff3cd',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #ffeaa7'
                }}>
                  <h4 style={{ color: '#856404', marginBottom: '8px', fontSize: '14px' }}>
                    ⚖️ Вес
                  </h4>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#856404' }}>
                    {dish.weight || '400г'}
                  </p>
                </div>
                
                <div style={{
                  background: '#d1ecf1',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #bee5eb'
                }}>
                  <h4 style={{ color: '#0c5460', marginBottom: '8px', fontSize: '14px' }}>
                    🍽️ Размер порции
                  </h4>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0c5460' }}>
                    {dish.portionSize || '1 порция'}
                  </p>
                </div>
              </div>

              {/* Срок хранения */}
              <div style={{
                background: '#f8d7da',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #f5c6cb'
              }}>
                <h4 style={{ color: '#721c24', marginBottom: '8px', fontSize: '14px' }}>
                  ⏰ Срок хранения
                </h4>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#721c24' }}>
                  {dish.shelfLife || '24 часа'}
                </p>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #e8f5e8, #f0f8f0)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #d4edda'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Вес порции</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#2D5016' }}>
                    {dish.weight || '350г'}
                  </div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #ffeaa7'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Время приготовления</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#856404' }}>
                    {dish.cookingTime || '45 мин'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div>
              <h3 style={{ color: '#2D5016', marginBottom: '15px', fontSize: '18px' }}>
                📊 Пищевая ценность (на 100г)
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Калории</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    {dish.nutritionalValue?.calories || dish.calories || '65'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>ккал</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #4ecdc4, #6dd5ed)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Белки</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    {dish.nutritionalValue?.protein || dish.protein || '4.2'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>г</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #45b7d1, #96c7ed)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Жиры</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    {dish.nutritionalValue?.fat || dish.fat || '2.1'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>г</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Углеводы</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    {dish.nutritionalValue?.carbs || dish.carbs || '8.5'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>г</div>
                </div>
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#666'
              }}>
                <strong>💡 Совет:</strong> Данные указаны приблизительно и могут варьироваться в зависимости от конкретных ингредиентов и способа приготовления.
              </div>
            </div>
          )}

          {activeTab === 'allergens' && (
            <div>
              <h3 style={{ color: '#2D5016', marginBottom: '15px', fontSize: '18px' }}>
                ⚠️ Аллергены и особенности
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#dc3545', marginBottom: '10px', fontSize: '16px' }}>
                  🚨 Содержит аллергены:
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {(dish.allergens || ['Мясо', 'Молочные продукты']).map((allergen, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid #f5c6cb'
                      }}
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#28a745', marginBottom: '10px', fontSize: '16px' }}>
                  ✅ Подходит для диет:
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {(dish.dietTypes || ['Традиционная кухня', 'Домашняя кухня']).map((diet, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#d4edda',
                        color: '#155724',
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid #c3e6cb'
                      }}
                    >
                      {diet}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                background: '#fff3cd',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #ffeaa7',
                fontSize: '14px',
                color: '#856404'
              }}>
                <strong>⚠️ Важно:</strong> Если у вас есть аллергия или непереносимость каких-либо продуктов, обязательно сообщите об этом повару при заказе.
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <h3 style={{ color: '#2D5016', marginBottom: '15px', fontSize: '18px' }}>
                ℹ️ Дополнительная информация
              </h3>
              
              <div style={{
                display: 'grid',
                gap: '15px'
              }}>
                <div style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2D5016', fontSize: '16px' }}>
                    👨‍🍳 Повар
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {dish.chef || 'Анна Петрова'} • Опыт: {dish.experience || '5 лет'}
                  </p>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2D5016', fontSize: '16px' }}>
                    🏠 Особенности приготовления
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {dish.cookingNotes || 'Готовится по традиционному рецепту с использованием свежих продуктов. Блюдо томится на медленном огне для максимального раскрытия вкуса.'}
                  </p>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2D5016', fontSize: '16px' }}>
                    📦 Упаковка и доставка
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    Блюдо упаковывается в экологичную тару. Рекомендуется употребить в течение 2 часов после доставки. При необходимости можно разогреть в микроволновке.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка закрытия */}
        <div style={{
          padding: '20px 25px',
          borderTop: '1px solid #e0e0e0',
          background: '#f8f9fa',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
            }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishDetails;
