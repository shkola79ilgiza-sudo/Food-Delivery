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
  ]
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
