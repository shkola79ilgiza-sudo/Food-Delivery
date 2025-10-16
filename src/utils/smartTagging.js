// Smart Tagging - AI автоматически анализирует блюдо и предлагает релевантные теги

export class SmartTagging {
  constructor() {
    this.tagDatabase = this.initializeTagDatabase();
    this.thresholds = this.initializeThresholds();
  }

  /**
   * Инициализация базы данных тегов
   */
  initializeTagDatabase() {
    return {
      // Макронутриенты
      macros: [
        { id: 'high-protein', name: 'Богато белком', emoji: '💪', priority: 'high' },
        { id: 'low-carb', name: 'Низкоуглеводное', emoji: '🥩', priority: 'high' },
        { id: 'high-fiber', name: 'Богато клетчаткой', emoji: '🌾', priority: 'medium' },
        { id: 'low-fat', name: 'Низкожирное', emoji: '🥗', priority: 'medium' },
        { id: 'high-fat', name: 'Высокожирное', emoji: '🥑', priority: 'low' }
      ],
      
      // Диеты
      diets: [
        { id: 'keto', name: 'Кето', emoji: '🥓', priority: 'high' },
        { id: 'paleo', name: 'Палео', emoji: '🦴', priority: 'medium' },
        { id: 'vegan', name: 'Веганское', emoji: '🌱', priority: 'high' },
        { id: 'vegetarian', name: 'Вегетарианское', emoji: '🥕', priority: 'high' },
        { id: 'gluten-free', name: 'Без глютена', emoji: '🌾🚫', priority: 'high' },
        { id: 'dairy-free', name: 'Без молочных продуктов', emoji: '🥛🚫', priority: 'medium' },
        { id: 'low-fodmap', name: 'Low FODMAP', emoji: '🍃', priority: 'low' }
      ],
      
      // Здоровье
      health: [
        { id: 'diabetic-friendly', name: 'Для диабетиков', emoji: '🩺', priority: 'high' },
        { id: 'heart-healthy', name: 'Полезно для сердца', emoji: '❤️', priority: 'high' },
        { id: 'low-sodium', name: 'Низкое содержание натрия', emoji: '🧂🚫', priority: 'medium' },
        { id: 'low-sugar', name: 'Низкое содержание сахара', emoji: '🍬🚫', priority: 'high' },
        { id: 'anti-inflammatory', name: 'Противовоспалительное', emoji: '🔥🚫', priority: 'medium' }
      ],
      
      // Калорийность
      calories: [
        { id: 'low-calorie', name: 'Низкокалорийное', emoji: '📉', priority: 'high' },
        { id: 'high-calorie', name: 'Высококалорийное', emoji: '📈', priority: 'low' },
        { id: 'balanced', name: 'Сбалансированное', emoji: '⚖️', priority: 'medium' }
      ],
      
      // Время приема пищи
      mealTime: [
        { id: 'breakfast', name: 'Завтрак', emoji: '🌅', priority: 'medium' },
        { id: 'lunch', name: 'Обед', emoji: '☀️', priority: 'medium' },
        { id: 'dinner', name: 'Ужин', emoji: '🌙', priority: 'medium' },
        { id: 'snack', name: 'Перекус', emoji: '🍪', priority: 'low' }
      ],
      
      // Спорт и фитнес
      fitness: [
        { id: 'pre-workout', name: 'Перед тренировкой', emoji: '🏋️', priority: 'medium' },
        { id: 'post-workout', name: 'После тренировки', emoji: '💪', priority: 'medium' },
        { id: 'muscle-building', name: 'Для набора массы', emoji: '💪📈', priority: 'medium' },
        { id: 'weight-loss', name: 'Для похудения', emoji: '⚖️📉', priority: 'high' }
      ],
      
      // Особые потребности
      special: [
        { id: 'pregnancy-safe', name: 'Безопасно при беременности', emoji: '🤰', priority: 'high' },
        { id: 'kid-friendly', name: 'Детское', emoji: '👶', priority: 'medium' },
        { id: 'elderly-friendly', name: 'Для пожилых', emoji: '👴', priority: 'low' }
      ]
    };
  }

  /**
   * Инициализация порогов для определения тегов
   */
  initializeThresholds() {
    return {
      // Макронутриенты (% от калорий)
      highProtein: 30, // >30% калорий из белка
      lowCarb: 20, // <20% калорий из углеводов
      highFiber: 5, // >5г клетчатки на 100г
      lowFat: 15, // <15% калорий из жира
      highFat: 40, // >40% калорий из жира
      
      // Калорийность (на порцию)
      lowCalorie: 300,
      highCalorie: 600,
      
      // Диабетические показатели
      lowGI: 55,
      lowSugar: 5, // <5г сахара на порцию
      
      // Натрий
      lowSodium: 140, // <140мг на порцию
      
      // Кето
      ketoCarbs: 10, // <10г углеводов на порцию
      ketoFat: 70 // >70% калорий из жира
    };
  }

  /**
   * Анализирует блюдо и генерирует теги
   * @param {Object} dish - Данные блюда
   * @returns {Array} Массив рекомендованных тегов
   */
  analyzeDish(dish) {
    const tags = [];
    const nutrition = this.normalizeNutrition(dish);
    
    // Анализ макронутриентов
    tags.push(...this.analyzeMacros(nutrition));
    
    // Анализ диет
    tags.push(...this.analyzeDiets(dish, nutrition));
    
    // Анализ здоровья
    tags.push(...this.analyzeHealth(dish, nutrition));
    
    // Анализ калорийности
    tags.push(...this.analyzeCalories(nutrition));
    
    // Анализ времени приема пищи
    tags.push(...this.analyzeMealTime(dish, nutrition));
    
    // Анализ для фитнеса
    tags.push(...this.analyzeFitness(nutrition));
    
    // Анализ особых потребностей
    tags.push(...this.analyzeSpecialNeeds(dish, nutrition));
    
    // Сортируем по приоритету и уверенности
    return tags
      .sort((a, b) => {
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10); // Максимум 10 тегов
  }

  /**
   * Нормализует данные о питательной ценности
   */
  normalizeNutrition(dish) {
    const calories = parseFloat(dish.calories) || 0;
    const protein = parseFloat(dish.protein) || 0;
    const carbs = parseFloat(dish.carbs) || 0;
    const fat = parseFloat(dish.fat) || 0;
    const fiber = parseFloat(dish.fiber) || 0;
    const sugar = parseFloat(dish.sugar) || 0;
    const sodium = parseFloat(dish.sodium) || 0;
    const glycemicIndex = parseFloat(dish.glycemicIndex) || 0;
    
    // Расчет процентов от калорий
    const proteinPercent = calories > 0 ? (protein * 4 / calories) * 100 : 0;
    const carbsPercent = calories > 0 ? (carbs * 4 / calories) * 100 : 0;
    const fatPercent = calories > 0 ? (fat * 9 / calories) * 100 : 0;
    
    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      glycemicIndex,
      proteinPercent,
      carbsPercent,
      fatPercent
    };
  }

  /**
   * Анализ макронутриентов
   */
  analyzeMacros(nutrition) {
    const tags = [];
    
    // Богато белком
    if (nutrition.proteinPercent > this.thresholds.highProtein) {
      tags.push({
        ...this.findTag('high-protein'),
        confidence: Math.min(95, 70 + (nutrition.proteinPercent - this.thresholds.highProtein)),
        reason: `${nutrition.proteinPercent.toFixed(1)}% калорий из белка`
      });
    }
    
    // Низкоуглеводное
    if (nutrition.carbsPercent < this.thresholds.lowCarb) {
      tags.push({
        ...this.findTag('low-carb'),
        confidence: Math.min(95, 70 + (this.thresholds.lowCarb - nutrition.carbsPercent) * 2),
        reason: `Только ${nutrition.carbsPercent.toFixed(1)}% калорий из углеводов`
      });
    }
    
    // Богато клетчаткой
    if (nutrition.fiber > this.thresholds.highFiber) {
      tags.push({
        ...this.findTag('high-fiber'),
        confidence: Math.min(95, 60 + nutrition.fiber * 5),
        reason: `${nutrition.fiber.toFixed(1)}г клетчатки`
      });
    }
    
    // Низкожирное
    if (nutrition.fatPercent < this.thresholds.lowFat) {
      tags.push({
        ...this.findTag('low-fat'),
        confidence: Math.min(95, 65 + (this.thresholds.lowFat - nutrition.fatPercent) * 2),
        reason: `Только ${nutrition.fatPercent.toFixed(1)}% калорий из жира`
      });
    }
    
    // Высокожирное
    if (nutrition.fatPercent > this.thresholds.highFat) {
      tags.push({
        ...this.findTag('high-fat'),
        confidence: Math.min(95, 60 + (nutrition.fatPercent - this.thresholds.highFat)),
        reason: `${nutrition.fatPercent.toFixed(1)}% калорий из жира`
      });
    }
    
    return tags;
  }

  /**
   * Анализ диет
   */
  analyzeDiets(dish, nutrition) {
    const tags = [];
    const ingredients = (dish.ingredients || '').toLowerCase();
    
    // Кето
    if (nutrition.carbs < this.thresholds.ketoCarbs && nutrition.fatPercent > this.thresholds.ketoFat) {
      tags.push({
        ...this.findTag('keto'),
        confidence: 90,
        reason: `Низкоуглеводное (${nutrition.carbs.toFixed(1)}г) и высокожирное (${nutrition.fatPercent.toFixed(1)}%)`
      });
    }
    
    // Веганское
    const meatKeywords = ['мясо', 'курица', 'говядина', 'свинина', 'рыба', 'яйцо', 'молоко', 'сыр', 'творог'];
    const hasMeat = meatKeywords.some(keyword => ingredients.includes(keyword));
    if (!hasMeat && ingredients.length > 0) {
      tags.push({
        ...this.findTag('vegan'),
        confidence: 75,
        reason: 'Не содержит продуктов животного происхождения'
      });
    }
    
    // Без глютена
    const glutenKeywords = ['пшеница', 'мука', 'хлеб', 'макароны', 'овес', 'ячмень', 'рожь'];
    const hasGluten = glutenKeywords.some(keyword => ingredients.includes(keyword));
    if (!hasGluten && ingredients.length > 0) {
      tags.push({
        ...this.findTag('gluten-free'),
        confidence: 80,
        reason: 'Не содержит глютен'
      });
    }
    
    return tags;
  }

  /**
   * Анализ здоровья
   */
  analyzeHealth(dish, nutrition) {
    const tags = [];
    
    // Для диабетиков
    if (nutrition.glycemicIndex > 0 && nutrition.glycemicIndex < this.thresholds.lowGI && nutrition.sugar < this.thresholds.lowSugar) {
      tags.push({
        ...this.findTag('diabetic-friendly'),
        confidence: 90,
        reason: `Низкий ГИ (${nutrition.glycemicIndex}) и низкое содержание сахара (${nutrition.sugar.toFixed(1)}г)`
      });
    }
    
    // Низкое содержание сахара
    if (nutrition.sugar < this.thresholds.lowSugar) {
      tags.push({
        ...this.findTag('low-sugar'),
        confidence: 85,
        reason: `Только ${nutrition.sugar.toFixed(1)}г сахара`
      });
    }
    
    // Низкое содержание натрия
    if (nutrition.sodium < this.thresholds.lowSodium) {
      tags.push({
        ...this.findTag('low-sodium'),
        confidence: 80,
        reason: `Низкое содержание натрия (${nutrition.sodium.toFixed(0)}мг)`
      });
    }
    
    return tags;
  }

  /**
   * Анализ калорийности
   */
  analyzeCalories(nutrition) {
    const tags = [];
    
    if (nutrition.calories < this.thresholds.lowCalorie) {
      tags.push({
        ...this.findTag('low-calorie'),
        confidence: 85,
        reason: `Всего ${nutrition.calories.toFixed(0)} ккал`
      });
    } else if (nutrition.calories > this.thresholds.highCalorie) {
      tags.push({
        ...this.findTag('high-calorie'),
        confidence: 75,
        reason: `${nutrition.calories.toFixed(0)} ккал - энергетически насыщенное`
      });
    } else {
      tags.push({
        ...this.findTag('balanced'),
        confidence: 70,
        reason: `Сбалансированная калорийность (${nutrition.calories.toFixed(0)} ккал)`
      });
    }
    
    return tags;
  }

  /**
   * Анализ времени приема пищи
   */
  analyzeMealTime(dish, nutrition) {
    const tags = [];
    const category = (dish.category || '').toLowerCase();
    
    // Простая эвристика на основе категории и калорийности
    if (category.includes('breakfast') || nutrition.calories < 400) {
      tags.push({
        ...this.findTag('breakfast'),
        confidence: 65,
        reason: 'Подходит для завтрака'
      });
    }
    
    if (nutrition.calories > 400 && nutrition.calories < 700) {
      tags.push({
        ...this.findTag('lunch'),
        confidence: 70,
        reason: 'Оптимально для обеда'
      });
    }
    
    if (nutrition.calories < 250) {
      tags.push({
        ...this.findTag('snack'),
        confidence: 75,
        reason: 'Идеально для перекуса'
      });
    }
    
    return tags;
  }

  /**
   * Анализ для фитнеса
   */
  analyzeFitness(nutrition) {
    const tags = [];
    
    // Для набора массы
    if (nutrition.proteinPercent > 25 && nutrition.calories > 500) {
      tags.push({
        ...this.findTag('muscle-building'),
        confidence: 80,
        reason: `Высокобелковое (${nutrition.proteinPercent.toFixed(1)}%) и калорийное`
      });
    }
    
    // Для похудения
    if (nutrition.calories < this.thresholds.lowCalorie && nutrition.proteinPercent > 20) {
      tags.push({
        ...this.findTag('weight-loss'),
        confidence: 85,
        reason: 'Низкокалорийное с достаточным количеством белка'
      });
    }
    
    // После тренировки
    if (nutrition.proteinPercent > 25 && nutrition.carbsPercent > 30) {
      tags.push({
        ...this.findTag('post-workout'),
        confidence: 75,
        reason: 'Хорошее соотношение белков и углеводов для восстановления'
      });
    }
    
    return tags;
  }

  /**
   * Анализ особых потребностей
   */
  analyzeSpecialNeeds(dish, nutrition) {
    const tags = [];
    const ingredients = (dish.ingredients || '').toLowerCase();
    
    // Безопасно при беременности (отсутствие опасных продуктов)
    const unsafeForPregnancy = ['сырое мясо', 'сырая рыба', 'суши', 'алкоголь', 'кофеин'];
    const hasUnsafe = unsafeForPregnancy.some(keyword => ingredients.includes(keyword));
    if (!hasUnsafe && ingredients.length > 0) {
      tags.push({
        ...this.findTag('pregnancy-safe'),
        confidence: 70,
        reason: 'Не содержит продуктов, опасных при беременности'
      });
    }
    
    return tags;
  }

  /**
   * Находит тег по ID
   */
  findTag(tagId) {
    for (const category of Object.values(this.tagDatabase)) {
      const tag = category.find(t => t.id === tagId);
      if (tag) return tag;
    }
    return null;
  }

  /**
   * Форматирует теги для отображения
   */
  formatTags(tags) {
    return tags.map(tag => ({
      ...tag,
      displayName: `${tag.emoji} ${tag.name}`,
      confidenceText: `${tag.confidence.toFixed(0)}% уверенность`
    }));
  }
}

// Экспортируем singleton
export const smartTagging = new SmartTagging();

