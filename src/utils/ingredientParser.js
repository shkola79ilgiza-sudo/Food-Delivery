// Улучшенный парсер ингредиентов для решения проблем с распознаванием
// Обрабатывает числа, количества и неопознанные элементы

export class IngredientParser {
  constructor() {
    this.quantityPatterns = this.initializeQuantityPatterns();
    this.unitConversions = this.initializeUnitConversions();
    this.numberWords = this.initializeNumberWords();
    this.commonMistakes = this.initializeCommonMistakes();
  }

  // Паттерны для распознавания количеств
  initializeQuantityPatterns() {
    return [
      // Простые числа
      { pattern: /^(\d+)$/, type: 'number', multiplier: 1 },
      { pattern: /^(\d+\.\d+)$/, type: 'decimal', multiplier: 1 },
      
      // Диапазоны
      { pattern: /^(\d+)-(\d+)$/, type: 'range', multiplier: 1 },
      { pattern: /^(\d+)\s*-\s*(\d+)$/, type: 'range', multiplier: 1 },
      
      // С единицами измерения
      { pattern: /^(\d+)\s*(г|грамм|g|gram)$/i, type: 'weight', multiplier: 1 },
      { pattern: /^(\d+)\s*(кг|килограмм|kg|kilogram)$/i, type: 'weight', multiplier: 1000 },
      { pattern: /^(\d+)\s*(мл|миллилитр|ml|milliliter)$/i, type: 'volume', multiplier: 1 },
      { pattern: /^(\d+)\s*(л|литр|l|liter)$/i, type: 'volume', multiplier: 1000 },
      { pattern: /^(\d+)\s*(шт|штук|piece|pcs)$/i, type: 'count', multiplier: 1 },
      { pattern: /^(\d+)\s*(ст\.л|столовая ложка|tbsp)$/i, type: 'volume', multiplier: 15 },
      { pattern: /^(\d+)\s*(ч\.л|чайная ложка|tsp)$/i, type: 'volume', multiplier: 5 },
      { pattern: /^(\d+)\s*(стакан|cup)$/i, type: 'volume', multiplier: 250 },
      
      // Диапазоны с единицами
      { pattern: /^(\d+)-(\d+)\s*(г|грамм|g)$/i, type: 'range_weight', multiplier: 1 },
      { pattern: /^(\d+)-(\d+)\s*(шт|штук|piece)$/i, type: 'range_count', multiplier: 1 },
      
      // Дробные числа
      { pattern: /^(\d+)\/(\d+)$/, type: 'fraction', multiplier: 1 },
      { pattern: /^(\d+)\s*и\s*(\d+)\/(\d+)$/, type: 'mixed_fraction', multiplier: 1 },
      
      // Словами
      { pattern: /^(один|одна|одно)$/i, type: 'word_number', multiplier: 1 },
      { pattern: /^(два|две)$/i, type: 'word_number', multiplier: 2 },
      { pattern: /^(три)$/i, type: 'word_number', multiplier: 3 },
      { pattern: /^(четыре)$/i, type: 'word_number', multiplier: 4 },
      { pattern: /^(пять)$/i, type: 'word_number', multiplier: 5 },
      { pattern: /^(шесть)$/i, type: 'word_number', multiplier: 6 },
      { pattern: /^(семь)$/i, type: 'word_number', multiplier: 7 },
      { pattern: /^(восемь)$/i, type: 'word_number', multiplier: 8 },
      { pattern: /^(девять)$/i, type: 'word_number', multiplier: 9 },
      { pattern: /^(десять)$/i, type: 'word_number', multiplier: 10 },
      
      // Неопределенные количества
      { pattern: /^(немного|чуть-чуть|щепотка|pinch)$/i, type: 'small_amount', multiplier: 1 },
      { pattern: /^(много|множество|handful)$/i, type: 'large_amount', multiplier: 100 },
      { pattern: /^(по вкусу|to taste)$/i, type: 'to_taste', multiplier: 1 },
      { pattern: /^(по желанию|optional)$/i, type: 'optional', multiplier: 1 }
    ];
  }

  // Конверсия единиц измерения
  initializeUnitConversions() {
    return {
      // Вес
      'г': 1, 'грамм': 1, 'g': 1, 'gram': 1,
      'кг': 1000, 'килограмм': 1000, 'kg': 1000, 'kilogram': 1000,
      'мг': 0.001, 'миллиграмм': 0.001, 'mg': 0.001, 'milligram': 0.001,
      
      // Объем
      'мл': 1, 'миллилитр': 1, 'ml': 1, 'milliliter': 1,
      'л': 1000, 'литр': 1000, 'l': 1000, 'liter': 1000,
      'ст.л': 15, 'столовая ложка': 15, 'tbsp': 15,
      'ч.л': 5, 'чайная ложка': 5, 'tsp': 5,
      'стакан': 250, 'cup': 250,
      
      // Количество
      'шт': 1, 'штук': 1, 'piece': 1, 'pcs': 1,
      'долька': 1, 'clove': 1,
      'зубчик': 1, 'tooth': 1,
      'лист': 1, 'leaf': 1,
      'веточка': 1, 'sprig': 1
    };
  }

  // Слова-числа
  initializeNumberWords() {
    return {
      'один': 1, 'одна': 1, 'одно': 1,
      'два': 2, 'две': 2,
      'три': 3, 'четыре': 4, 'пять': 5,
      'шесть': 6, 'семь': 7, 'восемь': 8,
      'девять': 9, 'десять': 10,
      'одиннадцать': 11, 'двенадцать': 12,
      'пятнадцать': 15, 'двадцать': 20,
      'тридцать': 30, 'сорок': 40, 'пятьдесят': 50,
      'сто': 100, 'двести': 200, 'триста': 300,
      'пятьсот': 500, 'тысяча': 1000
    };
  }

  // Частые ошибки распознавания
  initializeCommonMistakes() {
    return {
      '1-2': { type: 'range', min: 1, max: 2, unit: 'шт' },
      '2-3': { type: 'range', min: 2, max: 3, unit: 'шт' },
      '100': { type: 'number', value: 100, unit: 'г' },
      '200': { type: 'number', value: 200, unit: 'г' },
      '300': { type: 'number', value: 300, unit: 'г' },
      '500': { type: 'number', value: 500, unit: 'г' },
      '1': { type: 'number', value: 1, unit: 'шт' },
      '2': { type: 'number', value: 2, unit: 'шт' },
      '3': { type: 'number', value: 3, unit: 'шт' }
    };
  }

  // Основная функция парсинга ингредиентов
  parseIngredients(text) {
    if (!text || typeof text !== 'string') {
      return { ingredients: [], warnings: [], accuracy: 0 };
    }

    const lines = text.split(/[,\n;]/).map(line => line.trim()).filter(line => line.length > 0);
    const ingredients = [];
    const warnings = [];
    let totalProcessed = 0;
    let successfullyParsed = 0;

    lines.forEach((line, index) => {
      totalProcessed++;
      const parsed = this.parseIngredientLine(line, index);
      
      if (parsed.success) {
        ingredients.push(parsed.ingredient);
        successfullyParsed++;
      } else {
        warnings.push(parsed.warning);
      }
    });

    const accuracy = totalProcessed > 0 ? (successfullyParsed / totalProcessed) * 100 : 0;

    return {
      ingredients,
      warnings,
      accuracy: Math.round(accuracy * 100) / 100,
      totalProcessed,
      successfullyParsed,
      unrecognizedCount: totalProcessed - successfullyParsed
    };
  }

  // Парсинг отдельной строки с ингредиентом
  parseIngredientLine(line, index) {
    // Очистка строки
    const cleanLine = line.toLowerCase().trim();
    
    // Проверка на частые ошибки
    if (this.commonMistakes[cleanLine]) {
      const mistake = this.commonMistakes[cleanLine];
      return {
        success: true,
        ingredient: {
          name: `Ингредиент ${index + 1}`,
          quantity: mistake.type === 'range' ? 
            { min: mistake.min, max: mistake.max, unit: mistake.unit } :
            { value: mistake.value, unit: mistake.unit },
          confidence: 0.8,
          source: 'common_mistake'
        }
      };
    }

    // Попытка распознать количество и название
    const quantityMatch = this.extractQuantity(cleanLine);
    const name = this.extractIngredientName(cleanLine, quantityMatch);

    if (quantityMatch && name) {
      return {
        success: true,
        ingredient: {
          name: name,
          quantity: quantityMatch,
          confidence: 0.9,
          source: 'parsed'
        }
      };
    }

    // Если не удалось распознать, создаем базовый ингредиент
    return {
      success: true,
      ingredient: {
        name: cleanLine || `Ингредиент ${index + 1}`,
        quantity: { value: 1, unit: 'шт' },
        confidence: 0.3,
        source: 'fallback'
      },
      warning: `Не удалось распознать количество в "${line}". Использовано значение по умолчанию.`
    };
  }

  // Извлечение количества из строки
  extractQuantity(line) {
    for (const pattern of this.quantityPatterns) {
      const match = line.match(pattern.pattern);
      if (match) {
        switch (pattern.type) {
          case 'number':
            return {
              value: parseInt(match[1]),
              unit: 'шт',
              type: 'exact'
            };
          
          case 'decimal':
            return {
              value: parseFloat(match[1]),
              unit: 'шт',
              type: 'exact'
            };
          
          case 'range':
            return {
              min: parseInt(match[1]),
              max: parseInt(match[2]),
              unit: 'шт',
              type: 'range'
            };
          
          case 'weight':
            return {
              value: parseInt(match[1]) * pattern.multiplier,
              unit: 'г',
              type: 'exact'
            };
          
          case 'volume':
            return {
              value: parseInt(match[1]) * pattern.multiplier,
              unit: 'мл',
              type: 'exact'
            };
          
          case 'count':
            return {
              value: parseInt(match[1]),
              unit: 'шт',
              type: 'exact'
            };
          
          case 'range_weight':
            return {
              min: parseInt(match[1]) * pattern.multiplier,
              max: parseInt(match[2]) * pattern.multiplier,
              unit: 'г',
              type: 'range'
            };
          
          case 'range_count':
            return {
              min: parseInt(match[1]),
              max: parseInt(match[2]),
              unit: 'шт',
              type: 'range'
            };
          
          case 'fraction':
            const numerator = parseInt(match[1]);
            const denominator = parseInt(match[2]);
            return {
              value: numerator / denominator,
              unit: 'шт',
              type: 'exact'
            };
          
          case 'word_number':
            const wordValue = this.numberWords[match[1].toLowerCase()] || 1;
            return {
              value: wordValue,
              unit: 'шт',
              type: 'exact'
            };
          
          case 'small_amount':
            return {
              value: 5,
              unit: 'г',
              type: 'approximate'
            };
          
          case 'large_amount':
            return {
              value: 100,
              unit: 'г',
              type: 'approximate'
            };
          
          case 'to_taste':
            return {
              value: 1,
              unit: 'по вкусу',
              type: 'to_taste'
            };
          
          case 'optional':
            return {
              value: 0,
              unit: 'по желанию',
              type: 'optional'
            };
        }
      }
    }

    return null;
  }

  // Извлечение названия ингредиента
  extractIngredientName(line, quantityMatch) {
    if (!quantityMatch) {
      return line;
    }

    // Удаляем распознанное количество из строки
    let name = line;
    
    // Удаляем числа и единицы измерения
    name = name.replace(/\d+/g, '');
    name = name.replace(/(г|грамм|кг|килограмм|мл|миллилитр|л|литр|шт|штук|ст\.л|столовая ложка|ч\.л|чайная ложка|стакан)/gi, '');
    name = name.replace(/-/g, '');
    name = name.replace(/\s+/g, ' ').trim();
    
    // Удаляем лишние слова
    const stopWords = ['и', 'или', 'с', 'без', 'для', 'по', 'в', 'на', 'от', 'до'];
    name = name.split(' ').filter(word => !stopWords.includes(word.toLowerCase())).join(' ');
    
    return name || 'Неизвестный ингредиент';
  }

  // Валидация количества
  validateQuantity(quantity) {
    if (!quantity) return { valid: false, message: 'Количество не указано' };
    
    if (quantity.type === 'exact') {
      if (quantity.value <= 0) {
        return { valid: false, message: 'Количество должно быть больше 0' };
      }
      if (quantity.value > 10000) {
        return { valid: false, message: 'Количество слишком большое' };
      }
    }
    
    if (quantity.type === 'range') {
      if (quantity.min <= 0 || quantity.max <= 0) {
        return { valid: false, message: 'Диапазон должен быть больше 0' };
      }
      if (quantity.min > quantity.max) {
        return { valid: false, message: 'Минимальное значение больше максимального' };
      }
    }
    
    return { valid: true, message: 'Количество корректно' };
  }

  // Получение статистики парсинга
  getParsingStatistics() {
    return {
      patternsCount: this.quantityPatterns.length,
      unitConversionsCount: Object.keys(this.unitConversions).length,
      numberWordsCount: Object.keys(this.numberWords).length,
      commonMistakesCount: Object.keys(this.commonMistakes).length
    };
  }

  // Добавление нового паттерна
  addPattern(pattern) {
    this.quantityPatterns.push(pattern);
  }

  // Добавление новой ошибки
  addCommonMistake(mistake, correction) {
    this.commonMistakes[mistake] = correction;
  }

  // Экспорт данных
  exportData() {
    return {
      quantityPatterns: this.quantityPatterns,
      unitConversions: this.unitConversions,
      numberWords: this.numberWords,
      commonMistakes: this.commonMistakes,
      exportDate: new Date().toISOString()
    };
  }
}

// Экспорт экземпляра
export const ingredientParser = new IngredientParser();
