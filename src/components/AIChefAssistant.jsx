import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import '../App.css';

const AIChefAssistant = () => {
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState(false);
  const [customTags, setCustomTags] = useState('');
  const [customPresentation, setCustomPresentation] = useState('');
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // AI-анализ блюда
  const analyzeDish = () => {
    if (!dishName || !ingredients) {
      showError('Заполните название блюда и ингредиенты');
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analysis = performDishAnalysis(dishName, ingredients);
      setSuggestions(analysis);
      setIsAnalyzing(false);
      showSuccess('AI-анализ блюда завершен!');
    }, 1500);
  };

  // Демо-анализ для быстрого тестирования
  const runDemoAnalysis = () => {
    setDishName('Салат Цезарь с курицей');
    setIngredients('куриная грудка, салат айсберг, помидоры черри, сыр пармезан, сухарики, соус цезарь, оливковое масло');
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analysis = performDishAnalysis('Салат Цезарь с курицей', 'куриная грудка, салат айсберг, помидоры черри, сыр пармезан, сухарики, соус цезарь, оливковое масло');
      setSuggestions(analysis);
      setIsAnalyzing(false);
      showSuccess('Демо-анализ завершен!');
    }, 1500);
  };

  // AI-логика анализа блюда
  const performDishAnalysis = (name, ingredients) => {
    const analysis = {
      nutrition: calculateNutrition(ingredients),
      tags: generateTags(name, ingredients),
      presentation: generatePresentationTips(name, ingredients),
      popularity: predictPopularity(name, ingredients),
      price: suggestPrice(ingredients)
    };

    return analysis;
  };

  // Расчет БЖУ на основе ингредиентов
  const calculateNutrition = (ingredients) => {
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    
    ingredientList.forEach(ingredient => {
      if (ingredient.includes('мясо') || ingredient.includes('курица') || ingredient.includes('говядина')) {
        nutrition.calories += 200;
        nutrition.protein += 25;
        nutrition.fat += 10;
      }
      if (ingredient.includes('рыба') || ingredient.includes('лосось') || ingredient.includes('тунец')) {
        nutrition.calories += 150;
        nutrition.protein += 20;
        nutrition.fat += 8;
      }
      if (ingredient.includes('картофель') || ingredient.includes('рис') || ingredient.includes('макароны')) {
        nutrition.calories += 100;
        nutrition.carbs += 20;
      }
      if (ingredient.includes('овощи') || ingredient.includes('помидоры') || ingredient.includes('огурцы')) {
        nutrition.calories += 30;
        nutrition.carbs += 5;
      }
      if (ingredient.includes('масло') || ingredient.includes('сливочное')) {
        nutrition.calories += 50;
        nutrition.fat += 5;
      }
    });

    return nutrition;
  };

  // Генерация тегов
  const generateTags = (name, ingredients) => {
    const tags = [];
    const nameLower = name.toLowerCase();
    const ingredientsLower = ingredients.toLowerCase();

    // Диетические теги
    if (ingredientsLower.includes('овощи') || ingredientsLower.includes('салат')) {
      tags.push({ name: '🥗 Овощное', color: 'green' });
    }
    if (ingredientsLower.includes('мясо') || ingredientsLower.includes('курица')) {
      tags.push({ name: '🥩 Мясное', color: 'red' });
    }
    if (ingredientsLower.includes('рыба') || ingredientsLower.includes('морепродукты')) {
      tags.push({ name: '🐟 Рыбное', color: 'blue' });
    }

    // Кулинарные теги
    if (nameLower.includes('жарен') || ingredientsLower.includes('жарен')) {
      tags.push({ name: '🍳 Жареное', color: 'orange' });
    }
    if (nameLower.includes('запечен') || ingredientsLower.includes('запечен')) {
      tags.push({ name: '🔥 Запеченное', color: 'brown' });
    }
    if (nameLower.includes('пару') || ingredientsLower.includes('пару')) {
      tags.push({ name: '💨 На пару', color: 'lightblue' });
    }

    // Специальные теги
    if (ingredientsLower.includes('без глютена') || nameLower.includes('без глютена')) {
      tags.push({ name: '🌾 Без глютена', color: 'yellow' });
    }
    if (ingredientsLower.includes('веган') || nameLower.includes('веган')) {
      tags.push({ name: '🌱 Веганское', color: 'green' });
    }
    if (ingredientsLower.includes('халяль') || nameLower.includes('халяль')) {
      tags.push({ name: '🕌 Халяльное', color: 'purple' });
    }

    return tags;
  };

  // Советы по оформлению
  const generatePresentationTips = (name, ingredients) => {
    const tips = [];
    
    if (ingredients.includes('салат')) {
      tips.push('Используйте яркие овощи для контраста');
      tips.push('Добавьте орехи или семена для текстуры');
      tips.push('Подавайте в прозрачной посуде');
    }
    
    if (ingredients.includes('мясо')) {
      tips.push('Нарежьте мясо красивыми ломтиками');
      tips.push('Добавьте свежую зелень для украшения');
      tips.push('Подавайте с соусом в отдельной емкости');
    }
    
    if (ingredients.includes('рыба')) {
      tips.push('Добавьте лимон для свежести');
      tips.push('Используйте зелень для украшения');
      tips.push('Подавайте с овощами на гриле');
    }

    return tips;
  };

  // Предсказание популярности
  const predictPopularity = (name, ingredients) => {
    let score = 50; // Базовый балл
    
    const nameLower = name.toLowerCase();
    const ingredientsLower = ingredients.toLowerCase();

    // Популярные ингредиенты
    if (ingredientsLower.includes('курица')) score += 20;
    if (ingredientsLower.includes('сыр')) score += 15;
    if (ingredientsLower.includes('овощи')) score += 10;
    if (ingredientsLower.includes('салат')) score += 15;

    // Популярные названия
    if (nameLower.includes('цезарь')) score += 25;
    if (nameLower.includes('борщ')) score += 20;
    if (nameLower.includes('плов')) score += 20;

    if (score >= 80) return { level: 'Очень популярное', color: 'green', emoji: '🔥' };
    if (score >= 60) return { level: 'Популярное', color: 'blue', emoji: '👍' };
    if (score >= 40) return { level: 'Средне популярное', color: 'orange', emoji: '📊' };
    return { level: 'Может быть непопулярным', color: 'red', emoji: '⚠️' };
  };

  // Предложение цены
  const suggestPrice = (ingredients) => {
    let basePrice = 200;
    
    const ingredientsLower = ingredients.toLowerCase();
    
    if (ingredientsLower.includes('мясо')) basePrice += 100;
    if (ingredientsLower.includes('рыба')) basePrice += 150;
    if (ingredientsLower.includes('сыр')) basePrice += 50;
    if (ingredientsLower.includes('овощи')) basePrice += 30;
    if (ingredientsLower.includes('морепродукты')) basePrice += 200;

    return {
      min: basePrice - 50,
      max: basePrice + 100,
      recommended: basePrice
    };
  };

  // Функции для редактирования тегов и советов
  const handleEditTags = () => {
    setEditingTags(true);
    setCustomTags(suggestions.tags.map(tag => tag.name).join(', '));
  };

  const handleSaveTags = () => {
    if (customTags.trim()) {
      const newTags = customTags.split(',').map(tag => ({
        name: tag.trim(),
        color: 'custom'
      }));
      setSuggestions(prev => ({
        ...prev,
        tags: newTags
      }));
      setEditingTags(false);
      showSuccess('Теги обновлены!');
    }
  };

  const handleEditPresentation = () => {
    setEditingPresentation(true);
    setCustomPresentation(suggestions.presentation.join('\n'));
  };

  const handleSavePresentation = () => {
    if (customPresentation.trim()) {
      const newTips = customPresentation.split('\n').filter(tip => tip.trim());
      setSuggestions(prev => ({
        ...prev,
        presentation: newTips
      }));
      setEditingPresentation(false);
      showSuccess('Советы по оформлению обновлены!');
    }
  };

  const handleCancelEdit = (type) => {
    if (type === 'tags') {
      setEditingTags(false);
      setCustomTags('');
    } else {
      setEditingPresentation(false);
      setCustomPresentation('');
    }
  };

  return (
    <div 
      className="ai-chef-assistant-container"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
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
        <div className="ai-chef-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button 
              onClick={() => window.history.back()}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#2c2c2c',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              ← {t.common.back}
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h2 style={{ margin: 0 }}>👨‍🍳 {t.aiChefAssistant.title}</h2>
            </div>
            <div style={{ width: '100px' }}></div> {/* Spacer for centering */}
          </div>
          <p>{t.aiChefAssistant.subtitle}</p>
        </div>

      <div className="ai-chef-content">
        {/* Форма ввода */}
        <div className="input-section">
          <div className="input-group">
            <label>{t.aiChefAssistant.dishName}</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder={t.aiChefAssistant.dishNamePlaceholder}
            />
          </div>
          
          <div className="input-group">
            <label>{t.aiChefAssistant.ingredients}</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder={t.aiChefAssistant.ingredientsPlaceholder}
              rows={3}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="analyze-dish-button"
              onClick={analyzeDish}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? `🔄 ${t.aiChefAssistant.analyzing}` : `🤖 ${t.aiChefAssistant.analyzeDish}`}
            </button>
            <button 
              className="analyze-dish-button"
              onClick={runDemoAnalysis}
              disabled={isAnalyzing}
              style={{ background: 'linear-gradient(135deg, #9c27b0, #673ab7)' }}
            >
              🎯 Демо-анализ
            </button>
          </div>
        </div>

        {/* Результаты анализа */}
        {suggestions && (
          <div className="suggestions-section">
            {/* Кнопка "Новый анализ" */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '30px' 
            }}>
              <button 
                onClick={() => {
                  setSuggestions(null);
                  setDishName('');
                  setIngredients('');
                }}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                }}
              >
                🔄 Новый анализ
              </button>
            </div>
            {/* БЖУ */}
            <div className="suggestion-card">
              <h3>📊 {t.aiChefAssistant.nutritionValue}</h3>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="nutrition-value">{suggestions.nutrition.calories}</span>
                  <span className="nutrition-label">{t.aiChefAssistant.calories}</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{suggestions.nutrition.protein}г</span>
                  <span className="nutrition-label">{t.aiChefAssistant.protein}</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{suggestions.nutrition.carbs}г</span>
                  <span className="nutrition-label">{t.aiChefAssistant.carbs}</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{suggestions.nutrition.fat}г</span>
                  <span className="nutrition-label">{t.aiChefAssistant.fat}</span>
                </div>
              </div>
            </div>

            {/* Теги */}
            <div className="suggestion-card clickable-card" onClick={handleEditTags} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>🏷️ {t.aiChefAssistant.recommendedTags}</h3>
                <span style={{ fontSize: '12px', color: '#666', opacity: 0.7 }}>✏️ Нажмите для редактирования</span>
              </div>
              {editingTags ? (
                <div style={{ marginTop: '10px' }}>
                  <textarea
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    placeholder="Введите теги через запятую..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '10px',
                      border: '2px solid #4CAF50',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTags();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      💾 Сохранить
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit('tags');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #f44336, #da190b)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ❌ Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tags-grid">
                  {suggestions.tags.map((tag, index) => (
                    <span key={index} className={`tag ${tag.color}`}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Советы по оформлению */}
            <div className="suggestion-card clickable-card" onClick={handleEditPresentation} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>🎨 {t.aiChefAssistant.presentationTips}</h3>
                <span style={{ fontSize: '12px', color: '#666', opacity: 0.7 }}>✏️ Нажмите для редактирования</span>
              </div>
              {editingPresentation ? (
                <div style={{ marginTop: '10px' }}>
                  <textarea
                    value={customPresentation}
                    onChange={(e) => setCustomPresentation(e.target.value)}
                    placeholder="Введите советы по оформлению (каждый совет с новой строки)..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '10px',
                      border: '2px solid #FF9800',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSavePresentation();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      💾 Сохранить
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit('presentation');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #f44336, #da190b)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ❌ Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="presentation-tips">
                  {suggestions.presentation.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Популярность */}
            <div className="suggestion-card">
              <h3>📈 {t.aiChefAssistant.popularityForecast}</h3>
              <div className={`popularity-badge ${suggestions.popularity.color}`}>
                <span className="popularity-emoji">{suggestions.popularity.emoji}</span>
                <span className="popularity-text">{suggestions.popularity.level}</span>
              </div>
            </div>

            {/* Цена */}
            <div className="suggestion-card">
              <h3>💰 {t.aiChefAssistant.recommendedPrice}</h3>
              <div className="price-suggestion">
                <div className="price-range">
                  <span>{t.aiChefAssistant.from} {suggestions.price.min}₽ {t.aiChefAssistant.to} {suggestions.price.max}₽</span>
                </div>
                <div className="price-recommended">
                  <strong>{t.aiChefAssistant.recommended}: {suggestions.price.recommended}₽</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AIChefAssistant;
