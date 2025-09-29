// Улучшенные моковые данные с региональными различиями и сезонными колебаниями
// Более реалистичные цены на основе реальных данных

export class EnhancedMockData {
  constructor() {
    this.basePrices = this.initializeBasePrices();
    this.regionalMultipliers = this.initializeRegionalMultipliers();
    this.seasonalFactors = this.initializeSeasonalFactors();
    this.marketTrends = this.initializeMarketTrends();
  }

  // Базовые цены (средние по России)
  initializeBasePrices() {
    return {
      // Мясо и птица
      'говядина': { base: 180, category: 'meat', seasonality: 'high' },
      'свинина': { base: 150, category: 'meat', seasonality: 'medium' },
      'баранина': { base: 200, category: 'meat', seasonality: 'high' },
      'курица': { base: 120, category: 'poultry', seasonality: 'low' },
      'индейка': { base: 140, category: 'poultry', seasonality: 'low' },
      'утка': { base: 200, category: 'poultry', seasonality: 'high' },
      
      // Рыба и морепродукты
      'лосось': { base: 250, category: 'fish', seasonality: 'high' },
      'треска': { base: 150, category: 'fish', seasonality: 'medium' },
      'горбуша': { base: 120, category: 'fish', seasonality: 'high' },
      'креветки': { base: 300, category: 'seafood', seasonality: 'high' },
      'кальмары': { base: 180, category: 'seafood', seasonality: 'medium' },
      
      // Овощи
      'помидоры': { base: 60, category: 'vegetables', seasonality: 'very_high' },
      'огурцы': { base: 50, category: 'vegetables', seasonality: 'very_high' },
      'картофель': { base: 25, category: 'vegetables', seasonality: 'medium' },
      'лук': { base: 15, category: 'vegetables', seasonality: 'low' },
      'морковь': { base: 20, category: 'vegetables', seasonality: 'low' },
      'капуста': { base: 18, category: 'vegetables', seasonality: 'low' },
      'свекла': { base: 22, category: 'vegetables', seasonality: 'low' },
      'чеснок': { base: 40, category: 'vegetables', seasonality: 'low' },
      
      // Фрукты
      'яблоки': { base: 45, category: 'fruits', seasonality: 'high' },
      'бананы': { base: 60, category: 'fruits', seasonality: 'low' },
      'апельсины': { base: 70, category: 'fruits', seasonality: 'high' },
      'лимоны': { base: 80, category: 'fruits', seasonality: 'medium' },
      
      // Молочные продукты
      'молоко': { base: 40, category: 'dairy', seasonality: 'low' },
      'сыр': { base: 200, category: 'dairy', seasonality: 'low' },
      'творог': { base: 80, category: 'dairy', seasonality: 'low' },
      'сметана': { base: 60, category: 'dairy', seasonality: 'low' },
      'масло': { base: 120, category: 'dairy', seasonality: 'low' },
      
      // Крупы и макароны
      'рис': { base: 30, category: 'grains', seasonality: 'low' },
      'макароны': { base: 25, category: 'grains', seasonality: 'low' },
      'гречка': { base: 35, category: 'grains', seasonality: 'low' },
      'овсянка': { base: 28, category: 'grains', seasonality: 'low' },
      
      // Хлеб и выпечка
      'хлеб': { base: 20, category: 'bakery', seasonality: 'low' },
      'мука': { base: 35, category: 'bakery', seasonality: 'low' },
      
      // Специи и приправы
      'соль': { base: 8, category: 'spices', seasonality: 'none' },
      'перец': { base: 15, category: 'spices', seasonality: 'none' },
      'лавровый лист': { base: 12, category: 'spices', seasonality: 'none' },
      'томатная паста': { base: 40, category: 'spices', seasonality: 'low' },
      'майонез': { base: 60, category: 'spices', seasonality: 'low' }
    };
  }

  // Региональные множители цен
  initializeRegionalMultipliers() {
    return {
      'moscow': { 
        multiplier: 1.3, 
        description: 'Москва - самые высокие цены',
        factors: { transport: 1.2, rent: 1.4, demand: 1.1 }
      },
      'spb': { 
        multiplier: 1.2, 
        description: 'СПб - высокие цены',
        factors: { transport: 1.1, rent: 1.3, demand: 1.0 }
      },
      'ekaterinburg': { 
        multiplier: 1.0, 
        description: 'Екатеринбург - средние цены',
        factors: { transport: 1.0, rent: 1.0, demand: 1.0 }
      },
      'novosibirsk': { 
        multiplier: 0.9, 
        description: 'Новосибирск - ниже среднего',
        factors: { transport: 0.9, rent: 0.8, demand: 0.9 }
      },
      'krasnodar': { 
        multiplier: 0.95, 
        description: 'Краснодар - умеренные цены',
        factors: { transport: 0.9, rent: 0.9, demand: 1.0 }
      },
      'volgograd': { 
        multiplier: 0.85, 
        description: 'Волгоград - низкие цены',
        factors: { transport: 0.8, rent: 0.7, demand: 0.8 }
      },
      'tatarstan': { 
        multiplier: 0.9, 
        description: 'Татарстан - умеренные цены',
        factors: { transport: 0.85, rent: 0.8, demand: 0.9 }
      },
      'bashkortostan': { 
        multiplier: 0.85, 
        description: 'Башкортостан - низкие цены',
        factors: { transport: 0.8, rent: 0.75, demand: 0.85 }
      },
      'chelyabinsk': { 
        multiplier: 0.88, 
        description: 'Челябинск - умеренные цены',
        factors: { transport: 0.82, rent: 0.78, demand: 0.88 }
      },
      'omsk': { 
        multiplier: 0.87, 
        description: 'Омск - умеренные цены',
        factors: { transport: 0.83, rent: 0.77, demand: 0.87 }
      },
      'samara': { 
        multiplier: 0.92, 
        description: 'Самара - умеренные цены',
        factors: { transport: 0.88, rent: 0.85, demand: 0.92 }
      },
      'rostov': { 
        multiplier: 0.89, 
        description: 'Ростов-на-Дону - умеренные цены',
        factors: { transport: 0.86, rent: 0.82, demand: 0.89 }
      },
      'ufa': { 
        multiplier: 0.86, 
        description: 'Уфа - умеренные цены',
        factors: { transport: 0.81, rent: 0.78, demand: 0.86 }
      },
      'krasnoyarsk': { 
        multiplier: 0.93, 
        description: 'Красноярск - умеренные цены',
        factors: { transport: 0.89, rent: 0.86, demand: 0.93 }
      },
      'voronezh': { 
        multiplier: 0.88, 
        description: 'Воронеж - умеренные цены',
        factors: { transport: 0.84, rent: 0.8, demand: 0.88 }
      },
      'perm': { 
        multiplier: 0.87, 
        description: 'Пермь - умеренные цены',
        factors: { transport: 0.83, rent: 0.79, demand: 0.87 }
      },
      'saratov': { 
        multiplier: 0.85, 
        description: 'Саратов - низкие цены',
        factors: { transport: 0.8, rent: 0.75, demand: 0.85 }
      },
      'tyumen': { 
        multiplier: 0.94, 
        description: 'Тюмень - умеренные цены',
        factors: { transport: 0.9, rent: 0.87, demand: 0.94 }
      },
      'vladivostok': { 
        multiplier: 1.1, 
        description: 'Владивосток - высокие цены',
        factors: { transport: 1.2, rent: 1.1, demand: 1.0 }
      },
      'kaliningrad': { 
        multiplier: 1.05, 
        description: 'Калининград - выше среднего',
        factors: { transport: 1.1, rent: 1.05, demand: 1.0 }
      },
      'sevastopol': { 
        multiplier: 0.95, 
        description: 'Севастополь - умеренные цены',
        factors: { transport: 0.9, rent: 0.88, demand: 0.95 }
      },
      'default': { 
        multiplier: 1.0, 
        description: 'Средние цены по России',
        factors: { transport: 1.0, rent: 1.0, demand: 1.0 }
      }
    };
  }

  // Сезонные факторы
  initializeSeasonalFactors() {
    const currentMonth = new Date().getMonth() + 1;
    
    return {
      'зима': { 
        months: [12, 1, 2],
        factors: {
          'meat': 1.15,      // Мясо дороже зимой
          'fish': 1.1,       // Рыба дороже зимой
          'vegetables': 1.3, // Овощи намного дороже зимой
          'fruits': 1.4,     // Фрукты намного дороже зимой
          'dairy': 1.05,     // Молочные продукты немного дороже
          'grains': 1.0,     // Крупы без изменений
          'bakery': 1.0,     // Хлеб без изменений
          'spices': 1.0      // Специи без изменений
        },
        description: 'Зимние цены (декабрь-февраль)'
      },
      'весна': { 
        months: [3, 4, 5],
        factors: {
          'meat': 1.05,      // Мясо немного дороже
          'fish': 1.0,       // Рыба без изменений
          'vegetables': 0.8, // Овощи дешевле весной
          'fruits': 0.9,     // Фрукты дешевле весной
          'dairy': 1.0,      // Молочные продукты без изменений
          'grains': 1.0,     // Крупы без изменений
          'bakery': 1.0,     // Хлеб без изменений
          'spices': 1.0      // Специи без изменений
        },
        description: 'Весенние цены (март-май)'
      },
      'лето': { 
        months: [6, 7, 8],
        factors: {
          'meat': 0.95,      // Мясо дешевле летом
          'fish': 0.9,       // Рыба дешевле летом
          'vegetables': 0.6, // Овощи намного дешевле летом
          'fruits': 0.7,     // Фрукты намного дешевле летом
          'dairy': 0.95,     // Молочные продукты дешевле
          'grains': 1.0,     // Крупы без изменений
          'bakery': 1.0,     // Хлеб без изменений
          'spices': 1.0      // Специи без изменений
        },
        description: 'Летние цены (июнь-август)'
      },
      'осень': { 
        months: [9, 10, 11],
        factors: {
          'meat': 1.1,       // Мясо дороже осенью
          'fish': 1.05,      // Рыба дороже осенью
          'vegetables': 0.9, // Овощи дешевле осенью
          'fruits': 0.8,     // Фрукты дешевле осенью
          'dairy': 1.0,      // Молочные продукты без изменений
          'grains': 1.0,     // Крупы без изменений
          'bakery': 1.0,     // Хлеб без изменений
          'spices': 1.0      // Специи без изменений
        },
        description: 'Осенние цены (сентябрь-ноябрь)'
      }
    };
  }

  // Рыночные тренды
  initializeMarketTrends() {
    return {
      'inflation': 0.05,        // 5% инфляция в год
      'demand_growth': 0.02,    // 2% рост спроса в год
      'supply_shortage': 0.1,   // 10% дефицит предложения
      'transport_cost': 0.03,   // 3% рост транспортных расходов
      'energy_cost': 0.08       // 8% рост энергозатрат
    };
  }

  // Получение цены с учетом всех факторов
  getPrice(productName, region = 'default', date = new Date()) {
    const productKey = this.findProductKey(productName);
    if (!productKey) return null;

    const product = this.basePrices[productKey];
    const regional = this.regionalMultipliers[region] || this.regionalMultipliers['default'];
    const seasonal = this.getCurrentSeasonalFactor(date);
    
    // Базовая цена
    let price = product.base;
    
    // Применяем региональный множитель
    price *= regional.multiplier;
    
    // Применяем сезонный фактор
    const seasonalFactor = seasonal.factors[product.category] || 1.0;
    price *= seasonalFactor;
    
    // Применяем рыночные тренды
    price *= (1 + this.marketTrends.inflation);
    price *= (1 + this.marketTrends.demand_growth);
    
    // Добавляем случайные колебания (±5%)
    const randomFactor = 0.95 + Math.random() * 0.1;
    price *= randomFactor;
    
    return {
      productName: productKey,
      basePrice: product.base,
      regionalPrice: Math.round(price),
      region: region,
      regionalMultiplier: regional.multiplier,
      seasonalFactor: seasonalFactor,
      seasonal: seasonal.description,
      category: product.category,
      seasonality: product.seasonality,
      lastUpdated: new Date().toISOString()
    };
  }

  // Получение цен для нескольких продуктов
  getPrices(productNames, region = 'default', date = new Date()) {
    const results = [];
    
    for (const productName of productNames) {
      const price = this.getPrice(productName, region, date);
      if (price) {
        results.push(price);
      }
    }
    
    return results;
  }

  // Получение текущего сезонного фактора
  getCurrentSeasonalFactor(date = new Date()) {
    const month = date.getMonth() + 1;
    
    for (const [season, data] of Object.entries(this.seasonalFactors)) {
      if (data.months.includes(month)) {
        return data;
      }
    }
    
    return this.seasonalFactors['осень']; // Fallback
  }

  // Поиск ключа продукта
  findProductKey(productName) {
    const name = productName.toLowerCase().trim();
    
    // Точное совпадение
    if (this.basePrices[name]) return name;
    
    // Частичное совпадение
    for (const key of Object.keys(this.basePrices)) {
      if (name.includes(key) || key.includes(name)) {
        return key;
      }
    }
    
    // Поиск по словам
    const words = name.split(/[\s,;]+/);
    for (const word of words) {
      if (word.length > 2 && this.basePrices[word]) {
        return word;
      }
    }
    
    return null;
  }

  // Получение статистики по региону
  getRegionalStatistics(region = 'default') {
    const regional = this.regionalMultipliers[region] || this.regionalMultipliers['default'];
    const seasonal = this.getCurrentSeasonalFactor();
    
    return {
      region: region,
      description: regional.description,
      multiplier: regional.multiplier,
      factors: regional.factors,
      currentSeason: seasonal.description,
      seasonalFactors: seasonal.factors,
      marketTrends: this.marketTrends,
      lastUpdated: new Date().toISOString()
    };
  }

  // Получение цен по категориям
  getPricesByCategory(category, region = 'default') {
    const results = [];
    
    for (const [productName, product] of Object.entries(this.basePrices)) {
      if (product.category === category) {
        const price = this.getPrice(productName, region);
        if (price) {
          results.push(price);
        }
      }
    }
    
    return results.sort((a, b) => a.regionalPrice - b.regionalPrice);
  }

  // Получение сезонных рекомендаций
  getSeasonalRecommendations(region = 'default') {
    const seasonal = this.getCurrentSeasonalFactor();
    const recommendations = [];
    
    for (const [category, factor] of Object.entries(seasonal.factors)) {
      if (factor < 0.9) {
        recommendations.push({
          category: category,
          factor: factor,
          recommendation: `Сейчас хорошее время для покупки ${category} (цена на ${Math.round((1 - factor) * 100)}% ниже)`
        });
      } else if (factor > 1.1) {
        recommendations.push({
          category: category,
          factor: factor,
          recommendation: `Сейчас ${category} дороже обычного (цена на ${Math.round((factor - 1) * 100)}% выше)`
        });
      }
    }
    
    return recommendations;
  }
}

// Экспорт экземпляра
export const enhancedMockData = new EnhancedMockData();
