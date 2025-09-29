// Продвинутый анализатор ценообразования для блюд
// Учитывает ингредиенты, сложность, рыночные цены, сезонность и прибыльность

export class AdvancedPricingAnalyzer {
  constructor() {
    this.ingredientCosts = this.initializeIngredientCosts();
    this.marketMultipliers = this.initializeMarketMultipliers();
    this.seasonalFactors = this.initializeSeasonalFactors();
    this.complexityFactors = this.initializeComplexityFactors();
    this.restaurantType = 'budget'; // mid-range, premium, budget - ДОМАШНЯЯ КУХНЯ ПО УМОЛЧАНИЮ
  }

  // Стоимость ингредиентов за 100г (в рублях) - РЕАЛИСТИЧНЫЕ ЦЕНЫ ДЛЯ ДОМАШНЕЙ КУХНИ
  initializeIngredientCosts() {
    return {
      // Мясо и птица
      'говядина': 180,      // было 450, стало 180
      'свинина': 150,       // было 380, стало 150
      'баранина': 200,      // было 520, стало 200
      'курица': 120,        // было 280, стало 120
      'индейка': 140,       // было 320, стало 140
      'утка': 200,          // было 480, стало 200
      
      // Рыба и морепродукты
      'лосось': 250,        // было 650, стало 250
      'форель': 220,        // было 580, стало 220
      'треска': 150,        // было 320, стало 150
      'судак': 180,         // было 380, стало 180
      'креветки': 400,      // было 1200, стало 400
      'мидии': 300,         // было 800, стало 300
      'кальмары': 200,      // было 450, стало 200
      'икра': 800,          // было 2500, стало 800
      
      // Молочные продукты
      'сыр пармезан': 400,  // было 1200, стало 400
      'сыр моцарелла': 250, // было 800, стало 250
      'сыр фета': 200,      // было 600, стало 200
      'творог': 80,         // было 180, стало 80
      'сметана': 60,        // было 120, стало 60
      'молоко': 40,         // было 60, стало 40
      'масло сливочное': 100, // было 200, стало 100
      
      // Овощи и зелень
      'помидоры': 60,       // было 150, стало 60
      'огурцы': 50,         // было 120, стало 50
      'картофель': 25,      // было 40, стало 25
      'морковь': 20,        // было 30, стало 20
      'лук': 15,            // было 25, стало 15
      'чеснок': 40,         // было 80, стало 40
      'перец болгарский': 80, // было 180, стало 80
      'баклажаны': 80,      // было 200, стало 80
      'капуста': 20,        // было 35, стало 20
      'салат': 80,          // было 200, стало 80
      'руккола': 120,       // было 300, стало 120
      'шпинат': 100,        // было 250, стало 100
      
      // Фрукты и ягоды
      'яблоки': 40,         // было 80, стало 40
      'бананы': 60,         // было 120, стало 60
      'апельсины': 50,      // было 100, стало 50
      'лимон': 80,          // было 150, стало 80
      'клубника': 200,      // было 400, стало 200
      'малина': 250,        // было 500, стало 250
      'черника': 300,       // было 600, стало 300
      
      // Крупы и макароны
      'рис': 30,            // было 60, стало 30
      'гречка': 40,         // было 80, стало 40
      'макароны': 25,       // было 50, стало 25
      'хлеб': 20,           // было 40, стало 20
      'мука': 15,           // было 30, стало 15
      
      // Масла и жиры
      'масло оливковое': 200, // было 400, стало 200
      'масло подсолнечное': 40, // было 80, стало 40
      'масло кокосовое': 300, // было 600, стало 300
      
      // Специи и приправы
      'соль': 3,            // было 5, стало 3
      'перец': 80,          // было 200, стало 80
      'паприка': 120,       // было 300, стало 120
      'орегано': 200,       // было 800, стало 200
      'базилик': 150,       // было 600, стало 150
      'тимьян': 180,        // было 700, стало 180
      'розмарин': 200,      // было 800, стало 200
      
      // Орехи и семена
      'грецкие орехи': 200, // было 800, стало 200
      'миндаль': 250,       // было 1000, стало 250
      'кешью': 300,         // было 1200, стало 300
      'семена подсолнечника': 80, // было 200, стало 80
      'семена тыквы': 120,  // было 400, стало 120
      
      // Другие
      'яйца': 60,           // было 120, стало 60 (за 10 шт)
      'сахар': 25,          // было 50, стало 25
      'мед': 150,           // было 300, стало 150
      'уксус': 50,          // было 100, стало 50
      'соус соевый': 80,    // было 200, стало 80
      'томатная паста': 40, // было 80, стало 40
      'майонез': 60         // было 120, стало 60
    };
  }

  // Рыночные множители по типам заведений - АДАПТИРОВАНЫ ДЛЯ ДОМАШНЕЙ КУХНИ
  initializeMarketMultipliers() {
    return {
      'budget': {
        baseMultiplier: 1.2,    // было 1.0, стало 1.2
        maxPrice: 200,          // было 300, стало 200
        description: 'Бюджетная домашняя кухня'
      },
      'mid-range': {
        baseMultiplier: 1.8,    // было 1.5, стало 1.8
        maxPrice: 400,          // было 800, стало 400
        description: 'Средняя домашняя кухня'
      },
      'premium': {
        baseMultiplier: 2.2,    // было 2.5, стало 2.2
        maxPrice: 600,          // было 2000, стало 600
        description: 'Премиум домашняя кухня'
      },
      'fine-dining': {
        baseMultiplier: 2.8,    // было 4.0, стало 2.8
        maxPrice: 800,          // было 5000, стало 800
        description: 'Высокая домашняя кухня'
      }
    };
  }

  // Сезонные факторы
  initializeSeasonalFactors() {
    const currentMonth = new Date().getMonth() + 1;
    return {
      // Зима (декабрь-февраль)
      winter: {
        'супы': 1.2,
        'горячие блюда': 1.15,
        'салаты': 0.8,
        'холодные закуски': 0.7
      },
      // Весна (март-май)
      spring: {
        'салаты': 1.3,
        'овощные блюда': 1.2,
        'супы': 0.9,
        'тяжелые блюда': 0.8
      },
      // Лето (июнь-август)
      summer: {
        'салаты': 1.4,
        'холодные супы': 1.3,
        'свежие овощи': 1.2,
        'горячие блюда': 0.7
      },
      // Осень (сентябрь-ноябрь)
      autumn: {
        'супы': 1.1,
        'тушеные блюда': 1.2,
        'салаты': 0.9,
        'свежие овощи': 0.8
      }
    };
  }

  // Факторы сложности приготовления
  initializeComplexityFactors() {
    return {
      'сырой': 1.0,        // Салаты, холодные закуски
      'варка': 1.1,        // Простая варка
      'жарка': 1.3,        // Жарка на сковороде
      'запекание': 1.4,    // Запекание в духовке
      'тушение': 1.5,      // Тушение
      'гриль': 1.6,        // Гриль, барбекю
      'фритюр': 1.7,       // Фритюр
      'су-вид': 2.0,       // Су-вид
      'молекулярная': 2.5  // Молекулярная кухня
    };
  }

  // Основная функция анализа цены
  analyzePricing(dishName, ingredients, cookingMethod, category) {
    const analysis = {
      baseCost: 0,
      ingredientBreakdown: [],
      complexityFactor: 1.0,
      seasonalFactor: 1.0,
      marketMultiplier: 1.0,
      suggestedPrices: {},
      profitMargin: 0,
      recommendations: []
    };

    // 1. Расчет базовой стоимости ингредиентов
    analysis.baseCost = this.calculateIngredientCosts(ingredients, analysis.ingredientBreakdown);
    
    // 2. Фактор сложности приготовления
    analysis.complexityFactor = this.complexityFactors[cookingMethod] || 1.0;
    
    // 3. Сезонный фактор
    analysis.seasonalFactor = this.getSeasonalFactor(category);
    
    // 4. Рыночный множитель
    const marketData = this.marketMultipliers[this.restaurantType];
    analysis.marketMultiplier = marketData.baseMultiplier;
    
    // 5. Расчет рекомендуемых цен
    analysis.suggestedPrices = this.calculateSuggestedPrices(analysis);
    
    // 6. Анализ прибыльности
    analysis.profitMargin = this.calculateProfitMargin(analysis);
    
    // 7. Рекомендации
    analysis.recommendations = this.generateRecommendations(analysis, dishName, ingredients);

    return analysis;
  }

  // Расчет стоимости ингредиентов
  calculateIngredientCosts(ingredients, breakdown) {
    let totalCost = 0;
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    
    ingredientList.forEach(ingredient => {
      const parsed = this.parseIngredient(ingredient);
      const costPer100g = this.findIngredientCost(parsed.name);
      
      if (costPer100g > 0) {
        const cost = (costPer100g * parsed.quantity) / 100;
        totalCost += cost;
        
        breakdown.push({
          name: parsed.name,
          quantity: parsed.quantity,
          unit: parsed.unit,
          costPer100g: costPer100g,
          totalCost: cost
        });
      }
    });

    return totalCost;
  }

  // Парсинг ингредиента (количество + название)
  parseIngredient(ingredient) {
    const match = ingredient.match(/(\d+(?:\.\d+)?)\s*(г|кг|мл|л|шт|штук)?\s*(.+)/);
    if (match) {
      let quantity = parseFloat(match[1]);
      const unit = match[2] || 'г';
      const name = match[3].trim();
      
      // Конвертация в граммы
      if (unit === 'кг') quantity *= 1000;
      if (unit === 'л') quantity *= 1000;
      if (unit === 'шт' || unit === 'штук') quantity *= 50; // Примерный вес одной штуки
      
      return { name, quantity, unit };
    }
    
    // Если не удалось распарсить, предполагаем 100г
    return { name: ingredient, quantity: 100, unit: 'г' };
  }

  // Поиск стоимости ингредиента
  findIngredientCost(ingredientName) {
    const name = ingredientName.toLowerCase();
    
    // Точное совпадение
    if (this.ingredientCosts[name]) {
      return this.ingredientCosts[name];
    }
    
    // Поиск по частичному совпадению
    for (const [key, cost] of Object.entries(this.ingredientCosts)) {
      if (name.includes(key) || key.includes(name)) {
        return cost;
      }
    }
    
    // Если не найден, используем среднюю стоимость
    return 100; // Средняя стоимость неизвестного ингредиента
  }

  // Получение сезонного фактора
  getSeasonalFactor(category) {
    const currentMonth = new Date().getMonth() + 1;
    let season = 'winter';
    
    if (currentMonth >= 3 && currentMonth <= 5) season = 'spring';
    else if (currentMonth >= 6 && currentMonth <= 8) season = 'summer';
    else if (currentMonth >= 9 && currentMonth <= 11) season = 'autumn';
    
    const seasonalData = this.seasonalFactors[season];
    return seasonalData[category] || 1.0;
  }

  // Расчет рекомендуемых цен с проверкой разумности
  calculateSuggestedPrices(analysis) {
    const basePrice = analysis.baseCost * analysis.complexityFactor * analysis.seasonalFactor * analysis.marketMultiplier;
    
    // Получаем максимальную цену для типа заведения
    const maxPrice = this.marketMultipliers[this.restaurantType].maxPrice;
    
    // Ограничиваем цены разумными пределами для домашней кухни
    const limitedBasePrice = Math.min(basePrice, maxPrice);
    
    const prices = {
      minimum: Math.round(limitedBasePrice * 0.8),      // Минимальная цена (20% скидка)
      recommended: Math.round(limitedBasePrice),        // Рекомендуемая цена
      premium: Math.round(limitedBasePrice * 1.3),      // Премиум цена (+30%)
      maximum: Math.round(limitedBasePrice * 1.5)       // Максимальная цена (+50%)
    };
    
    // Дополнительная проверка: максимальная цена не должна превышать 800₽ для домашней кухни
    const absoluteMaxPrice = 800;
    if (prices.maximum > absoluteMaxPrice) {
      const scaleFactor = absoluteMaxPrice / prices.maximum;
      prices.minimum = Math.round(prices.minimum * scaleFactor);
      prices.recommended = Math.round(prices.recommended * scaleFactor);
      prices.premium = Math.round(prices.premium * scaleFactor);
      prices.maximum = absoluteMaxPrice;
    }
    
    return prices;
  }

  // Расчет прибыльности
  calculateProfitMargin(analysis) {
    const recommendedPrice = analysis.suggestedPrices.recommended;
    const cost = analysis.baseCost;
    const profit = recommendedPrice - cost;
    return Math.round((profit / recommendedPrice) * 100);
  }

  // Генерация рекомендаций
  generateRecommendations(analysis, dishName, ingredients) {
    const recommendations = [];
    
    // Анализ прибыльности
    if (analysis.profitMargin < 30) {
      recommendations.push({
        type: 'warning',
        message: `Низкая прибыльность (${analysis.profitMargin}%). Рассмотрите увеличение цены или оптимизацию ингредиентов.`
      });
    } else if (analysis.profitMargin > 70) {
      recommendations.push({
        type: 'success',
        message: `Отличная прибыльность (${analysis.profitMargin}%). Цена оптимальна.`
      });
    }
    
    // Анализ дорогих ингредиентов
    const expensiveIngredients = analysis.ingredientBreakdown
      .filter(item => item.costPer100g > 500)
      .sort((a, b) => b.costPer100g - a.costPer100g);
    
    if (expensiveIngredients.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Дорогие ингредиенты: ${expensiveIngredients.slice(0, 3).map(i => i.name).join(', ')}. Учитывайте это при ценообразовании.`
      });
    }
    
    // Сезонные рекомендации
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 6 && currentMonth <= 8) {
      recommendations.push({
        type: 'info',
        message: 'Летний сезон - отличное время для салатов и холодных блюд. Цены можно увеличить на 20-30%.'
      });
    }
    
    return recommendations;
  }

  // Установка типа заведения
  setRestaurantType(type) {
    if (this.marketMultipliers[type]) {
      this.restaurantType = type;
    }
  }

  // Получение статистики по ингредиентам
  getIngredientStatistics() {
    const stats = {
      totalIngredients: Object.keys(this.ingredientCosts).length,
      averageCost: 0,
      mostExpensive: [],
      cheapest: []
    };
    
    const costs = Object.values(this.ingredientCosts);
    stats.averageCost = Math.round(costs.reduce((a, b) => a + b, 0) / costs.length);
    
    // Самые дорогие ингредиенты
    stats.mostExpensive = Object.entries(this.ingredientCosts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, cost]) => ({ name, cost }));
    
    // Самые дешевые ингредиенты
    stats.cheapest = Object.entries(this.ingredientCosts)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([name, cost]) => ({ name, cost }));
    
    return stats;
  }
}

// Экспорт экземпляра для использования
export const pricingAnalyzer = new AdvancedPricingAnalyzer();
