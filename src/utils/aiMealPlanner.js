/**
 * AI Meal Planner - Генератор персонального рациона на 3 дня
 * Использует реальные блюда из меню для создания сбалансированного плана питания
 */

class AIMealPlanner {
  constructor() {
    this.nutritionGoals = {
      weight_loss: {
        calories: 1800,
        protein: 120,
        carbs: 180,
        fat: 60,
        fiber: 25,
        priority: ['low_calorie', 'high_protein', 'high_fiber']
      },
      muscle_gain: {
        calories: 2500,
        protein: 180,
        carbs: 300,
        fat: 80,
        fiber: 30,
        priority: ['high_protein', 'high_calorie', 'balanced']
      },
      healthy: {
        calories: 2200,
        protein: 150,
        carbs: 250,
        fat: 70,
        fiber: 28,
        priority: ['balanced', 'natural', 'variety']
      },
      diabetic_friendly: {
        calories: 2000,
        protein: 140,
        carbs: 200,
        fat: 65,
        fiber: 30,
        priority: ['low_gi', 'high_fiber', 'low_sugar']
      },
      keto: {
        calories: 1800,
        protein: 120,
        carbs: 50,
        fat: 140,
        fiber: 20,
        priority: ['high_fat', 'low_carb', 'moderate_protein']
      }
    };

    this.mealTimes = {
      breakfast: { calories: 0.25, protein: 0.25, carbs: 0.3, fat: 0.2 },
      lunch: { calories: 0.35, protein: 0.35, carbs: 0.35, fat: 0.35 },
      dinner: { calories: 0.3, protein: 0.3, carbs: 0.25, fat: 0.3 },
      snack: { calories: 0.1, protein: 0.1, carbs: 0.1, fat: 0.15 }
    };

    this.allergies = {
      gluten: ['пшеница', 'рожь', 'ячмень', 'овёс', 'хлеб', 'макароны', 'мука'],
      dairy: ['молоко', 'сыр', 'творог', 'йогурт', 'сметана', 'масло', 'сливки'],
      nuts: ['орехи', 'миндаль', 'фундук', 'грецкий', 'арахис'],
      seafood: ['рыба', 'креветки', 'краб', 'мидии', 'лосось', 'тунец'],
      eggs: ['яйца', 'яичный', 'белок', 'желток'],
      soy: ['соя', 'тофу', 'соевый', 'эдамаме']
    };
  }

  /**
   * Генерирует персональный план питания на 3 дня
   * @param {Object} params - Параметры для планирования
   * @returns {Object} План питания с блюдами и рекомендациями
   */
  async generateMealPlan(params = {}) {
    const {
      goal = 'healthy',
      allergies = [],
      preferences = [],
      availableDishes = [],
      budget = 'medium',
      cookingTime = 'medium'
    } = params;

    console.log('🍽️ Starting AI Meal Planning...', { goal, allergies, preferences });

    try {
      // 1. Получаем цели питания
      const nutritionGoal = this.nutritionGoals[goal] || this.nutritionGoals.healthy;
      console.log('📊 Nutrition goal:', nutritionGoal);

      // 2. Фильтруем блюда по аллергиям и предпочтениям
      const filteredDishes = this.filterDishes(availableDishes, allergies, preferences);
      console.log(`🍽️ Filtered dishes: ${filteredDishes.length} from ${availableDishes.length}`);

      if (filteredDishes.length === 0) {
        throw new Error('Нет доступных блюд после фильтрации по аллергиям/предпочтениям');
      }

      // 3. Классифицируем блюда по типам
      const classifiedDishes = this.classifyDishes(filteredDishes);
      console.log('🏷️ Classified dishes:', Object.keys(classifiedDishes));

      // 4. Генерируем план на 3 дня
      const mealPlan = await this.createThreeDayPlan(classifiedDishes, nutritionGoal, goal);
      console.log('📅 Generated meal plan:', mealPlan);

      // 5. Добавляем рекомендации и альтернативы
      const enhancedPlan = await this.enhancePlanWithAI(mealPlan, goal, nutritionGoal);
      console.log('✨ Enhanced plan with AI recommendations');

      return enhancedPlan;
    } catch (error) {
      console.error('❌ Error generating meal plan:', error);
      throw error;
    }
  }

  /**
   * Фильтрует блюда по аллергиям и предпочтениям
   */
  filterDishes(dishes, allergies = [], preferences = []) {
    return dishes.filter(dish => {
      // Проверяем аллергии
      const hasAllergy = allergies.some(allergy => {
        const allergyKeywords = this.allergies[allergy] || [allergy];
        return allergyKeywords.some(keyword => 
          dish.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (dish.ingredients && dish.ingredients.toLowerCase().includes(keyword.toLowerCase()))
        );
      });

      if (hasAllergy) {
        console.log(`🚫 Filtered out ${dish.name} due to allergy`);
        return false;
      }

      // Проверяем предпочтения (если указаны "только вегетарианские", "только халяль" и т.д.)
      const hasPreference = preferences.some(pref => {
        if (pref === 'vegetarian' && dish.meat) return false;
        if (pref === 'vegan' && (dish.meat || dish.dairy)) return false;
        if (pref === 'halal' && dish.alcohol) return false;
        return true;
      });

      return hasPreference;
    });
  }

  /**
   * Классифицирует блюда по типам и характеристикам
   */
  classifyDishes(dishes) {
    const classified = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      soups: [],
      salads: [],
      main_courses: [],
      desserts: [],
      low_calorie: [],
      high_protein: [],
      high_fiber: [],
      low_gi: [],
      diabetic_friendly: [],
      vegetarian: [],
      vegan: []
    };

    dishes.forEach(dish => {
      const name = dish.name.toLowerCase();
      const ingredients = (dish.ingredients || '').toLowerCase();

      // По времени приема пищи
      if (name.includes('каша') || name.includes('омлет') || name.includes('творог') || 
          name.includes('йогурт') || name.includes('блины') || name.includes('тост')) {
        classified.breakfast.push(dish);
      }
      
      if (name.includes('суп') || name.includes('борщ') || name.includes('щи') || 
          name.includes('бульон')) {
        classified.lunch.push(dish);
        classified.soups.push(dish);
      }
      
      if (name.includes('салат') || name.includes('овощи')) {
        classified.lunch.push(dish);
        classified.salads.push(dish);
      }
      
      if (name.includes('мясо') || name.includes('рыба') || name.includes('курица') || 
          name.includes('говядина') || name.includes('свинина') || name.includes('плов') || 
          name.includes('паста') || name.includes('паста')) {
        classified.dinner.push(dish);
        classified.main_courses.push(dish);
      }

      // По питательным характеристикам
      if (dish.dishCalories && dish.dishCalories < 300) {
        classified.low_calorie.push(dish);
      }
      
      if (dish.dishProtein && dish.dishProtein > 20) {
        classified.high_protein.push(dish);
      }
      
      if (dish.dishCarbs && dish.dishCarbs > 30) {
        classified.high_fiber.push(dish);
      }

      // Диабетические блюда
      if (dish.diabeticFriendly) {
        classified.diabetic_friendly.push(dish);
        classified.low_gi.push(dish);
      }

      // Вегетарианские/веганские
      if (!dish.meat) {
        classified.vegetarian.push(dish);
        if (!dish.dairy) {
          classified.vegan.push(dish);
        }
      }
    });

    return classified;
  }

  /**
   * Создает план питания на 3 дня
   */
  async createThreeDayPlan(classifiedDishes, nutritionGoal, goal) {
    const days = ['Понедельник', 'Вторник', 'Среда'];
    const mealPlan = {
      goal: goal,
      totalCalories: nutritionGoal.calories * 3,
      totalProtein: nutritionGoal.protein * 3,
      totalCarbs: nutritionGoal.carbs * 3,
      totalFat: nutritionGoal.fat * 3,
      days: [],
      summary: {
        averageCaloriesPerDay: nutritionGoal.calories,
        varietyScore: 0,
        nutritionBalance: 0
      }
    };

    for (let i = 0; i < days.length; i++) {
      const day = await this.createDayPlan(classifiedDishes, nutritionGoal, goal, i);
      mealPlan.days.push({
        day: days[i],
        date: this.getDateString(i),
        meals: day.meals,
        totals: day.totals,
        score: day.score
      });
    }

    // Рассчитываем общие метрики
    mealPlan.summary.varietyScore = this.calculateVarietyScore(mealPlan.days);
    mealPlan.summary.nutritionBalance = this.calculateNutritionBalance(mealPlan.days, nutritionGoal);

    return mealPlan;
  }

  /**
   * Создает план на один день
   */
  async createDayPlan(classifiedDishes, nutritionGoal, goal, dayIndex) {
    const dayMeals = {
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null
    };

    const dayTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    // Выбираем блюда для каждого приема пищи
    for (const mealTime of Object.keys(dayMeals)) {
      const targetCalories = nutritionGoal.calories * this.mealTimes[mealTime].calories;
      const targetProtein = nutritionGoal.protein * this.mealTimes[mealTime].protein;
      
      const selectedDish = this.selectDishForMeal(
        classifiedDishes, 
        mealTime, 
        targetCalories, 
        targetProtein, 
        goal,
        dayIndex
      );

      if (selectedDish) {
        dayMeals[mealTime] = selectedDish;
        dayTotals.calories += selectedDish.dishCalories || 0;
        dayTotals.protein += selectedDish.dishProtein || 0;
        dayTotals.carbs += selectedDish.dishCarbs || 0;
        dayTotals.fat += selectedDish.dishFat || 0;
      }
    }

    // Рассчитываем оценку дня
    const score = this.calculateDayScore(dayTotals, nutritionGoal);

    return {
      meals: dayMeals,
      totals: dayTotals,
      score: score
    };
  }

  /**
   * Выбирает блюдо для конкретного приема пищи
   */
  selectDishForMeal(classifiedDishes, mealTime, targetCalories, targetProtein, goal, dayIndex) {
    let candidates = [];

    // Определяем кандидатов в зависимости от времени приема пищи
    switch (mealTime) {
      case 'breakfast':
        candidates = [
          ...classifiedDishes.breakfast,
          ...classifiedDishes.low_calorie.filter(d => d.dishCalories < 400)
        ];
        break;
      case 'lunch':
        candidates = [
          ...classifiedDishes.soups,
          ...classifiedDishes.salads,
          ...classifiedDishes.lunch
        ];
        break;
      case 'dinner':
        candidates = [
          ...classifiedDishes.main_courses,
          ...classifiedDishes.dinner,
          ...classifiedDishes.high_protein
        ];
        break;
      case 'snack':
        candidates = [
          ...classifiedDishes.low_calorie.filter(d => d.dishCalories < 200)
        ];
        break;
    }

    // Фильтруем по целям питания
    if (goal === 'diabetic_friendly') {
      candidates = candidates.filter(d => classifiedDishes.diabetic_friendly.includes(d));
    }

    // Добавляем разнообразие по дням
    candidates = this.addVarietyByDay(candidates, dayIndex, mealTime);

    // Выбираем лучшее блюдо по калориям и белкам
    const bestDish = candidates.reduce((best, current) => {
      const bestScore = this.calculateDishScore(best, targetCalories, targetProtein);
      const currentScore = this.calculateDishScore(current, targetCalories, targetProtein);
      return currentScore > bestScore ? current : best;
    }, candidates[0]);

    return bestDish || null;
  }

  /**
   * Добавляет разнообразие по дням
   */
  addVarietyByDay(candidates, dayIndex, mealTime) {
    // Простая логика разнообразия - можно улучшить
    const varietyOffset = dayIndex * 2;
    return candidates.slice(varietyOffset % candidates.length).concat(
      candidates.slice(0, varietyOffset % candidates.length)
    );
  }

  /**
   * Рассчитывает оценку блюда для конкретной цели
   */
  calculateDishScore(dish, targetCalories, targetProtein) {
    if (!dish) return 0;

    const calories = dish.dishCalories || 0;
    const protein = dish.dishProtein || 0;

    // Оценка на основе близости к целевым значениям
    const caloriesScore = 1 - Math.abs(calories - targetCalories) / targetCalories;
    const proteinScore = 1 - Math.abs(protein - targetProtein) / Math.max(targetProtein, 1);

    return (caloriesScore + proteinScore) / 2;
  }

  /**
   * Рассчитывает оценку дня
   */
  calculateDayScore(dayTotals, nutritionGoal) {
    const caloriesScore = 1 - Math.abs(dayTotals.calories - nutritionGoal.calories) / nutritionGoal.calories;
    const proteinScore = 1 - Math.abs(dayTotals.protein - nutritionGoal.protein) / nutritionGoal.protein;
    const carbsScore = 1 - Math.abs(dayTotals.carbs - nutritionGoal.carbs) / nutritionGoal.carbs;
    const fatScore = 1 - Math.abs(dayTotals.fat - nutritionGoal.fat) / nutritionGoal.fat;

    return Math.max(0, (caloriesScore + proteinScore + carbsScore + fatScore) / 4 * 100);
  }

  /**
   * Рассчитывает показатель разнообразия
   */
  calculateVarietyScore(days) {
    const allDishes = [];
    days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) allDishes.push(meal.name);
      });
    });

    const uniqueDishes = new Set(allDishes);
    return Math.min(100, (uniqueDishes.size / allDishes.length) * 100);
  }

  /**
   * Рассчитывает баланс питания
   */
  calculateNutritionBalance(days, nutritionGoal) {
    const avgCalories = days.reduce((sum, day) => sum + day.totals.calories, 0) / days.length;
    const avgProtein = days.reduce((sum, day) => sum + day.totals.protein, 0) / days.length;

    const caloriesBalance = 1 - Math.abs(avgCalories - nutritionGoal.calories) / nutritionGoal.calories;
    const proteinBalance = 1 - Math.abs(avgProtein - nutritionGoal.protein) / nutritionGoal.protein;

    return Math.max(0, (caloriesBalance + proteinBalance) / 2 * 100);
  }

  /**
   * Улучшает план с помощью AI-рекомендаций
   */
  async enhancePlanWithAI(mealPlan, goal, nutritionGoal) {
    try {
      // Генерируем AI-рекомендации
      const aiRecommendations = await this.generateAIRecommendations(mealPlan, goal);
      
      // Добавляем альтернативы
      const alternatives = this.generateAlternatives(mealPlan);
      
      // Создаем итоговый план
      const enhancedPlan = {
        ...mealPlan,
        aiRecommendations,
        alternatives,
        tips: this.generateTips(goal),
        shoppingList: this.generateShoppingList(mealPlan),
        prepTime: this.estimatePrepTime(mealPlan),
        cost: this.estimateCost(mealPlan)
      };

      return enhancedPlan;
    } catch (error) {
      console.error('❌ Error enhancing plan with AI:', error);
      return mealPlan;
    }
  }

  /**
   * Генерирует AI-рекомендации
   */
  async generateAIRecommendations(mealPlan, goal) {
    const recommendations = [];

    // Анализируем баланс питания
    const avgScore = mealPlan.days.reduce((sum, day) => sum + day.score, 0) / mealPlan.days.length;
    
    if (avgScore < 70) {
      recommendations.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Несбалансированное питание',
        message: `Средняя оценка дня: ${avgScore.toFixed(1)}/100. Рекомендуем добавить больше белка или овощей.`,
        action: 'Добавить белковые блюда и овощи'
      });
    }

    // Анализируем разнообразие
    if (mealPlan.summary.varietyScore < 60) {
      recommendations.push({
        type: 'info',
        icon: '🔄',
        title: 'Мало разнообразия',
        message: `Показатель разнообразия: ${mealPlan.summary.varietyScore.toFixed(1)}%. Попробуйте разные типы блюд.`,
        action: 'Замените повторяющиеся блюда на альтернативы'
      });
    }

    // Целевые рекомендации
    if (goal === 'weight_loss') {
      recommendations.push({
        type: 'success',
        icon: '💪',
        title: 'Отличный план для похудения',
        message: 'План включает много овощей и белка. Не забывайте про физические упражнения!',
        action: 'Добавьте 30 минут кардио в день'
      });
    }

    return recommendations;
  }

  /**
   * Генерирует альтернативы блюд
   */
  generateAlternatives(mealPlan) {
    const alternatives = [];

    mealPlan.days.forEach((day, dayIndex) => {
      Object.entries(day.meals).forEach(([mealTime, meal]) => {
        if (meal) {
          alternatives.push({
            day: day.day,
            mealTime: mealTime,
            current: meal.name,
            alternatives: this.findAlternativeDishes(meal, mealTime)
          });
        }
      });
    });

    return alternatives;
  }

  /**
   * Находит альтернативные блюда
   */
  findAlternativeDishes(currentMeal, mealTime) {
    // Простая логика поиска альтернатив
    const alternatives = [];
    
    if (currentMeal.name.toLowerCase().includes('курица')) {
      alternatives.push('Рыба на пару', 'Говядина на гриле', 'Тофу с овощами');
    } else if (currentMeal.name.toLowerCase().includes('рис')) {
      alternatives.push('Гречка', 'Булгур', 'Киноа');
    } else if (currentMeal.name.toLowerCase().includes('салат')) {
      alternatives.push('Овощной суп', 'Тушеные овощи', 'Овощи на гриле');
    }

    return alternatives.slice(0, 3); // Максимум 3 альтернативы
  }

  /**
   * Генерирует советы по питанию
   */
  generateTips(goal) {
    const tips = {
      weight_loss: [
        'Пейте воду перед едой для снижения аппетита',
        'Ешьте медленно, тщательно пережевывая пищу',
        'Избегайте перекусов между основными приемами пищи'
      ],
      muscle_gain: [
        'Ешьте белок в течение 30 минут после тренировки',
        'Разделите приемы пищи на 5-6 раз в день',
        'Не забывайте про углеводы для энергии'
      ],
      healthy: [
        'Включайте в каждый прием пищи овощи',
        'Пейте 8 стаканов воды в день',
        'Ограничьте потребление сахара и соли'
      ],
      diabetic_friendly: [
        'Контролируйте размер порций',
        'Ешьте в одно и то же время каждый день',
        'Избегайте продуктов с высоким гликемическим индексом'
      ]
    };

    return tips[goal] || tips.healthy;
  }

  /**
   * Генерирует список покупок
   */
  generateShoppingList(mealPlan) {
    const ingredients = new Map();

    mealPlan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal && meal.ingredients) {
          const mealIngredients = meal.ingredients.split(',').map(ing => ing.trim());
          mealIngredients.forEach(ingredient => {
            if (ingredient) {
              const count = ingredients.get(ingredient) || 0;
              ingredients.set(ingredient, count + 1);
            }
          });
        }
      });
    });

    return Array.from(ingredients.entries()).map(([ingredient, count]) => ({
      ingredient,
      count,
      category: this.categorizeIngredient(ingredient)
    }));
  }

  /**
   * Категоризует ингредиент для списка покупок
   */
  categorizeIngredient(ingredient) {
    const name = ingredient.toLowerCase();
    
    if (name.includes('мясо') || name.includes('курица') || name.includes('рыба')) {
      return 'Мясо и рыба';
    } else if (name.includes('овощ') || name.includes('картофель') || name.includes('морковь')) {
      return 'Овощи';
    } else if (name.includes('молоко') || name.includes('сыр') || name.includes('творог')) {
      return 'Молочные продукты';
    } else if (name.includes('хлеб') || name.includes('мука') || name.includes('рис')) {
      return 'Зерновые';
    } else {
      return 'Прочее';
    }
  }

  /**
   * Оценивает время приготовления
   */
  estimatePrepTime(mealPlan) {
    let totalTime = 0;
    let mealCount = 0;

    mealPlan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          // Простая оценка времени приготовления
          if (meal.name.toLowerCase().includes('суп') || meal.name.toLowerCase().includes('борщ')) {
            totalTime += 60; // 1 час для супов
          } else if (meal.name.toLowerCase().includes('салат')) {
            totalTime += 15; // 15 минут для салатов
          } else {
            totalTime += 30; // 30 минут для основных блюд
          }
          mealCount++;
        }
      });
    });

    return {
      totalMinutes: totalTime,
      averagePerMeal: Math.round(totalTime / Math.max(mealCount, 1)),
      totalHours: Math.round(totalTime / 60 * 10) / 10
    };
  }

  /**
   * Оценивает стоимость плана
   */
  estimateCost(mealPlan) {
    let totalCost = 0;
    let mealCount = 0;

    mealPlan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal && meal.price) {
          totalCost += meal.price;
          mealCount++;
        }
      });
    });

    return {
      totalCost: totalCost,
      averagePerMeal: Math.round(totalCost / Math.max(mealCount, 1)),
      averagePerDay: Math.round(totalCost / mealPlan.days.length)
    };
  }

  /**
   * Получает строку даты для дня
   */
  getDateString(dayIndex) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayIndex);
    
    return targetDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    });
  }
}

// Создаем экземпляр и экспортируем
const aiMealPlanner = new AIMealPlanner();
export default aiMealPlanner;
