// AI-анализатор конкурентных цен с рекомендациями
// Сравнивает цены домашней кухни с ресторанами и дает умные советы

export class CompetitivePriceAnalyzer {
  constructor() {
    this.priceProvider = null; // Будет инициализирован извне
    this.analysisCache = new Map();
    this.recommendationEngine = this.initializeRecommendationEngine();
  }

  // Инициализация движка рекомендаций
  initializeRecommendationEngine() {
    return {
      // Факторы для анализа
      factors: {
        quality: 0.3,      // Качество блюда
        location: 0.2,     // Местоположение
        service: 0.15,     // Уровень сервиса
        brand: 0.1,        // Бренд/репутация
        convenience: 0.15, // Удобство
        uniqueness: 0.1    // Уникальность
      },
      
      // Типы рекомендаций
      recommendationTypes: {
        PRICE_TOO_HIGH: 'price_too_high',
        PRICE_TOO_LOW: 'price_too_low',
        COMPETITIVE_ADVANTAGE: 'competitive_advantage',
        MARKET_OPPORTUNITY: 'market_opportunity',
        COST_OPTIMIZATION: 'cost_optimization'
      }
    };
  }

  // Установка провайдера цен
  setPriceProvider(provider) {
    this.priceProvider = provider;
  }

  // Основной анализ конкурентных цен
  async analyzeCompetitivePricing(dishData, userLocation = 'moscow') {
    const {
      name: dishName,
      ingredients = '',
      category = 'горячие блюда',
      currentPrice = 0,
      quality = 'medium'
    } = dishData;

    const cacheKey = `${dishName}_${userLocation}_${currentPrice}`;
    
    // Проверяем кэш
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    try {
      // Получаем данные о ценах
      const priceData = await this.priceProvider.getProductPrices(dishName, userLocation);
      
      // Анализируем конкурентную ситуацию
      const analysis = {
        dishName,
        userLocation,
        currentPrice,
        quality,
        
        // Данные о конкурентах
        competitors: this.analyzeCompetitors(priceData),
        
        // Анализ цен
        priceAnalysis: this.analyzePrices(priceData, currentPrice),
        
        // Рекомендации
        recommendations: [],
        
        // Итоговая оценка
        overallScore: 0,
        confidence: 0,
        
        lastUpdated: new Date().toISOString()
      };

      // Генерируем рекомендации
      analysis.recommendations = this.generateRecommendations(analysis);
      
      // Рассчитываем общий балл
      analysis.overallScore = this.calculateOverallScore(analysis);
      analysis.confidence = this.calculateConfidence(analysis);

      // Сохраняем в кэш
      this.analysisCache.set(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Ошибка анализа конкурентных цен:', error);
      return this.getFallbackAnalysis(dishName, currentPrice);
    }
  }

  // Анализ конкурентов
  analyzeCompetitors(priceData) {
    const competitors = {
      restaurants: {
        count: priceData.restaurantPrices.data.length,
        averagePrice: priceData.restaurantPrices.average,
        priceRange: {
          min: priceData.restaurantPrices.min,
          max: priceData.restaurantPrices.max
        },
        distribution: this.analyzePriceDistribution(priceData.restaurantPrices.data)
      },
      
      stores: {
        count: priceData.storePrices.data.length,
        averagePrice: priceData.storePrices.average,
        priceRange: {
          min: priceData.storePrices.min,
          max: priceData.storePrices.max
        },
        cheapestStore: this.findCheapestStore(priceData.storePrices.data)
      }
    };

    return competitors;
  }

  // Анализ распределения цен
  analyzePriceDistribution(prices) {
    if (prices.length === 0) return { low: 0, medium: 0, high: 0 };
    
    const sortedPrices = prices.map(p => p.price).sort((a, b) => a - b);
    const lowThreshold = sortedPrices[Math.floor(sortedPrices.length * 0.33)];
    const highThreshold = sortedPrices[Math.floor(sortedPrices.length * 0.67)];
    
    return {
      low: prices.filter(p => p.price <= lowThreshold).length,
      medium: prices.filter(p => p.price > lowThreshold && p.price <= highThreshold).length,
      high: prices.filter(p => p.price > highThreshold).length
    };
  }

  // Поиск самого дешевого магазина
  findCheapestStore(storePrices) {
    if (storePrices.length === 0) return null;
    
    return storePrices.reduce((cheapest, current) => 
      current.price < cheapest.price ? current : cheapest
    );
  }

  // Анализ цен
  analyzePrices(priceData, currentPrice) {
    const restaurantAvg = priceData.restaurantPrices.average;
    const storeAvg = priceData.storePrices.average;
    
    return {
      // Сравнение с ресторанами
      vsRestaurants: {
        difference: currentPrice - restaurantAvg,
        percentage: restaurantAvg > 0 ? Math.round(((currentPrice - restaurantAvg) / restaurantAvg) * 100) : 0,
        position: this.getPricePosition(currentPrice, restaurantAvg),
        advantage: this.calculateAdvantage(currentPrice, restaurantAvg)
      },
      
      // Сравнение с магазинами
      vsStores: {
        difference: currentPrice - storeAvg,
        percentage: storeAvg > 0 ? Math.round(((currentPrice - storeAvg) / storeAvg) * 100) : 0,
        markup: storeAvg > 0 ? Math.round(((currentPrice - storeAvg) / storeAvg) * 100) : 0
      },
      
      // Рекомендуемые ценовые сегменты
      priceSegments: this.calculatePriceSegments(restaurantAvg, storeAvg),
      
      // Анализ прибыльности
      profitability: this.analyzeProfitability(currentPrice, storeAvg)
    };
  }

  // Определение позиции цены
  getPricePosition(currentPrice, averagePrice) {
    if (currentPrice < averagePrice * 0.8) return 'low';
    if (currentPrice > averagePrice * 1.2) return 'high';
    return 'medium';
  }

  // Расчет преимущества
  calculateAdvantage(currentPrice, competitorPrice) {
    const savings = competitorPrice - currentPrice;
    const percentage = competitorPrice > 0 ? (savings / competitorPrice) * 100 : 0;
    
    return {
      absolute: savings,
      percentage: Math.round(percentage),
      level: this.getAdvantageLevel(percentage)
    };
  }

  // Уровень преимущества
  getAdvantageLevel(percentage) {
    if (percentage > 30) return 'high';
    if (percentage > 15) return 'medium';
    if (percentage > 0) return 'low';
    return 'none';
  }

  // Расчет ценовых сегментов
  calculatePriceSegments(restaurantAvg, storeAvg) {
    return {
      budget: Math.round(storeAvg * 1.5),           // Бюджетный сегмент
      midRange: Math.round((restaurantAvg + storeAvg * 2) / 3), // Средний сегмент
      premium: Math.round(restaurantAvg * 0.8),     // Премиум сегмент (дешевле ресторанов)
      luxury: Math.round(restaurantAvg * 1.1)       // Люкс сегмент
    };
  }

  // Анализ прибыльности
  analyzeProfitability(currentPrice, costPrice) {
    if (costPrice <= 0) return { margin: 0, level: 'unknown' };
    
    const margin = ((currentPrice - costPrice) / currentPrice) * 100;
    
    return {
      margin: Math.round(margin),
      level: this.getProfitabilityLevel(margin),
      recommended: margin < 30 ? 'increase' : margin > 70 ? 'decrease' : 'maintain'
    };
  }

  // Уровень прибыльности
  getProfitabilityLevel(margin) {
    if (margin < 20) return 'low';
    if (margin < 40) return 'medium';
    if (margin < 60) return 'good';
    return 'excellent';
  }

  // Генерация рекомендаций
  generateRecommendations(analysis) {
    const recommendations = [];
    const { priceAnalysis, competitors } = analysis;
    
    // Рекомендация на основе сравнения с ресторанами
    if (priceAnalysis.vsRestaurants.advantage.level === 'high') {
      recommendations.push({
        type: this.recommendationEngine.recommendationTypes.COMPETITIVE_ADVANTAGE,
        priority: 'high',
        title: 'Отличное конкурентное преимущество!',
        message: `Вы на ${priceAnalysis.vsRestaurants.advantage.percentage}% дешевле ресторанов (экономия ${priceAnalysis.vsRestaurants.advantage.absolute}₽). Это привлекательно для клиентов!`,
        action: 'maintain_price',
        impact: 'positive'
      });
    } else if (priceAnalysis.vsRestaurants.advantage.level === 'none') {
      // Улучшенная логика для домашней кухни
      const restaurantAvg = competitors.restaurants.averagePrice;
      const homeKitchenPrice = Math.max(
        Math.round(restaurantAvg * 0.6), // 40% дешевле ресторанов
        Math.round(analysis.currentPrice * 0.3) // Но не менее 30% от текущей цены
      );
      
      recommendations.push({
        type: this.recommendationEngine.recommendationTypes.PRICE_TOO_HIGH,
        priority: 'high',
        title: 'Цена слишком высокая',
        message: `Ваша цена ${analysis.currentPrice}₽ выше средней ресторанной ${restaurantAvg}₽. Для домашней кухни рекомендуем ${homeKitchenPrice}₽ (на 40% дешевле ресторанов)`,
        action: 'decrease_price',
        suggestedPrice: homeKitchenPrice,
        impact: 'critical'
      });
    }

    // Рекомендация по прибыльности
    if (priceAnalysis.profitability.level === 'low') {
      recommendations.push({
        type: this.recommendationEngine.recommendationTypes.COST_OPTIMIZATION,
        priority: 'medium',
        title: 'Низкая прибыльность',
        message: `Маржа ${priceAnalysis.profitability.margin}% слишком низкая. Рассмотрите оптимизацию ингредиентов или повышение цены.`,
        action: 'optimize_costs',
        impact: 'warning'
      });
    }

    // Рекомендация по ценовым сегментам
    const currentSegment = this.determineCurrentSegment(analysis.currentPrice, priceAnalysis.priceSegments);
    if (currentSegment !== 'optimal') {
      recommendations.push({
        type: this.recommendationEngine.recommendationTypes.MARKET_OPPORTUNITY,
        priority: 'medium',
        title: 'Возможность на рынке',
        message: `Рассмотрите переход в ${currentSegment} сегмент для лучшего позиционирования.`,
        action: 'adjust_segment',
        impact: 'opportunity'
      });
    }

    // Рекомендация на основе статистики
    if (competitors.stores.cheapestStore) {
      recommendations.push({
        type: this.recommendationEngine.recommendationTypes.COST_OPTIMIZATION,
        priority: 'low',
        title: 'Оптимизация закупок',
        message: `Самые дешевые ингредиенты в ${competitors.stores.cheapestStore.store} (${competitors.stores.cheapestStore.price}₽). Рассмотрите смену поставщика.`,
        action: 'change_supplier',
        impact: 'cost_savings'
      });
    }

    return recommendations;
  }

  // Определение текущего сегмента
  determineCurrentSegment(currentPrice, segments) {
    if (currentPrice <= segments.budget) return 'budget';
    if (currentPrice <= segments.midRange) return 'mid_range';
    if (currentPrice <= segments.premium) return 'premium';
    if (currentPrice <= segments.luxury) return 'luxury';
    return 'overpriced';
  }

  // Расчет общего балла
  calculateOverallScore(analysis) {
    let score = 50; // Базовый балл
    
    // Бонус за конкурентное преимущество
    if (analysis.priceAnalysis.vsRestaurants.advantage.level === 'high') {
      score += 30;
    } else if (analysis.priceAnalysis.vsRestaurants.advantage.level === 'medium') {
      score += 15;
    } else if (analysis.priceAnalysis.vsRestaurants.advantage.level === 'none') {
      score -= 20;
    }
    
    // Бонус за прибыльность
    if (analysis.priceAnalysis.profitability.level === 'excellent') {
      score += 20;
    } else if (analysis.priceAnalysis.profitability.level === 'good') {
      score += 10;
    } else if (analysis.priceAnalysis.profitability.level === 'low') {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Расчет уверенности
  calculateConfidence(analysis) {
    let confidence = 0.5; // Базовая уверенность
    
    // Увеличиваем уверенность при наличии данных
    if (analysis.competitors.restaurants.count > 0) confidence += 0.2;
    if (analysis.competitors.stores.count > 0) confidence += 0.2;
    if (analysis.recommendations.length > 0) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  // Резервный анализ при ошибке
  getFallbackAnalysis(dishName, currentPrice) {
    return {
      dishName,
      currentPrice,
      competitors: { restaurants: { count: 0, averagePrice: 0 }, stores: { count: 0, averagePrice: 0 } },
      priceAnalysis: { vsRestaurants: { advantage: { level: 'unknown' } }, profitability: { level: 'unknown' } },
      recommendations: [{
        type: 'fallback',
        priority: 'low',
        title: 'Ограниченные данные',
        message: 'Недостаточно данных для полного анализа. Рекомендуем проверить цены конкурентов вручную.',
        action: 'manual_check',
        impact: 'neutral'
      }],
      overallScore: 50,
      confidence: 0.3,
      lastUpdated: new Date().toISOString()
    };
  }

  // Получение статистики анализа
  getAnalysisStatistics() {
    const analyses = Array.from(this.analysisCache.values());
    
    return {
      totalAnalyses: analyses.length,
      averageScore: analyses.length > 0 ? 
        Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length) : 0,
      averageConfidence: analyses.length > 0 ?
        Math.round(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length * 100) / 100 : 0,
      recommendationTypes: this.getRecommendationTypeStats(analyses),
      lastUpdated: new Date().toISOString()
    };
  }

  // Статистика по типам рекомендаций
  getRecommendationTypeStats(analyses) {
    const types = {};
    analyses.forEach(analysis => {
      analysis.recommendations.forEach(rec => {
        types[rec.type] = (types[rec.type] || 0) + 1;
      });
    });
    return types;
  }

  // Очистка кэша
  clearCache() {
    this.analysisCache.clear();
  }
}

// Экспорт экземпляра
export const competitivePriceAnalyzer = new CompetitivePriceAnalyzer();
