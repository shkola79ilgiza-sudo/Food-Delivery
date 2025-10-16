// AI-система проверки адекватности расчетов КБЖУ
// Сравнивает ручной ввод повара с автоматическим расчетом

import { smartNutritionCalculator } from './smartNutritionCalculator';

export class AInutritionValidator {
  constructor() {
    this.tolerancePercent = 15; // Допустимое отклонение в %
    this.warningThreshold = 10; // Порог для предупреждения
  }

  /**
   * Проверяет адекватность введенных поваром данных КБЖУ
   * @param {Object} manualData - Ручной ввод повара
   * @param {Array} ingredients - Список ингредиентов с весами
   * @returns {Object} Результат проверки
   */
  async validateNutrition(manualData, ingredients) {
    try {
      // Автоматический расчет через smartNutritionCalculator
      const ingredientsText = Array.isArray(ingredients) 
        ? ingredients.join(', ') 
        : ingredients;
      const autoCalculated = smartNutritionCalculator.calculateNutrition(ingredientsText);
      
      // Сравниваем данные
      const comparison = this.compareNutrition(manualData, autoCalculated);
      
      // Генерируем рекомендации
      const recommendations = this.generateRecommendations(comparison);
      
      // AI-анализ через внешний API (если нужно)
      const aiInsights = await this.getAIInsights(manualData, autoCalculated, ingredients);
      
      return {
        isValid: comparison.overallValid,
        confidence: comparison.confidence,
        manualData,
        autoCalculated,
        differences: comparison.differences,
        recommendations,
        aiInsights,
        needsReview: comparison.needsReview
      };
    } catch (error) {
      console.error('Ошибка валидации КБЖУ:', error);
      return {
        isValid: false,
        error: error.message,
        needsReview: true
      };
    }
  }

  /**
   * Сравнивает ручные и автоматические данные
   */
  compareNutrition(manual, auto) {
    const fields = ['calories', 'protein', 'carbs', 'fat'];
    const differences = {};
    let totalDeviation = 0;
    let needsReview = false;

    fields.forEach(field => {
      const manualValue = parseFloat(manual[field]) || 0;
      const autoValue = parseFloat(auto[field]) || 0;
      
      if (autoValue === 0) {
        differences[field] = {
          manual: manualValue,
          auto: autoValue,
          deviation: 0,
          deviationPercent: 0,
          status: 'unknown'
        };
        return;
      }

      const deviation = Math.abs(manualValue - autoValue);
      const deviationPercent = (deviation / autoValue) * 100;
      
      let status = 'ok';
      if (deviationPercent > this.tolerancePercent) {
        status = 'error';
        needsReview = true;
      } else if (deviationPercent > this.warningThreshold) {
        status = 'warning';
      }

      differences[field] = {
        manual: manualValue,
        auto: autoValue,
        deviation: deviation.toFixed(1),
        deviationPercent: deviationPercent.toFixed(1),
        status
      };

      totalDeviation += deviationPercent;
    });

    const averageDeviation = totalDeviation / fields.length;
    const overallValid = averageDeviation <= this.tolerancePercent;
    const confidence = Math.max(0, 100 - averageDeviation);

    return {
      differences,
      overallValid,
      needsReview,
      confidence: confidence.toFixed(1),
      averageDeviation: averageDeviation.toFixed(1)
    };
  }

  /**
   * Генерирует рекомендации для повара
   */
  generateRecommendations(comparison) {
    const recommendations = [];
    const { differences } = comparison;

    Object.keys(differences).forEach(field => {
      const diff = differences[field];
      const fieldNames = {
        calories: 'Калории',
        protein: 'Белки',
        carbs: 'Углеводы',
        fat: 'Жиры'
      };

      if (diff.status === 'error') {
        recommendations.push({
          type: 'error',
          field,
          message: `${fieldNames[field]}: Большое расхождение (${diff.deviationPercent}%). Ваш расчет: ${diff.manual}, автоматический: ${diff.auto}. Пожалуйста, перепроверьте данные.`,
          suggestion: this.getSuggestion(field, diff)
        });
      } else if (diff.status === 'warning') {
        recommendations.push({
          type: 'warning',
          field,
          message: `${fieldNames[field]}: Небольшое расхождение (${diff.deviationPercent}%). Рекомендуем проверить.`,
          suggestion: this.getSuggestion(field, diff)
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: '✅ Отлично! Ваши расчеты соответствуют автоматическим данным.',
        confidence: comparison.confidence
      });
    }

    return recommendations;
  }

  /**
   * Генерирует конкретные предложения по исправлению
   */
  getSuggestion(field, diff) {
    const suggestions = {
      calories: [
        'Проверьте вес ингредиентов',
        'Учтите калорийность масла для жарки',
        'Проверьте данные о калорийности основных ингредиентов'
      ],
      protein: [
        'Проверьте содержание белка в мясе/рыбе',
        'Учтите белок в молочных продуктах',
        'Проверьте вес белковых ингредиентов'
      ],
      carbs: [
        'Проверьте вес круп и макарон',
        'Учтите углеводы в овощах и фруктах',
        'Проверьте содержание сахара в соусах'
      ],
      fat: [
        'Проверьте количество масла',
        'Учтите жир в мясе и молочных продуктах',
        'Проверьте содержание жира в орехах и семенах'
      ]
    };

    const fieldSuggestions = suggestions[field] || [];
    const randomIndex = Math.floor(Math.random() * fieldSuggestions.length);
    return fieldSuggestions[randomIndex];
  }

  /**
   * Получает AI-инсайты через внешний API (опционально)
   */
  async getAIInsights(manual, auto, ingredients) {
    // Здесь можно интегрировать Gemini/ChatGPT для более глубокого анализа
    // Пока возвращаем базовый анализ
    
    const insights = [];

    // Анализ общей калорийности
    const caloriesDiff = Math.abs(manual.calories - auto.calories);
    if (caloriesDiff > 100) {
      insights.push({
        type: 'calories',
        message: `Большая разница в калориях (${caloriesDiff.toFixed(0)} ккал). Возможно, не учтен вес некоторых высококалорийных ингредиентов.`,
        priority: 'high'
      });
    }

    // Анализ соотношения БЖУ
    const manualTotal = parseFloat(manual.protein) + parseFloat(manual.carbs) + parseFloat(manual.fat);
    const autoTotal = parseFloat(auto.protein) + parseFloat(auto.carbs) + parseFloat(auto.fat);
    
    if (Math.abs(manualTotal - autoTotal) > 20) {
      insights.push({
        type: 'macros',
        message: 'Соотношение БЖУ значительно отличается. Рекомендуем использовать автоматический расчет как основу.',
        priority: 'medium'
      });
    }

    // Проверка на реалистичность
    if (manual.protein > manual.calories * 0.4) {
      insights.push({
        type: 'validation',
        message: 'Содержание белка кажется завышенным относительно общей калорийности.',
        priority: 'high'
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        message: 'Данные выглядят корректными и реалистичными.',
        priority: 'low'
      });
    }

    return insights;
  }

  /**
   * Форматирует результат для отображения повару
   */
  formatValidationResult(result) {
    if (result.error) {
      return {
        title: '❌ Ошибка валидации',
        message: result.error,
        type: 'error'
      };
    }

    if (!result.isValid) {
      return {
        title: '⚠️ Требуется проверка',
        message: 'Обнаружены значительные расхождения в расчетах КБЖУ.',
        details: result.recommendations,
        confidence: result.confidence,
        type: 'warning'
      };
    }

    return {
      title: '✅ Данные проверены',
      message: `Ваши расчеты корректны (точность: ${result.confidence}%)`,
      type: 'success'
    };
  }
}

// Экспортируем singleton
export const aiNutritionValidator = new AInutritionValidator();

