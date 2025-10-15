import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import aiMealPlanner from '../utils/aiMealPlanner';

const AIMealPlanner = ({ onClose, availableDishes = [] }) => {
  const [goal, setGoal] = useState('healthy');
  const [allergies, setAllergies] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const goals = [
    { id: 'weight_loss', name: 'Похудение', icon: '💪', calories: '1800 ккал', description: 'Сбалансированное питание для снижения веса' },
    { id: 'muscle_gain', name: 'Набор мышечной массы', icon: '🏋️', calories: '2500 ккал', description: 'Высокобелковый рацион для роста мышц' },
    { id: 'healthy', name: 'Здоровое питание', icon: '🌱', calories: '2200 ккал', description: 'Сбалансированный рацион для поддержания здоровья' },
    { id: 'diabetic_friendly', name: 'Для диабетиков', icon: '🩺', calories: '2000 ккал', description: 'Низкогликемический рацион' },
    { id: 'keto', name: 'Кето-диета', icon: '🥑', calories: '1800 ккал', description: 'Низкоуглеводный рацион' }
  ];

  const allergyOptions = [
    { id: 'gluten', name: 'Глютен', icon: '🌾' },
    { id: 'dairy', name: 'Молочные продукты', icon: '🥛' },
    { id: 'nuts', name: 'Орехи', icon: '🥜' },
    { id: 'seafood', name: 'Морепродукты', icon: '🐟' },
    { id: 'eggs', name: 'Яйца', icon: '🥚' },
    { id: 'soy', name: 'Соя', icon: '🫘' }
  ];

  const preferenceOptions = [
    { id: 'vegetarian', name: 'Вегетарианское', icon: '🥗' },
    { id: 'vegan', name: 'Веганское', icon: '🌿' },
    { id: 'halal', name: 'Халяль', icon: '☪️' },
    { id: 'kosher', name: 'Кошерное', icon: '✡️' },
    { id: 'organic', name: 'Органическое', icon: '🌱' }
  ];

  const generateMealPlan = async () => {
    if (availableDishes.length === 0) {
      showError('Нет доступных блюд для планирования. Добавьте блюда в меню.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🍽️ Generating meal plan...', { goal, allergies, preferences });
      
      const plan = await aiMealPlanner.generateMealPlan({
        goal,
        allergies,
        preferences,
        availableDishes,
        budget: 'medium',
        cookingTime: 'medium'
      });

      console.log('✅ Meal plan generated:', plan);
      setMealPlan(plan);
      showSuccess('Персональный план питания готов! Проверьте рекомендации.');
    } catch (error) {
      console.error('❌ Error generating meal plan:', error);
      showError('Ошибка при создании плана питания. Попробуйте изменить параметры.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAllergy = (allergyId) => {
    setAllergies(prev => 
      prev.includes(allergyId) 
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    );
  };

  const togglePreference = (preferenceId) => {
    setPreferences(prev => 
      prev.includes(preferenceId) 
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const getMealIcon = (mealTime) => {
    switch (mealTime) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getMealName = (mealTime) => {
    switch (mealTime) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      case 'snack': return 'Перекус';
      default: return mealTime;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  if (isGenerating) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>
          AI создает ваш персональный план питания...
        </h3>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Анализируем доступные блюда и ваши предпочтения
        </p>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#f0f0f0',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '85%',
            height: '100%',
            background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
            animation: 'loading 2s ease-in-out infinite'
          }}></div>
        </div>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '15px' }}>
          Это может занять несколько секунд...
        </p>
      </div>
    );
  }

  if (mealPlan) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <div>
            <h2 style={{ color: '#333', margin: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🍽️ Персональный план питания
            </h2>
            <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
              Цель: {goals.find(g => g.id === goal)?.name} • {mealPlan.days.length} дня
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '5px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Общие метрики */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50', marginBottom: '5px' }}>
              {mealPlan.summary.varietyScore.toFixed(0)}%
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Разнообразие</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3', marginBottom: '5px' }}>
              {mealPlan.summary.nutritionBalance.toFixed(0)}%
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Баланс</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800', marginBottom: '5px' }}>
              {mealPlan.cost?.averagePerDay || 0}₽
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Средний чек</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '5px' }}>
              {mealPlan.prepTime?.totalHours || 0}ч
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Время готовки</div>
          </div>
        </div>

        {/* Навигация по дням */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '10px'
        }}>
          {mealPlan.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              style={{
                background: selectedDay === index ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'white',
                color: selectedDay === index ? 'white' : '#333',
                border: `2px solid ${selectedDay === index ? '#4caf50' : '#e0e0e0'}`,
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📅</span>
              {day.day}
              <span style={{
                background: selectedDay === index ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                color: selectedDay === index ? 'white' : '#666',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {day.score.toFixed(0)}%
              </span>
            </button>
          ))}
        </div>

        {/* План на выбранный день */}
        {mealPlan.days[selectedDay] && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>
              📅 {mealPlan.days[selectedDay].day}
            </h3>
            
            {/* Приемы пищи */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(mealPlan.days[selectedDay].meals).map(([mealTime, meal]) => {
                if (!meal) return null;
                
                return (
                  <div
                    key={mealTime}
                    style={{
                      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{getMealIcon(mealTime)}</span>
                        <h4 style={{ margin: '0', color: '#333' }}>{getMealName(mealTime)}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {meal.dishCalories && (
                          <span style={{ color: '#666', fontSize: '14px' }}>
                            {meal.dishCalories} ккал
                          </span>
                        )}
                        {meal.price && (
                          <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '14px' }}>
                            {meal.price}₽
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>
                      {meal.name}
                    </h5>
                    
                    {meal.ingredients && (
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        <strong>Ингредиенты:</strong> {meal.ingredients}
                      </p>
                    )}
                    
                    {(meal.dishProtein || meal.dishCarbs || meal.dishFat) && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '15px', 
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        {meal.dishProtein && <span>Б: {meal.dishProtein}г</span>}
                        {meal.dishCarbs && <span>У: {meal.dishCarbs}г</span>}
                        {meal.dishFat && <span>Ж: {meal.dishFat}г</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Итоги дня */}
            <div style={{
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              border: '2px solid #2196f3',
              borderRadius: '10px',
              padding: '15px',
              marginTop: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📊 Итоги дня</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
                    {mealPlan.days[selectedDay].totals.calories.toFixed(0)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>ккал</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                    {mealPlan.days[selectedDay].totals.protein.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>г белка</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>
                    {mealPlan.days[selectedDay].totals.carbs.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>г углеводов</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#9c27b0' }}>
                    {mealPlan.days[selectedDay].totals.fat.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>г жиров</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI-рекомендации */}
        {mealPlan.aiRecommendations && mealPlan.aiRecommendations.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>🤖 AI-рекомендации</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mealPlan.aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    background: rec.type === 'warning' ? 'rgba(244, 67, 54, 0.1)' :
                               rec.type === 'success' ? 'rgba(76, 175, 80, 0.1)' :
                               'rgba(33, 150, 243, 0.1)',
                    border: `2px solid ${rec.type === 'warning' ? '#f44336' :
                                      rec.type === 'success' ? '#4caf50' : '#2196f3'}`,
                    borderRadius: '10px',
                    padding: '15px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{rec.icon}</span>
                    <h4 style={{ margin: '0', color: '#333' }}>{rec.title}</h4>
                  </div>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>{rec.message}</p>
                  {rec.action && (
                    <p style={{ margin: '0', color: '#2196f3', fontSize: '13px', fontWeight: 'bold' }}>
                      💡 {rec.action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={() => setShowShoppingList(!showShoppingList)}
            style={{
              background: 'linear-gradient(135deg, #ff9800, #f57c00)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🛒 Список покупок
          </button>
          
          <button
            onClick={() => {
              const planText = mealPlan.days.map(day => 
                `${day.day}:\n` +
                Object.entries(day.meals).map(([time, meal]) => 
                  `${getMealName(time)}: ${meal?.name || 'Не выбрано'}`
                ).join('\n')
              ).join('\n\n');
              
              navigator.clipboard.writeText(planText);
              showSuccess('План скопирован в буфер обмена!');
            }}
            style={{
              background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📋 Копировать план
          </button>
        </div>

        {/* Список покупок */}
        {showShoppingList && mealPlan.shoppingList && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>🛒 Список покупок</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mealPlan.shoppingList.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{item.ingredient}</strong>
                    <span style={{ color: '#666', fontSize: '14px', marginLeft: '10px' }}>
                      ({item.category})
                    </span>
                  </div>
                  <span style={{
                    background: '#4caf50',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.count} раз
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка создания нового плана */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setMealPlan(null)}
            style={{
              background: 'linear-gradient(135deg, #4caf50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Создать новый план
          </button>
        </div>

        {/* CSS для анимации */}
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Форма настройки плана
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '15px'
      }}>
        <div>
          <h2 style={{ color: '#333', margin: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🍽️ AI Планировщик питания
          </h2>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Создайте персональный план питания на 3 дня
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '5px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Выбор цели */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>🎯 Ваша цель</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {goals.map(goalOption => (
            <button
              key={goalOption.id}
              onClick={() => setGoal(goalOption.id)}
              style={{
                background: goal === goalOption.id ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'white',
                color: goal === goalOption.id ? 'white' : '#333',
                border: `2px solid ${goal === goalOption.id ? '#4caf50' : '#e0e0e0'}`,
                padding: '15px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{goalOption.icon}</span>
                <span>{goalOption.name}</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {goalOption.calories} • {goalOption.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Аллергии */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>🚫 Аллергии и непереносимость</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {allergyOptions.map(allergy => (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              style={{
                background: allergies.includes(allergy.id) ? 'linear-gradient(135deg, #f44336, #d32f2f)' : 'white',
                color: allergies.includes(allergy.id) ? 'white' : '#333',
                border: `2px solid ${allergies.includes(allergy.id) ? '#f44336' : '#e0e0e0'}`,
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <span>{allergy.icon}</span>
              {allergy.name}
            </button>
          ))}
        </div>
      </div>

      {/* Предпочтения */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>✨ Предпочтения в питании</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {preferenceOptions.map(preference => (
            <button
              key={preference.id}
              onClick={() => togglePreference(preference.id)}
              style={{
                background: preferences.includes(preference.id) ? 'linear-gradient(135deg, #2196f3, #1976d2)' : 'white',
                color: preferences.includes(preference.id) ? 'white' : '#333',
                border: `2px solid ${preferences.includes(preference.id) ? '#2196f3' : '#e0e0e0'}`,
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <span>{preference.icon}</span>
              {preference.name}
            </button>
          ))}
        </div>
      </div>

      {/* Информация о доступных блюдах */}
      <div style={{
        background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
        border: '2px solid #4caf50',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <h4 style={{ margin: '0', color: '#333' }}>Доступные блюда</h4>
        </div>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          В меню доступно <strong>{availableDishes.length}</strong> блюд для планирования.
          {allergies.length > 0 && (
            <span> После фильтрации по аллергиям останется меньше блюд.</span>
          )}
        </p>
      </div>

      {/* Кнопка генерации */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={generateMealPlan}
          disabled={availableDishes.length === 0}
          style={{
            background: availableDishes.length > 0 ? 'linear-gradient(135deg, #4caf50, #45a049)' : '#ccc',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            cursor: availableDishes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: availableDishes.length > 0 ? '0 4px 15px rgba(76, 175, 80, 0.3)' : 'none',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
        >
          <span>🤖</span>
          Создать план питания
        </button>
        
        {availableDishes.length === 0 && (
          <p style={{ color: '#f44336', fontSize: '14px', marginTop: '10px' }}>
            Нет доступных блюд для планирования
          </p>
        )}
      </div>
    </div>
  );
};

export default AIMealPlanner;
