// Справочник запрещенных продуктов для диабетического меню
export const diabeticRestrictions = {
  // Полностью запрещенные продукты (❌)
  forbidden: [
    'сахар', 'сахар-песок', 'сахар-рафинад', 'тростниковый сахар',
    'белый хлеб', 'батон', 'сдоба', 'печенье', 'торт', 'пирожное',
    'газировка', 'кола', 'пепси', 'фанта', 'спрайт',
    'конфеты', 'шоколад', 'леденцы', 'карамель',
    'варенье', 'джем', 'сироп', 'мед',
    'белый рис', 'манная каша', 'кукурузные хлопья',
    'картофель фри', 'чипсы', 'сухарики',
    'алкоголь', 'пиво', 'вино', 'водка'
  ],

  // Ограниченные продукты (⚠️) - можно в малых количествах
  limited: [
    'картофель', 'свекла', 'морковь', 'тыква',
    'банан', 'виноград', 'хурма', 'инжир',
    'белый рис', 'манка', 'кукуруза',
    'макароны', 'лапша', 'вермишель',
    'хлеб', 'булочки', 'круассаны'
  ],

  // Рекомендуемые заменители (✅)
  substitutes: {
    sugar: ['стевия', 'эритрит', 'ксилит', 'сорбит', 'аспартам', 'сахарин'],
    flour: ['миндальная мука', 'кокосовая мука', 'льняная мука', 'овсяная мука'],
    sweeteners: ['финики', 'изюм', 'курага', 'чернослив', 'яблочное пюре']
  },

  // Продукты с высоким ГИ (>70)
  highGI: [
    'сахар', 'сахар-песок', 'сахар-рафинад', 'тростниковый сахар',
    'белый хлеб', 'батон', 'сдоба', 'печенье',
    'белый рис', 'манная каша', 'кукурузные хлопья',
    'картофель', 'свекла', 'тыква',
    'банан', 'виноград', 'хурма'
  ],

  // Продукты со средним ГИ (50-70)
  mediumGI: [
    'коричневый рис', 'овсянка', 'гречка',
    'яблоки', 'груши', 'персики',
    'морковь', 'горох', 'фасоль'
  ],

  // Продукты с низким ГИ (<50)
  lowGI: [
    'брокколи', 'капуста', 'огурцы', 'помидоры',
    'листовая зелень', 'шпинат', 'руккола',
    'орехи', 'семена', 'авокадо',
    'рыба', 'курица', 'индейка', 'яйца'
  ],

  // База данных углеводов для расчета ХЕ (г углеводов на 100г продукта)
  carbContent: {
    // Хлеб и мучные изделия
    'хлеб': 45, 'батон': 50, 'сдоба': 55, 'печенье': 65,
    'макароны': 70, 'лапша': 70, 'вермишель': 70,
    'манная каша': 70, 'овсянка': 60, 'гречка': 65,
    
    // Крупы и злаки
    'рис': 75, 'белый рис': 75, 'коричневый рис': 70,
    'кукуруза': 20, 'кукурузные хлопья': 85,
    
    // Овощи
    'картофель': 16, 'свекла': 9, 'морковь': 7, 'тыква': 4,
    'горох': 13, 'фасоль': 12, 'чечевица': 20,
    
    // Фрукты
    'яблоки': 10, 'груши': 10, 'персики': 9, 'абрикосы': 9,
    'банан': 21, 'виноград': 15, 'хурма': 15, 'инжир': 12,
    'апельсины': 8, 'мандарины': 8, 'лимоны': 3,
    
    // Ягоды
    'клубника': 6, 'малина': 8, 'черника': 7, 'смородина': 7,
    
    // Молочные продукты
    'молоко': 4.7, 'кефир': 4, 'йогурт': 4, 'творог': 3,
    
    // Сладости и сахар
    'сахар': 100, 'мед': 80, 'варенье': 60, 'джем': 60,
    'конфеты': 85, 'шоколад': 50, 'печенье': 65,
    
    // Орехи и семена
    'орехи': 10, 'миндаль': 13, 'грецкие орехи': 10,
    'семена подсолнечника': 20, 'семена тыквы': 10
  }
};

// Функция проверки ингредиентов на диабетические ограничения
export const checkDiabeticRestrictions = (ingredients) => {
  if (!ingredients || typeof ingredients !== 'string') {
    return {
      isDiabeticFriendly: false,
      warnings: ['Не указаны ингредиенты'],
      recommendations: ['Укажите все ингредиенты для проверки']
    };
  }

  const ingredientList = ingredients.toLowerCase().split(/[,\n\r]+/).map(i => i.trim());
  const warnings = [];
  const recommendations = [];
  let isDiabeticFriendly = true;

  // Проверяем запрещенные продукты
  for (const ingredient of ingredientList) {
    for (const forbidden of diabeticRestrictions.forbidden) {
      if (ingredient.includes(forbidden)) {
        warnings.push(`⚠️ "${ingredient}" содержит запрещенный продукт: ${forbidden}`);
        isDiabeticFriendly = false;
      }
    }

    // Проверяем ограниченные продукты
    for (const limited of diabeticRestrictions.limited) {
      if (ingredient.includes(limited)) {
        warnings.push(`⚠️ "${ingredient}" - ограниченный продукт, используйте в малых количествах`);
      }
    }
  }

  // Рекомендации по заменителям
  if (ingredients.toLowerCase().includes('сахар')) {
    recommendations.push('💡 Замените сахар на стевию, эритрит или ксилит');
  }
  if (ingredients.toLowerCase().includes('белая мука')) {
    recommendations.push('💡 Используйте миндальную или кокосовую муку вместо белой');
  }
  if (ingredients.toLowerCase().includes('белый хлеб')) {
    recommendations.push('💡 Замените на цельнозерновой хлеб или хлебцы');
  }

  return {
    isDiabeticFriendly,
    warnings,
    recommendations,
    ingredientCount: ingredientList.length,
    forbiddenCount: warnings.filter(w => w.includes('запрещенный')).length,
    limitedCount: warnings.filter(w => w.includes('ограниченный')).length
  };
};

// Функция расчета гликемического индекса блюда
export const calculateDishGI = (ingredients) => {
  if (!ingredients || typeof ingredients !== 'string') {
    return { gi: 0, level: 'unknown', description: 'Не указаны ингредиенты' };
  }

  const ingredientList = ingredients.toLowerCase().split(/[,\n\r]+/).map(i => i.trim());
  let totalGI = 0;
  let ingredientCount = 0;

  for (const ingredient of ingredientList) {
    // Проверяем высокий ГИ
    for (const highGI of diabeticRestrictions.highGI) {
      if (ingredient.includes(highGI)) {
        totalGI += 80; // Средний высокий ГИ
        ingredientCount++;
        break;
      }
    }

    // Проверяем средний ГИ
    for (const mediumGI of diabeticRestrictions.mediumGI) {
      if (ingredient.includes(mediumGI)) {
        totalGI += 60; // Средний ГИ
        ingredientCount++;
        break;
      }
    }

    // Проверяем низкий ГИ
    for (const lowGI of diabeticRestrictions.lowGI) {
      if (ingredient.includes(lowGI)) {
        totalGI += 30; // Низкий ГИ
        ingredientCount++;
        break;
      }
    }

    // Специальная проверка для сахара - он должен давать высокий ГИ
    if (ingredient.includes('сахар')) {
      totalGI += 100; // Сахар имеет очень высокий ГИ
      ingredientCount++;
    }
  }

  const averageGI = ingredientCount > 0 ? totalGI / ingredientCount : 0;
  
  let level, description;
  if (averageGI >= 70) {
    level = 'high';
    description = 'Высокий ГИ - не рекомендуется для диабетиков';
  } else if (averageGI >= 50) {
    level = 'medium';
    description = 'Средний ГИ - можно в ограниченных количествах';
  } else {
    level = 'low';
    description = 'Низкий ГИ - подходит для диабетиков';
  }

  return {
    gi: Math.round(averageGI),
    level,
    description
  };
};

// Функция генерации AI-рекомендаций для диабетиков
export const generateDiabeticRecommendations = (ingredients, gi, isDiabeticFriendly) => {
  const recommendations = [];

  if (isDiabeticFriendly) {
    recommendations.push('✅ Блюдо подходит для диабетического меню');
    
    if (gi.level === 'low') {
      recommendations.push('🟢 Низкий гликемический индекс - отлично для диабетиков');
    } else if (gi.level === 'medium') {
      recommendations.push('🟡 Средний гликемический индекс - можно в умеренных количествах');
    }
  } else {
    recommendations.push('❌ Блюдо не подходит для диабетического меню');
    recommendations.push('🔧 Требуется замена ингредиентов');
  }

  // Специфические рекомендации
  if (ingredients.toLowerCase().includes('овощи')) {
    recommendations.push('🥬 Овощи - отличный выбор для диабетиков');
  }
  if (ingredients.toLowerCase().includes('белок')) {
    recommendations.push('🥩 Белок помогает стабилизировать уровень сахара');
  }
  if (ingredients.toLowerCase().includes('клетчатка')) {
    recommendations.push('🌾 Клетчатка замедляет всасывание углеводов');
  }

  return recommendations;
};

// Функция расчета Хлебных Единиц (ХЕ) для диабетиков
export const calculateBreadUnits = (ingredients, portions = 1) => {
  if (!ingredients || typeof ingredients !== 'string') {
    return {
      totalXE: 0,
      details: [],
      recommendations: ['Не указаны ингредиенты для расчета ХЕ']
    };
  }

  const ingredientList = ingredients.toLowerCase().split(/[,\n\r]+/).map(i => i.trim());
  const carbContent = diabeticRestrictions.carbContent;
  const details = [];
  let totalCarbohydrates = 0;

  // Парсим ингредиенты и их количество
  for (const ingredient of ingredientList) {
    let carbPer100g = 0;
    let ingredientName = ingredient;
    let quantity = 100; // По умолчанию считаем на 100г

    // Ищем количество в ингредиенте (например: "200г риса", "1 стакан молока")
    const quantityMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(г|кг|мл|л|стакан|шт|штук|кусок)/);
    if (quantityMatch) {
      quantity = parseFloat(quantityMatch[1]);
      const unit = quantityMatch[2];
      
      // Конвертируем единицы измерения
      if (unit === 'кг') quantity *= 1000;
      if (unit === 'л') quantity *= 1000;
      if (unit === 'стакан') quantity *= 250; // Примерно 250мл
      if (unit === 'шт' || unit === 'штук') quantity *= 50; // Примерно 50г на штуку
      if (unit === 'кусок') quantity *= 30; // Примерно 30г на кусок
      
      ingredientName = ingredient.replace(quantityMatch[0], '').trim();
    }

    // Ищем углеводы для ингредиента
    for (const [product, carbs] of Object.entries(carbContent)) {
      if (ingredientName.includes(product)) {
        carbPer100g = carbs;
        break;
      }
    }

    if (carbPer100g > 0) {
      const carbsInIngredient = (carbPer100g * quantity) / 100;
      const xeInIngredient = carbsInIngredient / 12; // 1 ХЕ = 12г углеводов
      
      totalCarbohydrates += carbsInIngredient;
      
      details.push({
        ingredient: ingredient,
        quantity: quantity,
        carbsPer100g: carbPer100g,
        carbsInIngredient: Math.round(carbsInIngredient * 10) / 10,
        xeInIngredient: Math.round(xeInIngredient * 10) / 10
      });
    }
  }

  const totalXE = Math.round((totalCarbohydrates / 12) * 10) / 10;
  const xePerPortion = Math.round((totalXE / portions) * 10) / 10;

  // Генерируем рекомендации
  const recommendations = [];
  
  if (totalXE === 0) {
    recommendations.push('🍃 Блюдо не содержит углеводов - 0 ХЕ');
  } else if (totalXE <= 1) {
    recommendations.push('✅ Низкое содержание углеводов - отлично для диабетиков');
  } else if (totalXE <= 2) {
    recommendations.push('🟡 Умеренное содержание углеводов - подходит для диабетиков');
  } else if (totalXE <= 4) {
    recommendations.push('🟠 Высокое содержание углеводов - требует осторожности');
  } else {
    recommendations.push('🔴 Очень высокое содержание углеводов - не рекомендуется для диабетиков');
  }

  if (xePerPortion > 2) {
    recommendations.push(`⚠️ На порцию приходится ${xePerPortion} ХЕ - рассмотрите уменьшение порции`);
  }

  return {
    totalXE,
    xePerPortion,
    totalCarbohydrates: Math.round(totalCarbohydrates * 10) / 10,
    details,
    recommendations,
    portions
  };
};
