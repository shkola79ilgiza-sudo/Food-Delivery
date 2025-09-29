// Система обратной связи от пользователей для улучшения точности
// Собирает и анализирует корректировки пользователей

export class UserFeedbackSystem {
  constructor() {
    this.feedbackData = this.loadFeedbackData();
    this.corrections = this.loadCorrections();
    this.learningRate = 0.1;
    this.minFeedbackThreshold = 3; // Минимум отзывов для применения изменений
  }

  // Загрузка данных обратной связи
  loadFeedbackData() {
    const saved = localStorage.getItem('userFeedbackData');
    return saved ? JSON.parse(saved) : {
      corrections: {},
      ratings: {},
      suggestions: {},
      statistics: {
        totalFeedback: 0,
        averageRating: 0,
        improvementRate: 0
      }
    };
  }

  // Загрузка корректировок
  loadCorrections() {
    const saved = localStorage.getItem('userCorrections');
    return saved ? JSON.parse(saved) : {};
  }

  // Сохранение данных
  saveData() {
    localStorage.setItem('userFeedbackData', JSON.stringify(this.feedbackData));
    localStorage.setItem('userCorrections', JSON.stringify(this.corrections));
  }

  // Добавление корректировки ингредиента
  addIngredientCorrection(originalIngredient, correctedIngredient, userConfidence = 1.0) {
    const key = originalIngredient.toLowerCase();
    
    if (!this.corrections[key]) {
      this.corrections[key] = {
        suggestions: [],
        confidence: 0,
        usageCount: 0
      };
    }
    
    this.corrections[key].suggestions.push({
      correction: correctedIngredient,
      confidence: userConfidence,
      timestamp: Date.now()
    });
    
    this.corrections[key].usageCount++;
    this.updateCorrectionConfidence(key);
    
    this.saveData();
    return true;
  }

  // Добавление корректировки питательной ценности
  addNutritionCorrection(ingredient, originalNutrition, correctedNutrition, userConfidence = 1.0) {
    const key = ingredient.toLowerCase();
    
    if (!this.feedbackData.corrections[key]) {
      this.feedbackData.corrections[key] = {
        nutrition: [],
        averageCorrection: null
      };
    }
    
    const correction = {
      original: originalNutrition,
      corrected: correctedNutrition,
      confidence: userConfidence,
      timestamp: Date.now()
    };
    
    this.feedbackData.corrections[key].nutrition.push(correction);
    this.updateNutritionCorrection(key);
    
    this.feedbackData.statistics.totalFeedback++;
    this.saveData();
    
    return true;
  }

  // Добавление рейтинга точности
  addAccuracyRating(ingredient, rating, comment = '') {
    const key = ingredient.toLowerCase();
    
    if (!this.feedbackData.ratings[key]) {
      this.feedbackData.ratings[key] = {
        ratings: [],
        averageRating: 0
      };
    }
    
    this.feedbackData.ratings[key].ratings.push({
      rating: Math.max(1, Math.min(5, rating)), // Ограничиваем 1-5
      comment,
      timestamp: Date.now()
    });
    
    this.updateAverageRating(key);
    this.feedbackData.statistics.totalFeedback++;
    this.saveData();
    
    return true;
  }

  // Добавление предложения по улучшению
  addSuggestion(suggestion, category = 'general') {
    const suggestionId = Date.now().toString();
    
    this.feedbackData.suggestions[suggestionId] = {
      text: suggestion,
      category,
      timestamp: Date.now(),
      status: 'pending',
      votes: 0
    };
    
    this.feedbackData.statistics.totalFeedback++;
    this.saveData();
    
    return suggestionId;
  }

  // Обновление уверенности корректировки
  updateCorrectionConfidence(key) {
    const correction = this.corrections[key];
    if (!correction || correction.suggestions.length === 0) return;
    
    // Взвешенное среднее по уверенности
    const totalWeight = correction.suggestions.reduce((sum, s) => sum + s.confidence, 0);
    const weightedSum = correction.suggestions.reduce((sum, s) => 
      sum + (s.confidence * s.confidence), 0
    );
    
    correction.confidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Обновление корректировки питательной ценности
  updateNutritionCorrection(key) {
    const correction = this.feedbackData.corrections[key];
    if (!correction || correction.nutrition.length === 0) return;
    
    // Вычисляем среднюю корректировку
    const avgCorrection = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    correction.nutrition.forEach(corr => {
      avgCorrection.calories += (corr.corrected.calories - corr.original.calories) * corr.confidence;
      avgCorrection.protein += (corr.corrected.protein - corr.original.protein) * corr.confidence;
      avgCorrection.carbs += (corr.corrected.carbs - corr.original.carbs) * corr.confidence;
      avgCorrection.fat += (corr.corrected.fat - corr.original.fat) * corr.confidence;
    });
    
    const totalConfidence = correction.nutrition.reduce((sum, c) => sum + c.confidence, 0);
    
    if (totalConfidence > 0) {
      avgCorrection.calories /= totalConfidence;
      avgCorrection.protein /= totalConfidence;
      avgCorrection.carbs /= totalConfidence;
      avgCorrection.fat /= totalConfidence;
    }
    
    correction.averageCorrection = avgCorrection;
  }

  // Обновление среднего рейтинга
  updateAverageRating(key) {
    const rating = this.feedbackData.ratings[key];
    if (!rating || rating.ratings.length === 0) return;
    
    const sum = rating.ratings.reduce((sum, r) => sum + r.rating, 0);
    rating.averageRating = sum / rating.ratings.length;
  }

  // Получение рекомендации для ингредиента
  getIngredientRecommendation(ingredient) {
    const key = ingredient.toLowerCase();
    
    // Проверяем корректировки
    if (this.corrections[key] && this.corrections[key].confidence > 0.7) {
      const bestSuggestion = this.corrections[key].suggestions
        .sort((a, b) => b.confidence - a.confidence)[0];
      
      return {
        type: 'correction',
        suggestion: bestSuggestion.correction,
        confidence: this.corrections[key].confidence,
        usageCount: this.corrections[key].usageCount
      };
    }
    
    // Проверяем рейтинги
    if (this.feedbackData.ratings[key] && this.feedbackData.ratings[key].averageRating < 3) {
      return {
        type: 'low_rating',
        suggestion: 'Проверьте правильность написания ингредиента',
        confidence: 0.8,
        averageRating: this.feedbackData.ratings[key].averageRating
      };
    }
    
    return null;
  }

  // Применение корректировки к питательной ценности
  applyNutritionCorrection(ingredient, originalNutrition) {
    const key = ingredient.toLowerCase();
    const correction = this.feedbackData.corrections[key];
    
    if (!correction || !correction.averageCorrection || correction.nutrition.length < this.minFeedbackThreshold) {
      return originalNutrition;
    }
    
    const avgCorrection = correction.averageCorrection;
    
    return {
      calories: Math.round(originalNutrition.calories + avgCorrection.calories),
      protein: Math.round((originalNutrition.protein + avgCorrection.protein) * 10) / 10,
      carbs: Math.round((originalNutrition.carbs + avgCorrection.carbs) * 10) / 10,
      fat: Math.round((originalNutrition.fat + avgCorrection.fat) * 10) / 10
    };
  }

  // Получение статистики обратной связи
  getFeedbackStatistics() {
    const totalCorrections = Object.keys(this.corrections).length;
    const totalRatings = Object.keys(this.feedbackData.ratings).length;
    const totalSuggestions = Object.keys(this.feedbackData.suggestions).length;
    
    const averageRating = Object.values(this.feedbackData.ratings)
      .reduce((sum, r) => sum + r.averageRating, 0) / Math.max(1, totalRatings);
    
    const improvementRate = this.calculateImprovementRate();
    
    return {
      totalCorrections,
      totalRatings,
      totalSuggestions,
      averageRating: Math.round(averageRating * 10) / 10,
      improvementRate: Math.round(improvementRate * 100) / 100,
      totalFeedback: this.feedbackData.statistics.totalFeedback
    };
  }

  // Расчет темпа улучшения
  calculateImprovementRate() {
    const recentCorrections = Object.values(this.corrections)
      .filter(c => c.suggestions.some(s => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000))
      .length;
    
    const totalCorrections = Object.keys(this.corrections).length;
    
    return totalCorrections > 0 ? recentCorrections / totalCorrections : 0;
  }

  // Получение популярных предложений
  getPopularSuggestions(limit = 5) {
    return Object.values(this.feedbackData.suggestions)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  // Голосование за предложение
  voteSuggestion(suggestionId, vote = 1) {
    if (this.feedbackData.suggestions[suggestionId]) {
      this.feedbackData.suggestions[suggestionId].votes += vote;
      this.saveData();
      return true;
    }
    return false;
  }

  // Экспорт данных для анализа
  exportFeedbackData() {
    return {
      corrections: this.corrections,
      feedback: this.feedbackData,
      statistics: this.getFeedbackStatistics(),
      exportDate: new Date().toISOString()
    };
  }

  // Импорт данных
  importFeedbackData(data) {
    if (data.corrections) {
      this.corrections = { ...this.corrections, ...data.corrections };
    }
    if (data.feedback) {
      this.feedbackData = { ...this.feedbackData, ...data.feedback };
    }
    this.saveData();
    return true;
  }

  // Сброс всех данных
  resetAllData() {
    this.corrections = {};
    this.feedbackData = {
      corrections: {},
      ratings: {},
      suggestions: {},
      statistics: {
        totalFeedback: 0,
        averageRating: 0,
        improvementRate: 0
      }
    };
    this.saveData();
  }
}

// Экспорт экземпляра
export const userFeedbackSystem = new UserFeedbackSystem();
