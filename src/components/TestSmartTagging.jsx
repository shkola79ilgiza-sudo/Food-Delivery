import React, { useState } from 'react';
import SmartTagSelector from './SmartTagSelector';

const TestSmartTagging = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentDish, setCurrentDish] = useState('keto');

  // Тестовые блюда с разными характеристиками
  const testDishes = {
    keto: {
      id: 'test-keto',
      name: 'Кето-блюдо: Стейк с авокадо',
      calories: 650,
      protein: 45,
      carbs: 8,
      fat: 50,
      fiber: 6,
      sugar: 2,
      sodium: 100,
      glycemicIndex: 15,
      ingredients: 'говядина 200г, авокадо 100г, масло 30г, зелень 50г',
      category: 'main_courses'
    },
    highProtein: {
      id: 'test-protein',
      name: 'Высокобелковое: Куриная грудка',
      calories: 400,
      protein: 60,
      carbs: 20,
      fat: 10,
      fiber: 3,
      sugar: 1,
      sodium: 120,
      glycemicIndex: 35,
      ingredients: 'курица 250г, рис 80г, овощи 100г',
      category: 'main_courses'
    },
    diabetic: {
      id: 'test-diabetic',
      name: 'Для диабетиков: Овощной салат',
      calories: 180,
      protein: 8,
      carbs: 15,
      fat: 12,
      fiber: 8,
      sugar: 3,
      sodium: 80,
      glycemicIndex: 25,
      ingredients: 'огурец 100г, помидор 100г, листья салата 50г, оливковое масло 15г',
      category: 'salads'
    },
    lowCalorie: {
      id: 'test-lowcal',
      name: 'Низкокалорийное: Рыба на пару',
      calories: 220,
      protein: 35,
      carbs: 10,
      fat: 6,
      fiber: 2,
      sugar: 1,
      sodium: 90,
      glycemicIndex: 30,
      ingredients: 'треска 200г, брокколи 150г, лимон 20г',
      category: 'main_courses'
    }
  };

  const dish = testDishes[currentDish];

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1000px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🧪 Тест: Smart Tagging
      </h1>

      {/* Выбор тестового блюда */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Выберите тестовое блюдо:</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px'
        }}>
          {Object.keys(testDishes).map(key => (
            <button
              key={key}
              onClick={() => {
                setCurrentDish(key);
                setSelectedTags([]);
              }}
              style={{
                padding: '15px',
                background: currentDish === key 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#f5f5f5',
                color: currentDish === key ? 'white' : '#333',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ marginBottom: '5px' }}>{testDishes[key].name}</div>
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.8,
                display: 'flex',
                gap: '10px',
                marginTop: '8px'
              }}>
                <span>🔥 {testDishes[key].calories} ккал</span>
                <span>🥩 {testDishes[key].protein}г</span>
                <span>🍞 {testDishes[key].carbs}г</span>
                <span>🥑 {testDishes[key].fat}г</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Карточка блюда */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>{dish.name}</h2>

        {/* КБЖУ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
              {dish.calories}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Калории</div>
          </div>
          <div style={{
            padding: '15px',
            background: '#f3e5f5',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0' }}>
              {dish.protein}г
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Белки</div>
          </div>
          <div style={{
            padding: '15px',
            background: '#fff3e0',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
              {dish.carbs}г
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Углеводы</div>
          </div>
          <div style={{
            padding: '15px',
            background: '#e8f5e9',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
              {dish.fat}г
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Жиры</div>
          </div>
        </div>

        {/* Дополнительные данные */}
        <div style={{
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            <strong>Ингредиенты:</strong> {dish.ingredients}
          </div>
          <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
            <span><strong>Клетчатка:</strong> {dish.fiber}г</span>
            <span><strong>Сахар:</strong> {dish.sugar}г</span>
            <span><strong>Натрий:</strong> {dish.sodium}мг</span>
            <span><strong>ГИ:</strong> {dish.glycemicIndex}</span>
          </div>
        </div>

        {/* Smart Tagging */}
        <SmartTagSelector
          dish={dish}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />

        {/* Выбранные теги */}
        {selectedTags.length > 0 && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: '#e8f5e9',
            borderRadius: '10px',
            border: '2px solid #4caf50'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#2d5016' }}>
              ✅ Выбранные теги ({selectedTags.length}):
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {selectedTags.map(tagId => (
                <span
                  key={tagId}
                  style={{
                    padding: '6px 12px',
                    background: '#4caf50',
                    color: 'white',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {tagId}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Инструкция */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>📖 Как тестировать:</h3>
        <ol style={{ lineHeight: '2', color: '#555' }}>
          <li><strong>Выберите тестовое блюдо</strong> из списка выше</li>
          <li><strong>AI автоматически анализирует</strong> блюдо и предлагает теги</li>
          <li><strong>Посмотрите на предложенные теги:</strong>
            <ul>
              <li>🏷️ Название тега с эмодзи</li>
              <li>📊 Процент уверенности (зеленый >85%, желтый >70%)</li>
              <li>💡 Причина выбора тега</li>
            </ul>
          </li>
          <li><strong>Нажмите на тег</strong> чтобы выбрать/отменить его</li>
          <li><strong>Выбранные теги</strong> отображаются внизу</li>
          <li><strong>Попробуйте разные блюда</strong> и сравните результаты:
            <ul>
              <li>Кето-блюдо → "🥓 Кето", "💪 Богато белком"</li>
              <li>Высокобелковое → "💪 Богато белком", "💪📈 Для набора массы"</li>
              <li>Для диабетиков → "🩺 Для диабетиков", "🍬🚫 Низкое содержание сахара"</li>
              <li>Низкокалорийное → "📉 Низкокалорийное", "⚖️📉 Для похудения"</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TestSmartTagging;

