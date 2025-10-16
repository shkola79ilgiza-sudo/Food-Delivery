import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSetClientOrders } from '../utils/safeStorage';
import { useToast } from '../contexts/ToastContext';
import AIOrderAnalysis from './AIOrderAnalysis';
import AIMealPlanner from './AIMealPlanner';
import '../App.css';

const AICoach = () => {
  const [userGoals, setUserGoals] = useState('');
  const [orderHistory, setOrderHistory] = useState([]);
  const [advice, setAdvice] = useState('');
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOrderAnalysis, setShowOrderAnalysis] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [availableDishes, setAvailableDishes] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess } = useToast();

  // Загружаем историю заказов и доступные блюда из localStorage
  useEffect(() => {
    // Пробуем загрузить заказы из разных источников
    let savedOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
    
    // Загружаем доступные блюда
    let dishes = JSON.parse(localStorage.getItem('allDishes') || '[]');
    if (dishes.length === 0) {
      // Пробуем другие ключи
      dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
    }
    setAvailableDishes(dishes);
    
    // Если заказы не найдены, пробуем другие ключи
    if (savedOrders.length === 0) {
      savedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }
    
    // Если все еще нет заказов, пробуем найти в других ключах
    if (savedOrders.length === 0) {
      const allKeys = Object.keys(localStorage);
      console.log('AI Coach: All localStorage keys:', allKeys);
      
      // Ищем ключи, которые могут содержать заказы
      const orderKeys = allKeys.filter(key => 
        key.includes('order') || key.includes('Order') || key.includes('заказ')
      );
      console.log('AI Coach: Potential order keys:', orderKeys);
      
      // Пробуем загрузить из найденных ключей
      for (const key of orderKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(data) && data.length > 0) {
            console.log(`AI Coach: Found orders in key "${key}":`, data);
            savedOrders = data;
            break;
          }
        } catch (e) {
          console.log(`AI Coach: Error parsing key "${key}":`, e);
        }
      }
    }
    
    console.log('AI Coach: Final orders loaded:', savedOrders);
    console.log('AI Coach: Orders count:', savedOrders.length);
    setOrderHistory(savedOrders);
  }, []);

  // Создание демо-заказов для тестирования
  const createDemoOrders = () => {
    const demoOrders = [
      {
        id: 'demo-order-1',
        date: new Date().toISOString(),
        items: [
          { name: 'Жареная курица', category: 'fried', calories: 450, price: 350 },
          { name: 'Картофель фри', category: 'fried', calories: 320, price: 180 },
          { name: 'Кока-кола', category: 'drinks', calories: 140, price: 80 }
        ],
        total: 610,
        status: 'delivered'
      },
      {
        id: 'demo-order-2',
        date: new Date(Date.now() - 86400000).toISOString(), // Вчера
        items: [
          { name: 'Салат Цезарь', category: 'vegetables', calories: 280, price: 250 },
          { name: 'Пицца Маргарита', category: 'baked', calories: 520, price: 450 }
        ],
        total: 700,
        status: 'delivered'
      },
      {
        id: 'demo-order-3',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 дня назад
        items: [
          { name: 'Жареные крылышки', category: 'fried', calories: 380, price: 320 },
          { name: 'Салат из свежих овощей', category: 'vegetables', calories: 120, price: 150 }
        ],
        total: 470,
        status: 'delivered'
      }
    ];
    
    // Сохраняем демо-заказы в localStorage
    safeSetClientOrders(demoOrders);
    setOrderHistory(demoOrders);
    showSuccess('Демо-заказы созданы! Теперь вы можете проанализировать их.');
    console.log('Demo orders created:', demoOrders);
  };

  // AI-анализ заказов
  const analyzeOrderHistory = () => {
    console.log('=== AI ANALYSIS DEBUG ===');
    console.log('Starting analysis with orders:', orderHistory);
    console.log('Orders count:', orderHistory.length);
    
    setIsAnalyzing(true);
    
    // Если нет заказов, создаем демо-данные для демонстрации
    let ordersToAnalyze = orderHistory;
    if (orderHistory.length === 0) {
      console.log('No orders found, creating demo data for analysis');
      ordersToAnalyze = [
        {
          id: 'demo-order-1',
          items: [
            { name: 'Жареная курица', category: 'fried', calories: 450 },
            { name: 'Картофель фри', category: 'fried', calories: 320 },
            { name: 'Кока-кола', category: 'drinks', calories: 140 }
          ]
        },
        {
          id: 'demo-order-2', 
          items: [
            { name: 'Салат Цезарь', category: 'vegetables', calories: 280 },
            { name: 'Пицца Маргарита', category: 'baked', calories: 520 }
          ]
        },
        {
          id: 'demo-order-3',
          items: [
            { name: 'Жареные крылышки', category: 'fried', calories: 380 },
            { name: 'Салат из свежих овощей', category: 'vegetables', calories: 120 }
          ]
        }
      ];
    }
    
    console.log('Orders to analyze:', ordersToAnalyze);
    
    setTimeout(() => {
      console.log('Performing AI analysis...');
      const analysis = performAIAnalysis(ordersToAnalyze);
      console.log('Analysis result:', analysis);
      
      setAdvice(analysis.advice);
      setWeeklyPlan(analysis.weeklyPlan);
      setIsAnalyzing(false);
      
      console.log('Advice set:', analysis.advice);
      console.log('Weekly plan set:', analysis.weeklyPlan);
      console.log('=== END AI ANALYSIS DEBUG ===');
      
      showSuccess('AI-анализ завершен!');
    }, 2000);
  };

  // AI-логика анализа
  const performAIAnalysis = (orders) => {
    console.log('=== PERFORM AI ANALYSIS DEBUG ===');
    console.log('Analyzing orders:', orders);
    
    const analysis = {
      advice: [],
      weeklyPlan: [],
      stats: {
        totalOrders: orders.length,
        friedCount: 0,
        vegetableCount: 0,
        meatCount: 0,
        averageCalories: 0
      }
    };

    // Анализируем заказы
    orders.forEach(order => {
      console.log('Processing order:', order);
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          console.log('Processing item:', item);
          if (item.category === 'fried' || item.name.includes('жарен')) {
            analysis.stats.friedCount++;
          }
          if (item.category === 'vegetables' || item.name.includes('салат')) {
            analysis.stats.vegetableCount++;
          }
          if (item.category === 'meat' || item.name.includes('мясо')) {
            analysis.stats.meatCount++;
          }
          analysis.stats.averageCalories += item.calories || 0;
        });
      }
    });

    analysis.stats.averageCalories = analysis.stats.averageCalories / orders.length || 0;
    console.log('Analysis stats:', analysis.stats);

    // Генерируем советы
    if (analysis.stats.friedCount > orders.length * 0.7) {
      analysis.advice.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Слишком много жареного!',
        message: 'Попробуйте запеченные или приготовленные на пару блюда. Рекомендую салаты и овощи на гриле.'
      });
    }

    if (analysis.stats.vegetableCount < orders.length * 0.3) {
      analysis.advice.push({
        type: 'info',
        icon: '🥗',
        title: 'Добавьте больше овощей',
        message: 'Овощи богаты витаминами и клетчаткой. Попробуйте свежие салаты, тушеные овощи или овощные супы.'
      });
    }

    if (analysis.stats.averageCalories > 800) {
      analysis.advice.push({
        type: 'warning',
        icon: '📊',
        title: 'Высокая калорийность блюд',
        message: 'Попробуйте более легкие варианты: салаты, супы, рыбу на пару.'
      });
    }

    // Генерируем недельный план
    analysis.weeklyPlan = generateWeeklyPlan(userGoals, analysis.stats);

    console.log('Final analysis result:', analysis);
    console.log('Advice count:', analysis.advice.length);
    console.log('Weekly plan count:', analysis.weeklyPlan.length);
    console.log('=== END PERFORM AI ANALYSIS DEBUG ===');

    return analysis;
  };

  // Генерация недельного плана
  const generateWeeklyPlan = (goals, stats) => {
    const plans = {
      weight_loss: [
        { day: 'Понедельник', breakfast: 'Овсянка с ягодами', lunch: 'Салат с куриной грудкой', dinner: 'Рыба на пару с овощами' },
        { day: 'Вторник', breakfast: 'Греческий йогурт', lunch: 'Овощной суп', dinner: 'Куриная грудка с салатом' },
        { day: 'Среда', breakfast: 'Творог с фруктами', lunch: 'Салат Цезарь', dinner: 'Рыба с овощами на гриле' },
        { day: 'Четверг', breakfast: 'Омлет с овощами', lunch: 'Куриный бульон', dinner: 'Тушеные овощи с мясом' },
        { day: 'Пятница', breakfast: 'Смузи с ягодами', lunch: 'Салат с тунцом', dinner: 'Запеченная рыба' },
        { day: 'Суббота', breakfast: 'Тост с авокадо', lunch: 'Овощной суп-пюре', dinner: 'Куриные котлеты на пару' },
        { day: 'Воскресенье', breakfast: 'Гречка с молоком', lunch: 'Салат с морепродуктами', dinner: 'Овощи на гриле' }
      ],
      muscle_gain: [
        { day: 'Понедельник', breakfast: 'Омлет с мясом', lunch: 'Стейк с картофелем', dinner: 'Куриная грудка с рисом' },
        { day: 'Вторник', breakfast: 'Творог с орехами', lunch: 'Мясной суп', dinner: 'Рыба с гречкой' },
        { day: 'Среда', breakfast: 'Яичница с беконом', lunch: 'Куриные котлеты с макаронами', dinner: 'Стейк с овощами' },
        { day: 'Четверг', breakfast: 'Сырники с медом', lunch: 'Мясной борщ', dinner: 'Куриная грудка с картофелем' },
        { day: 'Пятница', breakfast: 'Омлет с сыром', lunch: 'Рыба с рисом', dinner: 'Мясные тефтели' },
        { day: 'Суббота', breakfast: 'Творожная запеканка', lunch: 'Стейк с гречкой', dinner: 'Куриные крылышки' },
        { day: 'Воскресенье', breakfast: 'Яичница с колбасой', lunch: 'Мясной суп', dinner: 'Рыба с овощами' }
      ],
      healthy: [
        { day: 'Понедельник', breakfast: 'Овсянка с фруктами', lunch: 'Салат с курицей', dinner: 'Рыба с овощами' },
        { day: 'Вторник', breakfast: 'Греческий йогурт', lunch: 'Овощной суп', dinner: 'Куриная грудка с салатом' },
        { day: 'Среда', breakfast: 'Творог с ягодами', lunch: 'Салат с морепродуктами', dinner: 'Запеченная рыба' },
        { day: 'Четверг', breakfast: 'Омлет с овощами', lunch: 'Куриный бульон', dinner: 'Тушеные овощи' },
        { day: 'Пятница', breakfast: 'Смузи с зеленью', lunch: 'Салат с тунцом', dinner: 'Рыба на пару' },
        { day: 'Суббота', breakfast: 'Тост с авокадо', lunch: 'Овощной суп-пюре', dinner: 'Куриные котлеты на пару' },
        { day: 'Воскресенье', breakfast: 'Гречка с молоком', lunch: 'Салат с курицей', dinner: 'Овощи на гриле' }
      ]
    };

    return plans[goals] || plans.healthy;
  };

  return (
    <div 
      className="ai-coach-container"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* Полупрозрачный оверлей для лучшей читаемости */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="ai-coach-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>🤖 {t.aiCoach?.title || 'AI Консультант по питанию'}</h2>
            <button
              onClick={() => navigate('/client/menu')}
              style={{
                background: 'linear-gradient(135deg, #6c757d, #495057)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(108, 117, 125, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.4)';
              }}
            >
              ← {t.common?.back || 'Назад'} {(typeof t.clientMenu === 'string' ? t.clientMenu : t.clientMenu?.title) || 'Меню'}
            </button>
          </div>
          <p>{t.aiCoach.subtitle}</p>
        </div>

      <div className="ai-coach-content">
        {/* Выбор целей */}
        <div className="goals-section">
          <h3>🎯 {t.aiCoach.selectGoal}</h3>
          <div className="goals-grid">
            <button 
              className={`goal-button ${userGoals === 'weight_loss' ? 'active' : ''}`}
              onClick={() => setUserGoals('weight_loss')}
            >
              💪 {t.aiCoach.weightLoss}
            </button>
            <button 
              className={`goal-button ${userGoals === 'muscle_gain' ? 'active' : ''}`}
              onClick={() => setUserGoals('muscle_gain')}
            >
              🏋️ {t.aiCoach.muscleGain}
            </button>
            <button 
              className={`goal-button ${userGoals === 'healthy' ? 'active' : ''}`}
              onClick={() => setUserGoals('healthy')}
            >
              🌱 {t.aiCoach.healthyEating}
            </button>
          </div>
        </div>

        {/* Анализ заказов */}
        <div className="analysis-section">
          <h3>📊 {t.aiCoach.analyzeOrders}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{orderHistory.length}</div>
              <div className="stat-label">{t.aiCoach.totalOrders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{orderHistory.reduce((sum, order) => sum + (order.items?.length || 0), 0)}</div>
              <div className="stat-label">{t.aiCoach.dishesOrdered}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="analyze-button"
              onClick={analyzeOrderHistory}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? `🔄 ${t.aiCoach.analyzing}` : `🔍 ${t.aiCoach.analyzeButton}`}
            </button>
            
            <button 
              onClick={() => setShowOrderAnalysis(true)}
              style={{
                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.4)';
              }}
            >
              🤖 Углубленный AI-анализ
            </button>
            
            <button 
              onClick={() => setShowMealPlanner(true)}
              style={{
                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.4)';
              }}
            >
              🍽️ План питания на 3 дня
            </button>
            
            {orderHistory.length === 0 && (
              <button 
                className="demo-button"
                onClick={createDemoOrders}
                style={{
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
                }}
              >
                🎯 Создать демо-заказы
              </button>
            )}
          </div>
        </div>

        {/* AI-советы */}
        {advice && advice.length > 0 && (
          <div className="advice-section">
            <h3>💡 {t.aiCoach.aiAdvice}</h3>
            <div className="advice-list">
              {advice.map((item, index) => (
                <div key={index} className={`advice-item ${item.type}`}>
                  <div className="advice-icon">{item.icon}</div>
                  <div className="advice-content">
                    <h4>{item.title}</h4>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Состояние загрузки */}
        {isAnalyzing && (
          <div className="loading-section">
            <h3>🔄 Анализируем ваши заказы...</h3>
            <p>Пожалуйста, подождите, AI изучает ваши предпочтения в еде.</p>
          </div>
        )}

        {/* Сообщение если нет советов */}
        {!isAnalyzing && advice && advice.length === 0 && orderHistory.length > 0 && (
          <div className="no-advice-section">
            <h3>💡 {t.aiCoach.aiAdvice}</h3>
            <p>Отличные заказы! Продолжайте в том же духе. Ваше питание сбалансировано.</p>
          </div>
        )}

        {/* Недельный план */}
        {weeklyPlan && weeklyPlan.length > 0 && (
          <div className="weekly-plan-section">
            <h3>📅 {t.aiCoach.weeklyPlan}</h3>
            <div className="weekly-plan-grid">
              {weeklyPlan.map((day, index) => (
                <div key={index} className="day-plan">
                  <h4>{day.day}</h4>
                  <div className="meals">
                    <div className="meal">
                      <span className="meal-time">🌅 {t.aiCoach.breakfast}:</span>
                      <span className="meal-name">{day.breakfast}</span>
                    </div>
                    <div className="meal">
                      <span className="meal-time">☀️ {t.aiCoach.lunch}:</span>
                      <span className="meal-name">{day.lunch}</span>
                    </div>
                    <div className="meal">
                      <span className="meal-time">🌙 {t.aiCoach.dinner}:</span>
                      <span className="meal-name">{day.dinner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Order Analysis Modal */}
        {showOrderAnalysis && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <AIOrderAnalysis
                orders={orderHistory}
                userGoals={userGoals}
                onClose={() => setShowOrderAnalysis(false)}
              />
            </div>
          </div>
        )}

        {/* AI Meal Planner Modal */}
        {showMealPlanner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <AIMealPlanner
                availableDishes={availableDishes}
                onClose={() => setShowMealPlanner(false)}
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AICoach;
