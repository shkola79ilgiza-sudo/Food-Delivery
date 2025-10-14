// Простой диабетический калькулятор без сложных AI операций
// Предотвращает зависания страницы

export class SimpleDiabeticCalculator {
  constructor() {
    this.ingredientDatabase = {
      // Овощи (низкий ГИ)
      'помидор': { sugar: 2.6, gi: 15, diabeticFriendly: true },
      'огурец': { sugar: 1.7, gi: 15, diabeticFriendly: true },
      'капуста': { sugar: 3.2, gi: 10, diabeticFriendly: true },
      'морковь': { sugar: 4.7, gi: 35, diabeticFriendly: true },
      'лук': { sugar: 4.2, gi: 15, diabeticFriendly: true },
      'чеснок': { sugar: 1.0, gi: 15, diabeticFriendly: true },
      'перец': { sugar: 2.4, gi: 15, diabeticFriendly: true },
      'баклажан': { sugar: 3.5, gi: 15, diabeticFriendly: true },
      'кабачок': { sugar: 2.5, gi: 15, diabeticFriendly: true },
      'тыква': { sugar: 4.2, gi: 75, diabeticFriendly: false },
      
      // Фрукты (средний ГИ)
      'яблоко': { sugar: 10.4, gi: 36, diabeticFriendly: true },
      'груша': { sugar: 9.8, gi: 38, diabeticFriendly: true },
      'апельсин': { sugar: 8.1, gi: 42, diabeticFriendly: true },
      'банан': { sugar: 12.2, gi: 51, diabeticFriendly: false },
      'виноград': { sugar: 16.0, gi: 46, diabeticFriendly: false },
      
      // Мясо и рыба (низкий ГИ)
      'курица': { sugar: 0, gi: 0, diabeticFriendly: true },
      'говядина': { sugar: 0, gi: 0, diabeticFriendly: true },
      'свинина': { sugar: 0, gi: 0, diabeticFriendly: true },
      'рыба': { sugar: 0, gi: 0, diabeticFriendly: true },
      'лосось': { sugar: 0, gi: 0, diabeticFriendly: true },
      'тунец': { sugar: 0, gi: 0, diabeticFriendly: true },
      
      // Молочные продукты
      'молоко': { sugar: 4.7, gi: 30, diabeticFriendly: true },
      'сыр': { sugar: 0.1, gi: 0, diabeticFriendly: true },
      'творог': { sugar: 3.3, gi: 30, diabeticFriendly: true },
      'йогурт': { sugar: 4.7, gi: 35, diabeticFriendly: true },
      
      // Зерновые
      'рис': { sugar: 0.1, gi: 73, diabeticFriendly: false },
      'гречка': { sugar: 0.1, gi: 50, diabeticFriendly: true },
      'овсянка': { sugar: 0.1, gi: 55, diabeticFriendly: true },
      'хлеб': { sugar: 0.1, gi: 70, diabeticFriendly: false },
      
      // Сладости (высокий ГИ)
      'сахар': { sugar: 99.8, gi: 100, diabeticFriendly: false },
      'мед': { sugar: 82.4, gi: 90, diabeticFriendly: false },
      'шоколад': { sugar: 45.9, gi: 70, diabeticFriendly: false },
      
      // Заменители сахара
      'стевия': { sugar: 0, gi: 0, diabeticFriendly: true, sugarSubstitute: true },
      'эритрит': { sugar: 0, gi: 0, diabeticFriendly: true, sugarSubstitute: true },
      'ксилит': { sugar: 0, gi: 7, diabeticFriendly: true, sugarSubstitute: true }
    };
  }

  // Быстрый расчет без сложных операций
  calculateDiabeticValues(ingredientsText, cookingMethod = 'варка') {
    try {
      const ingredients = this.parseIngredients(ingredientsText);
      let totalSugar = 0;
      let totalGI = 0;
      let diabeticFriendly = true;
      let sugarSubstitutes = false;
      let ingredientCount = 0;

      ingredients.forEach(ingredient => {
        const data = this.ingredientDatabase[ingredient.toLowerCase()];
        if (data) {
          totalSugar += data.sugar;
          totalGI += data.gi;
          ingredientCount++;
          
          if (!data.diabeticFriendly) {
            diabeticFriendly = false;
          }
          
          if (data.sugarSubstitute) {
            sugarSubstitutes = true;
          }
        }
      });

      // Нормализуем значения
      if (ingredientCount > 0) {
        totalSugar = totalSugar / ingredientCount;
        totalGI = totalGI / ingredientCount;
      }

      // Применяем коэффициенты приготовления
      const cookingCoefficients = {
        'варка': 1.0,
        'жарка': 1.2,
        'запекание': 1.1,
        'тушение': 1.05,
        'гриль': 1.15
      };

      const coefficient = cookingCoefficients[cookingMethod] || 1.0;
      totalSugar *= coefficient;
      totalGI *= coefficient;

      // Рассчитываем уверенность
      const confidence = Math.min(0.95, 0.7 + (ingredientCount * 0.05));

      return {
        sugar: Math.round(totalSugar * 100) / 100,
        glycemicIndex: Math.round(totalGI),
        diabeticFriendly,
        sugarSubstitutes,
        confidence,
        method: 'simple_diabetic_calculator',
        ingredientCount,
        warnings: diabeticFriendly ? [] : ['Содержит ингредиенты с высоким ГИ']
      };
    } catch (error) {
      console.error('Error in simple diabetic calculator:', error);
      return {
        sugar: 0,
        glycemicIndex: 0,
        diabeticFriendly: false,
        sugarSubstitutes: false,
        confidence: 0.3,
        method: 'fallback',
        warnings: ['Ошибка расчета']
      };
    }
  }

  // Парсинг ингредиентов
  parseIngredients(text) {
    if (!text || typeof text !== 'string') return [];
    
    return text
      .toLowerCase()
      .split(/[,;]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  }

  // Добавление нового ингредиента
  addIngredient(name, data) {
    this.ingredientDatabase[name.toLowerCase()] = data;
  }

  // Получение статистики
  getStatistics() {
    const ingredients = Object.keys(this.ingredientDatabase);
    const diabeticFriendly = ingredients.filter(name => 
      this.ingredientDatabase[name].diabeticFriendly
    ).length;
    
    return {
      totalIngredients: ingredients.length,
      diabeticFriendlyIngredients: diabeticFriendly,
      diabeticFriendlyPercentage: Math.round((diabeticFriendly / ingredients.length) * 100)
    };
  }
}

// Экспорт экземпляра
export const simpleDiabeticCalculator = new SimpleDiabeticCalculator();
