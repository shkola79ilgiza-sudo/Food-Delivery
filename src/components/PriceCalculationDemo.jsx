import React, { useState } from 'react';

const PriceCalculationDemo = () => {
  const [demoIngredients, setDemoIngredients] = useState('курица 200г, картофель 300г, морковь 100г, лук 50г, масло 20г');
  const [cookingMethod, setCookingMethod] = useState('тушение');
  const [category, setCategory] = useState('горячие блюда');

  // База цен ингредиентов (из advancedPricingAnalyzer.js)
  const ingredientCosts = {
    'курица': 280,      // за 100г
    'картофель': 40,    // за 100г
    'морковь': 30,      // за 100г
    'лук': 25,          // за 100г
    'масло': 200        // за 100г (сливочное)
  };

  // Коэффициенты сложности
  const complexityFactors = {
    'сырой': 1.0,
    'варка': 1.1,
    'жарка': 1.3,
    'запекание': 1.4,
    'тушение': 1.5,
    'гриль': 1.6,
    'фритюр': 1.7
  };

  // Рыночные множители
  const marketMultipliers = {
    'budget': 1.0,
    'mid-range': 1.5,
    'premium': 2.5,
    'fine-dining': 4.0
  };

  // Сезонные факторы (зима)
  const seasonalFactors = {
    'супы': 1.2,
    'горячие блюда': 1.15,
    'салаты': 0.8,
    'холодные закуски': 0.7
  };

  const calculatePrice = () => {
    // 1. Парсинг ингредиентов
    const ingredients = demoIngredients.split(',').map(ing => {
      const match = ing.trim().match(/(\d+(?:\.\d+)?)\s*(г|кг|мл|л|шт)?\s*(.+)/);
      if (match) {
        let quantity = parseFloat(match[1]);
        const unit = match[2] || 'г';
        const name = match[3].trim();
        
        // Конвертация в граммы
        if (unit === 'кг') quantity *= 1000;
        if (unit === 'л') quantity *= 1000;
        if (unit === 'шт') quantity *= 50;
        
        return { name, quantity, unit };
      }
      return { name: ing.trim(), quantity: 100, unit: 'г' };
    });

    // 2. Расчет стоимости ингредиентов
    let totalCost = 0;
    const breakdown = [];
    
    ingredients.forEach(ingredient => {
      const costPer100g = ingredientCosts[ingredient.name] || 100;
      const cost = (costPer100g * ingredient.quantity) / 100;
      totalCost += cost;
      
      breakdown.push({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        costPer100g: costPer100g,
        totalCost: cost
      });
    });

    // 3. Применение коэффициентов
    const complexityFactor = complexityFactors[cookingMethod] || 1.0;
    const seasonalFactor = seasonalFactors[category] || 1.0;
    const marketMultiplier = marketMultipliers['mid-range']; // Средний сегмент

    // 4. Расчет базовой цены
    const basePrice = totalCost * complexityFactor * seasonalFactor * marketMultiplier;

    // 5. Расчет рекомендуемых цен
    const suggestedPrices = {
      minimum: Math.round(basePrice * 0.8),      // -20%
      recommended: Math.round(basePrice),         // Базовая цена
      premium: Math.round(basePrice * 1.3),      // +30%
      maximum: Math.round(basePrice * 1.5)       // +50%
    };

    // 6. Расчет прибыльности
    const profitMargin = Math.round(((suggestedPrices.recommended - totalCost) / suggestedPrices.recommended) * 100);

    return {
      totalCost,
      breakdown,
      complexityFactor,
      seasonalFactor,
      marketMultiplier,
      basePrice,
      suggestedPrices,
      profitMargin
    };
  };

  const result = calculatePrice();

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
      borderRadius: '12px',
      margin: '20px 0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2c3e50', 
        marginBottom: '20px',
        fontSize: '24px'
      }}>
        🧮 Детальный расчет цены блюда
      </h2>

      {/* Ввод данных */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Ингредиенты:
          </label>
          <textarea
            value={demoIngredients}
            onChange={(e) => setDemoIngredients(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical'
            }}
            rows="3"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Способ приготовления:
          </label>
          <select
            value={cookingMethod}
            onChange={(e) => setCookingMethod(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="сырой">Сырой (1.0x)</option>
            <option value="варка">Варка (1.1x)</option>
            <option value="жарка">Жарка (1.3x)</option>
            <option value="запекание">Запекание (1.4x)</option>
            <option value="тушение">Тушение (1.5x)</option>
            <option value="гриль">Гриль (1.6x)</option>
            <option value="фритюр">Фритюр (1.7x)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Категория:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="супы">Супы (1.2x)</option>
            <option value="горячие блюда">Горячие блюда (1.15x)</option>
            <option value="салаты">Салаты (0.8x)</option>
            <option value="холодные закуски">Холодные закуски (0.7x)</option>
          </select>
        </div>
      </div>

      {/* Детальный расчет */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Стоимость ингредиентов */}
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            📊 Стоимость ингредиентов
          </h3>
          {result.breakdown.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span>{item.name} ({item.quantity}{item.unit})</span>
              <span style={{ fontWeight: 'bold' }}>
                {item.totalCost.toFixed(0)}₽
              </span>
            </div>
          ))}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: '2px solid #3498db',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#2c3e50'
          }}>
            <span>Итого:</span>
            <span>{result.totalCost.toFixed(0)}₽</span>
          </div>
        </div>

        {/* Коэффициенты */}
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            ⚙️ Коэффициенты расчета
          </h3>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Сложность приготовления:</span>
              <span style={{ fontWeight: 'bold' }}>{result.complexityFactor}x</span>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {cookingMethod} → {result.complexityFactor}x
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Сезонный фактор:</span>
              <span style={{ fontWeight: 'bold' }}>{result.seasonalFactor}x</span>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {category} (зима) → {result.seasonalFactor}x
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Рыночный множитель:</span>
              <span style={{ fontWeight: 'bold' }}>{result.marketMultiplier}x</span>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Средний сегмент → {result.marketMultiplier}x
            </div>
          </div>
          <div style={{
            padding: '10px',
            background: '#ecf0f1',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Общий коэффициент:</span>
              <span>{(result.complexityFactor * result.seasonalFactor * result.marketMultiplier).toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Формула расчета */}
      <div style={{
        padding: '15px',
        background: '#2c3e50',
        color: 'white',
        borderRadius: '8px',
        marginBottom: '20px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ marginBottom: '10px' }}>🧮 Формула расчета:</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <div>Базовая цена = Стоимость ингредиентов × Сложность × Сезонность × Рынок</div>
          <div>Базовая цена = {result.totalCost.toFixed(0)}₽ × {result.complexityFactor} × {result.seasonalFactor} × {result.marketMultiplier}</div>
          <div style={{ color: '#3498db', fontWeight: 'bold' }}>
            Базовая цена = {result.basePrice.toFixed(0)}₽
          </div>
        </div>
      </div>

      {/* Рекомендуемые цены */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>
          💰 Рекомендуемые цены
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px'
        }}>
          <div style={{
            padding: '15px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>Минимальная</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {result.suggestedPrices.minimum}₽
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>-20%</div>
          </div>
          <div style={{
            padding: '15px',
            background: 'rgba(46, 204, 113, 0.3)',
            borderRadius: '8px',
            border: '2px solid #2ecc71'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>Рекомендуемая</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {result.suggestedPrices.recommended}₽
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>Базовая</div>
          </div>
          <div style={{
            padding: '15px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>Премиум</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {result.suggestedPrices.premium}₽
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>+30%</div>
          </div>
          <div style={{
            padding: '15px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>Максимальная</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {result.suggestedPrices.maximum}₽
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>+50%</div>
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          fontSize: '16px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Прибыльность: {result.profitMargin}%</strong>
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            При рекомендуемой цене {result.suggestedPrices.recommended}₽ прибыль составит {result.suggestedPrices.recommended - result.totalCost}₽
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculationDemo;
