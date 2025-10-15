import React from 'react';
import ShareNutritionButton from './ShareNutritionButton';

const TestShareNutrition = () => {
  // Тестовое блюдо
  const testDish = {
    id: 'test-1',
    name: 'Куриная грудка с рисом',
    description: 'Полезное и вкусное блюдо',
    calories: 450,
    protein: 40,
    carbs: 35,
    fat: 15,
    fiber: 3,
    sugar: 2,
    sodium: 120,
    weight: 350,
    ingredients: 'курица 200г, рис 100г, масло 20г, овощи 150г',
    category: 'main_courses'
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🧪 Тест: Поделиться КБЖУ
      </h1>

      {/* Карточка блюда */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>{testDish.name}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>{testDish.description}</p>

        {/* КБЖУ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
              {testDish.calories}
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
              {testDish.protein}г
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
              {testDish.carbs}г
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
              {testDish.fat}г
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Жиры</div>
          </div>
        </div>

        {/* Кнопка "Поделиться КБЖУ" */}
        <div style={{ textAlign: 'center' }}>
          <ShareNutritionButton dish={testDish} />
        </div>
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
          <li>Нажмите кнопку "📊 Поделиться КБЖУ"</li>
          <li>Выберите приложение (MyFitnessPal, YAZIO, и т.д.)</li>
          <li>Посмотрите на сгенерированный QR-код</li>
          <li>Попробуйте:
            <ul>
              <li>⬇️ Скачать QR-код</li>
              <li>💾 Скачать JSON</li>
              <li>📋 Копировать JSON в буфер</li>
            </ul>
          </li>
          <li>Откройте скачанный JSON и проверьте данные</li>
        </ol>
      </div>
    </div>
  );
};

export default TestShareNutrition;

