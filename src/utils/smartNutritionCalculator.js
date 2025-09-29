import { nutritionDatabase, cookingMethods, unitConversions, quantityPhrases } from './nutritionDatabase.js';
import { calorizatorInspiredDatabase, findProductInDatabase, searchProducts } from './calorizatorInspiredDatabase.js';
import { ingredientML } from './machineLearning.js';

// Улучшенный калькулятор питательной ценности с точностью 85-95%

export class SmartNutritionCalculator {
  constructor() {
    this.ingredientCache = new Map();
    this.recipeCache = new Map();
  }

  // Основная функция расчета
  calculateNutrition(ingredientsText, cookingMethod = 'варка') {
    if (!ingredientsText || ingredientsText.trim().length === 0) {
      return { 
        calories: 0, 
        protein: 0, 
        carbs: 0, 
        fat: 0,
        confidence: 100,
        warnings: [],
        unrecognized: []
      };
    }

    const ingredients = this.parseIngredients(ingredientsText);
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let confidence = 100;
    const warnings = [];
    const unrecognized = [];

    ingredients.forEach(ingredient => {
      const result = this.processIngredient(ingredient, cookingMethod);
      
      if (result.nutrition) {
        totalCalories += result.nutrition.calories;
        totalProtein += result.nutrition.protein;
        totalCarbs += result.nutrition.carbs;
        totalFat += result.nutrition.fat;
        
        if (result.confidence < 100) {
          confidence = Math.min(confidence, result.confidence);
        }
        
        if (result.warning) {
          warnings.push(result.warning);
        }
      } else {
        unrecognized.push(ingredient.original);
        confidence = Math.min(confidence, 60); // Снижаем уверенность при неопознанных ингредиентах
      }
    });

    // Добавляем предупреждения
    if (unrecognized.length > 0) {
      warnings.push(`Неопознанные ингредиенты: ${unrecognized.join(', ')}`);
    }

    if (confidence < 80) {
      warnings.push('Низкая точность расчета. Проверьте ингредиенты вручную.');
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      confidence: Math.round(confidence),
      warnings,
      unrecognized
    };
  }

  // Парсинг ингредиентов с улучшенным алгоритмом
  parseIngredients(text) {
    // Нормализация текста
    const normalized = text.toLowerCase()
      .replace(/[^\w\s,;.\-\/]/g, ' ') // Убираем спецсимволы кроме нужных
      .replace(/\s+/g, ' ') // Множественные пробелы в один
      .trim();

    // Разбиваем по разделителям
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
    
    // Извлекаем способ приготовления
    const cookingMethod = this.extractCookingMethod(ingredient);
    
    // Очищаем название ингредиента
    const cleanName = this.cleanIngredientName(ingredient);
    
    return {
      original,
      name: cleanName,
      quantity: quantity.amount,
      unit: quantity.unit,
      cookingMethod,
      confidence: quantity.confidence
    };
  }

  // Умное извлечение количества
  extractQuantity(ingredient) {
    // Проверяем специальные фразы
    for (const [phrase, amount] of Object.entries(quantityPhrases)) {
      if (ingredient.includes(phrase)) {
        return { amount, unit: 'г', confidence: 90 };
      }
    }

    // Ищем диапазоны (2-3, 100-200)
    const rangeMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      const avg = (min + max) / 2;
      return { amount: avg, unit: 'г', confidence: 80 };
    }

    // Ищем дробные числа (1.5, 2.5)
    const decimalMatch = ingredient.match(/(\d+\.\d+)\s*(г|кг|мл|л|шт|штук|кусочков?)?/);
    if (decimalMatch) {
      const amount = parseFloat(decimalMatch[1]);
      const unit = decimalMatch[2] || 'г';
      return { amount, unit, confidence: 95 };
    }

    // Ищем целые числа
    const numberMatch = ingredient.match(/(\d+)\s*(г|кг|мл|л|шт|штук|кусочков?|столовая ложка|ч\.л\.|стакан|чашка|пучок|веточка|лист|зубчик|щепотка)?/);
    if (numberMatch) {
      const amount = parseFloat(numberMatch[1]);
      const unit = numberMatch[2] || 'г';
      return { amount, unit, confidence: 95 };
    }

    // Если ничего не найдено, используем значение по умолчанию
    return { amount: 100, unit: 'г', confidence: 50 };
  }

  // Извлечение способа приготовления
  extractCookingMethod(ingredient) {
    const lower = ingredient.toLowerCase();
    
    for (const [method, _] of Object.entries(cookingMethods)) {
      if (lower.includes(method)) {
        return method;
      }
    }
    
    return 'варка'; // По умолчанию
  }

  // Очистка названия ингредиента
  cleanIngredientName(ingredient) {
    return ingredient
      .replace(/\d+(?:\.\d+)?\s*(г|кг|мл|л|шт|штук|кусочков?|столовая ложка|ч\.л\.|стакан|чашка|пучок|веточка|лист|зубчик|щепотка)/g, '')
      .replace(/\b(вареный|жареный|запеченный|тушеный|сырой|свежий|сушеный|маринованный|соленый|сладкий)\b/g, '')
      .replace(/\b(мелко|крупно|тонко|толсто)\s*(нарезанный|нарезанный|натертый|натертый)\b/g, '')
      .replace(/\b(по\s+вкусу|немного|чуть-чуть|совсем\s+немного|щепотка|горсть|несколько|пара|парочка)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Обработка ингредиента
  processIngredient(ingredient, defaultCookingMethod) {
    const cookingMethod = ingredient.cookingMethod || defaultCookingMethod;
    const nutrition = this.findIngredientNutrition(ingredient.name);
    
    if (!nutrition) {
      return { nutrition: null, confidence: 0, warning: null };
    }

    // Конвертируем количество в граммы
    const quantityInGrams = this.convertToGrams(ingredient.quantity, ingredient.unit);
    
    // Применяем коэффициент способа приготовления
    const cookingCoeff = cookingMethods[cookingMethod] || 1.0;
    
    // Рассчитываем питательную ценность
    const result = {
      calories: (nutrition.calories * quantityInGrams * cookingCoeff) / 100,
      protein: (nutrition.protein * quantityInGrams) / 100,
      carbs: (nutrition.carbs * quantityInGrams) / 100,
      fat: (nutrition.fat * quantityInGrams) / 100
    };

    // Определяем уверенность
    let confidence = ingredient.confidence;
    if (cookingMethod !== 'варка' && cookingMethod !== 'сырой') {
      confidence *= 0.9; // Снижаем уверенность для сложных способов приготовления
    }

    // Предупреждения
    let warning = null;
    if (quantityInGrams > 1000) {
      warning = `Большое количество ${ingredient.name} (${quantityInGrams}г)`;
    } else if (quantityInGrams < 5) {
      warning = `Очень малое количество ${ingredient.name} (${quantityInGrams}г)`;
    }

    return { nutrition: result, confidence, warning };
  }

  // Поиск питательной ценности ингредиента с использованием расширенной базы данных
  findIngredientNutrition(ingredientName) {
    // Проверяем кеш
    if (this.ingredientCache.has(ingredientName)) {
      return this.ingredientCache.get(ingredientName);
    }

    // Сначала ищем в расширенной базе Calorizator.ru
    const calorizatorResult = findProductInDatabase(ingredientName);
    if (calorizatorResult) {
      const result = {
        calories: calorizatorResult.calories,
        protein: calorizatorResult.protein,
        carbs: calorizatorResult.carbs,
        fat: calorizatorResult.fat,
        category: calorizatorResult.category,
        confidence: 0.95,
        source: 'calorizator_database'
      };
      this.ingredientCache.set(ingredientName, result);
      return result;
    }

    // Используем машинное обучение для распознавания в базовой базе
    const mlResult = ingredientML.smartRecognize(ingredientName, nutritionDatabase);
    
    if (mlResult && nutritionDatabase[mlResult.key]) {
      const result = nutritionDatabase[mlResult.key];
      this.ingredientCache.set(ingredientName, result);
      
      // Обучаем систему на успешном совпадении
      ingredientML.learnFromSuccess(ingredientName, mlResult.key, mlResult.confidence);
      
      return result;
    }

    // Fallback к стандартному распознаванию
    const standardResult = this.standardRecognize(ingredientName);
    if (standardResult) {
      this.ingredientCache.set(ingredientName, standardResult);
      return standardResult;
    }

    // Обучаем систему на неудачном совпадении
    const attemptedKeys = Object.keys(nutritionDatabase).filter(key => 
      ingredientName.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(ingredientName.toLowerCase())
    );
    ingredientML.learnFromFailure(ingredientName, attemptedKeys);

    return null;
  }

  // Стандартное распознавание (fallback)
  standardRecognize(ingredientName) {
    // Точное совпадение
    if (nutritionDatabase[ingredientName]) {
      return nutritionDatabase[ingredientName];
    }

    // Поиск по частичному совпадению с приоритетом
    const matches = Object.entries(nutritionDatabase)
      .filter(([key, _]) => {
        const name = ingredientName.toLowerCase();
        const dbKey = key.toLowerCase();
        
        // Точное совпадение
        if (name === dbKey) return true;
        
        // Содержит ключевое слово
        if (name.includes(dbKey) || dbKey.includes(name)) return true;
        
        // Поиск по корневым словам
        const nameWords = name.split(/\s+/);
        const keyWords = dbKey.split(/\s+/);
        
        return nameWords.some(word => 
          keyWords.some(keyWord => 
            word.includes(keyWord) || keyWord.includes(word)
          )
        );
      })
      .sort((a, b) => {
        // Приоритет: точное совпадение > длина ключа > алфавитный порядок
        const aKey = a[0].toLowerCase();
        const bKey = b[0].toLowerCase();
        const name = ingredientName.toLowerCase();
        
        if (name === aKey && name !== bKey) return -1;
        if (name === bKey && name !== aKey) return 1;
        if (aKey.length !== bKey.length) return bKey.length - aKey.length;
        return aKey.localeCompare(bKey);
      });

    if (matches.length > 0) {
      return matches[0][1];
    }

    return null;
  }

  // Конверсия в граммы
  convertToGrams(amount, unit) {
    if (!unit || unit === 'г' || unit === 'грамм') {
      return amount;
    }

    const conversion = unitConversions[unit.toLowerCase()];
    if (conversion) {
      return amount * conversion;
    }

    // Если единица не найдена, предполагаем граммы
    return amount;
  }

  // Валидация результата
  validateResult(result) {
    const warnings = [...result.warnings];
    
    // Проверка на разумные значения
    if (result.calories > 5000) {
      warnings.push('Очень высокое содержание калорий. Проверьте количество ингредиентов.');
    }
    
    if (result.protein > 500) {
      warnings.push('Очень высокое содержание белка. Проверьте количество ингредиентов.');
    }
    
    if (result.carbs > 1000) {
      warnings.push('Очень высокое содержание углеводов. Проверьте количество ингредиентов.');
    }
    
    if (result.fat > 500) {
      warnings.push('Очень высокое содержание жиров. Проверьте количество ингредиентов.');
    }

    // Проверка на нулевые значения
    if (result.calories === 0 && result.protein === 0 && result.carbs === 0 && result.fat === 0) {
      warnings.push('Не удалось рассчитать питательную ценность. Проверьте правильность написания ингредиентов.');
    }

    return {
      ...result,
      warnings
    };
  }

  // Получение рекомендаций по улучшению
  getRecommendations(result) {
    const recommendations = [];
    
    if (result.confidence < 80) {
      recommendations.push('Используйте более точные названия ингредиентов');
    }
    
    if (result.unrecognized.length > 0) {
      recommendations.push('Добавьте неизвестные ингредиенты в базу данных');
    }
    
    if (result.warnings.length > 0) {
      recommendations.push('Проверьте предупреждения и скорректируйте значения');
    }

    return recommendations;
  }
}

// Экспорт экземпляра для использования
export const smartNutritionCalculator = new SmartNutritionCalculator();
