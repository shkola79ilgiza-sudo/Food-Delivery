// Улучшенный калькулятор ценообразования с полной формулой
// Финальная цена = Ингредиенты + Упаковка + Энергия + Труд повара + Комиссия платформы + Доставка

export class EnhancedPricingCalculator {
  constructor() {
    this.packagingCosts = this.initializePackagingCosts();
    this.platformCommissions = this.initializePlatformCommissions();
    this.chefLaborRates = this.initializeChefLaborRates();
    this.energyCosts = this.initializeEnergyCosts();
    this.deliveryCosts = this.initializeDeliveryCosts();
    this.ingredientCosts = this.initializeIngredientCosts();
  }

  // Стоимость упаковки
  initializePackagingCosts() {
    return {
      // Базовые контейнеры
      'контейнер пластиковый': 15,
      'контейнер картонный': 8,
      'контейнер биоразлагаемый': 25,
      'контейнер стеклянный': 30,
      
      // Дополнительная упаковка
      'пакет бумажный': 3,
      'пакет пластиковый': 2,
      'пакет крафтовый': 5,
      'салфетки': 2,
      'приборы одноразовые': 8,
      'приборы деревянные': 12,
      'приборы металлические': 25,
      
      // Специальная упаковка
      'упаковка премиум': 50,
      'упаковка подарочная': 80,
      'термопакет': 20,
      'холодильный пакет': 15,
      
      // Брендинг
      'наклейка с логотипом': 5,
      'визитка': 3,
      'открытка': 8
    };
  }

  // Комиссии платформы
  initializePlatformCommissions() {
    return {
      'budget': {
        commission: 0.10, // 10%
        description: 'Бюджетный сегмент'
      },
      'mid-range': {
        commission: 0.15, // 15%
        description: 'Средний сегмент'
      },
      'premium': {
        commission: 0.20, // 20%
        description: 'Премиум сегмент'
      },
      'fine-dining': {
        commission: 0.25, // 25%
        description: 'Высокая кухня'
      }
    };
  }

  // Стоимость труда повара (РЕАЛИСТИЧНЫЕ СТАВКИ ДЛЯ ДОМАШНЕЙ КУХНИ)
  initializeChefLaborRates() {
    return {
      'новичок': {
        hourlyRate: 100, // было 200, стало 100 руб/час
        complexityMultiplier: 1.0,
        description: 'Начинающий повар'
      },
      'опытный': {
        hourlyRate: 150, // было 400, стало 150 руб/час
        complexityMultiplier: 1.1,
        description: 'Опытный повар'
      },
      'профессионал': {
        hourlyRate: 200, // было 600, стало 200 руб/час
        complexityMultiplier: 1.2,
        description: 'Профессиональный повар'
      },
      'шеф-повар': {
        hourlyRate: 300, // было 1000, стало 300 руб/час
        complexityMultiplier: 1.3,
        description: 'Шеф-повар'
      }
    };
  }

  // Энергозатраты
  initializeEnergyCosts() {
    return {
      'газ': {
        costPerHour: 15, // руб/час
        efficiency: 0.8
      },
      'электричество': {
        costPerHour: 25, // руб/час
        efficiency: 0.9
      },
      'индукция': {
        costPerHour: 20, // руб/час
        efficiency: 0.95
      },
      'микроволновка': {
        costPerHour: 10, // руб/час
        efficiency: 0.7
      }
    };
  }

  // Стоимость доставки
  initializeDeliveryCosts() {
    return {
      'самовывоз': 0,
      'доставка_близко': 50, // до 2 км
      'доставка_средне': 100, // 2-5 км
      'доставка_далеко': 150, // 5+ км
      'доставка_срочная': 200, // в течение часа
      'доставка_ночная': 300, // ночью
      'доставка_премиум': 500 // с курьером
    };
  }

  // Стоимость ингредиентов (РЕАЛИСТИЧНЫЕ ЦЕНЫ ДЛЯ ДОМАШНЕЙ КУХНИ)
  initializeIngredientCosts() {
    return {
      'говядина': 180,      // было 450, стало 180
      'свинина': 150,       // было 380, стало 150
      'курица': 120,        // было 280, стало 120
      'индейка': 140,       // было 320, стало 140
      'лосось': 250,        // было 650, стало 250
      'треска': 150,        // было 320, стало 150
      'креветки': 300,      // было 1200, стало 300
      'помидоры': 60,       // было 150, стало 60
      'огурцы': 50,         // было 120, стало 50
      'картофель': 25,      // было 40, стало 25
      'морковь': 20,        // было 30, стало 20
      'лук': 15,            // было 25, стало 15
      'чеснок': 40,         // было 80, стало 40
      'масло сливочное': 120, // было 200, стало 120
      'масло оливковое': 200, // было 400, стало 200
      'сыр пармезан': 400,  // было 1200, стало 400
      'сыр моцарелла': 250, // было 800, стало 250
      'творог': 80,         // было 180, стало 80
      'сметана': 60,        // было 120, стало 60
      'молоко': 40,         // было 60, стало 40
      'рис': 30,            // было 60, стало 30
      'гречка': 35,         // было 80, стало 35
      'макароны': 25        // было 50, стало 25
    };
  }

  // Основная функция расчета полной стоимости
  calculateFullPrice(dishData) {
    const {
      ingredients = '',
      cookingMethod = 'варка',
      category = 'горячие блюда',
      chefLevel = 'опытный',
      energyType = 'газ',
      packagingType = 'контейнер пластиковый',
      deliveryType = 'доставка_средне',
      platformType = 'mid-range',
      preparationTime = 30, // минуты
      servingSize = 1 // количество порций
    } = dishData;

    const calculation = {
      // 1. Стоимость ингредиентов
      ingredients: this.calculateIngredientCosts(ingredients),
      
      // 2. Стоимость упаковки
      packaging: this.calculatePackagingCosts(packagingType, servingSize),
      
      // 3. Энергозатраты
      energy: this.calculateEnergyCosts(cookingMethod, preparationTime, energyType),
      
      // 4. Стоимость труда повара
      labor: this.calculateLaborCosts(chefLevel, preparationTime, cookingMethod),
      
      // 5. Стоимость доставки
      delivery: this.calculateDeliveryCosts(deliveryType),
      
      // 6. Комиссия платформы
      platformCommission: 0, // Будет рассчитана после определения базовой цены
      
      // 7. Итоговые расчеты
      subtotal: 0,
      totalCost: 0,
      recommendedPrice: 0,
      profitMargin: 0
    };

    // Расчет промежуточной суммы (без комиссии)
    calculation.subtotal = calculation.ingredients.total + 
                          calculation.packaging.total + 
                          calculation.energy.total + 
                          calculation.labor.total + 
                          calculation.delivery.total;

    // Расчет комиссии платформы
    const commissionRate = this.platformCommissions[platformType].commission;
    calculation.platformCommission = {
      rate: commissionRate,
      amount: calculation.subtotal * commissionRate
    };

    // Итоговая себестоимость
    calculation.totalCost = calculation.subtotal + calculation.platformCommission.amount;

    // Рекомендуемая цена (с учетом желаемой маржи для домашней кухни)
    const targetMargin = 0.25; // 25% маржа (было 35%)
    calculation.recommendedPrice = Math.round(calculation.totalCost / (1 - targetMargin));

    // Фактическая маржа
    calculation.profitMargin = Math.round(((calculation.recommendedPrice - calculation.totalCost) / calculation.recommendedPrice) * 100);

    return calculation;
  }

  // Расчет стоимости ингредиентов
  calculateIngredientCosts(ingredients) {
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    let totalCost = 0;
    const breakdown = [];

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

    return { total: totalCost, breakdown };
  }

  // Расчет стоимости упаковки
  calculatePackagingCosts(packagingType, servingSize) {
    const baseCost = this.packagingCosts[packagingType] || 15;
    const totalCost = baseCost * servingSize;
    
    return {
      type: packagingType,
      costPerUnit: baseCost,
      quantity: servingSize,
      total: totalCost
    };
  }

  // Расчет энергозатрат
  calculateEnergyCosts(cookingMethod, preparationTime, energyType) {
    const energyData = this.energyCosts[energyType] || this.energyCosts['газ'];
    const hours = preparationTime / 60;
    const baseCost = energyData.costPerHour * hours;
    
    // Коэффициент сложности приготовления
    const complexityMultipliers = {
      'сырой': 0.1,
      'варка': 0.8,
      'жарка': 1.2,
      'запекание': 1.5,
      'тушение': 1.3,
      'гриль': 1.4,
      'фритюр': 1.6
    };
    
    const multiplier = complexityMultipliers[cookingMethod] || 1.0;
    const totalCost = baseCost * multiplier * energyData.efficiency;

    return {
      type: energyType,
      hours: hours,
      costPerHour: energyData.costPerHour,
      complexityMultiplier: multiplier,
      efficiency: energyData.efficiency,
      total: totalCost
    };
  }

  // Расчет стоимости труда повара
  calculateLaborCosts(chefLevel, preparationTime, cookingMethod) {
    const laborData = this.chefLaborRates[chefLevel] || this.chefLaborRates['опытный'];
    const hours = preparationTime / 60;
    const baseCost = laborData.hourlyRate * hours;
    
    // Дополнительный коэффициент за сложность
    const complexityMultiplier = laborData.complexityMultiplier;
    const totalCost = baseCost * complexityMultiplier;

    return {
      level: chefLevel,
      hourlyRate: laborData.hourlyRate,
      hours: hours,
      complexityMultiplier: complexityMultiplier,
      total: totalCost
    };
  }

  // Расчет стоимости доставки
  calculateDeliveryCosts(deliveryType) {
    const cost = this.deliveryCosts[deliveryType] || 0;
    
    return {
      type: deliveryType,
      cost: cost,
      total: cost
    };
  }

  // Парсинг ингредиента
  parseIngredient(ingredient) {
    const match = ingredient.match(/(\d+(?:\.\d+)?)\s*(г|кг|мл|л|шт|штук)?\s*(.+)/);
    if (match) {
      let quantity = parseFloat(match[1]);
      const unit = match[2] || 'г';
      const name = match[3].trim();
      
      // Конвертация в граммы
      if (unit === 'кг') quantity *= 1000;
      if (unit === 'л') quantity *= 1000;
      if (unit === 'шт' || unit === 'штук') quantity *= 50;
      
      return { name, quantity, unit };
    }
    
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
    
    return 100; // Средняя стоимость неизвестного ингредиента
  }

  // Генерация рекомендаций по ценообразованию
  generatePricingRecommendations(calculation, marketData = {}) {
    const recommendations = [];
    
    // Анализ прибыльности
    if (calculation.profitMargin < 25) {
      recommendations.push({
        type: 'warning',
        message: `Низкая маржа (${calculation.profitMargin}%). Рекомендуем увеличить цену или оптимизировать затраты.`
      });
    } else if (calculation.profitMargin > 60) {
      recommendations.push({
        type: 'success',
        message: `Отличная маржа (${calculation.profitMargin}%). Цена оптимальна.`
      });
    }

    // Анализ дорогих компонентов
    const expensiveComponents = [];
    if (calculation.ingredients.total > calculation.subtotal * 0.6) {
      expensiveComponents.push('ингредиенты');
    }
    if (calculation.labor.total > calculation.subtotal * 0.3) {
      expensiveComponents.push('труд повара');
    }
    if (calculation.packaging.total > calculation.subtotal * 0.1) {
      expensiveComponents.push('упаковка');
    }

    if (expensiveComponents.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Основные затраты: ${expensiveComponents.join(', ')}. Учитывайте это при ценообразовании.`
      });
    }

    // Рыночные рекомендации
    if (marketData.averagePrice) {
      const priceDifference = ((calculation.recommendedPrice - marketData.averagePrice) / marketData.averagePrice) * 100;
      
      if (priceDifference > 20) {
        recommendations.push({
          type: 'warning',
          message: `Цена на ${priceDifference.toFixed(0)}% выше рынка. Рассмотрите снижение для конкуренции.`
        });
      } else if (priceDifference < -20) {
        recommendations.push({
          type: 'info',
          message: `Цена на ${Math.abs(priceDifference).toFixed(0)}% ниже рынка. Возможно, стоит поднять цену.`
        });
      }
    }

    return recommendations;
  }
}

// Экспорт экземпляра
export const enhancedPricingCalculator = new EnhancedPricingCalculator();
