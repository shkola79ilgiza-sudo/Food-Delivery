// AI-помощник ценообразования с анализом рынка, конкурентов и прогнозированием спроса
// Анализирует фото блюд, цены конкурентов, прогнозирует спрос
// Интегрирует открытые API, краудсорсинг и улучшенные моковые данные

import { integratedPricingSystem } from './integratedPricingSystem';

export class AIPricingAssistant {
  constructor() {
    this.marketData = this.initializeMarketData();
    this.competitorPrices = this.initializeCompetitorPrices();
    this.demandHistory = this.initializeDemandHistory();
    this.ingredientRecognition = this.initializeIngredientRecognition();
    this.locationData = this.initializeLocationData();
  }

  // Инициализация рыночных данных
  initializeMarketData() {
    return {
      // Средние цены по категориям в разных районах
      'центр': {
        'супы': { min: 180, avg: 220, max: 280 },
        'салаты': { min: 150, avg: 200, max: 250 },
        'горячие блюда': { min: 250, avg: 320, max: 450 },
        'десерты': { min: 120, avg: 180, max: 250 },
        'напитки': { min: 80, avg: 120, max: 180 }
      },
      'спальные районы': {
        'супы': { min: 80, avg: 120, max: 150 },      // снижено
        'салаты': { min: 60, avg: 100, max: 130 },    // снижено
        'горячие блюда': { min: 120, avg: 180, max: 250 }, // снижено
        'десерты': { min: 50, avg: 80, max: 120 },    // снижено
        'напитки': { min: 40, avg: 60, max: 80 }      // снижено
      },
      'татарстан': {
        'супы': { min: 70, avg: 110, max: 140 },      // умеренные цены
        'салаты': { min: 55, avg: 90, max: 120 },     // умеренные цены
        'горячие блюда': { min: 110, avg: 170, max: 230 }, // умеренные цены
        'десерты': { min: 45, avg: 75, max: 110 },    // умеренные цены
        'напитки': { min: 35, avg: 55, max: 75 }      // умеренные цены
      },
      'bashkortostan': {
        'супы': { min: 65, avg: 100, max: 130 },      // низкие цены
        'салаты': { min: 50, avg: 80, max: 110 },     // низкие цены
        'горячие блюда': { min: 100, avg: 150, max: 200 }, // низкие цены
        'десерты': { min: 40, avg: 65, max: 95 },     // низкие цены
        'напитки': { min: 30, avg: 50, max: 70 }      // низкие цены
      },
      'chelyabinsk': {
        'супы': { min: 68, avg: 105, max: 135 },      // умеренные цены
        'салаты': { min: 52, avg: 85, max: 115 },     // умеренные цены
        'горячие блюда': { min: 105, avg: 160, max: 215 }, // умеренные цены
        'десерты': { min: 42, avg: 70, max: 100 },    // умеренные цены
        'напитки': { min: 32, avg: 52, max: 72 }      // умеренные цены
      },
      'vladivostok': {
        'супы': { min: 85, avg: 130, max: 170 },      // высокие цены
        'салаты': { min: 70, avg: 110, max: 150 },    // высокие цены
        'горячие блюда': { min: 130, avg: 200, max: 270 }, // высокие цены
        'десерты': { min: 55, avg: 90, max: 130 },    // высокые цены
        'напитки': { min: 45, avg: 70, max: 95 }      // высокие цены
      },
      'kaliningrad': {
        'супы': { min: 80, avg: 125, max: 165 },      // выше среднего
        'салаты': { min: 65, avg: 105, max: 145 },    // выше среднего
        'горячие блюда': { min: 125, avg: 190, max: 255 }, // выше среднего
        'десерты': { min: 50, avg: 85, max: 125 },    // выше среднего
        'напитки': { min: 40, avg: 65, max: 90 }      // выше среднего
      },
      'премиум районы': {
        'супы': { min: 250, avg: 350, max: 500 },
        'салаты': { min: 200, avg: 300, max: 400 },
        'горячие блюда': { min: 400, avg: 600, max: 800 },
        'десерты': { min: 150, avg: 250, max: 350 },
        'напитки': { min: 120, avg: 200, max: 300 }
      }
    };
  }

  // Инициализация цен конкурентов
  initializeCompetitorPrices() {
    return {
      // Рестораны в разных районах
      'рестораны': {
        'центр': {
          'борщ': { min: 200, avg: 250, max: 300 },
          'цезарь': { min: 180, avg: 220, max: 280 },
          'стейк': { min: 800, avg: 1200, max: 1800 },
          'паста': { min: 300, avg: 450, max: 600 }
        },
        'спальные районы': {
          'борщ': { min: 100, avg: 130, max: 160 },     // снижено
          'солянка': { min: 110, avg: 140, max: 170 },  // снижено
          'солянка мясная': { min: 120, avg: 150, max: 180 }, // снижено
          'цезарь': { min: 80, avg: 110, max: 140 },    // снижено
          'стейк': { min: 400, avg: 500, max: 600 },    // снижено
          'паста': { min: 120, avg: 160, max: 200 }     // снижено
        },
        'татарстан': {
          'борщ': { min: 90, avg: 120, max: 150 },      // умеренные цены
          'солянка': { min: 100, avg: 130, max: 160 },  // умеренные цены
          'солянка мясная': { min: 110, avg: 140, max: 170 }, // умеренные цены
          'цезарь': { min: 70, avg: 100, max: 130 },    // умеренные цены
          'стейк': { min: 350, avg: 450, max: 550 },    // умеренные цены
          'паста': { min: 110, avg: 150, max: 190 }     // умеренные цены
        }
      },
      // Домашние повара - РЕАЛИСТИЧНЫЕ ЦЕНЫ
      'домашние повара': {
        'центр': {
          'борщ': { min: 80, avg: 120, max: 150 },     // снижено
          'цезарь': { min: 60, avg: 100, max: 130 },   // снижено
          'стейк': { min: 200, avg: 300, max: 400 },   // снижено
          'паста': { min: 100, avg: 150, max: 200 }    // снижено
        },
        'спальные районы': {
          'борщ': { min: 40, avg: 60, max: 80 },       // еще больше снижено
          'солянка': { min: 50, avg: 70, max: 90 },    // еще больше снижено
          'солянка мясная': { min: 60, avg: 80, max: 100 }, // еще больше снижено
          'цезарь': { min: 30, avg: 50, max: 70 },     // еще больше снижено
          'стейк': { min: 100, avg: 150, max: 200 },   // еще больше снижено
          'паста': { min: 50, avg: 80, max: 110 }      // еще больше снижено
        },
        'татарстан': {
          'борщ': { min: 35, avg: 55, max: 75 },       // умеренные цены
          'солянка': { min: 45, avg: 65, max: 85 },    // умеренные цены
          'солянка мясная': { min: 55, avg: 75, max: 95 }, // умеренные цены
          'цезарь': { min: 25, avg: 45, max: 65 },     // умеренные цены
          'стейк': { min: 90, avg: 140, max: 190 },    // умеренные цены
          'паста': { min: 45, avg: 75, max: 105 }      // умеренные цены
        },
        'bashkortostan': {
          'борщ': { min: 30, avg: 50, max: 70 },       // низкие цены
          'солянка': { min: 40, avg: 60, max: 80 },    // низкие цены
          'солянка мясная': { min: 50, avg: 70, max: 90 }, // низкие цены
          'цезарь': { min: 20, avg: 40, max: 60 },     // низкие цены
          'стейк': { min: 80, avg: 130, max: 180 },    // низкие цены
          'паста': { min: 40, avg: 70, max: 100 }      // низкие цены
        },
        'chelyabinsk': {
          'борщ': { min: 32, avg: 52, max: 72 },       // умеренные цены
          'солянка': { min: 42, avg: 62, max: 82 },    // умеренные цены
          'солянка мясная': { min: 52, avg: 72, max: 92 }, // умеренные цены
          'цезарь': { min: 22, avg: 42, max: 62 },     // умеренные цены
          'стейк': { min: 85, avg: 135, max: 185 },    // умеренные цены
          'паста': { min: 42, avg: 72, max: 102 }      // умеренные цены
        },
        'vladivostok': {
          'борщ': { min: 50, avg: 80, max: 110 },      // высокие цены
          'солянка': { min: 60, avg: 90, max: 120 },   // высокие цены
          'солянка мясная': { min: 70, avg: 100, max: 130 }, // высокие цены
          'цезарь': { min: 40, avg: 70, max: 100 },    // высокие цены
          'стейк': { min: 120, avg: 180, max: 240 },   // высокие цены
          'паста': { min: 60, avg: 100, max: 140 }     // высокие цены
        },
        'kaliningrad': {
          'борщ': { min: 45, avg: 75, max: 105 },      // выше среднего
          'солянка': { min: 55, avg: 85, max: 115 },   // выше среднего
          'солянка мясная': { min: 65, avg: 95, max: 125 }, // выше среднего
          'цезарь': { min: 35, avg: 65, max: 95 },     // выше среднего
          'стейк': { min: 110, avg: 170, max: 230 },   // выше среднего
          'паста': { min: 55, avg: 95, max: 135 }      // выше среднего
        }
      }
    };
  }

  // Инициализация истории спроса
  initializeDemandHistory() {
    return {
      // Сезонные тренды
      'сезонные': {
        'зима': ['супы', 'горячие блюда', 'горячие напитки'],
        'весна': ['салаты', 'овощные блюда', 'свежие соки'],
        'лето': ['холодные супы', 'салаты', 'мороженое', 'холодные напитки'],
        'осень': ['тушеные блюда', 'супы', 'теплые напитки']
      },
      // Дневные тренды
      'дневные': {
        'утро': ['завтраки', 'кофе', 'выпечка'],
        'день': ['салаты', 'супы', 'легкие блюда'],
        'вечер': ['горячие блюда', 'десерты', 'напитки']
      },
      // Недельные тренды
      'недельные': {
        'понедельник': ['легкие блюда', 'салаты'],
        'пятница': ['десерты', 'напитки', 'праздничные блюда'],
        'выходные': ['сложные блюда', 'десерты', 'семейные порции']
      }
    };
  }

  // Инициализация распознавания ингредиентов по фото
  initializeIngredientRecognition() {
    return {
      // Простое распознавание по цветам и формам (симуляция)
      'цвета': {
        'красный': ['помидоры', 'перец', 'мясо', 'свекла'],
        'зеленый': ['салат', 'огурцы', 'зелень', 'брокколи'],
        'белый': ['молоко', 'сыр', 'рис', 'картофель'],
        'коричневый': ['мясо', 'хлеб', 'кофе', 'шоколад']
      },
      'формы': {
        'круглые': ['помидоры', 'лук', 'картофель', 'яйца'],
        'длинные': ['огурцы', 'морковь', 'бананы', 'макароны'],
        'листовые': ['салат', 'капуста', 'шпинат', 'базилик']
      }
    };
  }

  // Инициализация данных о местоположении
  initializeLocationData() {
    return {
      'районы': ['центр', 'спальные районы', 'премиум районы', 'татарстан', 'bashkortostan', 'chelyabinsk', 'omsk', 'samara', 'rostov', 'ufa', 'krasnoyarsk', 'voronezh', 'perm', 'saratov', 'tyumen', 'vladivostok', 'kaliningrad', 'sevastopol'],
      'типы_заведений': ['рестораны', 'кафе', 'домашние повара', 'фудкорты'],
      'сезонность': this.getCurrentSeason(),
      'время_дня': this.getCurrentTimeOfDay(),
      'день_недели': this.getCurrentDayOfWeek()
    };
  }

  // Получение текущего сезона
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 12 || month <= 2) return 'зима';
    if (month >= 3 && month <= 5) return 'весна';
    if (month >= 6 && month <= 8) return 'лето';
    return 'осень';
  }

  // Получение времени дня
  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'утро';
    if (hour >= 12 && hour < 18) return 'день';
    return 'вечер';
  }

  // Получение дня недели
  getCurrentDayOfWeek() {
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return days[new Date().getDay()];
  }

  // Основная функция AI-анализа ценообразования
  async analyzePricing(dishData, userLocation = 'moscow') {
    // Проверяем, что userLocation существует в наших данных
    const availableLocations = Object.keys(this.marketData);
    const validLocation = userLocation && this.marketData[userLocation] ? userLocation : availableLocations[0] || 'moscow';
    
    const {
      name = '',
      ingredients = '',
      category = 'горячие блюда',
      photo = null,
      cookingMethod = 'варка'
    } = dishData;

    const analysis = {
      // Базовый анализ
      dishName: name,
      category: category,
      userLocation: userLocation,
      
      // Анализ ингредиентов
      ingredientAnalysis: await this.analyzeIngredients(ingredients, photo),
      
      // Рыночный анализ
      marketAnalysis: this.analyzeMarket(category, validLocation),
      
      // Анализ конкурентов
      competitorAnalysis: this.analyzeCompetitors(name, category, validLocation),
      
      // Прогноз спроса
      demandForecast: this.forecastDemand(category, validLocation),
      
      // Рекомендации
      recommendations: [],
      
      // Итоговая цена
      suggestedPrice: 0,
      priceRange: { min: 0, max: 0 },
      confidence: 0
    };

    // Генерация рекомендаций
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // Расчет рекомендуемой цены
    const priceCalculation = this.calculateRecommendedPrice(analysis);
    analysis.suggestedPrice = priceCalculation.price;
    analysis.priceRange = priceCalculation.range;
    analysis.confidence = priceCalculation.confidence;

    return analysis;
  }

  // Анализ ингредиентов (включая фото)
  async analyzeIngredients(ingredients, photo) {
    const analysis = {
      recognizedIngredients: [],
      estimatedCost: 0,
      complexity: 'medium',
      preparationTime: 30,
      skillLevel: 'intermediate'
    };

    // Анализ текстовых ингредиентов
    if (ingredients) {
      const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
      analysis.recognizedIngredients = ingredientList;
      
      // Простая оценка стоимости
      analysis.estimatedCost = this.estimateIngredientCost(ingredientList);
      
      // Оценка сложности
      analysis.complexity = this.assessComplexity(ingredientList);
      analysis.preparationTime = this.estimatePreparationTime(ingredientList);
      analysis.skillLevel = this.assessSkillLevel(ingredientList);
    }

    // Анализ фото (симуляция)
    if (photo) {
      const photoAnalysis = await this.analyzePhoto(photo);
      analysis.recognizedIngredients = [...new Set([...analysis.recognizedIngredients, ...photoAnalysis.ingredients])];
      analysis.estimatedCost = Math.max(analysis.estimatedCost, photoAnalysis.estimatedCost);
    }

    return analysis;
  }

  // Анализ фото блюда (симуляция AI)
  async analyzePhoto(photo) {
    // Симуляция анализа фото
    await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация обработки
    
    // Простая симуляция распознавания
    const mockAnalysis = {
      ingredients: ['помидоры', 'огурцы', 'салат', 'сыр'],
      estimatedCost: 120,
      confidence: 0.75,
      dishType: 'салат',
      colors: ['зеленый', 'красный', 'белый'],
      complexity: 'low'
    };

    return mockAnalysis;
  }

  // Оценка стоимости ингредиентов - РЕАЛИСТИЧНЫЕ ЦЕНЫ ДЛЯ ДОМАШНЕЙ КУХНИ
  estimateIngredientCost(ingredients) {
    const baseCosts = {
      'мясо': 80,       // было 120, стало 80
      'курица': 50,     // было 80, стало 50
      'рыба': 100,      // было 150, стало 100
      'морепродукты': 120, // было 200, стало 120
      'овощи': 20,      // было 30, стало 20
      'фрукты': 25,     // было 40, стало 25
      'молочные': 40,   // было 60, стало 40
      'крупы': 15,      // было 20, стало 15
      'специи': 50,     // было 80, стало 50
      'масла': 40       // было 60, стало 40
    };

    let totalCost = 0;
    ingredients.forEach(ingredient => {
      for (const [category, cost] of Object.entries(baseCosts)) {
        if (ingredient.includes(category)) {
          totalCost += cost;
          break;
        }
      }
    });

    return totalCost || 30; // Минимальная стоимость снижена с 50 до 30
  }

  // Оценка сложности приготовления
  assessComplexity(ingredients) {
    const complexIngredients = ['мясо', 'рыба', 'тесто', 'соус', 'маринад'];
    const hasComplex = ingredients.some(ing => 
      complexIngredients.some(complex => ing.includes(complex))
    );
    
    return hasComplex ? 'high' : 'medium';
  }

  // Оценка времени приготовления
  estimatePreparationTime(ingredients) {
    const timeIngredients = {
      'мясо': 60, 'рыба': 30, 'овощи': 15, 'салат': 10,
      'суп': 45, 'паста': 20, 'десерт': 30
    };

    let maxTime = 15; // Базовое время
    ingredients.forEach(ingredient => {
      for (const [type, time] of Object.entries(timeIngredients)) {
        if (ingredient.includes(type)) {
          maxTime = Math.max(maxTime, time);
        }
      }
    });

    return maxTime;
  }

  // Оценка уровня навыков
  assessSkillLevel(ingredients) {
    const advancedIngredients = ['тесто', 'соус', 'маринад', 'ферментация'];
    const hasAdvanced = ingredients.some(ing => 
      advancedIngredients.some(advanced => ing.includes(advanced))
    );
    
    return hasAdvanced ? 'expert' : 'intermediate';
  }

  // Анализ рынка
  analyzeMarket(category, location) {
    // Проверяем, что location существует и есть в marketData
    const availableLocations = Object.keys(this.marketData);
    const validLocation = location && this.marketData[location] ? location : availableLocations[0] || 'moscow';
    const marketData = this.marketData[validLocation];
    const categoryData = marketData[category] || { min: 100, avg: 150, max: 200 };
    
    return {
      location: location,
      category: category,
      priceRange: categoryData,
      marketTrend: this.getMarketTrend(category, location),
      seasonality: this.getSeasonalityFactor(category)
    };
  }

  // Анализ конкурентов
  analyzeCompetitors(dishName, category, location) {
    const competitors = this.competitorPrices;
    const analysis = {
      restaurants: null,
      homeChefs: null,
      recommendations: []
    };

    // Проверяем, что location существует
    const availableRestaurantLocations = Object.keys(competitors.рестораны);
    const validLocation = location && competitors.рестораны[location] ? location : availableRestaurantLocations[0] || 'moscow';
    
    // Если location не найден, пробуем найти похожий
    if (!competitors.рестораны[validLocation]) {
      const fallbackLocation = availableRestaurantLocations[0] || 'moscow';
      console.warn(`Location '${location}' not found, using fallback: '${fallbackLocation}'`);
      return this.analyzeCompetitors(dishName, category, fallbackLocation);
    }

    // Анализ ресторанов
    if (competitors.рестораны[validLocation]) {
      const restaurantPrices = competitors.рестораны[validLocation];
      const dishPrices = restaurantPrices[dishName.toLowerCase()] || restaurantPrices[category];
      
      if (dishPrices) {
        analysis.restaurants = {
          min: dishPrices.min,
          avg: dishPrices.avg,
          max: dishPrices.max,
          recommendation: this.getCompetitorRecommendation(dishPrices, 'restaurant')
        };
      }
    }

    // Анализ домашних поваров
    if (competitors.домашние_повара[validLocation]) {
      const homeChefPrices = competitors.домашние_повара[validLocation];
      const dishPrices = homeChefPrices[dishName.toLowerCase()] || homeChefPrices[category];
      
      if (dishPrices) {
        analysis.homeChefs = {
          min: dishPrices.min,
          avg: dishPrices.avg,
          max: dishPrices.max,
          recommendation: this.getCompetitorRecommendation(dishPrices, 'homeChef')
        };
      }
    }

    return analysis;
  }

  // Прогноз спроса
  forecastDemand(category, location) {
    const currentSeason = this.getCurrentSeason();
    const currentTime = this.getCurrentTimeOfDay();
    const currentDay = this.getCurrentDayOfWeek();
    
    const seasonalTrends = this.demandHistory.сезонные[currentSeason] || [];
    const dailyTrends = this.demandHistory.дневные[currentTime] || [];
    const weeklyTrends = this.demandHistory.недельные[currentDay] || [];
    
    const isPopular = seasonalTrends.includes(category) || 
                     dailyTrends.includes(category) || 
                     weeklyTrends.includes(category);
    
    return {
      season: currentSeason,
      timeOfDay: currentTime,
      dayOfWeek: currentDay,
      isPopular: isPopular,
      demandLevel: isPopular ? 'high' : 'medium',
      recommendation: this.getDemandRecommendation(isPopular, category)
    };
  }

  // Получение интегрированной цены с использованием всех источников данных
  async getIntegratedPrice(dishName, ingredients, category, location = 'moscow') {
    try {
      // Получаем цены на ингредиенты через интегрированную систему
      const ingredientPrices = [];
      for (const ingredient of ingredients) {
        const priceData = await integratedPricingSystem.getIntegratedPrice(ingredient, location);
        if (priceData.success) {
          ingredientPrices.push({
            ingredient: ingredient,
            price: priceData.integratedPrice,
            confidence: priceData.confidence
          });
        }
      }

      // Рассчитываем общую стоимость ингредиентов
      const totalIngredientCost = ingredientPrices.reduce((sum, item) => sum + item.price, 0);
      const averageConfidence = ingredientPrices.length > 0 
        ? ingredientPrices.reduce((sum, item) => sum + item.confidence, 0) / ingredientPrices.length 
        : 0.5;

      // Получаем рекомендации по ценообразованию
      const recommendations = integratedPricingSystem.getPricingRecommendations(dishName, location);

      return {
        success: true,
        dishName: dishName,
        ingredientCost: totalIngredientCost,
        ingredientPrices: ingredientPrices,
        confidence: averageConfidence,
        recommendations: recommendations,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ошибка получения интегрированной цены:', error);
      return {
        success: false,
        error: error.message,
        dishName: dishName
      };
    }
  }

  // Генерация рекомендаций
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Рекомендации по ценообразованию
    if (analysis.competitorAnalysis.restaurants && analysis.competitorAnalysis.homeChefs) {
      const restaurantAvg = analysis.competitorAnalysis.restaurants.avg;
      const homeChefAvg = analysis.competitorAnalysis.homeChefs.avg;
      
      if (restaurantAvg && homeChefAvg) {
        const recommendedPrice = Math.round((restaurantAvg * 0.5 + homeChefAvg * 1.1) / 2); // Снижены множители
        recommendations.push({
          type: 'pricing',
          priority: 'high',
          message: `Рекомендуемая цена: ${recommendedPrice}₽ (на 50% дешевле ресторанов, на 10% дороже домашних поваров)`,
          price: recommendedPrice
        });
      }
    }

    // Рекомендации по спросу
    if (analysis.demandForecast.isPopular) {
      recommendations.push({
        type: 'demand',
        priority: 'medium',
        message: `Высокий спрос на ${analysis.category} в ${analysis.demandForecast.season}. Рекомендуем увеличить цену на 5-10%.`,
        action: 'increase_price'
      });
    }

    // Рекомендации по ингредиентам
    if (analysis.ingredientAnalysis.complexity === 'high') {
      recommendations.push({
        type: 'ingredients',
        priority: 'low',
        message: 'Сложное блюдо требует высокой цены для покрытия трудозатрат.',
        action: 'justify_higher_price'
      });
    }

    return recommendations;
  }

  // Расчет рекомендуемой цены - АДАПТИРОВАН ДЛЯ ДОМАШНЕЙ КУХНИ
  calculateRecommendedPrice(analysis) {
    let basePrice = analysis.ingredientAnalysis.estimatedCost;
    
    // Применение рыночных факторов (еще больше снижены)
    const marketFactor = analysis.marketAnalysis.seasonality;
    basePrice *= marketFactor;
    
    // Применение фактора спроса (еще больше снижен)
    const demandFactor = analysis.demandForecast.isPopular ? 1.05 : 1.0; // было 1.1
    basePrice *= demandFactor;
    
    // Применение фактора сложности (еще больше снижен)
    const complexityFactor = analysis.ingredientAnalysis.complexity === 'high' ? 1.1 : 1.0; // было 1.2
    basePrice *= complexityFactor;
    
    // Учет конкурентов (приоритет домашним поварам)
    let competitorPrice = basePrice;
    if (analysis.competitorAnalysis.restaurants && analysis.competitorAnalysis.homeChefs) {
      const restaurantAvg = analysis.competitorAnalysis.restaurants.avg;
      const homeChefAvg = analysis.competitorAnalysis.homeChefs.avg;
      // Больше веса домашним поварам (было 0.3/0.7, стало 0.2/0.8)
      competitorPrice = (restaurantAvg * 0.2 + homeChefAvg * 0.8);
    }
    
    // Финальная цена как среднее между расчетной и конкурентной
    let finalPrice = Math.round((basePrice + competitorPrice) / 2);
    
    // Ограничение максимальной цены для домашней кухни
    const maxHomeKitchenPrice = 300; // Максимум 300₽ для домашней кухни (было 500₽)
    if (finalPrice > maxHomeKitchenPrice) {
      finalPrice = maxHomeKitchenPrice;
    }
    
    // Дополнительное ограничение: цена не должна превышать стоимость ингредиентов более чем в 2 раза
    const maxReasonablePrice = analysis.ingredientAnalysis.estimatedCost * 2;
    if (finalPrice > maxReasonablePrice) {
      finalPrice = Math.round(maxReasonablePrice);
    }
    
    return {
      price: finalPrice,
      range: {
        min: Math.round(finalPrice * 0.8),
        max: Math.round(finalPrice * 1.2)
      },
      confidence: 0.85
    };
  }

  // Вспомогательные методы
  getMarketTrend(category, location) {
    // Симуляция тренда рынка
    return Math.random() > 0.5 ? 'growing' : 'stable';
  }

  getSeasonalityFactor(category) {
    const currentSeason = this.getCurrentSeason();
    const seasonalFactors = {
      'зима': { 'супы': 1.2, 'горячие блюда': 1.15, 'салаты': 0.8 },
      'лето': { 'салаты': 1.3, 'холодные супы': 1.2, 'горячие блюда': 0.7 },
      'весна': { 'овощные блюда': 1.1, 'салаты': 1.2 },
      'осень': { 'тушеные блюда': 1.1, 'супы': 1.05 }
    };
    
    return seasonalFactors[currentSeason]?.[category] || 1.0;
  }

  getCompetitorRecommendation(prices, type) {
    const avg = prices.avg;
    if (type === 'restaurant') {
      return `Рестораны: ${avg}₽ (диапазон: ${prices.min}-${prices.max}₽)`;
    } else {
      return `Домашние повара: ${avg}₽ (диапазон: ${prices.min}-${prices.max}₽)`;
    }
  }

  getDemandRecommendation(isPopular, category) {
    if (isPopular) {
      return `Высокий спрос на ${category}. Рекомендуем увеличить цену.`;
    } else {
      return `Средний спрос на ${category}. Стандартная цена.`;
    }
  }
}

// Экспорт экземпляра
export const aiPricingAssistant = new AIPricingAssistant();
