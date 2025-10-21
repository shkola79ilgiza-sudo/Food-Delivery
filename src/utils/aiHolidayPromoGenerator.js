/**
 * 🖼️ AI-Генератор Праздничных Промо-Текстов
 *
 * Создаёт продающие тексты для праздничных акций, баннеров и промо.
 */

class AIHolidayPromoGenerator {
  constructor() {
    // Шаблоны эмоциональных триггеров по праздникам
    this.emotionalTriggers = {
      "Новый год": {
        emotions: ["волшебство", "семейное тепло", "новые начинания", "сказка"],
        cta: ["Встречайте", "Подарите", "Закажите сейчас", "Не упустите"],
        tone: "festive",
        urgency: "high",
      },
      "8 Марта": {
        emotions: ["нежность", "забота", "красота", "любовь"],
        cta: ["Порадуйте", "Удивите", "Позаботьтесь", "Подарите радость"],
        tone: "gentle",
        urgency: "medium",
      },
      "23 Февраля": {
        emotions: ["мужество", "сила", "благодарность", "уважение"],
        cta: ["Поздравьте", "Угостите", "Отметьте", "Закажите"],
        tone: "confident",
        urgency: "medium",
      },
      Пасха: {
        emotions: ["светлость", "традиция", "духовность", "обновление"],
        cta: ["Отпразднуйте", "Разделите", "Встречайте", "Соберитесь"],
        tone: "spiritual",
        urgency: "low",
      },
      "День Победы": {
        emotions: ["гордость", "память", "уважение", "благодарность"],
        cta: ["Почтите память", "Отметьте", "Соберитесь", "Вспомните"],
        tone: "respectful",
        urgency: "low",
      },
      Масленица: {
        emotions: ["веселье", "традиция", "изобилие", "радость"],
        cta: ["Отпразднуйте", "Попробуйте", "Закажите", "Насладитесь"],
        tone: "cheerful",
        urgency: "medium",
      },
      "День Рождения": {
        emotions: ["радость", "праздник", "веселье", "счастье"],
        cta: ["Закажите", "Удивите", "Порадуйте", "Отпразднуйте"],
        tone: "joyful",
        urgency: "high",
      },
      Корпоратив: {
        emotions: ["успех", "командный дух", "профессионализм", "достижения"],
        cta: ["Организуйте", "Закажите", "Обеспечьте", "Удивите коллег"],
        tone: "professional",
        urgency: "medium",
      },
    };

    // Формулы продающих заголовков
    this.headlineFormulas = [
      "{CTA} {emotion} {праздник}! {benefit}",
      "{праздник}: {benefit} + {bonus}!",
      "{urgency}! {CTA} {блюдо} к {праздник}",
      "Только к {праздник}: {benefit} - {скидка}%!",
    ];
  }

  /**
   * Генерация промо-текста для конкретного блюда/набора
   *
   * @param {Object} dish - блюдо или набор
   * @param {String} holiday - праздник
   * @param {Object} options - опции генерации
   * @returns {Object} сгенерированные варианты текстов
   */
  generatePromoText(dish, holiday, options = {}) {
    const holidayData = this.emotionalTriggers[holiday];

    if (!holidayData) {
      return {
        success: false,
        error: "Неизвестный праздник",
      };
    }

    const variants = [];

    // Генерируем 3 варианта
    for (let i = 0; i < 3; i++) {
      const variant = this.generateSingleVariant(dish, holiday, holidayData, i);
      variants.push(variant);
    }

    return {
      success: true,
      variants: variants,
      holiday: holiday,
      tone: holidayData.tone,
    };
  }

  /**
   * Генерация одного варианта промо-текста
   */
  generateSingleVariant(dish, holiday, holidayData, variantIndex) {
    const emotion =
      holidayData.emotions[variantIndex % holidayData.emotions.length];
    const cta = holidayData.cta[variantIndex % holidayData.cta.length];

    // Генерируем заголовок
    let headline = "";

    switch (variantIndex) {
      case 0:
        // Формула 1: Эмоция + Действие
        headline = `${this.getEmoji(holiday)} ${cta} ${emotion} ${holiday}!`;
        break;
      case 1:
        // Формула 2: Срочность + Выгода
        headline = `${this.getUrgencyPrefix(holidayData.urgency)} ${
          dish.name || "Праздничный набор"
        } к ${holiday}`;
        break;
      case 2:
        // Формула 3: Праздник + Скидка
        const discount = dish.discount || 15;
        headline = `${holiday}: ${
          dish.name || "Специальное предложение"
        } - Скидка ${discount}%!`;
        break;
      default:
        headline = `${cta} ${
          dish.name || "наш праздничный набор"
        } к ${holiday}!`;
    }

    // Генерируем описание
    const description = this.generateDescription(
      dish,
      holiday,
      holidayData,
      variantIndex
    );

    // Генерируем CTA (Call To Action)
    const ctaText = this.generateCTA(dish, holiday, holidayData, variantIndex);

    return {
      headline: headline,
      description: description,
      cta: ctaText,
      variant: variantIndex + 1,
      length: headline.length + description.length,
    };
  }

  /**
   * Генерация описания
   */
  generateDescription(dish, holiday, holidayData, variantIndex) {
    const price = dish.pricing?.discountedPrice || dish.price || 0;
    const discount = dish.pricing?.discount || 15;
    const persons = dish.persons || 1;

    const templates = [
      // Вариант 1: Фокус на качестве
      `${
        dish.description || "Наше фирменное блюдо"
      } - идеальный выбор для ${holiday}! ` +
        `Готовим с любовью специально для вас. ` +
        `${
          persons > 1 ? `На ${persons} персон` : "Порция"
        } всего за ${price}₽. ` +
        `Экономьте ${discount}% и получайте удовольствие!`,

      // Вариант 2: Фокус на удобстве
      `Не тратьте время на готовку - закажите ${
        dish.name || "наш праздничный набор"
      }! ` +
        `Всё включено, всё готово. ${
          persons > 1 ? `${persons} персон накормлены` : "Вкусно и сытно"
        }. ` +
        `Специальная цена к ${holiday}: ${price}₽ (обычно дороже на ${discount}%). ` +
        `Доставка в праздничной упаковке!`,

      // Вариант 3: Фокус на эмоциях
      `${holiday} - это время для близких! Создайте незабываемую атмосферу с нашим ${
        dish.name || "праздничным набором"
      }. ` +
        `${dish.dishes?.length || 1} блюд${
          dish.dishes?.length > 1 ? "а" : "о"
        }, ${persons} счастливых гостей, ` +
        `0 хлопот. Цена праздника: всего ${price}₽ вместо ${Math.round(
          price * (1 + discount / 100)
        )}₽!`,
    ];

    return templates[variantIndex % templates.length];
  }

  /**
   * Генерация Call-To-Action
   */
  generateCTA(dish, holiday, holidayData, variantIndex) {
    const deadline = dish.validUntil;

    const ctas = [
      deadline ? `⏰ Заказать до ${deadline}` : `🎁 Заказать сейчас`,
      `🚀 Забронировать ${dish.name || "набор"}`,
      `💝 Оформить праздничный заказ`,
    ];

    return ctas[variantIndex % ctas.length];
  }

  /**
   * Получить эмодзи для праздника
   */
  getEmoji(holiday) {
    const emojis = {
      "Новый год": "🎄",
      "8 Марта": "🌸",
      "23 Февраля": "🎖️",
      Пасха: "🥚",
      "День Победы": "🎗️",
      Масленица: "🥞",
      "День Рождения": "🎂",
      Корпоратив: "🏢",
    };

    return emojis[holiday] || "🎉";
  }

  /**
   * Получить префикс срочности
   */
  getUrgencyPrefix(urgency) {
    switch (urgency) {
      case "high":
        return "🔥 ТОЛЬКО СЕГОДНЯ:";
      case "medium":
        return "⏰ Осталось мало времени!";
      case "low":
        return "✨ Специальное предложение:";
      default:
        return "🎉";
    }
  }

  /**
   * Генерация баннера для социальных сетей
   */
  generateSocialMediaBanner(dish, holiday, platform = "instagram") {
    const holidayData = this.emotionalTriggers[holiday];

    const platformFormats = {
      instagram: {
        maxLength: 150,
        hashtagCount: 5,
        emojiDensity: "high",
      },
      facebook: {
        maxLength: 300,
        hashtagCount: 3,
        emojiDensity: "medium",
      },
      vk: {
        maxLength: 200,
        hashtagCount: 4,
        emojiDensity: "medium",
      },
    };

    const format = platformFormats[platform];

    const emoji = this.getEmoji(holiday);
    const cta = holidayData.cta[0];
    const emotion = holidayData.emotions[0];

    const text =
      `${emoji} ${cta} ${emotion} ${holiday}!\n\n` +
      `${dish.name || "Праздничный набор"} - ` +
      `${dish.persons || 1} персон${dish.persons > 1 ? "" : "а"}\n` +
      `💰 Всего ${dish.pricing?.discountedPrice || dish.price}₽ ` +
      `(скидка ${dish.pricing?.discount || 15}%)\n\n` +
      `${dish.promoText || "Торопитесь - количество ограничено!"}\n\n`;

    // Добавляем хештеги
    const hashtags = this.generateHashtags(holiday, dish, format.hashtagCount);

    return {
      text: text + hashtags.join(" "),
      platform: platform,
      length: text.length,
      hashtags: hashtags,
    };
  }

  /**
   * Генерация хештегов
   */
  generateHashtags(holiday, dish, count) {
    const allHashtags = [
      `#${holiday.replace(/\s/g, "")}`,
      "#fooddelivery",
      "#доставкаеды",
      "#праздничныйстол",
      "#готовыйстол",
      `#набор${holiday.replace(/\s/g, "")}`,
      "#акция",
      "#скидка",
      "#заказать",
      "#праздник",
    ];

    // Возвращаем нужное количество
    return allHashtags.slice(0, count);
  }

  /**
   * Генерация email-рассылки
   */
  generateEmailPromo(dish, holiday, recipientName = "Уважаемый клиент") {
    // const holidayData = this.emotionalTriggers[holiday]; // Не используется в текущей реализации
    const emoji = this.getEmoji(holiday);

    const subject = `${emoji} Специальное предложение к ${holiday}!`;

    const body = `
      Здравствуйте, ${recipientName}!

      ${holiday} совсем скоро, и мы подготовили для вас специальное предложение!

      ${emoji} ${dish.name || "Праздничный набор"}
      
      ${dish.description || "Готовый праздничный стол без хлопот!"}

      📦 В составе:
      ${
        dish.dishes
          ? dish.dishes
              .map((d) => `• ${d.name} (${d.portionsPerDish} порций)`)
              .join("\n      ")
          : "• Всё необходимое для праздника"
      }

      💰 Цена: ${dish.pricing?.discountedPrice || dish.price}₽ (вместо ${
      dish.pricing?.recommendedPrice ||
      Math.round((dish.pricing?.discountedPrice || dish.price) * 1.15)
    }₽)
      💝 Ваша экономия: ${
        dish.pricing?.savings || Math.round((dish.price || 0) * 0.15)
      }₽
      
      ${
        dish.promoText || "🎁 При заказе до конца недели - бесплатная доставка!"
      }

      ⏰ Успейте заказать до ${dish.validUntil || "конца акции"}!

      С уважением,
      Команда FoodDelivery
    `;

    return {
      subject: subject,
      body: body.trim(),
      holiday: holiday,
    };
  }

  /**
   * Генерация SMS-уведомления
   */
  generateSMS(dish, holiday) {
    const emoji = this.getEmoji(holiday);
    const price = dish.pricing?.discountedPrice || dish.price;
    const discount = dish.pricing?.discount || 15;

    const templates = [
      `${emoji} ${holiday}! ${
        dish.name || "Праздничный набор"
      } всего ${price}₽ (скидка ${discount}%). Заказ: [ссылка]`,
      `${emoji} К ${holiday}: ${
        dish.name || "Готовый стол"
      } - ${price}₽. Успейте до ${dish.validUntil || "праздника"}! [ссылка]`,
      `${emoji} Спец.цена к ${holiday}: ${
        dish.name || "Набор"
      } ${price}₽ (-${discount}%). Заказ: [ссылка]`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Генерация Push-уведомления
   */
  generatePushNotification(dish, holiday) {
    const emoji = this.getEmoji(holiday);

    return {
      title: `${emoji} ${holiday} уже близко!`,
      body: `${dish.name || "Праздничный набор"} со скидкой ${
        dish.pricing?.discount || 15
      }% - всего ${dish.pricing?.discountedPrice || dish.price}₽!`,
      action: "Заказать",
      icon: emoji,
      urgency: this.emotionalTriggers[holiday]?.urgency || "medium",
    };
  }

  /**
   * Генерация полного маркетингового пакета
   */
  generateFullMarketingKit(dish, holiday) {
    const variants = this.generatePromoText(dish, holiday);
    const socialBanners = {
      instagram: this.generateSocialMediaBanner(dish, holiday, "instagram"),
      facebook: this.generateSocialMediaBanner(dish, holiday, "facebook"),
      vk: this.generateSocialMediaBanner(dish, holiday, "vk"),
    };
    const email = this.generateEmailPromo(dish, holiday);
    const sms = this.generateSMS(dish, holiday);
    const push = this.generatePushNotification(dish, holiday);

    return {
      success: true,
      holiday: holiday,
      textVariants: variants.variants,
      socialMedia: socialBanners,
      email: email,
      sms: sms,
      push: push,
      downloadable: {
        format: "json",
        data: {
          holiday,
          dish: dish.name,
          price: dish.pricing?.discountedPrice || dish.price,
          variants,
          socialBanners,
          email,
          sms,
          push,
        },
      },
    };
  }

  /**
   * A/B тестирование: какой вариант сработает лучше
   */
  predictBestVariant(variants, targetAudience = "all") {
    // Симуляция AI-предсказания на основе длины, эмоций и CTA

    const scores = variants.map((variant, idx) => {
      let score = 0;

      // Длина заголовка (короче = лучше)
      if (variant.headline.length < 50) score += 10;
      else if (variant.headline.length < 80) score += 5;

      // Наличие чисел (конкретика)
      if (/\d+/.test(variant.headline)) score += 15;

      // Наличие скидки
      if (/скидка|%|-\d+%/i.test(variant.headline)) score += 20;

      // Наличие срочности
      if (/только|сегодня|осталось|успейте/i.test(variant.headline))
        score += 15;

      // Эмодзи
      const emojiCount = (
        variant.headline.match(/[\u{1F300}-\u{1F9FF}]/gu) || []
      ).length;
      score += Math.min(emojiCount * 5, 15);

      return {
        ...variant,
        predictedScore: score,
        recommendation:
          score > 40 ? "Отлично!" : score > 25 ? "Хорошо" : "Можно улучшить",
      };
    });

    // Сортируем по убыванию score
    scores.sort((a, b) => b.predictedScore - a.predictedScore);

    return {
      bestVariant: scores[0],
      allVariants: scores,
      recommendation: `AI рекомендует вариант ${scores[0].variant}: самый высокий прогнозируемый CTR`,
    };
  }

  /**
   * Генерация визуального баннера (текстовое описание для дизайнера)
   */
  generateBannerDesignBrief(dish, holiday) {
    // const holidayData = this.emotionalTriggers[holiday]; // Не используется в текущей реализации
    const color = this.getHolidayColor(holiday);

    return {
      layout: {
        size: "1200x628px (стандарт для соцсетей)",
        orientation: "horizontal",
      },
      colors: {
        primary: color,
        secondary: this.getComplementaryColor(color),
        background: "#ffffff",
      },
      typography: {
        headline: {
          text: `${this.getEmoji(holiday)} ${holiday}`,
          font: "Montserrat Bold",
          size: "48px",
          color: color,
        },
        subheadline: {
          text: dish.name || "Праздничный набор",
          font: "Montserrat Regular",
          size: "32px",
          color: "#333",
        },
        price: {
          text: `${dish.pricing?.discountedPrice || dish.price}₽`,
          font: "Montserrat Black",
          size: "64px",
          color: color,
        },
        discount: {
          text: `-${dish.pricing?.discount || 15}%`,
          font: "Montserrat Bold",
          size: "36px",
          color: "#ff4444",
          background: "#fff",
          badge: true,
        },
      },
      images: {
        main: dish.photo || "праздничный стол",
        background: `праздничный паттерн (${holiday})`,
        decorations: [`${this.getEmoji(holiday)}`, "конфетти", "звёзды"],
      },
      cta: {
        text: "ЗАКАЗАТЬ СЕЙЧАС",
        style: "button",
        color: color,
        position: "bottom-right",
      },
    };
  }

  /**
   * Получить цвет праздника
   */
  getHolidayColor(holiday) {
    const colors = {
      "Новый год": "#ff4444",
      "8 Марта": "#ff69b4",
      "23 Февраля": "#4a90e2",
      Пасха: "#ffd700",
      "День Победы": "#ff6b6b",
      Масленица: "#ffaa00",
      "День Рождения": "#9c27b0",
      Корпоратив: "#3f51b5",
    };

    return colors[holiday] || "#2196f3";
  }

  /**
   * Получить дополнительный цвет
   */
  getComplementaryColor(primaryColor) {
    // Простая логика для комплементарных цветов
    const complementary = {
      "#ff4444": "#44ffaa",
      "#ff69b4": "#69ffb4",
      "#4a90e2": "#e2904a",
      "#ffd700": "#0027ff",
      "#ff6b6b": "#6bffff",
      "#ffaa00": "#00aaff",
      "#9c27b0": "#27b09c",
      "#3f51b5": "#b5513f",
    };

    return complementary[primaryColor] || "#ffffff";
  }
}

// Экспортируем класс и экземпляр
export { AIHolidayPromoGenerator };
const aiHolidayPromoGenerator = new AIHolidayPromoGenerator();
export default aiHolidayPromoGenerator;
