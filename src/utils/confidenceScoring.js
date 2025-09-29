// Система Confidence Scoring для максимальной точности
// Оценивает уверенность каждого предсказания и принимает решения на основе пороговых значений

export class ConfidenceScoringSystem {
  constructor() {
    this.thresholds = {
      high: 0.85,      // Высокая уверенность
      medium: 0.65,    // Средняя уверенность
      low: 0.45,       // Низкая уверенность
      minimum: 0.25    // Минимальная уверенность
    };
    
    this.weights = {
      tensorflow: 0.4,     // Вес TensorFlow.js предсказаний
      ocr: 0.3,            // Вес OCR предсказаний
      database: 0.2,       // Вес базы данных
      userFeedback: 0.1    // Вес обратной связи пользователей
    };
    
    this.confidenceHistory = [];
    this.accuracyMetrics = {
      totalPredictions: 0,
      correctPredictions: 0,
      falsePositives: 0,
      falseNegatives: 0
    };
  }

  // Основная функция оценки уверенности
  evaluateConfidence(predictions, context = {}) {
    const evaluatedPredictions = predictions.map(pred => ({
      ...pred,
      confidence: this.calculateConfidence(pred, context),
      riskLevel: this.assessRiskLevel(pred),
      recommendation: this.getRecommendation(pred)
    }));

    // Сортируем по уверенности
    evaluatedPredictions.sort((a, b) => b.confidence - a.confidence);

    return {
      predictions: evaluatedPredictions,
      overallConfidence: this.calculateOverallConfidence(evaluatedPredictions),
      qualityScore: this.calculateQualityScore(evaluatedPredictions),
      needsReview: this.needsReview(evaluatedPredictions),
      recommendations: this.getOverallRecommendations(evaluatedPredictions)
    };
  }

  // Расчет уверенности для отдельного предсказания
  calculateConfidence(prediction, context) {
    let confidence = prediction.confidence || 0;
    
    // Корректировка на основе метода
    switch (prediction.method) {
      case 'tensorflow_vision':
        confidence *= this.weights.tensorflow;
        break;
      case 'ocr_processing':
        confidence *= this.weights.ocr;
        break;
      case 'database_lookup':
        confidence *= this.weights.database;
        break;
      case 'user_feedback':
        confidence *= this.weights.userFeedback;
        break;
    }

    // Корректировка на основе контекста
    if (context.ingredientCount > 10) {
      confidence *= 0.9; // Штраф за сложные блюда
    }
    
    if (context.hasUncommonIngredients) {
      confidence *= 0.8; // Штраф за редкие ингредиенты
    }
    
    if (context.userExperience > 100) {
      confidence *= 1.1; // Бонус за опытного пользователя
    }

    // Корректировка на основе исторических данных
    const historicalAccuracy = this.getHistoricalAccuracy(prediction);
    confidence = (confidence + historicalAccuracy) / 2;

    return Math.max(0, Math.min(1, confidence));
  }

  // Оценка уровня риска
  assessRiskLevel(prediction) {
    const confidence = prediction.confidence || 0;
    
    if (confidence >= this.thresholds.high) {
      return 'low';
    } else if (confidence >= this.thresholds.medium) {
      return 'medium';
    } else if (confidence >= this.thresholds.low) {
      return 'high';
    } else {
      return 'critical';
    }
  }

  // Получение рекомендации
  getRecommendation(prediction) {
    const riskLevel = this.assessRiskLevel(prediction);
    
    switch (riskLevel) {
      case 'low':
        return 'Можно использовать без дополнительной проверки';
      case 'medium':
        return 'Рекомендуется проверить результат';
      case 'high':
        return 'Требуется ручная проверка';
      case 'critical':
        return 'Не рекомендуется использовать без подтверждения';
    }
  }

  // Расчет общей уверенности
  calculateOverallConfidence(predictions) {
    if (predictions.length === 0) return 0;
    
    const weightedSum = predictions.reduce((sum, pred) => {
      return sum + (pred.confidence * this.getMethodWeight(pred.method));
    }, 0);
    
    const totalWeight = predictions.reduce((sum, pred) => {
      return sum + this.getMethodWeight(pred.method);
    }, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Расчет веса метода
  getMethodWeight(method) {
    switch (method) {
      case 'tensorflow_vision': return this.weights.tensorflow;
      case 'ocr_processing': return this.weights.ocr;
      case 'database_lookup': return this.weights.database;
      case 'user_feedback': return this.weights.userFeedback;
      default: return 0.1;
    }
  }

  // Расчет качества предсказаний
  calculateQualityScore(predictions) {
    if (predictions.length === 0) return 0;
    
    const highConfidenceCount = predictions.filter(p => p.confidence >= this.thresholds.high).length;
    const mediumConfidenceCount = predictions.filter(p => 
      p.confidence >= this.thresholds.medium && p.confidence < this.thresholds.high
    ).length;
    
    const qualityScore = (
      highConfidenceCount * 1.0 +
      mediumConfidenceCount * 0.7 +
      (predictions.length - highConfidenceCount - mediumConfidenceCount) * 0.3
    ) / predictions.length;
    
    return Math.round(qualityScore * 100) / 100;
  }

  // Проверка необходимости пересмотра
  needsReview(predictions) {
    const lowConfidenceCount = predictions.filter(p => p.confidence < this.thresholds.medium).length;
    const criticalCount = predictions.filter(p => p.confidence < this.thresholds.low).length;
    
    return {
      needsReview: lowConfidenceCount > predictions.length * 0.3,
      needsManualCheck: criticalCount > 0,
      reviewReason: this.getReviewReason(predictions)
    };
  }

  // Получение причины пересмотра
  getReviewReason(predictions) {
    const reasons = [];
    
    const lowConfidenceCount = predictions.filter(p => p.confidence < this.thresholds.medium).length;
    if (lowConfidenceCount > 0) {
      reasons.push(`Низкая уверенность в ${lowConfidenceCount} предсказаниях`);
    }
    
    const criticalCount = predictions.filter(p => p.confidence < this.thresholds.low).length;
    if (criticalCount > 0) {
      reasons.push(`Критически низкая уверенность в ${criticalCount} предсказаниях`);
    }
    
    const overallConfidence = this.calculateOverallConfidence(predictions);
    if (overallConfidence < this.thresholds.medium) {
      reasons.push('Общая уверенность ниже среднего уровня');
    }
    
    return reasons;
  }

  // Получение общих рекомендаций
  getOverallRecommendations(predictions) {
    const recommendations = [];
    
    const overallConfidence = this.calculateOverallConfidence(predictions);
    
    if (overallConfidence < this.thresholds.low) {
      recommendations.push('Рекомендуется добавить больше информации об ингредиентах');
      recommendations.push('Попробуйте загрузить фото упаковки продукта');
    }
    
    if (overallConfidence < this.thresholds.medium) {
      recommendations.push('Проверьте правильность написания ингредиентов');
      recommendations.push('Убедитесь, что все ингредиенты указаны');
    }
    
    const highRiskCount = predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
    if (highRiskCount > 0) {
      recommendations.push(`Требуется ручная проверка ${highRiskCount} ингредиентов`);
    }
    
    return recommendations;
  }

  // Получение исторической точности
  getHistoricalAccuracy(prediction) {
    const method = prediction.method;
    const historicalData = this.confidenceHistory.filter(h => h.method === method);
    
    if (historicalData.length === 0) return 0.5;
    
    const accuracy = historicalData.reduce((sum, h) => sum + h.accuracy, 0) / historicalData.length;
    return accuracy;
  }

  // Запись результата для обучения
  recordResult(prediction, actualResult, wasCorrect) {
    this.confidenceHistory.push({
      method: prediction.method,
      confidence: prediction.confidence,
      accuracy: wasCorrect ? 1 : 0,
      timestamp: Date.now()
    });
    
    // Обновляем метрики
    this.accuracyMetrics.totalPredictions++;
    if (wasCorrect) {
      this.accuracyMetrics.correctPredictions++;
    } else {
      if (actualResult === null) {
        this.accuracyMetrics.falsePositives++;
      } else {
        this.accuracyMetrics.falseNegatives++;
      }
    }
    
    // Ограничиваем историю последними 1000 записями
    if (this.confidenceHistory.length > 1000) {
      this.confidenceHistory = this.confidenceHistory.slice(-1000);
    }
  }

  // Обновление пороговых значений
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Обновление весов методов
  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  // Получение статистики
  getStatistics() {
    const accuracy = this.accuracyMetrics.totalPredictions > 0 
      ? this.accuracyMetrics.correctPredictions / this.accuracyMetrics.totalPredictions 
      : 0;
    
    const precision = this.accuracyMetrics.correctPredictions > 0
      ? this.accuracyMetrics.correctPredictions / (this.accuracyMetrics.correctPredictions + this.accuracyMetrics.falsePositives)
      : 0;
    
    const recall = this.accuracyMetrics.correctPredictions > 0
      ? this.accuracyMetrics.correctPredictions / (this.accuracyMetrics.correctPredictions + this.accuracyMetrics.falseNegatives)
      : 0;
    
    return {
      accuracy: Math.round(accuracy * 100) / 100,
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      totalPredictions: this.accuracyMetrics.totalPredictions,
      confidenceHistory: this.confidenceHistory.length,
      thresholds: this.thresholds,
      weights: this.weights
    };
  }

  // Сброс статистики
  resetStatistics() {
    this.confidenceHistory = [];
    this.accuracyMetrics = {
      totalPredictions: 0,
      correctPredictions: 0,
      falsePositives: 0,
      falseNegatives: 0
    };
  }

  // Экспорт данных для анализа
  exportData() {
    return {
      confidenceHistory: this.confidenceHistory,
      accuracyMetrics: this.accuracyMetrics,
      thresholds: this.thresholds,
      weights: this.weights,
      exportDate: new Date().toISOString()
    };
  }
}

// Экспорт экземпляра
export const confidenceScoring = new ConfidenceScoringSystem();
