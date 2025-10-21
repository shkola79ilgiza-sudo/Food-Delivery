// Простая система машинного обучения для улучшения распознавания ингредиентов
// Использует статистический анализ и паттерны для повышения точности

export class IngredientML {
  constructor() {
    this.learningData = this.loadLearningData();
    this.patterns = this.initializePatterns();
    this.confidenceThreshold = 0.7;
  }

  // Загрузка данных для обучения
  loadLearningData() {
    const saved = localStorage.getItem("ingredientMLData");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      successfulMatches: {},
      failedMatches: {},
      userCorrections: {},
      patterns: {},
      statistics: {
        totalQueries: 0,
        successfulQueries: 0,
        accuracy: 0,
      },
    };
  }

  // Сохранение данных обучения
  saveLearningData() {
    localStorage.setItem("ingredientMLData", JSON.stringify(this.learningData));
  }

  // Инициализация паттернов
  initializePatterns() {
    return {
      // Паттерны для мясных продуктов
      meat: {
        keywords: [
          "мясо",
          "говядина",
          "свинина",
          "баранина",
          "телятина",
          "фарш",
        ],
        patterns: [
          /(\w+)\s*мясо/,
          /мясо\s*(\w+)/,
          /(\w+)\s*фарш/,
          /фарш\s*(\w+)/,
        ],
        confidence: 0.9,
      },

      // Паттерны для овощей
      vegetables: {
        keywords: [
          "овощ",
          "помидор",
          "огурец",
          "морковь",
          "лук",
          "картофель",
          "капуста",
        ],
        patterns: [
          /(\w+)\s*овощ/,
          /овощ\s*(\w+)/,
          /свежий\s*(\w+)/,
          /(\w+)\s*свежий/,
        ],
        confidence: 0.8,
      },

      // Паттерны для молочных продуктов
      dairy: {
        keywords: ["молоко", "сыр", "творог", "сметана", "йогурт", "кефир"],
        patterns: [
          /(\w+)\s*молоко/,
          /молоко\s*(\w+)/,
          /(\w+)\s*сыр/,
          /сыр\s*(\w+)/,
        ],
        confidence: 0.85,
      },

      // Паттерны для специй
      spices: {
        keywords: ["соль", "перец", "специи", "приправы", "травы", "зелень"],
        patterns: [
          /(\w+)\s*соль/,
          /соль\s*(\w+)/,
          /(\w+)\s*перец/,
          /перец\s*(\w+)/,
        ],
        confidence: 0.7,
      },
    };
  }

  // Обучение на основе успешных совпадений
  learnFromSuccess(ingredient, matchedKey, confidence) {
    if (!this.learningData.successfulMatches[ingredient]) {
      this.learningData.successfulMatches[ingredient] = [];
    }

    this.learningData.successfulMatches[ingredient].push({
      matchedKey,
      confidence,
      timestamp: Date.now(),
    });

    this.updateStatistics(true);
    this.saveLearningData();
  }

  // Обучение на основе неудачных совпадений
  learnFromFailure(ingredient, attemptedKeys) {
    if (!this.learningData.failedMatches[ingredient]) {
      this.learningData.failedMatches[ingredient] = [];
    }

    this.learningData.failedMatches[ingredient].push({
      attemptedKeys,
      timestamp: Date.now(),
    });

    this.updateStatistics(false);
    this.saveLearningData();
  }

  // Обучение на основе пользовательских исправлений
  learnFromCorrection(ingredient, userCorrection) {
    this.learningData.userCorrections[ingredient] = {
      correction: userCorrection,
      timestamp: Date.now(),
    };

    this.updateStatistics(true);
    this.saveLearningData();
  }

  // Обновление статистики
  updateStatistics(success) {
    this.learningData.statistics.totalQueries++;
    if (success) {
      this.learningData.statistics.successfulQueries++;
    }

    this.learningData.statistics.accuracy =
      this.learningData.statistics.successfulQueries /
      this.learningData.statistics.totalQueries;
  }

  // Умное распознавание ингредиента с использованием ML
  smartRecognize(ingredient, nutritionDatabase) {
    const normalized = ingredient.toLowerCase().trim();

    // Проверяем пользовательские исправления
    if (this.learningData.userCorrections[normalized]) {
      const correction =
        this.learningData.userCorrections[normalized].correction;
      if (nutritionDatabase[correction]) {
        return {
          key: correction,
          confidence: 0.95,
          source: "user_correction",
        };
      }
    }

    // Проверяем историю успешных совпадений
    if (this.learningData.successfulMatches[normalized]) {
      const history = this.learningData.successfulMatches[normalized];
      const mostRecent = history[history.length - 1];

      if (nutritionDatabase[mostRecent.matchedKey]) {
        return {
          key: mostRecent.matchedKey,
          confidence: Math.min(mostRecent.confidence + 0.1, 0.95),
          source: "learning_history",
        };
      }
    }

    // Применяем паттерны
    const patternMatch = this.applyPatterns(normalized, nutritionDatabase);
    if (patternMatch) {
      return patternMatch;
    }

    // Стандартное распознавание
    const standardMatch = this.standardRecognize(normalized, nutritionDatabase);
    if (standardMatch) {
      return standardMatch;
    }

    return null;
  }

  // Применение паттернов
  applyPatterns(ingredient, nutritionDatabase) {
    for (const [patternData] of Object.entries(this.patterns)) {
      // category не используется
      // Проверяем ключевые слова
      for (const keyword of patternData.keywords) {
        if (ingredient.includes(keyword)) {
          // Ищем точное совпадение с ключевым словом
          if (nutritionDatabase[keyword]) {
            return {
              key: keyword,
              confidence: patternData.confidence,
              source: "pattern_keyword",
            };
          }

          // Ищем частичные совпадения
          const partialMatches = Object.keys(nutritionDatabase)
            .filter((key) => key.includes(keyword) || keyword.includes(key))
            .sort((a, b) => b.length - a.length);

          if (partialMatches.length > 0) {
            return {
              key: partialMatches[0],
              confidence: patternData.confidence * 0.8,
              source: "pattern_partial",
            };
          }
        }
      }

      // Применяем регулярные выражения
      for (const pattern of patternData.patterns) {
        const match = ingredient.match(pattern);
        if (match) {
          const extracted = match[1];
          if (nutritionDatabase[extracted]) {
            return {
              key: extracted,
              confidence: patternData.confidence * 0.7,
              source: "pattern_regex",
            };
          }
        }
      }
    }

    return null;
  }

  // Стандартное распознавание
  standardRecognize(ingredient, nutritionDatabase) {
    // Точное совпадение
    if (nutritionDatabase[ingredient]) {
      return {
        key: ingredient,
        confidence: 1.0,
        source: "exact_match",
      };
    }

    // Поиск по частичному совпадению
    const matches = Object.keys(nutritionDatabase)
      .filter((key) => {
        const keyLower = key.toLowerCase();
        return ingredient.includes(keyLower) || keyLower.includes(ingredient);
      })
      .sort((a, b) => {
        // Приоритет: точное совпадение > длина ключа
        if (ingredient === a.toLowerCase()) return -1;
        if (ingredient === b.toLowerCase()) return 1;
        return b.length - a.length;
      });

    if (matches.length > 0) {
      const confidence = matches[0].toLowerCase() === ingredient ? 0.9 : 0.7;
      return {
        key: matches[0],
        confidence,
        source: "partial_match",
      };
    }

    return null;
  }

  // Получение рекомендаций для улучшения
  getRecommendations() {
    const recommendations = [];

    // Анализ неудачных совпадений
    const failedCount = Object.keys(this.learningData.failedMatches).length;
    if (failedCount > 10) {
      recommendations.push({
        type: "warning",
        message: `Обнаружено ${failedCount} неудачных попыток распознавания. Рассмотрите возможность добавления новых ингредиентов в базу данных.`,
      });
    }

    // Анализ точности
    if (this.learningData.statistics.accuracy < 0.8) {
      recommendations.push({
        type: "suggestion",
        message: `Текущая точность распознавания: ${(
          this.learningData.statistics.accuracy * 100
        ).toFixed(1)}%. Используйте более точные названия ингредиентов.`,
      });
    }

    // Анализ популярных неудачных запросов
    const popularFailures = Object.entries(this.learningData.failedMatches)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);

    if (popularFailures.length > 0) {
      recommendations.push({
        type: "info",
        message: `Часто не распознаются: ${popularFailures
          .map(([ingredient]) => ingredient)
          .join(", ")}`,
      });
    }

    return recommendations;
  }

  // Получение статистики
  getStatistics() {
    return {
      ...this.learningData.statistics,
      totalIngredients: Object.keys(this.learningData.successfulMatches).length,
      userCorrections: Object.keys(this.learningData.userCorrections).length,
      failedIngredients: Object.keys(this.learningData.failedMatches).length,
    };
  }

  // Сброс данных обучения
  resetLearningData() {
    this.learningData = {
      successfulMatches: {},
      failedMatches: {},
      userCorrections: {},
      patterns: {},
      statistics: {
        totalQueries: 0,
        successfulQueries: 0,
        accuracy: 0,
      },
    };
    this.saveLearningData();
  }
}

// Экспорт экземпляра для использования
export const ingredientML = new IngredientML();
