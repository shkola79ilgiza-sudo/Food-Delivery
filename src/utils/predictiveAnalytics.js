// Предиктивная аналитика на основе истории использования
// Анализирует паттерны и предсказывает наиболее вероятные значения

export class PredictiveAnalytics {
  constructor() {
    this.historyData = this.loadHistoryData();
    this.patterns = this.initializePatterns();
    this.predictions = new Map();
    this.learningRate = 0.05;
    this.minDataPoints = 5;
  }

  // Загрузка исторических данных
  loadHistoryData() {
    const saved = localStorage.getItem('predictiveAnalyticsData');
    return saved ? JSON.parse(saved) : {
      ingredientUsage: {},
      nutritionPatterns: {},
      seasonalData: {},
      userPreferences: {},
      accuracyHistory: []
    };
  }

  // Сохранение данных
  saveHistoryData() {
    localStorage.setItem('predictiveAnalyticsData', JSON.stringify(this.historyData));
  }

  // Инициализация паттернов
  initializePatterns() {
    return {
      seasonal: {
        spring: ['зелень', 'редис', 'щавель', 'крапива'],
        summer: ['помидоры', 'огурцы', 'кабачки', 'баклажаны'],
        autumn: ['тыква', 'капуста', 'свекла', 'морковь'],
        winter: ['картофель', 'лук', 'чеснок', 'корнеплоды']
      },
      regional: {
        'ru': ['борщ', 'щи', 'окрошка', 'пельмени'],
        'tt': ['эчпочмак', 'губадия', 'кыстыбый', 'чак-чак'],
        'en': ['burger', 'pizza', 'pasta', 'salad']
      },
      timeBased: {
        breakfast: ['яйца', 'молоко', 'хлеб', 'масло'],
        lunch: ['суп', 'мясо', 'гарнир', 'салат'],
        dinner: ['рыба', 'овощи', 'творог', 'кефир']
      }
    };
  }

  // Добавление записи об использовании
  addUsageRecord(ingredient, nutrition, context = {}) {
    const timestamp = Date.now();
    const season = this.getCurrentSeason();
    const timeOfDay = this.getTimeOfDay();
    
    const record = {
      ingredient: ingredient.toLowerCase(),
      nutrition,
      context: {
        ...context,
        season,
        timeOfDay,
        timestamp
      }
    };
    
    // Добавляем в историю ингредиентов
    if (!this.historyData.ingredientUsage[ingredient]) {
      this.historyData.ingredientUsage[ingredient] = [];
    }
    this.historyData.ingredientUsage[ingredient].push(record);
    
    // Ограничиваем историю последними 100 записями
    if (this.historyData.ingredientUsage[ingredient].length > 100) {
      this.historyData.ingredientUsage[ingredient] = 
        this.historyData.ingredientUsage[ingredient].slice(-100);
    }
    
    // Обновляем паттерны
    this.updatePatterns(record);
    
    this.saveHistoryData();
  }

  // Предсказание питательной ценности
  predictNutrition(ingredient, context = {}) {
    const key = `${ingredient}_${JSON.stringify(context)}`;
    
    if (this.predictions.has(key)) {
      const prediction = this.predictions.get(key);
      if (Date.now() - prediction.timestamp < 5 * 60 * 1000) { // 5 минут кеш
        return prediction.data;
      }
    }
    
    const prediction = this.calculatePrediction(ingredient, context);
    this.predictions.set(key, {
      data: prediction,
      timestamp: Date.now()
    });
    
    return prediction;
  }

  // Расчет предсказания
  calculatePrediction(ingredient, context) {
    const ingredientHistory = this.historyData.ingredientUsage[ingredient.toLowerCase()];
    
    if (!ingredientHistory || ingredientHistory.length < this.minDataPoints) {
      return this.getFallbackPrediction(ingredient, context);
    }
    
    // Анализируем исторические данные
    const recentData = this.getRecentData(ingredientHistory, 30); // Последние 30 дней
    const seasonalData = this.getSeasonalData(ingredientHistory, context.season);
    const contextualData = this.getContextualData(ingredientHistory, context);
    
    // Комбинируем предсказания
    const predictions = [
      this.predictFromHistory(recentData),
      this.predictFromSeason(seasonalData),
      this.predictFromContext(contextualData)
    ].filter(p => p !== null);
    
    if (predictions.length === 0) {
      return this.getFallbackPrediction(ingredient, context);
    }
    
    // Взвешенное среднее
    const weights = [0.5, 0.3, 0.2]; // Веса для разных типов предсказаний
    const weightedPrediction = this.calculateWeightedAverage(predictions, weights);
    
    return {
      nutrition: weightedPrediction,
      confidence: this.calculateConfidence(predictions),
      method: 'predictive_analytics',
      dataPoints: predictions.length
    };
  }

  // Предсказание на основе истории
  predictFromHistory(data) {
    if (data.length < 2) return null;
    
    const avgNutrition = this.calculateAverageNutrition(data);
    const trend = this.calculateTrend(data);
    
    return {
      nutrition: this.applyTrend(avgNutrition, trend),
      confidence: Math.min(0.9, data.length / 20),
      type: 'history'
    };
  }

  // Предсказание на основе сезона
  predictFromSeason(data) {
    if (data.length < 2) return null;
    
    const avgNutrition = this.calculateAverageNutrition(data);
    
    return {
      nutrition: avgNutrition,
      confidence: 0.7,
      type: 'seasonal'
    };
  }

  // Предсказание на основе контекста
  predictFromContext(data) {
    if (data.length < 2) return null;
    
    const avgNutrition = this.calculateAverageNutrition(data);
    
    return {
      nutrition: avgNutrition,
      confidence: 0.6,
      type: 'contextual'
    };
  }

  // Расчет среднего значения питательной ценности
  calculateAverageNutrition(data) {
    const sum = data.reduce((acc, record) => ({
      calories: acc.calories + record.nutrition.calories,
      protein: acc.protein + record.nutrition.protein,
      carbs: acc.carbs + record.nutrition.carbs,
      fat: acc.fat + record.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    const count = data.length;
    
    return {
      calories: Math.round(sum.calories / count),
      protein: Math.round((sum.protein / count) * 10) / 10,
      carbs: Math.round((sum.carbs / count) * 10) / 10,
      fat: Math.round((sum.fat / count) * 10) / 10
    };
  }

  // Расчет тренда
  calculateTrend(data) {
    if (data.length < 3) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const sortedData = data.sort((a, b) => a.context.timestamp - b.context.timestamp);
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstAvg = this.calculateAverageNutrition(firstHalf);
    const secondAvg = this.calculateAverageNutrition(secondHalf);
    
    return {
      calories: (secondAvg.calories - firstAvg.calories) * this.learningRate,
      protein: (secondAvg.protein - firstAvg.protein) * this.learningRate,
      carbs: (secondAvg.carbs - firstAvg.carbs) * this.learningRate,
      fat: (secondAvg.fat - firstAvg.fat) * this.learningRate
    };
  }

  // Применение тренда
  applyTrend(nutrition, trend) {
    return {
      calories: Math.round(nutrition.calories + trend.calories),
      protein: Math.round((nutrition.protein + trend.protein) * 10) / 10,
      carbs: Math.round((nutrition.carbs + trend.carbs) * 10) / 10,
      fat: Math.round((nutrition.fat + trend.fat) * 10) / 10
    };
  }

  // Расчет взвешенного среднего
  calculateWeightedAverage(predictions, weights) {
    const weightedSum = predictions.reduce((acc, pred, index) => ({
      calories: acc.calories + pred.nutrition.calories * weights[index],
      protein: acc.protein + pred.nutrition.protein * weights[index],
      carbs: acc.carbs + pred.nutrition.carbs * weights[index],
      fat: acc.fat + pred.nutrition.fat * weights[index]
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    return {
      calories: Math.round(weightedSum.calories / totalWeight),
      protein: Math.round((weightedSum.protein / totalWeight) * 10) / 10,
      carbs: Math.round((weightedSum.carbs / totalWeight) * 10) / 10,
      fat: Math.round((weightedSum.fat / totalWeight) * 10) / 10
    };
  }

  // Расчет уверенности
  calculateConfidence(predictions) {
    if (predictions.length === 0) return 0.3;
    
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const dataPointsBonus = Math.min(0.2, predictions.length * 0.02);
    
    return Math.min(0.95, avgConfidence + dataPointsBonus);
  }

  // Получение недавних данных
  getRecentData(history, days) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return history.filter(record => record.context.timestamp > cutoff);
  }

  // Получение сезонных данных
  getSeasonalData(history, season) {
    if (!season) return history;
    return history.filter(record => record.context.season === season);
  }

  // Получение контекстных данных
  getContextualData(history, context) {
    return history.filter(record => {
      return Object.keys(context).every(key => 
        record.context[key] === context[key]
      );
    });
  }

  // Получение текущего сезона
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  // Получение времени дня
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'breakfast';
    if (hour >= 12 && hour < 18) return 'lunch';
    return 'dinner';
  }

  // Резервное предсказание
  getFallbackPrediction(ingredient, context) {
    return {
      nutrition: { calories: 100, protein: 5, carbs: 15, fat: 3 },
      confidence: 0.3,
      method: 'fallback',
      dataPoints: 0
    };
  }

  // Обновление паттернов
  updatePatterns(record) {
    // Обновляем сезонные паттерны
    const season = record.context.season;
    if (!this.historyData.seasonalData[season]) {
      this.historyData.seasonalData[season] = {};
    }
    
    if (!this.historyData.seasonalData[season][record.ingredient]) {
      this.historyData.seasonalData[season][record.ingredient] = [];
    }
    
    this.historyData.seasonalData[season][record.ingredient].push(record);
  }

  // Получение статистики
  getStatistics() {
    const totalRecords = Object.values(this.historyData.ingredientUsage)
      .reduce((sum, records) => sum + records.length, 0);
    
    const uniqueIngredients = Object.keys(this.historyData.ingredientUsage).length;
    
    const avgConfidence = this.historyData.accuracyHistory.length > 0
      ? this.historyData.accuracyHistory.reduce((sum, acc) => sum + acc, 0) / this.historyData.accuracyHistory.length
      : 0;
    
    return {
      totalRecords,
      uniqueIngredients,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      predictionsCache: this.predictions.size,
      lastUpdate: new Date().toISOString()
    };
  }

  // Очистка старых данных
  cleanupOldData(daysToKeep = 90) {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    Object.keys(this.historyData.ingredientUsage).forEach(ingredient => {
      this.historyData.ingredientUsage[ingredient] = 
        this.historyData.ingredientUsage[ingredient].filter(record => 
          record.context.timestamp > cutoff
        );
    });
    
    this.saveHistoryData();
  }

  // Сброс всех данных
  resetAllData() {
    this.historyData = {
      ingredientUsage: {},
      nutritionPatterns: {},
      seasonalData: {},
      userPreferences: {},
      accuracyHistory: []
    };
    this.predictions.clear();
    this.saveHistoryData();
  }
}

// Экспорт экземпляра
export const predictiveAnalytics = new PredictiveAnalytics();
