// Калькулятор для диабетического меню
// Автоматически рассчитывает сахар, гликемический индекс и диабетическую пригодность

export class DiabeticCalculator {
  constructor() {
    this.sugarDatabase = this.initializeSugarDatabase();
    this.glycemicIndexDatabase = this.initializeGlycemicIndexDatabase();
    this.sugarSubstitutesDatabase = this.initializeSugarSubstitutesDatabase();
  }

  // База данных содержания сахара в ингредиентах (г на 100г)
  initializeSugarDatabase() {
    return {
      // Фрукты (высокое содержание сахара)
      'бананы': 12.2,
      'виноград': 16.0,
      'яблоки': 10.4,
      'груши': 9.8,
      'апельсины': 8.3,
      'мандарины': 7.5,
      'персики': 8.4,
      'абрикосы': 9.2,
      'сливы': 9.9,
      'черешня': 12.8,
      'вишня': 8.5,
      'клубника': 4.9,
      'малина': 4.4,
      'черника': 7.3,
      'клюква': 4.0,
      'смородина': 7.4,
      'крыжовник': 8.1,
      
      // Сухофрукты (очень высокое содержание сахара)
      'изюм': 59.2,
      'курага': 53.4,
      'чернослив': 38.1,
      'финики': 66.5,
      'инжир': 16.3,
      
      // Овощи (низкое-среднее содержание сахара)
      'морковь': 4.7,
      'свекла': 6.8,
      'помидоры': 2.6,
      'огурцы': 1.7,
      'капуста': 3.2,
      'лук': 4.2,
      'чеснок измельченный': 1.0,
      'перец болгарский': 2.4,
      'баклажаны': 3.2,
      'кабачки': 2.5,
      'тыква': 4.2,
      
      // Крупы и злаки
      'рис': 0.1,
      'гречка': 0.1,
      'овсянка': 0.8,
      'пшено': 0.1,
      'перловка': 0.8,
      'макароны': 1.1,
      'хлеб': 1.0,
      'мука': 0.1,
      
      // Молочные продукты
      'молоко': 4.7,
      'кефир': 4.1,
      'йогурт': 3.2,
      'творог': 1.3,
      'сыр': 0.1,
      'сметана': 3.2,
      
      // Мясо и рыба (практически без сахара)
      'говядина': 0.0,
      'свинина': 0.0,
      'курица': 0.0,
      'рыба': 0.0,
      'яйца': 0.7,
      
      // Сладости и добавки
      'сахар': 99.8,
      'мед': 82.4,
      'варенье': 60.0,
      'джем': 55.0,
      'шоколад': 48.2,
      'конфеты': 70.0,
      'печенье': 25.0,
      'торт': 35.0,
      
      // Напитки
      'сок': 10.0,
      'газировка': 8.5,
      'компот': 12.0,
      'морс': 8.0,
      
      // Орехи и семена
      'орехи': 2.6,
      'семечки': 2.0,
      'миндаль': 4.4,
      'фундук': 4.3,
      'арахис': 4.2,
      
      // Специи и приправы
      'соль': 0.0,
      'перец черный': 0.0,
      'лавровый лист': 0.0,
      'корица': 2.2,
      'ваниль': 12.7,
      'имбирь': 1.7,
      'чеснок специя': 1.0,
      
      // Масла и жиры
      'масло': 0.0,
      'майонез': 0.3,
      'кетчуп': 22.8,
      'горчица': 2.9
    };
  }

  // База данных гликемических индексов
  initializeGlycemicIndexDatabase() {
    return {
      // Очень низкий ГИ (0-30)
      'капуста': 10,
      'огурцы': 15,
      'помидоры': 15,
      'баклажаны': 20,
      'кабачки': 15,
      'перец болгарский': 15,
      'чеснок измельченный': 30,
      'лук': 15,
      'грибы': 15,
      'орехи': 15,
      'семечки': 20,
      'мясо': 0,
      'рыба': 0,
      'яйца': 0,
      'сыр': 0,
      'творог': 30,
      'молоко': 30,
      'кефир': 30,
      'йогурт': 35,
      
      // Низкий ГИ (31-50)
      'яблоки': 35,
      'груши': 38,
      'апельсины': 35,
      'мандарины': 30,
      'персики': 35,
      'сливы': 35,
      'вишня': 25,
      'клубника': 25,
      'малина': 25,
      'черника': 25,
      'клюква': 25,
      'морковь': 35,
      'свекла': 30,
      'тыква': 75, // Высокий ГИ!
      'овсянка': 40,
      'гречка': 40,
      'перловка': 25,
      'пшено': 45,
      'макароны': 50,
      'хлеб': 50,
      
      // Средний ГИ (51-70)
      'бананы': 60,
      'виноград': 45,
      'абрикосы': 30,
      'рис': 70,
      'картофель': 65,
      'кукуруза': 70,
      'мед': 60,
      
      // Высокий ГИ (71-100)
      'сахар': 100,
      'конфеты': 80,
      'печенье': 70,
      'торт': 80,
      'варенье': 65,
      'джем': 65,
      'сок': 50,
      'газировка': 70,
      'компот': 60,
      'мука': 85,
      'изюм': 65,
      'курага': 40,
      'финики': 70
    };
  }

  // База данных заменителей сахара
  initializeSugarSubstitutesDatabase() {
    return {
      'стевия': true,
      'стевиозид': true,
      'эритрит': true,
      'ксилит': true,
      'сорбит': true,
      'маннит': true,
      'аспартам': true,
      'сахарин': true,
      'цикламат': true,
      'ацесульфам': true,
      'сукралоза': true,
      'фруктоза': false, // Не является заменителем в диабетическом смысле
      'глюкоза': false,
      'сахароза': false,
      'лактоза': false,
      'мальтоза': false
    };
  }

  // Основная функция расчета диабетических показателей
  calculateDiabeticValues(ingredientsText, cookingMethod = 'варка') {
    if (!ingredientsText || ingredientsText.trim().length === 0) {
      return {
        sugar: 0,
        glycemicIndex: 0,
        sugarSubstitutes: false,
        diabeticFriendly: false,
        confidence: 0,
        warnings: [],
        recommendations: []
      };
    }

    const ingredients = this.parseIngredients(ingredientsText);
    let totalSugar = 0;
    let totalWeight = 0;
    let hasSugarSubstitutes = false;
    const warnings = [];
    const recommendations = [];

    // Анализируем каждый ингредиент
    ingredients.forEach(ingredient => {
      const sugarContent = this.getSugarContent(ingredient.name);
      const glycemicIndex = this.getGlycemicIndex(ingredient.name);
      const weight = ingredient.quantity || 100;
      
      // Рассчитываем сахар
      totalSugar += (sugarContent * weight) / 100;
      totalWeight += weight;
      
      // Проверяем заменители сахара
      if (this.hasSugarSubstitutes(ingredient.name)) {
        hasSugarSubstitutes = true;
      }
      
      // Анализируем диабетическую пригодность
      if (sugarContent > 15) {
        warnings.push(`Высокое содержание сахара в ${ingredient.name}: ${sugarContent}г/100г`);
      }
      
      if (glycemicIndex > 70) {
        warnings.push(`Высокий гликемический индекс в ${ingredient.name}: ${glycemicIndex}`);
      }
    });

    // Рассчитываем средний гликемический индекс
    const avgGlycemicIndex = this.calculateAverageGlycemicIndex(ingredients);
    
    // Определяем диабетическую пригодность
    const diabeticFriendly = this.isDiabeticFriendly(totalSugar, avgGlycemicIndex, hasSugarSubstitutes);
    
    // Генерируем рекомендации
    if (totalSugar > 20) {
      recommendations.push('Рекомендуется уменьшить количество сладких ингредиентов');
    }
    
    if (avgGlycemicIndex > 60) {
      recommendations.push('Рекомендуется добавить продукты с низким ГИ');
    }
    
    if (!hasSugarSubstitutes && totalSugar > 10) {
      recommendations.push('Рассмотрите использование заменителей сахара');
    }

    // Рассчитываем уверенность
    const confidence = this.calculateConfidence(ingredients, totalSugar, avgGlycemicIndex);

    return {
      sugar: Math.round(totalSugar * 10) / 10,
      glycemicIndex: Math.round(avgGlycemicIndex),
      sugarSubstitutes: hasSugarSubstitutes,
      diabeticFriendly,
      confidence: Math.round(confidence * 100) / 100,
      warnings,
      recommendations,
      method: 'diabetic_calculator'
    };
  }

  // Парсинг ингредиентов (используем существующую логику)
  parseIngredients(text) {
    const normalized = text.toLowerCase()
      .replace(/[^\w\s,;.\-\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const rawIngredients = normalized.split(/[,;.\n]/)
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    return rawIngredients.map(ingredient => this.parseIngredient(ingredient));
  }

  // Парсинг отдельного ингредиента
  parseIngredient(ingredient) {
    const original = ingredient;
    
    // Извлекаем количество
    const quantity = this.extractQuantity(ingredient);
    
    // Очищаем название
    const cleanName = this.cleanIngredientName(ingredient);
    
    return {
      original,
      name: cleanName,
      quantity: quantity.amount,
      unit: quantity.unit
    };
  }

  // Извлечение количества
  extractQuantity(ingredient) {
    const rangeMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      return { amount: (min + max) / 2, unit: 'г' };
    }

    const numberMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(г|кг|мл|л|шт|штук|кусочков?)?/);
    if (numberMatch) {
      let amount = parseFloat(numberMatch[1]);
      const unit = numberMatch[2] || 'г';
      
      if (unit === 'кг') amount *= 1000;
      else if (unit === 'шт' || unit === 'штук') amount *= 50;
      
      return { amount, unit };
    }

    return { amount: 100, unit: 'г' };
  }

  // Очистка названия ингредиента
  cleanIngredientName(ingredient) {
    return ingredient
      .replace(/\d+(?:\.\d+)?\s*(г|кг|мл|л|шт|штук|кусочков?)/g, '')
      .replace(/\b(вареный|жареный|запеченный|тушеный|сырой|свежий)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Получение содержания сахара
  getSugarContent(ingredientName) {
    const normalized = ingredientName.toLowerCase();
    
    // Точное совпадение
    if (this.sugarDatabase[normalized]) {
      return this.sugarDatabase[normalized];
    }
    
    // Поиск по частичному совпадению
    for (const [key, value] of Object.entries(this.sugarDatabase)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
    
    return 0; // По умолчанию 0г сахара
  }

  // Получение гликемического индекса
  getGlycemicIndex(ingredientName) {
    const normalized = ingredientName.toLowerCase();
    
    if (this.glycemicIndexDatabase[normalized]) {
      return this.glycemicIndexDatabase[normalized];
    }
    
    for (const [key, value] of Object.entries(this.glycemicIndexDatabase)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
    
    return 50; // Средний ГИ по умолчанию
  }

  // Проверка наличия заменителей сахара
  hasSugarSubstitutes(ingredientName) {
    const normalized = ingredientName.toLowerCase();
    
    for (const [key, value] of Object.entries(this.sugarSubstitutesDatabase)) {
      if (normalized.includes(key) && value) {
        return true;
      }
    }
    
    return false;
  }

  // Расчет среднего гликемического индекса
  calculateAverageGlycemicIndex(ingredients) {
    if (ingredients.length === 0) return 0;
    
    let totalWeightedGI = 0;
    let totalWeight = 0;
    
    ingredients.forEach(ingredient => {
      const gi = this.getGlycemicIndex(ingredient.name);
      const weight = ingredient.quantity || 100;
      
      totalWeightedGI += gi * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalWeightedGI / totalWeight : 0;
  }

  // Определение диабетической пригодности
  isDiabeticFriendly(sugar, glycemicIndex, hasSugarSubstitutes) {
    // Критерии для диабетического блюда:
    // 1. Сахар < 15г на порцию
    // 2. ГИ < 55
    // 3. Или есть заменители сахара
    
    return (sugar < 15 && glycemicIndex < 55) || hasSugarSubstitutes;
  }

  // Расчет уверенности
  calculateConfidence(ingredients, sugar, glycemicIndex) {
    let confidence = 0.8; // Базовая уверенность
    
    // Бонус за известные ингредиенты
    const knownIngredients = ingredients.filter(ing => 
      this.sugarDatabase[ing.name] !== undefined
    ).length;
    
    confidence += (knownIngredients / ingredients.length) * 0.2;
    
    // Штраф за высокие значения
    if (sugar > 50) confidence -= 0.1;
    if (glycemicIndex > 80) confidence -= 0.1;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  // Получение рекомендаций по улучшению
  getImprovementRecommendations(sugar, glycemicIndex, hasSugarSubstitutes) {
    const recommendations = [];
    
    if (sugar > 20) {
      recommendations.push('Замените сладкие фрукты на менее сладкие (яблоки, груши)');
    }
    
    if (glycemicIndex > 60) {
      recommendations.push('Добавьте овощи с низким ГИ (капуста, огурцы, помидоры)');
    }
    
    if (!hasSugarSubstitutes && sugar > 10) {
      recommendations.push('Используйте стевию или эритрит вместо сахара');
    }
    
    if (sugar < 5 && glycemicIndex < 40) {
      recommendations.push('Отличное диабетическое блюдо!');
    }
    
    return recommendations;
  }
}

// Экспорт экземпляра
export const diabeticCalculator = new DiabeticCalculator();
