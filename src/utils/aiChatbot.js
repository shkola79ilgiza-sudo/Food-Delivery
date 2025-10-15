/**
 * AI Chatbot - AI-дежурный для ответов на вопросы о блюдах
 * Предоставляет мгновенные ответы на основе КБЖУ, ингредиентов и целей клиента
 */

import aiBenefitGenerator from './aiBenefitGenerator';
import { checkDiabeticRestrictions, calculateDishGI } from './diabeticRestrictions';

class AIChatbot {
  constructor() {
    this.knowledgeBase = {
      // Типичные вопросы клиентов
      questions: {
        calories: ['калории', 'ккал', 'энергетическая ценность', 'калорийность'],
        protein: ['белок', 'протеин', 'белки'],
        carbs: ['углеводы', 'сахар', 'углеводов'],
        fat: ['жиры', 'жир', 'жирность'],
        allergens: ['аллергия', 'аллерген', 'непереносимость', 'можно ли есть'],
        diabetic: ['диабет', 'сахарный диабет', 'диабетик', 'гликемический индекс', 'ги'],
        vegetarian: ['вегетарианское', 'без мяса', 'вегетарианец'],
        vegan: ['веганское', 'без животных продуктов', 'веган'],
        halal: ['халяль', 'халал', 'мусульманское'],
        kosher: ['кошерное', 'кашрут'],
        pregnancy: ['беременность', 'беременная', 'кормление грудью', 'лактация'],
        workout: ['тренировка', 'до тренировки', 'после тренировки', 'спорт', 'фитнес'],
        weight_loss: ['похудение', 'снижение веса', 'диета', 'худеть'],
        muscle_gain: ['набор массы', 'мышцы', 'масса'],
        benefits: ['польза', 'полезно', 'преимущества', 'зачем'],
        ingredients: ['состав', 'ингредиенты', 'из чего'],
        cooking: ['приготовление', 'как готовить', 'рецепт'],
        storage: ['хранение', 'срок годности', 'как хранить'],
        portion: ['порция', 'размер порции', 'сколько'],
        taste: ['вкус', 'вкусно', 'как на вкус']
      },

      // Шаблоны ответов
      responses: {
        greeting: [
          'Здравствуйте! Я AI-дежурный. Чем могу помочь? 🤖',
          'Привет! Задайте любой вопрос о блюде, и я отвечу! 😊',
          'Добрый день! Я знаю всё о блюдах в меню. Спрашивайте! 💡'
        ],
        unknown: [
          'Извините, я не уверен в ответе на этот вопрос. Могу переключить вас на живого повара? 🤔',
          'Это интересный вопрос! Лучше уточнить у повара. Хотите связаться с ним? 👨‍🍳',
          'Хм, этот вопрос выходит за рамки моих знаний. Предлагаю задать его повару! 💬'
        ],
        escalate: [
          'Отлично! Переключаю вас на живого повара. Он ответит в ближайшее время! 👨‍🍳',
          'Хорошо, сейчас соединяю с поваром. Он даст более подробный ответ! ✅',
          'Понятно! Повар получит ваш вопрос и свяжется с вами! 📞'
        ]
      }
    };

    this.conversationHistory = [];
  }

  /**
   * Обрабатывает вопрос клиента о блюде
   * @param {String} question - Вопрос клиента
   * @param {Object} dish - Блюдо, о котором спрашивают
   * @param {Object} userProfile - Профиль пользователя (цели, аллергии и т.д.)
   * @returns {Object} Ответ AI
   */
  async answerQuestion(question, dish, userProfile = {}) {
    console.log('💬 AI Chatbot processing question...', { question, dish: dish?.name, userProfile });

    try {
      // Определяем тип вопроса
      const questionType = this.classifyQuestion(question);
      console.log('🔍 Question type:', questionType);

      // Генерируем ответ на основе типа вопроса
      const response = await this.generateResponse(questionType, question, dish, userProfile);
      
      // Сохраняем в историю
      this.conversationHistory.push({
        question,
        questionType,
        response,
        dish: dish?.name,
        timestamp: new Date().toISOString()
      });

      console.log('✅ AI response generated:', response);
      return response;
    } catch (error) {
      console.error('❌ Error processing question:', error);
      return {
        answer: 'Извините, произошла ошибка. Попробуйте переформулировать вопрос или обратитесь к повару.',
        confidence: 0,
        needsEscalation: true,
        source: 'error'
      };
    }
  }

  /**
   * Классифицирует вопрос по типу
   */
  classifyQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.knowledgeBase.questions)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        return type;
      }
    }

    return 'general';
  }

  /**
   * Генерирует ответ на основе типа вопроса
   */
  async generateResponse(questionType, question, dish, userProfile) {
    if (!dish) {
      return {
        answer: 'Пожалуйста, укажите блюдо, о котором хотите спросить.',
        confidence: 0,
        needsEscalation: false,
        source: 'validation'
      };
    }

    switch (questionType) {
      case 'calories':
        return this.answerCaloriesQuestion(dish, userProfile);
      
      case 'protein':
        return this.answerProteinQuestion(dish, userProfile);
      
      case 'carbs':
        return this.answerCarbsQuestion(dish, userProfile);
      
      case 'fat':
        return this.answerFatQuestion(dish, userProfile);
      
      case 'allergens':
        return this.answerAllergensQuestion(dish, question, userProfile);
      
      case 'diabetic':
        return this.answerDiabeticQuestion(dish, userProfile);
      
      case 'vegetarian':
        return this.answerVegetarianQuestion(dish);
      
      case 'vegan':
        return this.answerVeganQuestion(dish);
      
      case 'halal':
        return this.answerHalalQuestion(dish);
      
      case 'pregnancy':
        return this.answerPregnancyQuestion(dish);
      
      case 'workout':
        return this.answerWorkoutQuestion(dish, question, userProfile);
      
      case 'weight_loss':
        return this.answerWeightLossQuestion(dish, userProfile);
      
      case 'muscle_gain':
        return this.answerMuscleGainQuestion(dish, userProfile);
      
      case 'benefits':
        return this.answerBenefitsQuestion(dish, userProfile);
      
      case 'ingredients':
        return this.answerIngredientsQuestion(dish);
      
      case 'portion':
        return this.answerPortionQuestion(dish, userProfile);
      
      default:
        return this.answerGeneralQuestion(dish, question, userProfile);
    }
  }

  /**
   * Ответ на вопрос о калориях
   */
  answerCaloriesQuestion(dish, userProfile) {
    const calories = dish.dishCalories || 0;
    let answer = `Блюдо "${dish.name}" содержит ${calories} ккал на порцию. `;

    if (calories < 300) {
      answer += 'Это низкокалорийное блюдо, отлично подходит для контроля веса! 🎯';
    } else if (calories < 500) {
      answer += 'Это умеренно калорийное блюдо, хороший выбор для сбалансированного питания. 🌱';
    } else {
      answer += 'Это калорийное блюдо, идеально для активных людей и набора энергии. ⚡';
    }

    // Персонализация под цель
    if (userProfile.goal === 'weight_loss' && calories > 400) {
      answer += '\n\n⚠️ Обратите внимание: для вашей цели "Похудение" рекомендую порцию поменьше или выбрать менее калорийную альтернативу.';
    }

    return {
      answer,
      confidence: 95,
      needsEscalation: false,
      source: 'nutrition_data',
      data: { calories }
    };
  }

  /**
   * Ответ на вопрос о белках
   */
  answerProteinQuestion(dish, userProfile) {
    const protein = dish.dishProtein || 0;
    let answer = `Блюдо "${dish.name}" содержит ${protein}г белка на порцию. `;

    if (protein > 20) {
      answer += 'Отличный источник белка! 💪 Идеально для роста мышц и восстановления.';
    } else if (protein > 10) {
      answer += 'Умеренное содержание белка, подходит для поддержания мышечной массы. 🏃';
    } else {
      answer += 'Низкое содержание белка. Рекомендую дополнить другим белковым блюдом. 🥗';
    }

    // Персонализация под цель
    if (userProfile.goal === 'muscle_gain' && protein < 20) {
      answer += '\n\n💡 Совет: для вашей цели "Набор мышечной массы" рекомендую добавить порцию протеина (мясо, рыбу, яйца).';
    }

    return {
      answer,
      confidence: 95,
      needsEscalation: false,
      source: 'nutrition_data',
      data: { protein }
    };
  }

  /**
   * Ответ на вопрос об углеводах
   */
  answerCarbsQuestion(dish, userProfile) {
    const carbs = dish.dishCarbs || 0;
    let answer = `Блюдо "${dish.name}" содержит ${carbs}г углеводов на порцию. `;

    if (carbs > 40) {
      answer += 'Высокое содержание углеводов - отличный источник энергии! ⚡';
    } else if (carbs > 20) {
      answer += 'Умеренное содержание углеводов для сбалансированного питания. 🌱';
    } else {
      answer += 'Низкое содержание углеводов, подходит для низкоуглеводных диет. 🥑';
    }

    return {
      answer,
      confidence: 95,
      needsEscalation: false,
      source: 'nutrition_data',
      data: { carbs }
    };
  }

  /**
   * Ответ на вопрос о жирах
   */
  answerFatQuestion(dish, userProfile) {
    const fat = dish.dishFat || 0;
    let answer = `Блюдо "${dish.name}" содержит ${fat}г жиров на порцию. `;

    if (fat < 10) {
      answer += 'Низкое содержание жиров, отлично для диетического питания! 🎯';
    } else if (fat < 20) {
      answer += 'Умеренное содержание жиров. 🌱';
    } else {
      answer += 'Высокое содержание жиров. Подходит для кето-диеты и активного образа жизни. 🥑';
    }

    return {
      answer,
      confidence: 95,
      needsEscalation: false,
      source: 'nutrition_data',
      data: { fat }
    };
  }

  /**
   * Ответ на вопрос об аллергенах
   */
  answerAllergensQuestion(dish, question, userProfile) {
    const ingredients = (dish.ingredients || '').toLowerCase();
    const allergens = [];

    // Проверяем на распространенные аллергены
    const commonAllergens = {
      'глютен': ['пшеница', 'рожь', 'ячмень', 'овёс', 'мука', 'хлеб'],
      'молочные продукты': ['молоко', 'сыр', 'творог', 'сметана', 'масло', 'сливки'],
      'орехи': ['орехи', 'миндаль', 'фундук', 'грецкий', 'арахис'],
      'морепродукты': ['рыба', 'креветки', 'краб', 'лосось', 'тунец'],
      'яйца': ['яйцо', 'яичный'],
      'соя': ['соя', 'тофу', 'соевый']
    };

    Object.entries(commonAllergens).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => ingredients.includes(keyword))) {
        allergens.push(allergen);
      }
    });

    let answer = `Блюдо "${dish.name}" `;
    
    if (allergens.length === 0) {
      answer += 'не содержит распространенных аллергенов (глютен, орехи, морепродукты, молочные продукты, яйца, соя). ✅';
    } else {
      answer += `содержит следующие потенциальные аллергены: ${allergens.join(', ')}. ⚠️`;
    }

    answer += `\n\nПолный состав: ${dish.ingredients || 'не указан'}`;

    // Персонализация под аллергии пользователя
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      const userAllergens = userProfile.allergies.filter(allergy => allergens.includes(allergy));
      if (userAllergens.length > 0) {
        answer += `\n\n🚨 ВНИМАНИЕ: Это блюдо содержит ваши аллергены (${userAllergens.join(', ')})! Не рекомендую заказывать.`;
      }
    }

    return {
      answer,
      confidence: allergens.length === 0 ? 85 : 95,
      needsEscalation: false,
      source: 'ingredients_analysis',
      data: { allergens, ingredients: dish.ingredients }
    };
  }

  /**
   * Ответ на вопрос о диабете
   */
  answerDiabeticQuestion(dish, userProfile) {
    const ingredients = dish.ingredients ? dish.ingredients.split(',').map(i => i.trim()) : [];
    
    let answer = `Блюдо "${dish.name}" `;

    if (dish.diabeticFriendly) {
      answer += 'помечено как подходящее для диабетиков. ✅\n\n';
      const gi = calculateDishGI(ingredients);
      answer += `Гликемический индекс: ${gi.level} (${gi.value})\n`;
      answer += `Рекомендация: ${gi.description}`;
    } else {
      const restrictions = checkDiabeticRestrictions(ingredients);
      const gi = calculateDishGI(ingredients);
      
      answer += restrictions.suitable ? 
        'не помечено официально, но подходит для диабетиков по составу. ✅' :
        'НЕ рекомендуется для диабетиков. ❌';
      
      answer += `\n\nГликемический индекс: ${gi.level} (${gi.value})`;
      
      if (restrictions.warnings.length > 0) {
        answer += `\n\nПредупреждения:\n${restrictions.warnings.map(w => `⚠️ ${w}`).join('\n')}`;
      }
    }

    return {
      answer,
      confidence: 90,
      needsEscalation: !dish.diabeticFriendly && userProfile.isDiabetic,
      source: 'diabetic_analysis',
      data: { diabeticFriendly: dish.diabeticFriendly }
    };
  }

  /**
   * Ответ на вопрос о вегетарианстве
   */
  answerVegetarianQuestion(dish) {
    const ingredients = (dish.ingredients || '').toLowerCase();
    const meatKeywords = ['мясо', 'курица', 'говядина', 'свинина', 'баранина', 'рыба', 'морепродукты'];
    const hasMeat = meatKeywords.some(keyword => ingredients.includes(keyword));

    let answer = `Блюдо "${dish.name}" `;
    
    if (!hasMeat) {
      answer += 'НЕ содержит мяса и рыбы. Подходит для вегетарианцев! ✅🥗';
    } else {
      answer += 'содержит мясо/рыбу и НЕ подходит для вегетарианцев. ❌';
    }

    return {
      answer,
      confidence: 85,
      needsEscalation: false,
      source: 'ingredients_analysis',
      data: { vegetarian: !hasMeat }
    };
  }

  /**
   * Ответ на вопрос о веганстве
   */
  answerVeganQuestion(dish) {
    const ingredients = (dish.ingredients || '').toLowerCase();
    const animalProducts = ['мясо', 'курица', 'рыба', 'молоко', 'сыр', 'творог', 'яйцо', 'мед', 'сметана', 'масло'];
    const hasAnimalProducts = animalProducts.some(keyword => ingredients.includes(keyword));

    let answer = `Блюдо "${dish.name}" `;
    
    if (!hasAnimalProducts) {
      answer += 'НЕ содержит продуктов животного происхождения. Подходит для веганов! ✅🌿';
    } else {
      answer += 'содержит продукты животного происхождения и НЕ подходит для веганов. ❌';
    }

    return {
      answer,
      confidence: 85,
      needsEscalation: false,
      source: 'ingredients_analysis',
      data: { vegan: !hasAnimalProducts }
    };
  }

  /**
   * Ответ на вопрос о халяле
   */
  answerHalalQuestion(dish) {
    const ingredients = (dish.ingredients || '').toLowerCase();
    const forbiddenKeywords = ['свинина', 'алкоголь', 'вино', 'пиво'];
    const hasForbidden = forbiddenKeywords.some(keyword => ingredients.includes(keyword));

    let answer = `Блюдо "${dish.name}" `;
    
    if (!hasForbidden) {
      answer += 'НЕ содержит запрещенных для халяль ингредиентов (свинина, алкоголь). ✅☪️\n\nОднако для полной уверенности рекомендую уточнить у повара наличие халяльной сертификации.';
    } else {
      answer += 'содержит запрещенные для халяль ингредиенты и НЕ подходит. ❌';
    }

    return {
      answer,
      confidence: hasForbidden ? 95 : 70,
      needsEscalation: !hasForbidden, // Эскалация для подтверждения сертификации
      source: 'ingredients_analysis',
      data: { halal: !hasForbidden }
    };
  }

  /**
   * Ответ на вопрос о беременности/лактации
   */
  answerPregnancyQuestion(dish) {
    const ingredients = (dish.ingredients || '').toLowerCase();
    const riskyIngredients = ['сырая рыба', 'суши', 'сырое мясо', 'мягкий сыр', 'алкоголь'];
    const hasRiskyIngredients = riskyIngredients.some(keyword => ingredients.includes(keyword));

    let answer = `Блюдо "${dish.name}" `;
    
    if (!hasRiskyIngredients) {
      answer += 'не содержит явно опасных для беременности/лактации ингредиентов. ✅\n\nОднако я рекомендую проконсультироваться с врачом для полной уверенности.';
    } else {
      answer += 'содержит ингредиенты, которые могут быть опасны при беременности/лактации. ❌\n\nСоветую выбрать другое блюдо или проконсультироваться с врачом.';
    }

    return {
      answer,
      confidence: 60,
      needsEscalation: true, // Медицинские вопросы требуют эскалации
      source: 'ingredients_analysis',
      data: { safeForPregnancy: !hasRiskyIngredients }
    };
  }

  /**
   * Ответ на вопрос о тренировках
   */
  answerWorkoutQuestion(dish, question, userProfile) {
    const lowerQuestion = question.toLowerCase();
    const isPreWorkout = lowerQuestion.includes('до') || lowerQuestion.includes('перед');
    const isPostWorkout = lowerQuestion.includes('после');

    const calories = dish.dishCalories || 0;
    const protein = dish.dishProtein || 0;
    const carbs = dish.dishCarbs || 0;

    let answer = `Блюдо "${dish.name}" `;

    if (isPreWorkout) {
      if (carbs > 30 && calories < 400) {
        answer += 'ОТЛИЧНО подходит для приема перед тренировкой! 🏋️\n\nСодержит достаточно углеводов для энергии, но не перегружает желудок.';
      } else {
        answer += 'может быть не лучшим выбором перед тренировкой. Рекомендую более легкие блюда с углеводами. ⚠️';
      }
    } else if (isPostWorkout) {
      if (protein > 20) {
        answer += 'ОТЛИЧНО подходит после тренировки! 💪\n\nВысокое содержание белка способствует восстановлению мышц.';
      } else {
        answer += 'может быть недостаточно для восстановления после тренировки. Рекомендую добавить порцию белка. 💡';
      }
    } else {
      answer += `содержит ${protein}г белка и ${carbs}г углеводов. Подходит для ${protein > 20 ? 'пост-тренировочного' : 'пре-тренировочного'} питания. 🏋️`;
    }

    return {
      answer,
      confidence: 80,
      needsEscalation: false,
      source: 'nutrition_analysis',
      data: { calories, protein, carbs }
    };
  }

  /**
   * Ответ на вопрос о похудении
   */
  answerWeightLossQuestion(dish, userProfile) {
    const calories = dish.dishCalories || 0;
    const protein = dish.dishProtein || 0;
    const fiber = dish.dishFiber || 0;

    let answer = `Блюдо "${dish.name}" `;
    let score = 0;

    if (calories < 300) score += 3;
    else if (calories < 400) score += 2;
    else if (calories < 500) score += 1;

    if (protein > 20) score += 3;
    else if (protein > 10) score += 1;

    if (fiber > 5) score += 2;

    if (score >= 6) {
      answer += 'ОТЛИЧНО подходит для похудения! 🎯\n\n';
      answer += `✅ Низкая калорийность (${calories} ккал)\n`;
      if (protein > 10) answer += `✅ Высокий белок (${protein}г) для сытости\n`;
      if (fiber > 5) answer += `✅ Клетчатка (${fiber}г) для пищеварения`;
    } else if (score >= 3) {
      answer += 'может подойти для похудения, но есть лучшие варианты. 💡';
    } else {
      answer += 'может замедлить похудение из-за высокой калорийности. Рекомендую другое блюдо. ⚠️';
    }

    return {
      answer,
      confidence: 85,
      needsEscalation: false,
      source: 'goal_analysis',
      data: { calories, protein, fiber, score }
    };
  }

  /**
   * Ответ на вопрос о наборе массы
   */
  answerMuscleGainQuestion(dish, userProfile) {
    const calories = dish.dishCalories || 0;
    const protein = dish.dishProtein || 0;

    let answer = `Блюдо "${dish.name}" `;

    if (protein > 25 && calories > 400) {
      answer += 'ИДЕАЛЬНО для набора мышечной массы! 💪\n\n';
      answer += `✅ Высокий белок (${protein}г)\n`;
      answer += `✅ Достаточная калорийность (${calories} ккал)`;
    } else if (protein > 15) {
      answer += 'подходит для набора массы, но можно усилить добавлением белкового гарнира. 💡';
    } else {
      answer += 'недостаточно белка для эффективного набора массы. Рекомендую более белковые блюда. ⚠️';
    }

    return {
      answer,
      confidence: 85,
      needsEscalation: false,
      source: 'goal_analysis',
      data: { calories, protein }
    };
  }

  /**
   * Ответ на вопрос о пользе
   */
  answerBenefitsQuestion(dish, userProfile) {
    // Используем AI Benefit Generator для создания ответа
    const benefit = aiBenefitGenerator.generateBenefit(dish, 'medium', userProfile.goal);

    return {
      answer: `💡 ${benefit}`,
      confidence: 80,
      needsEscalation: false,
      source: 'ai_benefit_generator',
      data: { benefit }
    };
  }

  /**
   * Ответ на вопрос об ингредиентах
   */
  answerIngredientsQuestion(dish) {
    const ingredients = dish.ingredients || 'Состав не указан';

    let answer = `Блюдо "${dish.name}" состоит из:\n\n${ingredients}`;

    if (dish.description) {
      answer += `\n\n📝 Описание: ${dish.description}`;
    }

    return {
      answer,
      confidence: 100,
      needsEscalation: false,
      source: 'dish_data',
      data: { ingredients }
    };
  }

  /**
   * Ответ на вопрос о порции
   */
  answerPortionQuestion(dish, userProfile) {
    const calories = dish.dishCalories || 0;
    const price = dish.price || 0;

    let answer = `Блюдо "${dish.name}":\n\n`;
    answer += `📊 Калорийность: ${calories} ккал\n`;
    answer += `💰 Цена: ${price}₽\n`;

    // Рекомендации по порции
    if (userProfile.goal === 'weight_loss' && calories > 500) {
      answer += `\n💡 Для похудения рекомендую взять половину порции или поделиться с другом!`;
    } else if (userProfile.goal === 'muscle_gain' && calories < 400) {
      answer += `\n💡 Для набора массы рекомендую взять двойную порцию или добавить гарнир!`;
    }

    return {
      answer,
      confidence: 90,
      needsEscalation: false,
      source: 'dish_data',
      data: { calories, price }
    };
  }

  /**
   * Ответ на общий вопрос
   */
  answerGeneralQuestion(dish, question, userProfile) {
    // Пытаемся найти ключевые слова в вопросе
    const lowerQuestion = question.toLowerCase();

    // Если вопрос о цене
    if (lowerQuestion.includes('цена') || lowerQuestion.includes('стоимость') || lowerQuestion.includes('сколько стоит')) {
      return {
        answer: `Блюдо "${dish.name}" стоит ${dish.price || 0}₽. 💰`,
        confidence: 100,
        needsEscalation: false,
        source: 'dish_data',
        data: { price: dish.price }
      };
    }

    // Если вопрос о времени приготовления
    if (lowerQuestion.includes('время') || lowerQuestion.includes('быстро') || lowerQuestion.includes('долго')) {
      return {
        answer: `Время приготовления блюда "${dish.name}" зависит от загруженности кухни. Обычно 15-30 минут. ⏱️\n\nДля точного времени лучше уточнить у повара!`,
        confidence: 50,
        needsEscalation: true,
        source: 'general_knowledge'
      };
    }

    // Если вопрос о доставке
    if (lowerQuestion.includes('доставка') || lowerQuestion.includes('доставить') || lowerQuestion.includes('привезти')) {
      return {
        answer: `Да, мы доставляем "${dish.name}"! 🚗\n\nСтоимость и время доставки зависят от вашего адреса. Уточните детали у службы поддержки!`,
        confidence: 70,
        needsEscalation: true,
        source: 'general_knowledge'
      };
    }

    // Если не можем ответить - эскалация
    return {
      answer: this.knowledgeBase.responses.unknown[Math.floor(Math.random() * this.knowledgeBase.responses.unknown.length)],
      confidence: 0,
      needsEscalation: true,
      source: 'unknown',
      suggestion: 'Попробуйте спросить о калориях, белках, аллергенах или пользе блюда.'
    };
  }

  /**
   * Генерирует список предложенных вопросов
   */
  generateSuggestedQuestions(dish, userProfile = {}) {
    const suggestions = [];

    // Базовые вопросы
    suggestions.push('Сколько калорий в этом блюде?');
    suggestions.push('Сколько белка в этом блюде?');
    suggestions.push('Какие ингредиенты в этом блюде?');

    // Вопросы по целям
    if (userProfile.goal === 'weight_loss') {
      suggestions.push('Подходит ли это блюдо для похудения?');
    } else if (userProfile.goal === 'muscle_gain') {
      suggestions.push('Можно ли есть это блюдо после тренировки?');
    }

    // Вопросы по аллергиям
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      suggestions.push(`Содержит ли это блюдо ${userProfile.allergies[0]}?`);
    }

    // Вопросы по диете
    if (userProfile.isDiabetic) {
      suggestions.push('Подходит ли это блюдо для диабетиков?');
    }

    suggestions.push('В чем польза этого блюда?');

    return suggestions;
  }

  /**
   * Проверяет, нужна ли эскалация к живому повару
   */
  shouldEscalate(response) {
    return response.needsEscalation || response.confidence < 70;
  }

  /**
   * Генерирует сообщение для эскалации
   */
  generateEscalationMessage(question, dish, response) {
    return {
      type: 'escalation',
      message: this.knowledgeBase.responses.escalate[Math.floor(Math.random() * this.knowledgeBase.responses.escalate.length)],
      originalQuestion: question,
      dishName: dish.name,
      aiResponse: response.answer,
      aiConfidence: response.confidence,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Получает историю разговора
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Очищает историю разговора
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Создаем экземпляр и экспортируем
const aiChatbot = new AIChatbot();
export default aiChatbot;
