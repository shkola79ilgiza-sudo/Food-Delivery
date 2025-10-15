import React, { useState, useEffect } from 'react';
import DiabeticChecker from './DiabeticChecker';

const DiabeticMenuSection = ({ dishes = [], onAddToCart }) => {
  const [activeTab, setActiveTab] = useState('verified'); // 'verified' или 'ai-check'
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [sortBy, setSortBy] = useState('gi'); // gi, calories, protein
  const [filterBy, setFilterBy] = useState('all'); // all, low-gi, high-protein, low-calories

  // Функция для добавления тестового блюда
  const addTestDish = () => {
    const testDishes = [
      {
        id: `test-${Date.now()}`,
        name: 'Греческий салат с авокадо',
        price: 450,
        image: '/images/placeholder.jpg',
        ingredients: 'Помидоры, огурцы, авокадо, оливки, сыр фета, оливковое масло, лимонный сок, базилик',
        calories: 280,
        protein: 12,
        glycemicIndex: 25,
        diabeticFriendly: false, // Для тестирования AI-проверки
        description: 'Свежий салат с низким гликемическим индексом'
      },
      {
        id: `test-${Date.now()}-2`,
        name: 'Овсяная каша с ягодами',
        price: 320,
        image: '/images/placeholder.jpg',
        ingredients: 'Овсяные хлопья, черника, малина, мед, миндаль, корица',
        calories: 350,
        protein: 15,
        glycemicIndex: 55,
        diabeticFriendly: false,
        description: 'Полезная каша с натуральными ягодами'
      },
      {
        id: `test-${Date.now()}-3`,
        name: 'Куриная грудка с овощами',
        price: 580,
        image: '/images/placeholder.jpg',
        ingredients: 'Куриная грудка, брокколи, морковь, цукини, оливковое масло, чеснок, розмарин',
        calories: 320,
        protein: 35,
        glycemicIndex: 15,
        diabeticFriendly: false,
        description: 'Белковое блюдо с минимальным содержанием углеводов'
      }
    ];
    
    const randomDish = testDishes[Math.floor(Math.random() * testDishes.length)];
    setAllDishes(prev => [...prev, randomDish]);
  };

  useEffect(() => {
    // Инициализируем allDishes только один раз
    if (allDishes.length === 0 && dishes.length > 0) {
      setAllDishes(dishes);
    }
  }, [dishes, allDishes.length]);

  useEffect(() => {
    let filtered;
    if (activeTab === 'verified') {
      // Только блюда, отмеченные поварами как диабетические
      filtered = allDishes.filter(dish => dish.diabeticFriendly === true);
    } else {
      // Все блюда для AI-проверки
      filtered = allDishes.filter(dish => dish.diabeticFriendly !== true);
    }
    
    // Дополнительная фильтрация
    switch (filterBy) {
      case 'low-gi':
        filtered = filtered.filter(dish => (dish.glycemicIndex || 0) < 50);
        break;
      case 'high-protein':
        filtered = filtered.filter(dish => (dish.protein || 0) > 15);
        break;
      case 'low-calories':
        filtered = filtered.filter(dish => (dish.calories || 0) < 300);
        break;
      default:
        break;
    }

    // Сортировка
    switch (sortBy) {
      case 'gi':
        filtered.sort((a, b) => (a.glycemicIndex || 0) - (b.glycemicIndex || 0));
        break;
      case 'calories':
        filtered.sort((a, b) => (a.calories || 0) - (b.calories || 0));
        break;
      case 'protein':
        filtered.sort((a, b) => (b.protein || 0) - (a.protein || 0));
        break;
      default:
        break;
    }

    setFilteredDishes(filtered);
  }, [allDishes, sortBy, filterBy, activeTab]);

  const getGIColor = (gi) => {
    if (gi < 50) return '#4caf50'; // Зеленый - низкий ГИ
    if (gi < 70) return '#ff9800'; // Оранжевый - средний ГИ
    return '#f44336'; // Красный - высокий ГИ
  };

  const getGILabel = (gi) => {
    if (gi < 50) return 'Низкий ГИ';
    if (gi < 70) return 'Средний ГИ';
    return 'Высокий ГИ';
  };

  const handleAddToCart = (dish) => {
    if (onAddToCart) {
      onAddToCart(dish);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Заголовок секции */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#e8f5e8',
        borderRadius: '12px',
        border: '2px solid #4caf50'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>
          🩺 Меню для диабетиков
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {activeTab === 'verified' 
            ? 'Блюда, проверенные поварами для диабетиков'
            : 'Проверьте любые блюда AI-системой на пригодность для диабетиков'
          }
        </div>
        <div style={{ fontSize: '12px', color: '#4caf50', marginTop: '5px' }}>
          ✅ Без сахара • ✅ Низкий ГИ • ✅ Проверено экспертами
        </div>
      </div>

      {/* Вкладки */}
      <div style={{
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab('verified')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: activeTab === 'verified' ? '#4caf50' : 'transparent',
            color: activeTab === 'verified' ? 'white' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          ✅ Проверенные поварами
        </button>
        <button
          onClick={() => setActiveTab('ai-check')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: activeTab === 'ai-check' ? '#2196f3' : 'transparent',
            color: activeTab === 'ai-check' ? 'white' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          🤖 Проверить AI-системой
        </button>
      </div>

      {/* Кнопка добавления тестового блюда */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={addTestDish}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f57c00'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ff9800'}
        >
          ➕ Добавить тестовое блюдо для AI-проверки
        </button>
      </div>

      {/* Фильтры и сортировка */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ marginRight: '5px', fontWeight: 'bold' }}>Сортировка:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="gi">По гликемическому индексу</option>
            <option value="calories">По калориям</option>
            <option value="protein">По белку</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '5px', fontWeight: 'bold' }}>Фильтр:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="all">Все блюда</option>
            <option value="low-gi">Низкий ГИ (&lt;50)</option>
            <option value="high-protein">Высокобелковые (&gt;15г)</option>
            <option value="low-calories">Низкокалорийные (&lt;300 ккал)</option>
          </select>
        </div>

        <div style={{
          fontSize: '12px',
          color: '#666',
          marginLeft: 'auto'
        }}>
          Найдено: {filteredDishes.length} блюд
        </div>
      </div>

      {/* Список блюд */}
      {filteredDishes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          fontSize: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {activeTab === 'verified' ? '🍽️' : '🤖'}
          </div>
          <div>
            {activeTab === 'verified' 
              ? 'Пока нет блюд для диабетиков' 
              : 'Нет блюд для AI-проверки'
            }
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            {activeTab === 'verified' 
              ? 'Повара добавляют новые блюда каждый день'
              : 'Все блюда уже проверены поварами или нет доступных блюд'
            }
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredDishes.map((dish, index) => (
            <div key={index} style={{
              border: `2px solid ${activeTab === 'verified' ? '#4caf50' : '#2196f3'}`,
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: activeTab === 'verified' ? '#f8fff8' : '#f0f8ff',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {/* Заголовок блюда */}
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#2e7d32'
              }}>
                {dish.name}
              </div>

              {/* Фото блюда */}
              {dish.image && (
                <div style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  backgroundImage: `url(${dish.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
              )}

              {/* Пищевая ценность */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Калории:</span> {dish.calories || 0} ккал
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Белки:</span> {dish.protein || 0}г
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Углеводы:</span> {dish.carbs || 0}г
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Жиры:</span> {dish.fat || 0}г
                </div>
              </div>

              {/* Гликемический индекс */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '5px 10px',
                backgroundColor: getGIColor(dish.glycemicIndex || 0),
                borderRadius: '15px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                <span style={{ marginRight: '5px' }}>📊</span>
                ГИ: {dish.glycemicIndex || 0} ({getGILabel(dish.glycemicIndex || 0)})
              </div>

              {/* Метки */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
                marginBottom: '10px'
              }}>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  ✅ Без сахара
                </span>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  🩺 Проверено
                </span>
                {dish.halal && (
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: '#9c27b0',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    🕌 Халяль
                  </span>
                )}
              </div>

              {/* Описание */}
              {dish.description && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '10px',
                  lineHeight: '1.4'
                }}>
                  {dish.description}
                </div>
              )}

              {/* AI-проверка для вкладки ai-check */}
              {activeTab === 'ai-check' && dish.ingredients && (
                <div style={{
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <DiabeticChecker ingredients={dish.ingredients} />
                </div>
              )}

              {/* AI-рекомендация для проверенных блюд */}
              {activeTab === 'verified' && (
                <div style={{
                  fontSize: '11px',
                  color: '#1976d2',
                  backgroundColor: '#e3f2fd',
                  padding: '8px',
                  borderRadius: '6px',
                  borderLeft: '3px solid #2196f3'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>🤖 AI-рекомендация:</div>
                  <div>
                    {dish.glycemicIndex < 50 
                      ? 'Отлично для диабетиков! Низкий ГИ и сбалансированный состав.'
                      : dish.glycemicIndex < 70
                      ? 'Подходит для диабетиков в умеренных количествах.'
                      : 'Требует осторожности при диабете.'
                    }
                  </div>
                </div>
              )}

              {/* Кнопка заказа */}
              <button 
                onClick={() => handleAddToCart(dish)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: activeTab === 'verified' ? '#4caf50' : '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = activeTab === 'verified' ? '#45a049' : '#1976d2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = activeTab === 'verified' ? '#4caf50' : '#2196f3'}
              >
                🛒 {activeTab === 'verified' ? 'Заказать' : 'Добавить в корзину'} за {dish.price || '0'}₽
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Информационный блок */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: activeTab === 'verified' ? '#f5f5f5' : '#f0f8ff',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666',
        border: `1px solid ${activeTab === 'verified' ? '#e0e0e0' : '#2196f3'}`
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
          ℹ️ {activeTab === 'verified' ? 'О диабетическом меню' : 'О AI-проверке блюд'}
        </div>
        <div style={{ lineHeight: '1.5' }}>
          {activeTab === 'verified' ? (
            <>
              Все блюда в этом разделе прошли проверку AI-системой на соответствие требованиям для людей с диабетом.
              Мы проверяем отсутствие сахара, низкий гликемический индекс и сбалансированный состав.
              Если у вас есть вопросы о составе блюда, обратитесь к повару через чат.
            </>
          ) : (
            <>
              В этом разделе вы можете проверить любые блюда AI-системой на пригодность для диабетиков.
              Система анализирует состав ингредиентов, рассчитывает гликемический индекс и дает рекомендации.
              После проверки вы можете добавить подходящие блюда в корзину для заказа.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiabeticMenuSection;
