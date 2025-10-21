/**
 * AI Conscience Checker - Анализатор этичности и соответствия диете
 * Проверяет блюда на соответствие заявленным характеристикам и этическим стандартам
 */

class AIConscienceChecker {
  constructor() {
    this.dietaryStandards = {
      vegetarian: {
        forbidden: [
          "мясо",
          "курица",
          "говядина",
          "свинина",
          "баранина",
          "рыба",
          "морепродукты",
          "креветки",
          "краб",
          "лосось",
          "тунец",
          "колбаса",
          "сосиски",
          "бекон",
          "ветчина",
          "сало",
        ],
        allowed: [
          "овощи",
          "фрукты",
          "зерновые",
          "бобовые",
          "орехи",
          "семена",
          "молочные продукты",
          "яйца",
        ],
        strictness: "medium",
      },
      vegan: {
        forbidden: [
          "мясо",
          "курица",
          "говядина",
          "свинина",
          "баранина",
          "рыба",
          "морепродукты",
          "молоко",
          "сыр",
          "творог",
          "йогурт",
          "сметана",
          "масло",
          "сливки",
          "яйца",
          "майонез",
          "мед",
        ],
        allowed: [
          "овощи",
          "фрукты",
          "зерновые",
          "бобовые",
          "орехи",
          "семена",
          "тофу",
          "соевое молоко",
        ],
        strictness: "high",
      },
      halal: {
        forbidden: [
          "свинина",
          "алкоголь",
          "желатин свиной",
          "сало",
          "бекон",
          "ветчина",
          "колбаса свиная",
        ],
        allowed: [
          "говядина",
          "баранина",
          "курица",
          "рыба",
          "овощи",
          "фрукты",
          "зерновые",
        ],
        strictness: "high",
      },
      kosher: {
        forbidden: [
          "свинина",
          "моллюски",
          "ракообразные",
          "смешение мяса и молока",
          "алкоголь некошерный",
        ],
        allowed: [
          "говядина кошерная",
          "курица кошерная",
          "рыба с чешуей",
          "овощи",
          "фрукты",
        ],
        strictness: "high",
      },
      gluten_free: {
        forbidden: [
          "пшеница",
          "рожь",
          "ячмень",
          "овёс",
          "глютен",
          "мука пшеничная",
          "хлеб",
          "макароны",
          "паста",
        ],
        allowed: [
          "рис",
          "кукуруза",
          "картофель",
          "овощи",
          "фрукты",
          "мясо",
          "рыба",
        ],
        strictness: "high",
      },
    };

    this.ethicalStandards = {
      organic: {
        forbidden: [
          "пестициды",
          "гербициды",
          "гмо",
          "генетически модифицированный",
          "химические удобрения",
        ],
        indicators: ["органический", "био", "эко", "без пестицидов"],
        strictness: "medium",
      },
      fair_trade: {
        indicators: [
          "справедливая торговля",
          "fair trade",
          "поддержка фермеров",
        ],
        strictness: "low",
      },
      sustainable: {
        forbidden: ["пальмовое масло", "вырубка лесов", "чрезмерный вылов"],
        indicators: [
          "устойчивое производство",
          "экологически чистый",
          "местные продукты",
        ],
        strictness: "medium",
      },
      cruelty_free: {
        forbidden: [
          "тестирование на животных",
          "животные продукты из промышленного производства",
        ],
        indicators: ["cruelty free", "без жестокости", "этичное производство"],
        strictness: "high",
      },
    };

    this.nutritionalPurity = {
      artificial_additives: [
        "консерванты",
        "красители",
        "усилители вкуса",
        "глутамат натрия",
        "e621",
        "e250",
        "e252",
      ],
      natural_indicators: [
        "натуральный",
        "без консервантов",
        "без красителей",
        "домашний",
        "свежий",
      ],
      processing_levels: {
        minimal: ["сырой", "свежий", "натуральный"],
        moderate: ["вареный", "тушеный", "запеченный"],
        high: ["жареный", "копченый", "консервированный", "замороженный"],
      },
    };

    this.healthWarnings = {
      high_sodium: {
        threshold: 600, // мг на 100г
        warning: "Высокое содержание натрия может повышать давление",
      },
      high_sugar: {
        threshold: 15, // г на 100г
        warning: "Высокое содержание сахара может способствовать набору веса",
      },
      high_fat: {
        threshold: 20, // г на 100г
        warning: "Высокое содержание жиров может повышать холестерин",
      },
      low_fiber: {
        threshold: 3, // г на 100г
        warning: "Низкое содержание клетчатки может замедлить пищеварение",
      },
    };
  }

  /**
   * Анализирует блюдо на соответствие этическим и диетическим стандартам
   * @param {Object} dish - Блюдо для анализа
   * @param {Array} claimedStandards - Заявленные стандарты (веган, халяль и т.д.)
   * @returns {Object} Результат анализа
   */
  async analyzeDish(dish, claimedStandards = []) {
    console.log("🔍 Starting AI Conscience Analysis...", {
      dish: dish.name,
      claimedStandards,
    });

    try {
      const analysis = {
        dishId: dish.id,
        dishName: dish.name,
        claimedStandards: claimedStandards,
        results: {
          dietaryCompliance: {},
          ethicalCompliance: {},
          nutritionalPurity: {},
          healthWarnings: [],
          overallScore: 0,
          recommendations: [],
        },
        timestamp: new Date().toISOString(),
      };

      // 1. Проверяем соответствие диетическим стандартам
      analysis.results.dietaryCompliance = await this.checkDietaryCompliance(
        dish,
        claimedStandards
      );

      // 2. Проверяем этические стандарты
      analysis.results.ethicalCompliance = await this.checkEthicalCompliance(
        dish
      );

      // 3. Анализируем натуральность
      analysis.results.nutritionalPurity = await this.analyzeNutritionalPurity(
        dish
      );

      // 4. Проверяем предупреждения о здоровье
      analysis.results.healthWarnings = await this.checkHealthWarnings(dish);

      // 5. Рассчитываем общий балл
      analysis.results.overallScore = this.calculateOverallScore(
        analysis.results
      );

      // 6. Генерируем рекомендации
      analysis.results.recommendations = await this.generateRecommendations(
        analysis.results
      );

      console.log("✅ Conscience analysis completed:", analysis);
      return analysis;
    } catch (error) {
      console.error("❌ Error in conscience analysis:", error);
      throw error;
    }
  }

  /**
   * Проверяет соответствие диетическим стандартам
   */
  async checkDietaryCompliance(dish, claimedStandards) {
    const compliance = {};

    claimedStandards.forEach((standard) => {
      const standardRules = this.dietaryStandards[standard];
      if (!standardRules) return;

      const violations = [];
      const ingredients = this.extractIngredients(dish);

      // Проверяем запрещенные ингредиенты
      standardRules.forbidden.forEach((forbiddenIngredient) => {
        if (this.containsIngredient(ingredients, forbiddenIngredient)) {
          violations.push({
            type: "forbidden_ingredient",
            ingredient: forbiddenIngredient,
            severity:
              standardRules.strictness === "high" ? "critical" : "warning",
            message: `Содержит запрещенный для ${standard} ингредиент: ${forbiddenIngredient}`,
          });
        }
      });

      // Проверяем соответствие заявленному стандарту
      const isCompliant = violations.length === 0;

      compliance[standard] = {
        compliant: isCompliant,
        violations: violations,
        confidence: this.calculateConfidence(ingredients, standardRules),
        recommendation: isCompliant
          ? `Блюдо соответствует стандарту ${standard}`
          : `Блюдо НЕ соответствует стандарту ${standard}. Найдено ${violations.length} нарушений.`,
      };
    });

    return compliance;
  }

  /**
   * Проверяет соответствие этическим стандартам
   */
  async checkEthicalCompliance(dish) {
    const compliance = {};

    Object.entries(this.ethicalStandards).forEach(([standard, rules]) => {
      const violations = [];
      const indicators = [];
      const ingredients = this.extractIngredients(dish);
      const description = (dish.description || "").toLowerCase();

      // Проверяем запрещенные элементы
      if (rules.forbidden) {
        rules.forbidden.forEach((forbiddenElement) => {
          if (
            this.containsIngredient(ingredients, forbiddenElement) ||
            description.includes(forbiddenElement)
          ) {
            violations.push({
              type: "ethical_violation",
              element: forbiddenElement,
              severity: rules.strictness === "high" ? "critical" : "warning",
              message: `Содержит неэтичный элемент: ${forbiddenElement}`,
            });
          }
        });
      }

      // Ищем положительные индикаторы
      if (rules.indicators) {
        rules.indicators.forEach((indicator) => {
          if (description.includes(indicator.toLowerCase())) {
            indicators.push({
              type: "ethical_indicator",
              indicator: indicator,
              message: `Найден положительный индикатор: ${indicator}`,
            });
          }
        });
      }

      compliance[standard] = {
        violations: violations,
        indicators: indicators,
        score: this.calculateEthicalScore(
          violations,
          indicators,
          rules.strictness
        ),
        recommendation:
          violations.length === 0
            ? `Блюдо соответствует этическому стандарту ${standard}`
            : `Найдены нарушения этического стандарта ${standard}`,
      };
    });

    return compliance;
  }

  /**
   * Анализирует натуральность и чистоту питания
   */
  async analyzeNutritionalPurity(dish) {
    const ingredients = this.extractIngredients(dish);
    const description = (dish.description || "").toLowerCase();

    const analysis = {
      artificialAdditives: [],
      naturalIndicators: [],
      processingLevel: "unknown",
      purityScore: 0,
      recommendations: [],
    };

    // Ищем искусственные добавки
    this.nutritionalPurity.artificial_additives.forEach((additive) => {
      if (
        this.containsIngredient(ingredients, additive) ||
        description.includes(additive.toLowerCase())
      ) {
        analysis.artificialAdditives.push({
          additive: additive,
          severity: "warning",
          message: `Содержит искусственную добавку: ${additive}`,
        });
      }
    });

    // Ищем натуральные индикаторы
    this.nutritionalPurity.natural_indicators.forEach((indicator) => {
      if (description.includes(indicator.toLowerCase())) {
        analysis.naturalIndicators.push({
          indicator: indicator,
          message: `Найден натуральный индикатор: ${indicator}`,
        });
      }
    });

    // Определяем уровень обработки
    analysis.processingLevel = this.determineProcessingLevel(
      description,
      ingredients
    );

    // Рассчитываем балл чистоты
    analysis.purityScore = this.calculatePurityScore(analysis);

    // Генерируем рекомендации
    if (analysis.artificialAdditives.length > 0) {
      analysis.recommendations.push({
        type: "warning",
        message: "Рекомендуем уменьшить количество искусственных добавок",
      });
    }

    if (analysis.processingLevel === "high") {
      analysis.recommendations.push({
        type: "info",
        message:
          "Блюдо подвергнуто интенсивной обработке. Рассмотрите более натуральные альтернативы.",
      });
    }

    return analysis;
  }

  /**
   * Проверяет предупреждения о здоровье
   */
  async checkHealthWarnings(dish) {
    const warnings = [];

    // Проверяем содержание натрия
    if (
      dish.dishSodium &&
      dish.dishSodium > this.healthWarnings.high_sodium.threshold
    ) {
      warnings.push({
        type: "sodium_warning",
        level: "high",
        value: dish.dishSodium,
        threshold: this.healthWarnings.high_sodium.threshold,
        message: `Высокое содержание натрия: ${dish.dishSodium}мг/100г`,
        warning: this.healthWarnings.high_sodium.warning,
      });
    }

    // Проверяем содержание сахара
    if (
      dish.dishSugar &&
      dish.dishSugar > this.healthWarnings.high_sugar.threshold
    ) {
      warnings.push({
        type: "sugar_warning",
        level: "high",
        value: dish.dishSugar,
        threshold: this.healthWarnings.high_sugar.threshold,
        message: `Высокое содержание сахара: ${dish.dishSugar}г/100г`,
        warning: this.healthWarnings.high_sugar.warning,
      });
    }

    // Проверяем содержание жиров
    if (dish.dishFat && dish.dishFat > this.healthWarnings.high_fat.threshold) {
      warnings.push({
        type: "fat_warning",
        level: "high",
        value: dish.dishFat,
        threshold: this.healthWarnings.high_fat.threshold,
        message: `Высокое содержание жиров: ${dish.dishFat}г/100г`,
        warning: this.healthWarnings.high_fat.warning,
      });
    }

    // Проверяем содержание клетчатки
    if (
      dish.dishFiber &&
      dish.dishFiber < this.healthWarnings.low_fiber.threshold
    ) {
      warnings.push({
        type: "fiber_warning",
        level: "low",
        value: dish.dishFiber,
        threshold: this.healthWarnings.low_fiber.threshold,
        message: `Низкое содержание клетчатки: ${dish.dishFiber}г/100г`,
        warning: this.healthWarnings.low_fiber.warning,
      });
    }

    return warnings;
  }

  /**
   * Рассчитывает общий балл соответствия
   */
  calculateOverallScore(results) {
    let totalScore = 100;
    let penaltyPoints = 0;

    // Штрафы за нарушения диетических стандартов
    Object.values(results.dietaryCompliance).forEach((compliance) => {
      if (!compliance.compliant) {
        compliance.violations.forEach((violation) => {
          penaltyPoints += violation.severity === "critical" ? 30 : 15;
        });
      }
    });

    // Штрафы за этические нарушения
    Object.values(results.ethicalCompliance).forEach((compliance) => {
      if (compliance.score < 70) {
        penaltyPoints += 20;
      }
    });

    // Штрафы за низкую чистоту
    if (results.nutritionalPurity.purityScore < 60) {
      penaltyPoints += 15;
    }

    // Штрафы за предупреждения о здоровье
    results.healthWarnings.forEach((warning) => {
      penaltyPoints += warning.level === "high" ? 10 : 5;
    });

    return Math.max(0, totalScore - penaltyPoints);
  }

  /**
   * Генерирует рекомендации по улучшению
   */
  async generateRecommendations(results) {
    const recommendations = [];

    // Рекомендации по диетическим стандартам
    Object.entries(results.dietaryCompliance).forEach(
      ([standard, compliance]) => {
        if (!compliance.compliant) {
          recommendations.push({
            type: "dietary",
            priority: "high",
            standard: standard,
            message: `Уберите запрещенные для ${standard} ингредиенты: ${compliance.violations
              .map((v) => v.ingredient)
              .join(", ")}`,
            action: `Замените запрещенные ингредиенты на разрешенные для ${standard}`,
          });
        }
      }
    );

    // Рекомендации по этическим стандартам
    Object.entries(results.ethicalCompliance).forEach(
      ([standard, compliance]) => {
        if (compliance.score < 70) {
          recommendations.push({
            type: "ethical",
            priority: "medium",
            standard: standard,
            message: `Улучшите соответствие этическому стандарту ${standard}`,
            action: `Используйте сертифицированные ${standard} ингредиенты`,
          });
        }
      }
    );

    // Рекомендации по чистоте
    if (results.nutritionalPurity.purityScore < 60) {
      recommendations.push({
        type: "purity",
        priority: "medium",
        message: "Увеличьте натуральность блюда",
        action: "Замените искусственные добавки на натуральные альтернативы",
      });
    }

    // Рекомендации по здоровью
    results.healthWarnings.forEach((warning) => {
      recommendations.push({
        type: "health",
        priority: warning.level === "high" ? "high" : "medium",
        message: warning.message,
        action: `Снизьте содержание ${warning.type.replace("_warning", "")}`,
      });
    });

    return recommendations;
  }

  /**
   * Извлекает ингредиенты из блюда
   */
  extractIngredients(dish) {
    const ingredients = [];

    if (dish.ingredients) {
      ingredients.push(
        ...dish.ingredients.split(",").map((ing) => ing.trim().toLowerCase())
      );
    }

    if (dish.name) {
      ingredients.push(dish.name.toLowerCase());
    }

    return ingredients;
  }

  /**
   * Проверяет, содержит ли список ингредиентов указанный ингредиент
   */
  containsIngredient(ingredients, ingredient) {
    const searchTerm = ingredient.toLowerCase();
    return ingredients.some(
      (ing) => ing.includes(searchTerm) || searchTerm.includes(ing)
    );
  }

  /**
   * Рассчитывает уверенность в соответствии стандарту
   */
  calculateConfidence(ingredients, standardRules) {
    let confidence = 0;
    let totalChecks = standardRules.forbidden.length;

    // Проверяем, сколько запрещенных ингредиентов НЕ найдено
    standardRules.forbidden.forEach((forbiddenIngredient) => {
      if (!this.containsIngredient(ingredients, forbiddenIngredient)) {
        confidence += 1;
      }
    });

    return Math.round((confidence / totalChecks) * 100);
  }

  /**
   * Рассчитывает этический балл
   */
  calculateEthicalScore(violations, indicators, strictness) {
    let score = 100;

    // Штрафы за нарушения
    violations.forEach((violation) => {
      score -= violation.severity === "critical" ? 40 : 20;
    });

    // Бонусы за индикаторы
    indicators.forEach((indicator) => {
      score += 10;
    });

    // Учитываем строгость стандарта
    if (strictness === "high") {
      score = Math.max(0, score - 20); // Дополнительный штраф за высокую строгость
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Определяет уровень обработки продукта
   */
  determineProcessingLevel(description, ingredients) {
    let processingScore = 0;

    // Проверяем индикаторы минимальной обработки
    this.nutritionalPurity.processing_levels.minimal.forEach((indicator) => {
      if (description.includes(indicator)) {
        processingScore -= 2;
      }
    });

    // Проверяем индикаторы умеренной обработки
    this.nutritionalPurity.processing_levels.moderate.forEach((indicator) => {
      if (description.includes(indicator)) {
        processingScore += 1;
      }
    });

    // Проверяем индикаторы высокой обработки
    this.nutritionalPurity.processing_levels.high.forEach((indicator) => {
      if (description.includes(indicator)) {
        processingScore += 3;
      }
    });

    if (processingScore <= -1) return "minimal";
    if (processingScore <= 2) return "moderate";
    return "high";
  }

  /**
   * Рассчитывает балл чистоты питания
   */
  calculatePurityScore(analysis) {
    let score = 100;

    // Штрафы за искусственные добавки
    score -= analysis.artificialAdditives.length * 15;

    // Бонусы за натуральные индикаторы
    score += analysis.naturalIndicators.length * 10;

    // Штрафы за уровень обработки
    switch (analysis.processingLevel) {
      case "high":
        score -= 30;
        break;
      case "moderate":
        score -= 10;
        break;
      case "minimal":
        score += 10;
        break;
      default:
        // Обработка неизвестного уровня
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Анализирует несколько блюд одновременно
   */
  async analyzeMultipleDishes(dishes, claimedStandards = []) {
    console.log(
      `🔍 Analyzing ${dishes.length} dishes for conscience compliance...`
    );

    const results = {
      dishes: [],
      summary: {
        totalDishes: dishes.length,
        averageScore: 0,
        complianceByStandard: {},
        criticalIssues: [],
        recommendations: [],
      },
    };

    let totalScore = 0;

    for (const dish of dishes) {
      try {
        const analysis = await this.analyzeDish(dish, claimedStandards);
        results.dishes.push(analysis);
        totalScore += analysis.results.overallScore;
      } catch (error) {
        console.error(`❌ Error analyzing dish ${dish.name}:`, error);
        results.dishes.push({
          dishId: dish.id,
          dishName: dish.name,
          error: error.message,
        });
      }
    }

    // Рассчитываем сводку
    results.summary.averageScore = Math.round(totalScore / dishes.length);

    // Группируем по стандартам
    claimedStandards.forEach((standard) => {
      const compliantDishes = results.dishes.filter(
        (d) =>
          d.results &&
          d.results.dietaryCompliance[standard] &&
          d.results.dietaryCompliance[standard].compliant
      ).length;

      results.summary.complianceByStandard[standard] = {
        compliant: compliantDishes,
        total: dishes.length,
        percentage: Math.round((compliantDishes / dishes.length) * 100),
      };
    });

    // Собираем критические проблемы
    results.dishes.forEach((dish) => {
      if (dish.results && dish.results.overallScore < 50) {
        results.summary.criticalIssues.push({
          dishName: dish.dishName,
          score: dish.results.overallScore,
          issues: dish.results.recommendations.filter(
            (r) => r.priority === "high"
          ),
        });
      }
    });

    console.log("✅ Multiple dishes analysis completed:", results.summary);
    return results;
  }
}

// Экспортируем класс напрямую
export { AIConscienceChecker };
export default AIConscienceChecker;
