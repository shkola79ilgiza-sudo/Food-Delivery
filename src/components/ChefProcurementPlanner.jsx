import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import "../App.css";

const ChefProcurementPlanner = ({ onClose }) => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // week, month, quarter
  const [addedToShoppingList, setAddedToShoppingList] = useState(new Set()); // Отслеживаем добавленные блюда
  const [removedRecommendations, setRemovedRecommendations] = useState(
    new Set()
  ); // Отслеживаем удаленные рекомендации

  // Вспомогательные функции
  const getIngredientIcon = (ingredient) => {
    const normalizedIngredient = ingredient.toLowerCase().trim();

    // Мясо и птица
    if (
      normalizedIngredient.includes("курица") ||
      normalizedIngredient.includes("куриное")
    )
      return "🍗";
    if (
      normalizedIngredient.includes("говядина") ||
      normalizedIngredient.includes("говяжье")
    )
      return "🥩";
    if (
      normalizedIngredient.includes("свинина") ||
      normalizedIngredient.includes("свиное")
    )
      return "🐷";
    if (
      normalizedIngredient.includes("баранина") ||
      normalizedIngredient.includes("баранье")
    )
      return "🐑";
    if (
      normalizedIngredient.includes("рыба") ||
      normalizedIngredient.includes("лосось") ||
      normalizedIngredient.includes("треска")
    )
      return "🐟";

    // Овощи
    if (
      normalizedIngredient.includes("картофель") ||
      normalizedIngredient.includes("картошка")
    )
      return "🥔";
    if (normalizedIngredient.includes("лук")) return "🧅";
    if (
      normalizedIngredient.includes("морковь") ||
      normalizedIngredient.includes("морковка")
    )
      return "🥕";
    if (
      normalizedIngredient.includes("помидор") ||
      normalizedIngredient.includes("томат")
    )
      return "🍅";
    if (normalizedIngredient.includes("огурец")) return "🥒";
    if (normalizedIngredient.includes("капуста")) return "🥬";
    if (normalizedIngredient.includes("перец")) return "🫑";
    if (normalizedIngredient.includes("чеснок")) return "🧄";

    // Зелень
    if (normalizedIngredient.includes("салат")) return "🥗";
    if (normalizedIngredient.includes("петрушка")) return "🌿";
    if (normalizedIngredient.includes("укроп")) return "🌿";
    if (normalizedIngredient.includes("базилик")) return "🌿";

    // Молочные продукты
    if (normalizedIngredient.includes("молоко")) return "🥛";
    if (
      normalizedIngredient.includes("сыр") ||
      normalizedIngredient.includes("пармезан")
    )
      return "🧀";
    if (normalizedIngredient.includes("творог")) return "🥛";
    if (normalizedIngredient.includes("сметана")) return "🥛";
    if (normalizedIngredient.includes("масло сливочное")) return "🧈";

    // Крупы и мука
    if (normalizedIngredient.includes("мука")) return "🌾";
    if (normalizedIngredient.includes("рис")) return "🍚";
    if (normalizedIngredient.includes("гречка")) return "🌾";
    if (normalizedIngredient.includes("овсянка")) return "🌾";

    // Орехи
    if (
      normalizedIngredient.includes("орех") ||
      normalizedIngredient.includes("миндаль")
    )
      return "🥜";

    // Яйца
    if (normalizedIngredient.includes("яйцо")) return "🥚";

    // Сахар и сладости
    if (normalizedIngredient.includes("сахар")) return "🍯";
    if (normalizedIngredient.includes("мед")) return "🍯";

    // Консервы
    if (
      normalizedIngredient.includes("тушенка") ||
      normalizedIngredient.includes("консерв")
    )
      return "🥫";

    // Масла
    if (normalizedIngredient.includes("масло")) return "🫒";

    // По умолчанию
    return "🥕";
  };

  const getChefDishes = (chefId) => {
    try {
      const key = `demo_menu_${chefId}`;
      const raw = localStorage.getItem(key);
      let parsed = raw ? JSON.parse(raw) : [];

      // Если блюд нет, создаем тестовые блюда с ингредиентами
      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.log("🔧 Создаем тестовые блюда для повара:", chefId);
        parsed = [
          {
            id: "dish-1",
            name: "Борщ",
            category: "Супы",
            price: 350,
            description: "Традиционный украинский борщ",
            ingredients: `500г говядина
300г свекла
200г капуста
150г морковь
100г лук
50г томатная паста
2 зубчика чеснок
соль, перец по вкусу`,
            image: "",
            chefId: chefId,
          },
          {
            id: "dish-2",
            name: "Плов",
            category: "Основные блюда",
            price: 400,
            description: "Узбекский плов с бараниной",
            ingredients: `400г баранина
300г рис
200г морковь
100г лук
50г масло растительное
2 зубчика чеснок
соль, специи по вкусу`,
            image: "",
            chefId: chefId,
          },
          {
            id: "dish-3",
            name: "Котлета по-киевски",
            category: "Основные блюда",
            price: 450,
            description: "Классическая котлета по-киевски",
            ingredients: `300г куриная грудка
100г масло сливочное
50г мука
2 яйца
100г панировочные сухари
соль, перец по вкусу`,
            image: "",
            chefId: chefId,
          },
          {
            id: "dish-4",
            name: "Салат Цезарь",
            category: "Салаты",
            price: 280,
            description: "Классический салат Цезарь",
            ingredients: `200г салат айсберг
150г куриная грудка
50г пармезан
30г сухарики
2 яйца
50г масло оливковое
соль, перец по вкусу`,
            image: "",
            chefId: chefId,
          },
          {
            id: "dish-5",
            name: "Суп-лапша",
            category: "Супы",
            price: 250,
            description: "Домашний суп с лапшой",
            ingredients: `300г куриная грудка
200г лапша
150г морковь
100г лук
50г масло растительное
соль, перец, зелень по вкусу`,
            image: "",
            chefId: chefId,
          },
        ];

        // Сохраняем тестовые блюда в localStorage
        localStorage.setItem(key, JSON.stringify(parsed));
        console.log("✅ Тестовые блюда созданы и сохранены");
      }

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error loading chef dishes:", error);
      return [];
    }
  };

  const getRealDishIngredients = (dishName, chefDishes) => {
    // Ищем блюдо в реальных блюдах повара
    const dish = chefDishes.find((d) => d.name === dishName);

    console.log("🔍 Поиск блюда:", dishName);
    console.log(
      "📋 Доступные блюда повара:",
      chefDishes.map((d) => d.name)
    );
    console.log("🍽️ Найденное блюдо:", dish);

    if (dish && dish.ingredients) {
      console.log("✅ Найдены ингредиенты:", dish.ingredients);
      // Парсим реальные ингредиенты из текста
      const parsed = parseIngredientsText(dish.ingredients);
      console.log("📝 Распарсенные ингредиенты:", parsed);
      return parsed;
    }

    console.log("⚠️ Используем fallback для блюда:", dishName);
    // Если не нашли реальное блюдо, используем fallback
    return getDishIngredients(dishName);
  };

  const parseIngredientsText = (ingredientsText) => {
    if (!ingredientsText || typeof ingredientsText !== "string") {
      return [];
    }

    const ingredients = [];
    const lines = ingredientsText.split("\n").filter((line) => line.trim());

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Пропускаем строки с "по вкусу" - это не ингредиенты для покупки
      if (
        trimmedLine.includes("по вкусу") ||
        trimmedLine.includes("специи") ||
        trimmedLine.includes("приправы")
      ) {
        return; // Пропускаем эту строку
      }

      // Парсим строки вида "500г говядина" или "2 шт лук"
      const match = trimmedLine.match(
        /^(\d+(?:\.\d+)?)\s*(г|кг|шт|л|мл|ст\.л|ч\.л|пучок|зубчик|долька|кусок|порция)?\s*(.+)$/i
      );

      if (match) {
        const amount = parseFloat(match[1]);
        const unit = match[2] || "г";
        const name = match[3].trim();

        // Конвертируем в граммы для единообразия
        let amountInGrams = amount;
        if (unit === "кг") amountInGrams = amount * 1000;
        else if (unit === "л" || unit === "мл")
          amountInGrams = amount; // Для жидкостей оставляем как есть
        else if (
          unit === "шт" ||
          unit === "пучок" ||
          unit === "зубчик" ||
          unit === "долька" ||
          unit === "кусок" ||
          unit === "порция"
        ) {
          amountInGrams = amount * 50; // Примерный вес для штучных продуктов
        }

        ingredients.push({
          name: name,
          amount: amountInGrams / 1000, // Конвертируем в кг для расчетов
          unit: unit,
        });
      } else {
        // Если не удалось распарсить, пропускаем (не добавляем в список покупок)
        console.log("⚠️ Пропускаем нераспознанную строку:", trimmedLine);
      }
    });

    return ingredients;
  };

  const getDishIngredients = (dishName) => {
    // Симуляция анализа ингредиентов блюда (fallback)
    const ingredientsMap = {
      "Цезарь с курицей": [
        { name: "Куриная грудка", amount: 0.2 },
        { name: "Салат айсберг", amount: 0.1 },
        { name: "Пармезан", amount: 0.05 },
        { name: "Сухарики", amount: 0.03 },
      ],
      "Азу с тушёнкой": [
        { name: "Говядина", amount: 0.3 },
        { name: "Картофель", amount: 0.2 },
        { name: "Лук", amount: 0.1 },
        { name: "Морковь", amount: 0.1 },
      ],
      'Татарское печенье "Бармак"': [
        { name: "Мука", amount: 0.15 },
        { name: "Грецкие орехи", amount: 0.1 },
        { name: "Сахар", amount: 0.08 },
        { name: "Масло сливочное", amount: 0.1 },
      ],
    };
    return (
      ingredientsMap[dishName] || [
        { name: "Основные ингредиенты", amount: 0.5 },
      ]
    );
  };

  const getIngredientPrice = (ingredient) => {
    // Расширенная база цен на ингредиенты
    const prices = {
      // Мясо и птица
      "Куриная грудка": 300,
      курица: 300,
      "куриное мясо": 300,
      Говядина: 500,
      "говяжье мясо": 500,
      "говяжий фарш": 450,
      Свинина: 400,
      "свиное мясо": 400,
      "свиной фарш": 350,
      Баранина: 600,
      "баранье мясо": 600,
      Рыба: 300,
      лосось: 800,
      треска: 400,
      минтай: 200,

      // Овощи
      Картофель: 50,
      картошка: 50,
      Лук: 80,
      "лук репчатый": 80,
      "лук зеленый": 120,
      Морковь: 60,
      морковка: 60,
      Помидоры: 150,
      помидор: 150,
      томаты: 150,
      Огурцы: 120,
      огурец: 120,
      Капуста: 40,
      "капуста белокочанная": 40,
      Перец: 200,
      "перец болгарский": 200,
      Чеснок: 300,
      чеснок: 300,

      // Зелень
      Салат: 150,
      "салат айсберг": 150,
      "салат листовой": 150,
      Петрушка: 100,
      петрушка: 100,
      Укроп: 100,
      укроп: 100,
      Базилик: 200,
      базилик: 200,

      // Молочные продукты
      Молоко: 80,
      молоко: 80,
      Сыр: 400,
      сыр: 400,
      пармезан: 800,
      чеддер: 500,
      Творог: 200,
      творог: 200,
      Сметана: 150,
      сметана: 150,
      "Масло сливочное": 200,
      масло: 200,

      // Крупы и мука
      Мука: 40,
      мука: 40,
      "мука пшеничная": 40,
      Рис: 80,
      рис: 80,
      "рис длиннозерный": 100,
      Гречка: 100,
      гречка: 100,
      Овсянка: 60,
      овсянка: 60,

      // Орехи и сухофрукты
      "Грецкие орехи": 600,
      "орехи грецкие": 600,
      Миндаль: 800,
      миндаль: 800,
      Изюм: 300,
      изюм: 300,

      // Специи и приправы
      Соль: 20,
      соль: 20,
      "Перец черный": 100,
      перец: 100,
      "Лавровый лист": 50,
      лаврушка: 50,

      // Масла
      "Масло растительное": 100,
      "масло подсолнечное": 100,
      "Масло оливковое": 300,
      "оливковое масло": 300,

      // Яйца
      Яйца: 80,
      яйцо: 80,
      "яйца куриные": 80,

      // Сахар и сладости
      Сахар: 60,
      сахар: 60,
      "сахар песок": 60,
      Мед: 300,
      мед: 300,

      // Консервы
      Тушенка: 200,
      "тушенка говяжья": 200,
      Консервы: 150,
      "консервы рыбные": 150,
    };

    // Нормализуем название ингредиента для поиска
    const normalizedIngredient = ingredient.toLowerCase().trim();

    // Ищем точное совпадение
    for (const [key, price] of Object.entries(prices)) {
      if (key.toLowerCase() === normalizedIngredient) {
        return price;
      }
    }

    // Ищем частичное совпадение
    for (const [key, price] of Object.entries(prices)) {
      if (
        normalizedIngredient.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalizedIngredient)
      ) {
        return price;
      }
    }

    // Возвращаем среднюю цену для неизвестных ингредиентов
    return 150;
  };

  const generateRecommendations = useCallback((orders) => {
    console.log("🚀 Генерация рекомендаций для заказов:", orders);

    // Анализируем точное количество порций каждого блюда
    const dishPortions = {};
    let totalOrders = 0;

    orders.forEach((order) => {
      totalOrders++;
      order.items?.forEach((item) => {
        console.log(
          "📦 Анализируем товар:",
          item.name,
          "количество:",
          item.quantity
        );

        // Суммируем точное количество порций
        dishPortions[item.name] =
          (dishPortions[item.name] || 0) + item.quantity;
      });
    });

    console.log("🍽️ Точное количество порций блюд:", dishPortions);
    console.log("📊 Всего заказов:", totalOrders);

    // Генерируем рекомендации на основе реальных заказов
    const recommendations = [];

    // Получаем блюда повара для расчета стоимости
    const chefId = localStorage.getItem("chefId") || "demo-chef-1";
    const chefDishes = getChefDishes(chefId);

    // Популярные блюда с точным расчетом
    const topDishes = Object.entries(dishPortions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Показываем топ-5 блюд

    topDishes.forEach(([dishName, totalPortions], index) => {
      // Находим блюдо в меню повара для получения цены
      const dish = chefDishes.find((d) => d.name === dishName);
      const dishPrice = dish ? dish.price : 200; // Fallback цена

      // Рассчитываем рекомендуемое количество с запасом
      const recommendedPortions = Math.ceil(totalPortions * 1.2); // +20% запас

      // Рассчитываем стоимость
      const estimatedCost = recommendedPortions * dishPrice;

      // Определяем приоритет на основе популярности
      let priority = "low";
      if (totalPortions >= 5) priority = "high";
      else if (totalPortions >= 3) priority = "medium";

      recommendations.push({
        id: `dish-${index}`,
        type: "dish",
        name: dishName,
        priority: priority,
        reason: `Заказано ${totalPortions} порций в ${totalOrders} заказах`,
        suggestedAmount: recommendedPortions,
        unit: "порций",
        estimatedCost: estimatedCost,
        icon: "🍽️",
        // Дополнительная информация для отладки
        actualPortions: totalPortions,
        dishPrice: dishPrice,
      });
    });

    // Сезонные рекомендации
    const seasonalRecommendations = getSeasonalRecommendations();
    recommendations.push(...seasonalRecommendations);

    console.log("✅ Сгенерированные рекомендации:", recommendations);
    setRecommendations(recommendations);
  }, []);

  const getSeasonalRecommendations = () => {
    const month = new Date().getMonth();
    const seasonal = [];

    if (month >= 2 && month <= 4) {
      // Весна
      seasonal.push({
        id: "seasonal-spring-1",
        type: "seasonal",
        name: "Свежая зелень",
        priority: "medium",
        reason: "Весенний сезон - время для свежих салатов",
        suggestedAmount: 2,
        unit: "кг",
        estimatedCost: 300,
        icon: "🌱",
      });
    }

    if (month >= 5 && month <= 7) {
      // Лето
      seasonal.push({
        id: "seasonal-summer-1",
        type: "seasonal",
        name: "Сезонные овощи",
        priority: "high",
        reason: "Летний сезон - изобилие свежих овощей",
        suggestedAmount: 5,
        unit: "кг",
        estimatedCost: 500,
        icon: "🍅",
      });
    }

    return seasonal;
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const clientOrders = JSON.parse(
        localStorage.getItem("clientOrders") || "[]"
      );
      const chefId = localStorage.getItem("chefId") || "demo-chef-1";

      // Фильтруем заказы повара за выбранный период
      const now = new Date();
      const periodStart = new Date();

      switch (selectedPeriod) {
        case "week":
          periodStart.setDate(now.getDate() - 7);
          break;
        case "month":
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          periodStart.setMonth(now.getMonth() - 3);
          break;
        default:
          periodStart.setDate(now.getDate() - 7);
      }

      const chefOrders = clientOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          order.items?.some((item) => item.chefId === chefId) &&
          orderDate >= periodStart
        );
      });

      setOrders(chefOrders);
      generateRecommendations(chefOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      showError("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, showError, generateRecommendations]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#e74c3c";
      case "medium":
        return "#f39c12";
      case "low":
        return "#27ae60";
      default:
        return "#95a5a6";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Неизвестно";
    }
  };

  const createTestOrder = () => {
    try {
      const chefId = localStorage.getItem("chefId") || "demo-chef-1";
      const testOrder = {
        id: `test-order-${Date.now()}`,
        chefId: chefId,
        customer: {
          name: "Тестовый клиент",
          phone: "+7 (999) 123-45-67",
          address: "Тестовый адрес",
        },
        items: [
          {
            id: "test-item-1",
            name: "Борщ",
            quantity: 2,
            price: 350,
            chefId: chefId,
          },
          {
            id: "test-item-2",
            name: "Плов узбекский",
            quantity: 1,
            price: 450,
            chefId: chefId,
          },
        ],
        total: 1150,
        status: "delivered",
        createdAt: new Date().toISOString(),
        delivery: {
          date: new Date().toISOString().split("T")[0],
          time: "12:00",
        },
      };

      // Сохраняем тестовый заказ
      const existingOrders = JSON.parse(
        localStorage.getItem("clientOrders") || "[]"
      );
      const updatedOrders = [testOrder, ...existingOrders];
      localStorage.setItem("clientOrders", JSON.stringify(updatedOrders));

      // Обновляем список заказов
      setOrders(updatedOrders);

      // Пересчитываем рекомендации
      generateRecommendations(updatedOrders);

      showSuccess("Тестовый заказ создан! Рекомендации обновлены.");
    } catch (error) {
      console.error("Error creating test order:", error);
      showError("Ошибка создания тестового заказа");
    }
  };

  const handleAddToShoppingList = (recommendation) => {
    try {
      const shoppingList = JSON.parse(
        localStorage.getItem("chefShoppingList") || "[]"
      );

      // Если это блюдо, разбиваем на ингредиенты
      if (recommendation.type === "dish") {
        const chefId = localStorage.getItem("chefId") || "demo-chef-1";
        const chefDishes = getChefDishes(chefId);
        const ingredients = getRealDishIngredients(
          recommendation.name,
          chefDishes
        );

        console.log(
          "🍽️ Добавляем блюдо в список покупок:",
          recommendation.name
        );
        console.log("🥕 Ингредиенты для добавления:", ingredients);

        // Добавляем каждый ингредиент в список покупок
        ingredients.forEach((ingredient) => {
          const existingItem = shoppingList.find(
            (item) => item.name === ingredient.name
          );

          if (existingItem) {
            // Увеличиваем количество
            existingItem.suggestedAmount += Math.ceil(
              ingredient.amount * recommendation.suggestedAmount
            );
            existingItem.estimatedCost = Math.ceil(
              existingItem.suggestedAmount * getIngredientPrice(ingredient.name)
            );
          } else {
            // Добавляем новый ингредиент
            shoppingList.push({
              id: `ingredient-${Date.now()}-${Math.random()}`,
              type: "ingredient",
              name: ingredient.name,
              priority: recommendation.priority,
              reason: `Из блюда: ${recommendation.name}`,
              suggestedAmount: Math.ceil(
                ingredient.amount * recommendation.suggestedAmount
              ),
              unit: ingredient.unit || "кг",
              estimatedCost: Math.ceil(
                ingredient.amount *
                  recommendation.suggestedAmount *
                  getIngredientPrice(ingredient.name)
              ),
              icon: getIngredientIcon(ingredient.name),
              addedAt: new Date().toISOString(),
              purchased: false,
            });
          }
        });
      } else {
        // Если это не блюдо, добавляем как есть
        const existingItem = shoppingList.find(
          (item) => item.name === recommendation.name
        );

        if (existingItem) {
          existingItem.suggestedAmount += recommendation.suggestedAmount;
          existingItem.estimatedCost += recommendation.estimatedCost;
        } else {
          shoppingList.push({
            ...recommendation,
            addedAt: new Date().toISOString(),
            purchased: false,
          });
        }
      }

      localStorage.setItem("chefShoppingList", JSON.stringify(shoppingList));

      // Отмечаем блюдо как добавленное и удаляем из рекомендаций
      setAddedToShoppingList((prev) => new Set([...prev, recommendation.id]));
      setRemovedRecommendations(
        (prev) => new Set([...prev, recommendation.id])
      );

      showSuccess(
        `${recommendation.name} добавлен в список покупок и удален из рекомендаций`
      );
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      showError("Ошибка добавления в список покупок");
    }
  };

  const handleRestoreRecommendation = (recommendationId) => {
    try {
      // Удаляем из списка удаленных рекомендаций
      setRemovedRecommendations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recommendationId);
        return newSet;
      });

      // Удаляем из списка добавленных в покупки
      setAddedToShoppingList((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recommendationId);
        return newSet;
      });

      showSuccess("Рекомендация восстановлена");
    } catch (error) {
      console.error("Error restoring recommendation:", error);
      showError("Ошибка восстановления рекомендации");
    }
  };

  if (loading) {
    return (
      <div className="chef-procurement-modal-overlay">
        <div className="chef-procurement-modal">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loading-spinner"></div>
            <p>Анализируем заказы...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-procurement-modal-overlay" onClick={onClose}>
      <div
        className="chef-procurement-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chef-procurement-header">
          <h3>🤖 AI Планировщик закупок</h3>
          <button onClick={onClose} className="back-button">
            ✕
          </button>
        </div>

        <div className="chef-procurement-content">
          {/* Период анализа */}
          <div className="period-selector">
            <h4>📅 Период анализа</h4>
            <div className="period-buttons">
              <button
                className={selectedPeriod === "week" ? "active" : ""}
                onClick={() => setSelectedPeriod("week")}
              >
                Неделя
              </button>
              <button
                className={selectedPeriod === "month" ? "active" : ""}
                onClick={() => setSelectedPeriod("month")}
              >
                Месяц
              </button>
              <button
                className={selectedPeriod === "quarter" ? "active" : ""}
                onClick={() => setSelectedPeriod("quarter")}
              >
                Квартал
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="procurement-stats">
            <h4>📊 Статистика заказов</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{orders.length}</div>
                <div className="stat-label">Заказов</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {orders.reduce(
                    (sum, order) => sum + (order.items?.length || 0),
                    0
                  )}
                </div>
                <div className="stat-label">Блюд</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {orders.reduce((sum, order) => sum + (order.total || 0), 0)}₽
                </div>
                <div className="stat-label">Выручка</div>
              </div>
            </div>
          </div>

          {/* Кнопка создания тестового заказа */}
          <div className="test-actions">
            <button
              onClick={createTestOrder}
              className="create-test-order-btn"
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              🧪 Создать тестовый заказ
            </button>
          </div>

          {/* Удаленные рекомендации */}
          {removedRecommendations.size > 0 && (
            <div className="recommendations-section">
              <h4>🗑️ Удаленные рекомендации</h4>
              <div className="recommendations-list">
                {recommendations
                  .filter((recommendation) =>
                    removedRecommendations.has(recommendation.id)
                  )
                  .map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="recommendation-card"
                      style={{ opacity: 0.7, border: "2px dashed #ccc" }}
                    >
                      <div className="recommendation-header">
                        <div className="recommendation-icon">
                          {recommendation.icon}
                        </div>
                        <div className="recommendation-info">
                          <h5>{recommendation.name}</h5>
                          <p className="recommendation-reason">
                            {recommendation.reason}
                          </p>
                        </div>
                        <div className="recommendation-priority">
                          <span
                            className="priority-badge"
                            style={{
                              backgroundColor: getPriorityColor(
                                recommendation.priority
                              ),
                            }}
                          >
                            {getPriorityText(recommendation.priority)}
                          </span>
                        </div>
                      </div>

                      <div className="recommendation-details">
                        <div className="detail-item">
                          <strong>Заказано порций:</strong>{" "}
                          {recommendation.actualPortions || 0}
                        </div>
                        <div className="detail-item">
                          <strong>Рекомендуется:</strong>{" "}
                          {recommendation.suggestedAmount} {recommendation.unit}{" "}
                          (+20% запас)
                        </div>
                        <div className="detail-item">
                          <strong>Цена за порцию:</strong>{" "}
                          {recommendation.dishPrice || 200}₽
                        </div>
                        <div className="detail-item">
                          <strong>Общая стоимость:</strong>{" "}
                          {recommendation.estimatedCost}₽
                        </div>
                      </div>

                      <div className="recommendation-actions">
                        <button
                          className="add-to-list-btn"
                          onClick={() =>
                            handleRestoreRecommendation(recommendation.id)
                          }
                          style={{ background: "#28a745", color: "white" }}
                        >
                          🔄 Восстановить
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Рекомендации */}
          <div className="recommendations-section">
            <h4>💡 AI Рекомендации</h4>
            <div className="recommendations-list">
              {recommendations
                .filter(
                  (recommendation) =>
                    !removedRecommendations.has(recommendation.id)
                )
                .map((recommendation) => (
                  <div key={recommendation.id} className="recommendation-card">
                    <div className="recommendation-header">
                      <div className="recommendation-icon">
                        {recommendation.icon}
                      </div>
                      <div className="recommendation-info">
                        <h5>{recommendation.name}</h5>
                        <p className="recommendation-reason">
                          {recommendation.reason}
                        </p>
                      </div>
                      <div className="recommendation-priority">
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(
                              recommendation.priority
                            ),
                          }}
                        >
                          {getPriorityText(recommendation.priority)}
                        </span>
                      </div>
                    </div>

                    <div className="recommendation-details">
                      <div className="detail-item">
                        <strong>Заказано порций:</strong>{" "}
                        {recommendation.actualPortions || 0}
                      </div>
                      <div className="detail-item">
                        <strong>Рекомендуется:</strong>{" "}
                        {recommendation.suggestedAmount} {recommendation.unit}{" "}
                        (+20% запас)
                      </div>
                      <div className="detail-item">
                        <strong>Цена за порцию:</strong>{" "}
                        {recommendation.dishPrice || 200}₽
                      </div>
                      <div className="detail-item">
                        <strong>Общая стоимость:</strong>{" "}
                        {recommendation.estimatedCost}₽
                      </div>
                    </div>

                    <div className="recommendation-actions">
                      <button
                        className={`add-to-list-btn ${
                          addedToShoppingList.has(recommendation.id)
                            ? "added"
                            : ""
                        }`}
                        onClick={() => handleAddToShoppingList(recommendation)}
                        disabled={addedToShoppingList.has(recommendation.id)}
                      >
                        {addedToShoppingList.has(recommendation.id)
                          ? "✅ Добавлено"
                          : "➕ Добавить в список покупок"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProcurementPlanner;
