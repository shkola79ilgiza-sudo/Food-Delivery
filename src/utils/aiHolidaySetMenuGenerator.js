/**
 * 🎄 AI-Конструктор Праздничных Сет-Меню
 *
 * Генерирует готовые праздничные наборы блюд для поваров
 * на основе их существующего меню и предстоящих праздников.
 */

class AIHolidaySetMenuGenerator {
  constructor() {
    // База праздников России и мира
    this.holidays = {
      "Новый год": {
        date: "31.12",
        keywords: [
          "оливье",
          "селедка под шубой",
          "мандарины",
          "шампанское",
          "холодец",
        ],
        targetAudience: "семья",
        avgBudget: 5000,
        color: "#ff4444",
      },
      "8 Марта": {
        date: "08.03",
        keywords: ["торт", "десерт", "шампанское", "салат", "фрукты", "цветы"],
        targetAudience: "женщины",
        avgBudget: 3000,
        color: "#ff69b4",
      },
      "23 Февраля": {
        date: "23.02",
        keywords: ["мясо", "шашлык", "картофель", "соленья", "пиво", "закуски"],
        targetAudience: "мужчины",
        avgBudget: 3500,
        color: "#4a90e2",
      },
      Пасха: {
        date: "variable",
        keywords: ["кулич", "пасха", "яйца", "творог", "сырная пасха"],
        targetAudience: "семья",
        avgBudget: 2500,
        color: "#ffd700",
      },
      "День Победы": {
        date: "09.05",
        keywords: ["борщ", "пирожки", "каша", "компот", "традиционные блюда"],
        targetAudience: "пожилые, семья",
        avgBudget: 2000,
        color: "#ff6b6b",
      },
      Масленица: {
        date: "variable",
        keywords: ["блины", "икра", "сметана", "мёд", "варенье"],
        targetAudience: "семья",
        avgBudget: 1500,
        color: "#ffaa00",
      },
      "День Рождения": {
        date: "any",
        keywords: ["торт", "пицца", "салаты", "напитки", "закуски"],
        targetAudience: "любая",
        avgBudget: 4000,
        color: "#9c27b0",
      },
      Корпоратив: {
        date: "any",
        keywords: ["фуршет", "канапе", "салаты", "горячее", "десерт"],
        targetAudience: "офис",
        avgBudget: 8000,
        color: "#3f51b5",
      },
    };

    // Типы сет-меню по количеству персон
    this.setTypes = {
      romantic: { persons: 2, name: "Романтический ужин", margin: 50 },
      family: { persons: 4, name: "Семейный набор", margin: 45 },
      party: { persons: 8, name: "Вечеринка", margin: 40 },
      corporate: { persons: 15, name: "Корпоративный", margin: 35 },
      banquet: { persons: 30, name: "Банкет", margin: 30 },
    };
  }

  /**
   * Получить ближайший праздник
   */
  getUpcomingHoliday() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Простая логика: определяем ближайший праздник по дате
    if (currentMonth === 12 && currentDay >= 20) return "Новый год";
    if (currentMonth === 2 && currentDay >= 15) return "23 Февраля";
    if (currentMonth === 3 && currentDay <= 10) return "8 Марта";
    if (currentMonth === 4 || currentMonth === 5) return "Пасха";
    if (currentMonth === 5 && currentDay <= 12) return "День Победы";
    if (currentMonth === 2 && currentDay <= 15) return "Масленица";

    return "День Рождения"; // По умолчанию
  }

  /**
   * Генерация праздничного сет-меню с помощью AI
   *
   * @param {Array} chefDishes - блюда повара
   * @param {String} holiday - название праздника
   * @param {String} setType - тип набора (romantic, family, party, etc.)
   * @param {Object} options - дополнительные опции
   * @returns {Object} сгенерированное сет-меню
   */
  async generateHolidaySet(
    chefDishes,
    holiday = null,
    setType = "family",
    options = {}
  ) {
    try {
      // Определяем праздник
      const selectedHoliday = holiday || this.getUpcomingHoliday();
      const holidayData = this.holidays[selectedHoliday];
      const setTypeData = this.setTypes[setType];

      if (!holidayData || !setTypeData) {
        throw new Error("Неизвестный праздник или тип набора");
      }

      console.log(`🎉 Генерация сет-меню для праздника: ${selectedHoliday}`);

      // Фильтруем блюда повара по релевантности празднику
      const relevantDishes = this.filterDishesByHoliday(
        chefDishes,
        holidayData
      );

      if (relevantDishes.length === 0) {
        return {
          success: false,
          error:
            "Недостаточно подходящих блюд для создания праздничного набора",
        };
      }

      // Генерируем композицию набора
      const setComposition = this.composeSet(
        relevantDishes,
        setTypeData.persons,
        holidayData,
        options
      );

      // Рассчитываем цену с маржой
      const pricing = this.calculateSetPricing(
        setComposition,
        setTypeData.margin,
        holidayData.avgBudget
      );

      // Генерируем AI-описание и название
      const aiDescription = await this.generateAIDescription(
        selectedHoliday,
        setComposition,
        setTypeData,
        pricing
      );

      // Формируем итоговый результат
      return {
        success: true,
        set: {
          id: `holiday-set-${Date.now()}`,
          name: aiDescription.name,
          holiday: selectedHoliday,
          type: setType,
          persons: setTypeData.persons,
          dishes: setComposition,
          pricing: pricing,
          description: aiDescription.description,
          tags: aiDescription.tags,
          promoText: aiDescription.promoText,
          validUntil: this.getHolidayDeadline(selectedHoliday),
          color: holidayData.color,
        },
      };
    } catch (error) {
      console.error("❌ Ошибка генерации сет-меню:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Фильтрация блюд по релевантности празднику
   */
  filterDishesByHoliday(dishes, holidayData) {
    return dishes
      .map((dish) => {
        let relevanceScore = 0;

        // Проверяем название и ингредиенты на ключевые слова
        const dishText = `${dish.name} ${dish.description || ""} ${
          dish.ingredients || ""
        }`.toLowerCase();

        holidayData.keywords.forEach((keyword) => {
          if (dishText.includes(keyword.toLowerCase())) {
            relevanceScore += 10;
          }
        });

        // Бонус за категорию
        if (
          dish.category === "salads" &&
          holidayData.keywords.includes("салат")
        )
          relevanceScore += 5;
        if (
          dish.category === "desserts" &&
          holidayData.keywords.includes("десерт")
        )
          relevanceScore += 5;
        if (
          dish.category === "mainCourses" &&
          holidayData.keywords.includes("мясо")
        )
          relevanceScore += 5;

        return {
          ...dish,
          relevanceScore,
        };
      })
      .filter((dish) => dish.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Составление композиции набора
   */
  composeSet(dishes, persons, holidayData, options = {}) {
    const composition = [];
    const categories = {
      salads: Math.ceil(persons / 4), // 1 салат на 4 человека
      mainCourses: Math.ceil(persons / 3), // 1 горячее на 3 человека
      desserts: Math.ceil(persons / 4), // 1 десерт на 4 человека
      appetizers: Math.ceil(persons / 5), // 1 закуска на 5 человек
      beverages: Math.ceil(persons / 6), // 1 напиток на 6 человек
    };

    // Формируем набор по категориям
    Object.keys(categories).forEach((category) => {
      const categoryDishes = dishes.filter((d) => d.category === category);
      const needed = categories[category];

      for (let i = 0; i < needed && i < categoryDishes.length; i++) {
        composition.push({
          ...categoryDishes[i],
          quantity: 1,
          portionsPerDish: Math.ceil(persons / needed),
        });
      }
    });

    // Если не хватает блюд, добавляем самые релевантные
    if (composition.length < 3) {
      dishes.slice(0, 5 - composition.length).forEach((dish) => {
        if (!composition.find((d) => d.id === dish.id)) {
          composition.push({
            ...dish,
            quantity: 1,
            portionsPerDish: Math.ceil(persons / 3),
          });
        }
      });
    }

    return composition;
  }

  /**
   * Расчет цены набора с маржой
   */
  calculateSetPricing(composition, targetMargin, avgBudget) {
    let totalCost = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    composition.forEach((item) => {
      const itemCost = (item.price || 0) * (item.quantity || 1);
      totalCost += itemCost;

      // КБЖУ на все порции
      const portions = item.portionsPerDish || 1;
      totalCalories += (item.calories || 0) * portions;
      totalProtein += (item.protein || 0) * portions;
      totalCarbs += (item.carbs || 0) * portions;
      totalFat += (item.fat || 0) * portions;
    });

    // Цена с маржой
    const priceWithMargin = Math.ceil(totalCost * (1 + targetMargin / 100));

    // Округление до красивого числа
    const finalPrice = Math.ceil(priceWithMargin / 100) * 100;

    // Скидка для привлекательности
    const discount = Math.floor(Math.random() * 15) + 10; // 10-25%
    const discountedPrice = Math.ceil(finalPrice * (1 - discount / 100));

    return {
      baseCost: totalCost,
      recommendedPrice: finalPrice,
      discountedPrice: discountedPrice,
      discount: discount,
      margin: Math.round(((finalPrice - totalCost) / totalCost) * 100),
      savings: finalPrice - discountedPrice,
      nutrition: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        perPerson: {
          calories: Math.round(
            totalCalories / composition[0]?.portionsPerDish || 1
          ),
          protein: Math.round(
            totalProtein / composition[0]?.portionsPerDish || 1
          ),
          carbs: Math.round(totalCarbs / composition[0]?.portionsPerDish || 1),
          fat: Math.round(totalFat / composition[0]?.portionsPerDish || 1),
        },
      },
    };
  }

  /**
   * Генерация AI-описания набора
   */
  async generateAIDescription(holiday, composition, setTypeData, pricing) {
    const dishNames = composition.map((d) => d.name).join(", ");
    const persons = setTypeData.persons;

    // Симуляция AI (в реальности - вызов GPT/Gemini)
    const aiPrompt = `
      Создай продающее название и описание для праздничного набора:
      Праздник: ${holiday}
      Блюда: ${dishNames}
      Персон: ${persons}
      Цена: ${pricing.discountedPrice}₽ (скидка ${pricing.discount}%)
    `;

    console.log("🤖 AI Промт:", aiPrompt);

    // Генерируем название на основе праздника
    const names = {
      "Новый год": `🎄 Новогодний Семейный Стол на ${persons} персон`,
      "8 Марта": `🌸 Весенний Набор к 8 Марта на ${persons} персон`,
      "23 Февраля": `🎖️ Мужской Набор к 23 Февраля на ${persons} персон`,
      Пасха: `🥚 Пасхальный Стол на ${persons} персон`,
      "День Победы": `🎗️ Праздничный Набор ко Дню Победы на ${persons} персон`,
      Масленица: `🥞 Масленичный Набор на ${persons} персон`,
      "День Рождения": `🎂 Праздничный Набор на ${persons} персон`,
      Корпоратив: `🏢 Корпоративный Набор на ${persons} персон`,
    };

    // Генерируем описание
    const descriptions = {
      "Новый год": `Встречайте Новый год с нашим готовым праздничным столом! Включает ${composition.length} изысканных блюд: ${dishNames}. Все блюда свежеприготовленные, упакованы в праздничную упаковку. Экономия времени + скидка ${pricing.discount}%!`,
      "8 Марта": `Порадуйте любимых женщин! Готовый праздничный набор на ${persons} персон. В составе: ${dishNames}. Бесплатная доставка + праздничная упаковка. Специальная цена: ${pricing.discountedPrice}₽ вместо ${pricing.recommendedPrice}₽!`,
      "23 Февраля": `Мужской праздник требует мужского подхода! Сытный набор на ${persons} персон: ${dishNames}. Всё, что нужно для отличного вечера. Скидка ${pricing.discount}%!`,
      Пасха: `Светлый праздник Пасхи - светлые эмоции! Традиционный набор на ${persons} персон. В составе: ${dishNames}. Освящено с любовью, доставлено с заботой!`,
      "День Победы": `В память о великом подвиге! Традиционный набор на ${persons} персон: ${dishNames}. Специальная праздничная цена с уважением к ветеранам.`,
      Масленица: `Широкая Масленица на ${persons} персон! Блины и всё, что к ним нужно: ${dishNames}. Готово к столу - просто разогрей!`,
      "День Рождения": `День Рождения - это легко! Готовый праздничный стол на ${persons} персон: ${dishNames}. Вам остается только пригласить гостей!`,
      Корпоратив: `Корпоративное мероприятие на ${persons} персон без хлопот! Профессиональный фуршет: ${dishNames}. Бесплатная доставка в офис + сервировка!`,
    };

    // Генерируем промо-текст
    const promoTexts = {
      "Новый год": `🎁 НОВОГОДНЯЯ АКЦИЯ! Закажите сет-меню до 28 декабря и получите бесплатное шампанское + праздничный декор стола!`,
      "8 Марта": `💐 К 8 Марта: Каждый заказ - с бесплатной открыткой и цветочной композицией! Только до 7 марта!`,
      "23 Февраля": `🎖️ Защитникам скидка! При заказе набора - бесплатная доставка + тост за героев!`,
      Пасха: `🕊️ Христос Воскресе! Специальная цена на пасхальные наборы + бесплатная корзина для кулича!`,
      "День Победы": `🎗️ Со светлым праздником! Скидка 9% на все наборы в честь Дня Победы!`,
      Масленица: `🔥 Масленичная неделя! Закажи набор и получи рецепт фирменных блинов от шеф-повара!`,
      "День Рождения": `🎈 Именинникам везёт! Скидка 15% при заказе за 3 дня + бесплатная свеча на торт!`,
      Корпоратив: `🏢 Для компаний от 15 человек - бесплатная доставка, сервировка и корпоративный чек!`,
    };

    // Генерируем теги
    const tags = [
      `${holiday}`,
      `На ${persons} персон`,
      `Скидка ${pricing.discount}%`,
      "Готовый набор",
      "Праздничная упаковка",
    ];

    return {
      name: names[holiday] || `Праздничный Набор на ${persons} персон`,
      description:
        descriptions[holiday] ||
        `Готовый праздничный стол на ${persons} персон. В составе: ${dishNames}. Всё включено!`,
      promoText:
        promoTexts[holiday] ||
        `🎉 Специальное предложение! Скидка ${pricing.discount}% на праздничные наборы!`,
      tags: tags,
    };
  }

  /**
   * Получить дедлайн для заказа (за 2 дня до праздника)
   */
  getHolidayDeadline(holiday) {
    const holidayData = this.holidays[holiday];
    if (
      !holidayData ||
      holidayData.date === "any" ||
      holidayData.date === "variable"
    ) {
      return null;
    }

    const [day, month] = holidayData.date.split(".");
    const currentYear = new Date().getFullYear();
    const holidayDate = new Date(
      currentYear,
      parseInt(month) - 1,
      parseInt(day)
    );

    // За 2 дня до праздника
    const deadline = new Date(holidayDate);
    deadline.setDate(deadline.getDate() - 2);

    return deadline.toLocaleDateString("ru-RU");
  }

  /**
   * Генерация нескольких вариантов наборов
   */
  async generateMultipleVariants(chefDishes, holiday = null, options = {}) {
    const selectedHoliday = holiday || this.getUpcomingHoliday();
    const variants = [];

    // Генерируем варианты для разного количества персон
    const types = ["romantic", "family", "party"];

    for (const type of types) {
      const variant = await this.generateHolidaySet(
        chefDishes,
        selectedHoliday,
        type,
        options
      );
      if (variant.success) {
        variants.push(variant.set);
      }
    }

    return {
      success: true,
      holiday: selectedHoliday,
      variants: variants,
      deadline: this.getHolidayDeadline(selectedHoliday),
    };
  }

  /**
   * AI-рекомендации по оптимизации набора
   */
  generateOptimizationTips(set) {
    const tips = [];

    // Проверка КБЖУ
    const avgCalories = set.pricing.nutrition.perPerson.calories;
    if (avgCalories > 800) {
      tips.push({
        type: "warning",
        message: `⚠️ Высокая калорийность (${avgCalories} ккал/чел). Рекомендуем добавить лёгкий салат или заменить одно блюдо.`,
      });
    }

    // Проверка цены
    const holidayData = this.holidays[set.holiday];
    if (set.pricing.discountedPrice > holidayData.avgBudget * 1.2) {
      tips.push({
        type: "info",
        message: `💰 Цена выше среднего бюджета на ${Math.round(
          (set.pricing.discountedPrice / holidayData.avgBudget - 1) * 100
        )}%. Рекомендуем увеличить скидку или уменьшить порции.`,
      });
    }

    // Проверка разнообразия
    if (set.dishes.length < 4) {
      tips.push({
        type: "suggestion",
        message: `💡 Добавьте ещё ${
          4 - set.dishes.length
        } блюдо(а) для большего разнообразия и привлекательности набора.`,
      });
    }

    // Проверка баланса БЖУ
    const protein = set.pricing.nutrition.perPerson.protein;
    const carbs = set.pricing.nutrition.perPerson.carbs;

    if (protein < 20) {
      tips.push({
        type: "suggestion",
        message: `🥩 Низкое содержание белка (${protein}г). Добавьте мясное или рыбное блюдо.`,
      });
    }

    if (carbs > 100) {
      tips.push({
        type: "warning",
        message: `🍞 Много углеводов (${carbs}г). Рекомендуем сбалансировать набор овощами.`,
      });
    }

    return tips;
  }

  /**
   * Получить список всех доступных праздников
   */
  getAvailableHolidays() {
    return Object.keys(this.holidays).map((name) => ({
      name,
      ...this.holidays[name],
    }));
  }

  /**
   * Получить рекомендованные праздники на текущий месяц
   */
  getCurrentMonthHolidays() {
    const currentMonth = new Date().getMonth() + 1;
    const upcoming = [];

    Object.keys(this.holidays).forEach((name) => {
      const holiday = this.holidays[name];
      if (holiday.date !== "any" && holiday.date !== "variable") {
        const [month] = holiday.date.split("."); // day не используется
        if (
          parseInt(month) === currentMonth ||
          parseInt(month) === currentMonth + 1
        ) {
          upcoming.push({
            name,
            ...holiday,
          });
        }
      }
    });

    return upcoming;
  }
}

// Создаем и экспортируем экземпляр
const aiHolidaySetMenuGenerator = new AIHolidaySetMenuGenerator();
export default aiHolidaySetMenuGenerator;
