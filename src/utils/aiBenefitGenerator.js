/**
 * AI Benefit Generator - Генератор продающих текстов о пользе блюд
 * Создает убедительные описания преимуществ блюд на основе их питательной ценности
 */

class AIBenefitGenerator {
  constructor() {
    this.nutritionBenefits = {
      protein: {
        high: {
          benefits: ['строительство мышц', 'восстановление тканей', 'укрепление иммунитета', 'долгое чувство сытости'],
          keywords: ['белок', 'протеин', 'аминокислоты'],
          emoji: '💪'
        },
        medium: {
          benefits: ['поддержание мышечной массы', 'нормальный обмен веществ'],
          keywords: ['белок', 'протеин'],
          emoji: '🏃'
        }
      },
      fiber: {
        high: {
          benefits: ['улучшение пищеварения', 'нормализация работы кишечника', 'контроль уровня сахара', 'снижение холестерина'],
          keywords: ['клетчатка', 'пищевые волокна', 'овощи'],
          emoji: '🌾'
        },
        medium: {
          benefits: ['поддержка пищеварения', 'регулярность стула'],
          keywords: ['клетчатка', 'овощи'],
          emoji: '🥗'
        }
      },
      vitamins: {
        A: {
          benefits: ['улучшение зрения', 'здоровье кожи', 'укрепление иммунитета'],
          sources: ['морковь', 'тыква', 'сладкий картофель', 'шпинат'],
          emoji: '👁️'
        },
        C: {
          benefits: ['укрепление иммунитета', 'антиоксидантная защита', 'синтез коллагена'],
          sources: ['цитрусовые', 'болгарский перец', 'брокколи', 'клубника'],
          emoji: '🍊'
        },
        D: {
          benefits: ['здоровье костей', 'укрепление иммунитета', 'улучшение настроения'],
          sources: ['рыба', 'яйца', 'грибы'],
          emoji: '☀️'
        },
        E: {
          benefits: ['антиоксидантная защита', 'здоровье кожи', 'защита клеток'],
          sources: ['орехи', 'семена', 'растительные масла', 'авокадо'],
          emoji: '🥑'
        },
        K: {
          benefits: ['свертываемость крови', 'здоровье костей', 'предотвращение кальцификации'],
          sources: ['листовая зелень', 'брокколи', 'капуста'],
          emoji: '🥬'
        },
        B: {
          benefits: ['энергетический обмен', 'здоровье нервной системы', 'производство красных кровяных клеток'],
          sources: ['мясо', 'рыба', 'яйца', 'бобовые', 'цельные зерна'],
          emoji: '⚡'
        }
      },
      minerals: {
        iron: {
          benefits: ['предотвращение анемии', 'транспорт кислорода', 'повышение энергии'],
          sources: ['красное мясо', 'шпинат', 'бобовые', 'тофу'],
          emoji: '🩸'
        },
        calcium: {
          benefits: ['здоровье костей и зубов', 'мышечная функция', 'нервная передача'],
          sources: ['молочные продукты', 'листовая зелень', 'тофу', 'миндаль'],
          emoji: '🦴'
        },
        magnesium: {
          benefits: ['здоровье сердца', 'снижение стресса', 'улучшение сна', 'мышечное восстановление'],
          sources: ['орехи', 'семена', 'темный шоколад', 'бананы'],
          emoji: '❤️'
        },
        potassium: {
          benefits: ['контроль давления', 'здоровье сердца', 'мышечные сокращения'],
          sources: ['бананы', 'картофель', 'авокадо', 'шпинат'],
          emoji: '💓'
        },
        zinc: {
          benefits: ['укрепление иммунитета', 'заживление ран', 'синтез ДНК'],
          sources: ['мясо', 'морепродукты', 'семена', 'орехи'],
          emoji: '🛡️'
        }
      },
      omega3: {
        benefits: ['здоровье сердца', 'улучшение работы мозга', 'снижение воспалений', 'улучшение настроения'],
        sources: ['жирная рыба', 'семена льна', 'грецкие орехи', 'чиа'],
        emoji: '🐟'
      },
      antioxidants: {
        benefits: ['защита от старения', 'снижение риска хронических заболеваний', 'улучшение работы мозга'],
        sources: ['ягоды', 'темный шоколад', 'зеленый чай', 'орехи'],
        emoji: '🛡️'
      },
      lowGI: {
        benefits: ['стабильный уровень энергии', 'контроль аппетита', 'снижение риска диабета', 'улучшение концентрации'],
        keywords: ['низкий ГИ', 'медленные углеводы', 'цельные зерна'],
        emoji: '📊'
      }
    };

    this.mealTimeBenefits = {
      breakfast: {
        general: 'Идеальный завтрак для энергичного начала дня',
        emoji: '🌅'
      },
      lunch: {
        general: 'Сбалансированный обед для поддержания продуктивности',
        emoji: '☀️'
      },
      dinner: {
        general: 'Легкий и питательный ужин для восстановления',
        emoji: '🌙'
      },
      snack: {
        general: 'Здоровый перекус для подзарядки энергии',
        emoji: '🍎'
      },
      'pre-workout': {
        general: 'Оптимальный выбор перед тренировкой',
        emoji: '🏋️'
      },
      'post-workout': {
        general: 'Восстанавливающее питание после тренировки',
        emoji: '💪'
      }
    };

    this.goalBenefits = {
      weight_loss: {
        keywords: ['низкокалорийный', 'сытный', 'богатый белком', 'низкий ГИ'],
        benefits: ['контроль аппетита', 'ускорение метаболизма', 'сжигание жира'],
        emoji: '🎯'
      },
      muscle_gain: {
        keywords: ['высокобелковый', 'питательный', 'энергетический'],
        benefits: ['рост мышц', 'восстановление', 'набор массы'],
        emoji: '💪'
      },
      healthy: {
        keywords: ['сбалансированный', 'натуральный', 'полезный'],
        benefits: ['общее здоровье', 'энергия', 'долголетие'],
        emoji: '🌱'
      },
      energy: {
        keywords: ['энергетический', 'тонизирующий', 'бодрящий'],
        benefits: ['повышение энергии', 'улучшение концентрации', 'борьба с усталостью'],
        emoji: '⚡'
      },
      immunity: {
        keywords: ['укрепляющий', 'витаминный', 'иммуностимулирующий'],
        benefits: ['укрепление иммунитета', 'защита от болезней', 'быстрое восстановление'],
        emoji: '🛡️'
      }
    };

    this.seasonalBenefits = {
      spring: {
        keywords: ['свежий', 'витаминный', 'легкий'],
        benefits: ['детоксикация', 'обновление организма', 'витаминная подзарядка'],
        emoji: '🌸'
      },
      summer: {
        keywords: ['освежающий', 'гидратирующий', 'легкий'],
        benefits: ['увлажнение', 'охлаждение', 'энергия'],
        emoji: '☀️'
      },
      autumn: {
        keywords: ['согревающий', 'укрепляющий', 'питательный'],
        benefits: ['укрепление иммунитета', 'подготовка к зиме', 'согревание'],
        emoji: '🍂'
      },
      winter: {
        keywords: ['согревающий', 'сытный', 'иммуностимулирующий'],
        benefits: ['согревание', 'защита от простуд', 'энергия'],
        emoji: '❄️'
      }
    };

    this.templates = {
      short: [
        '{emoji} {benefit1} и {benefit2}',
        'Богат {nutrient}, что способствует {benefit1}',
        '{emoji} Идеально для {goal}: {benefit1}'
      ],
      medium: [
        '{emoji} Это блюдо богато {nutrient}, что помогает {benefit1} и {benefit2}. {call_to_action}',
        'Благодаря высокому содержанию {nutrient}, это блюдо {benefit1}. {emoji} {additional_benefit}',
        '{emoji} Идеальный выбор для {goal}! Содержит {nutrient}, необходимый для {benefit1} и {benefit2}'
      ],
      long: [
        '{emoji} Наше блюдо "{dish_name}" - это настоящий кладезь пользы! Благодаря высокому содержанию {nutrient1} и {nutrient2}, оно способствует {benefit1}, {benefit2} и {benefit3}. {mealtime_benefit} {call_to_action}',
        '🌟 "{dish_name}" - ваш идеальный выбор для {goal}! Это блюдо содержит {nutrient1}, который {benefit1}, а также {nutrient2}, необходимый для {benefit2}. {emoji} {seasonal_benefit} {call_to_action}'
      ]
    };

    this.callToActions = [
      'Попробуйте сегодня!',
      'Закажите прямо сейчас!',
      'Ваш организм скажет "спасибо"!',
      'Инвестиция в ваше здоровье!',
      'Побалуйте себя пользой!',
      'Здоровье начинается с правильного выбора!',
      'Доступно для заказа сегодня!'
    ];
  }

  /**
   * Генерирует продающий текст о пользе блюда
   * @param {Object} dish - Блюдо для анализа
   * @param {String} format - Формат текста ('short', 'medium', 'long')
   * @param {String} goal - Цель клиента (опционально)
   * @returns {String} Продающий текст
   */
  generateBenefit(dish, format = 'medium', goal = null) {
    console.log('💡 Generating benefit text...', { dish: dish.name, format, goal });

    try {
      const analysis = this.analyzeDishNutrition(dish);
      const benefits = this.extractKeyBenefits(analysis, goal);
      const text = this.composeBenefitText(dish, benefits, format, goal);

      console.log('✅ Benefit text generated:', text);
      return text;
    } catch (error) {
      console.error('❌ Error generating benefit:', error);
      return this.generateFallbackBenefit(dish);
    }
  }

  /**
   * Анализирует питательную ценность блюда
   */
  analyzeDishNutrition(dish) {
    const analysis = {
      macronutrients: {},
      micronutrients: {},
      specialProperties: [],
      ingredients: this.parseIngredients(dish.ingredients || ''),
      dietaryTags: []
    };

    // Анализ макронутриентов
    if (dish.dishProtein && dish.dishProtein > 20) {
      analysis.macronutrients.protein = 'high';
    } else if (dish.dishProtein && dish.dishProtein > 10) {
      analysis.macronutrients.protein = 'medium';
    }

    if (dish.dishFiber && dish.dishFiber > 5) {
      analysis.macronutrients.fiber = 'high';
    } else if (dish.dishFiber && dish.dishFiber > 3) {
      analysis.macronutrients.fiber = 'medium';
    }

    if (dish.dishCalories && dish.dishCalories < 300) {
      analysis.specialProperties.push('low_calorie');
    }

    if (dish.dishFat && dish.dishFat < 10) {
      analysis.specialProperties.push('low_fat');
    }

    // Анализ микронутриентов по ингредиентам
    analysis.micronutrients = this.identifyMicronutrients(analysis.ingredients);

    // Диетические теги
    if (dish.diabeticFriendly) {
      analysis.dietaryTags.push('low_gi');
    }

    if (dish.vegetarian) {
      analysis.dietaryTags.push('vegetarian');
    }

    if (dish.vegan) {
      analysis.dietaryTags.push('vegan');
    }

    return analysis;
  }

  /**
   * Парсит ингредиенты
   */
  parseIngredients(ingredientsString) {
    if (!ingredientsString) return [];
    return ingredientsString.split(',').map(ing => ing.trim().toLowerCase());
  }

  /**
   * Определяет микронутриенты по ингредиентам
   */
  identifyMicronutrients(ingredients) {
    const micronutrients = {
      vitamins: [],
      minerals: [],
      other: []
    };

    ingredients.forEach(ingredient => {
      // Витамины
      Object.entries(this.nutritionBenefits.vitamins).forEach(([vitamin, data]) => {
        if (data.sources.some(source => ingredient.includes(source))) {
          if (!micronutrients.vitamins.includes(vitamin)) {
            micronutrients.vitamins.push(vitamin);
          }
        }
      });

      // Минералы
      Object.entries(this.nutritionBenefits.minerals).forEach(([mineral, data]) => {
        if (data.sources.some(source => ingredient.includes(source))) {
          if (!micronutrients.minerals.includes(mineral)) {
            micronutrients.minerals.push(mineral);
          }
        }
      });

      // Омега-3
      if (this.nutritionBenefits.omega3.sources.some(source => ingredient.includes(source))) {
        micronutrients.other.push('omega3');
      }

      // Антиоксиданты
      if (this.nutritionBenefits.antioxidants.sources.some(source => ingredient.includes(source))) {
        micronutrients.other.push('antioxidants');
      }
    });

    return micronutrients;
  }

  /**
   * Извлекает ключевые преимущества
   */
  extractKeyBenefits(analysis, goal) {
    const benefits = {
      primary: [],
      secondary: [],
      nutrients: [],
      emojis: []
    };

    // Преимущества из макронутриентов
    if (analysis.macronutrients.protein) {
      const proteinData = this.nutritionBenefits.protein[analysis.macronutrients.protein];
      benefits.primary.push(...proteinData.benefits.slice(0, 2));
      benefits.nutrients.push('белок');
      benefits.emojis.push(proteinData.emoji);
    }

    if (analysis.macronutrients.fiber) {
      const fiberData = this.nutritionBenefits.fiber[analysis.macronutrients.fiber];
      benefits.primary.push(...fiberData.benefits.slice(0, 2));
      benefits.nutrients.push('клетчатка');
      benefits.emojis.push(fiberData.emoji);
    }

    // Преимущества из микронутриентов
    analysis.micronutrients.vitamins.slice(0, 2).forEach(vitamin => {
      const vitaminData = this.nutritionBenefits.vitamins[vitamin];
      benefits.secondary.push(...vitaminData.benefits.slice(0, 1));
      benefits.nutrients.push(`витамин ${vitamin}`);
      benefits.emojis.push(vitaminData.emoji);
    });

    analysis.micronutrients.minerals.slice(0, 2).forEach(mineral => {
      const mineralData = this.nutritionBenefits.minerals[mineral];
      benefits.secondary.push(...mineralData.benefits.slice(0, 1));
      benefits.nutrients.push(mineral);
      benefits.emojis.push(mineralData.emoji);
    });

    // Преимущества из специальных свойств
    if (analysis.specialProperties.includes('low_calorie')) {
      benefits.primary.push('контроль веса');
    }

    if (analysis.dietaryTags.includes('low_gi')) {
      benefits.primary.push(...this.nutritionBenefits.lowGI.benefits.slice(0, 2));
      benefits.emojis.push(this.nutritionBenefits.lowGI.emoji);
    }

    // Преимущества, связанные с целью
    if (goal && this.goalBenefits[goal]) {
      const goalData = this.goalBenefits[goal];
      benefits.primary.push(...goalData.benefits.slice(0, 2));
      benefits.emojis.push(goalData.emoji);
    }

    return benefits;
  }

  /**
   * Составляет текст о пользе
   */
  composeBenefitText(dish, benefits, format, goal) {
    const templates = this.templates[format] || this.templates.medium;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const replacements = {
      '{emoji}': benefits.emojis[0] || '🌟',
      '{dish_name}': dish.name,
      '{benefit1}': benefits.primary[0] || 'улучшение здоровья',
      '{benefit2}': benefits.primary[1] || 'повышение энергии',
      '{benefit3}': benefits.secondary[0] || 'общее благополучие',
      '{nutrient}': benefits.nutrients[0] || 'питательные вещества',
      '{nutrient1}': benefits.nutrients[0] || 'белок',
      '{nutrient2}': benefits.nutrients[1] || 'витамины',
      '{goal}': goal ? this.goalBenefits[goal]?.keywords[0] || 'здорового питания' : 'здорового питания',
      '{call_to_action}': this.callToActions[Math.floor(Math.random() * this.callToActions.length)],
      '{mealtime_benefit}': this.getMealTimeBenefit(dish),
      '{seasonal_benefit}': this.getSeasonalBenefit(),
      '{additional_benefit}': benefits.secondary[0] || 'Отличный выбор для здорового питания!'
    };

    let text = template;
    Object.entries(replacements).forEach(([key, value]) => {
      text = text.replace(new RegExp(key, 'g'), value);
    });

    return text;
  }

  /**
   * Получает преимущество по времени приема пищи
   */
  getMealTimeBenefit(dish) {
    // Простая логика определения времени приема пищи
    const name = dish.name.toLowerCase();
    
    if (name.includes('каша') || name.includes('омлет') || name.includes('творог')) {
      return this.mealTimeBenefits.breakfast.general;
    } else if (name.includes('суп') || name.includes('салат')) {
      return this.mealTimeBenefits.lunch.general;
    } else if (name.includes('мясо') || name.includes('рыба')) {
      return this.mealTimeBenefits.dinner.general;
    }

    return '';
  }

  /**
   * Получает сезонное преимущество
   */
  getSeasonalBenefit() {
    const month = new Date().getMonth();
    let season;

    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';

    const seasonData = this.seasonalBenefits[season];
    return `${seasonData.emoji} ${seasonData.benefits[0]}`;
  }

  /**
   * Генерирует резервный текст о пользе
   */
  generateFallbackBenefit(dish) {
    return `🌟 "${dish.name}" - вкусное и питательное блюдо, приготовленное с любовью! Попробуйте сегодня!`;
  }

  /**
   * Генерирует список преимуществ для нескольких блюд
   */
  generateBulkBenefits(dishes, format = 'medium', goal = null) {
    console.log(`💡 Generating benefits for ${dishes.length} dishes...`);

    const results = dishes.map(dish => ({
      dishId: dish.id,
      dishName: dish.name,
      benefit: this.generateBenefit(dish, format, goal),
      shortBenefit: this.generateBenefit(dish, 'short', goal),
      longBenefit: this.generateBenefit(dish, 'long', goal)
    }));

    console.log('✅ Bulk benefits generated');
    return results;
  }

  /**
   * Генерирует заголовки для карточек блюд
   */
  generateCatchyHeadlines(dish) {
    const headlines = [];

    // На основе питательности
    if (dish.dishProtein && dish.dishProtein > 20) {
      headlines.push('💪 Силовая бомба!');
      headlines.push('Белковый чемпион!');
    }

    if (dish.dishCalories && dish.dishCalories < 300) {
      headlines.push('🎯 Легкое и сытное!');
      headlines.push('Идеально для фигуры!');
    }

    if (dish.diabeticFriendly) {
      headlines.push('✨ Подходит для диабетиков!');
      headlines.push('Контроль сахара в крови!');
    }

    // Общие заголовки
    headlines.push('🌟 Здоровый выбор!');
    headlines.push('❤️ С любовью к вашему здоровью!');

    return headlines;
  }

  /**
   * Генерирует хештеги для социальных сетей
   */
  generateHashtags(dish, goal = null) {
    const hashtags = ['#ЗдоровоеПитание', '#ВкусноИПолезно'];

    if (dish.dishProtein && dish.dishProtein > 20) {
      hashtags.push('#БелковаяЕда', '#Фитнес');
    }

    if (dish.diabeticFriendly) {
      hashtags.push('#ДляДиабетиков', '#НизкийГИ');
    }

    if (goal === 'weight_loss') {
      hashtags.push('#ПП', '#Похудение');
    }

    if (goal === 'muscle_gain') {
      hashtags.push('#НаборМассы', '#Спортпит');
    }

    return hashtags;
  }
}

// Создаем экземпляр и экспортируем
const aiBenefitGenerator = new AIBenefitGenerator();
export default aiBenefitGenerator;
