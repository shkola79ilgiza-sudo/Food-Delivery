import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";

const ChefPlanningAssistant = ({ chefId }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [demandForecast, setDemandForecast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [planningRecommendations, setPlanningRecommendations] = useState([]);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const loadAllOrders = useCallback(() => {
    try {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      console.log("👨‍🍳 ChefPlanningAssistant: Loaded orders:", orders);
      setAllOrders(orders);
    } catch (error) {
      console.error("Error loading orders:", error);
      showError("Ошибка загрузки заказов");
    }
  }, [showError]);

  // Загрузка всех заказов для анализа
  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  // Анализ спроса по праздникам
  const analyzeHolidayDemand = (orders) => {
    const holidayDemand = {
      "новый год": { orders: 0, dishes: {}, totalValue: 0 },
      "8 марта": { orders: 0, dishes: {}, totalValue: 0 },
      навруз: { orders: 0, dishes: {}, totalValue: 0 },
      ураза: { orders: 0, dishes: {}, totalValue: 0 },
      масленица: { orders: 0, dishes: {}, totalValue: 0 },
    };

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.date);
      const month = orderDate.getMonth() + 1;
      const day = orderDate.getDate();

      // Определяем праздник
      let holiday = null;
      if (month === 12 || month === 1) holiday = "новый год";
      else if (month === 3 && day === 8) holiday = "8 марта";
      else if (month === 3 && day >= 20 && day <= 22) holiday = "навруз";
      else if (month >= 5 && month <= 6) holiday = "ураза";
      else if (month === 2 || (month === 3 && day <= 15)) holiday = "масленица";

      if (holiday && holidayDemand[holiday]) {
        holidayDemand[holiday].orders++;
        holidayDemand[holiday].totalValue += order.total || 0;

        // Анализируем блюда
        if (order.items) {
          order.items.forEach((item) => {
            const dishName = item.name;
            holidayDemand[holiday].dishes[dishName] =
              (holidayDemand[holiday].dishes[dishName] || 0) + item.quantity;
          });
        }
      }
    });

    return holidayDemand;
  };

  // Анализ популярности блюд
  const analyzeDishPopularity = (orders) => {
    const dishStats = {};
    const categoryStats = {};
    const seasonalStats = {
      spring: {},
      summer: {},
      autumn: {},
      winter: {},
    };

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.date);
      const month = orderDate.getMonth();
      const season =
        month >= 2 && month <= 4
          ? "spring"
          : month >= 5 && month <= 7
          ? "summer"
          : month >= 8 && month <= 10
          ? "autumn"
          : "winter";

      if (order.items) {
        order.items.forEach((item) => {
          const dishName = item.name;
          const category = item.category || "other";

          // Общая статистика
          if (!dishStats[dishName]) {
            dishStats[dishName] = {
              totalOrders: 0,
              totalQuantity: 0,
              totalRevenue: 0,
              categories: new Set(),
              seasons: { spring: 0, summer: 0, autumn: 0, winter: 0 },
            };
          }

          dishStats[dishName].totalOrders++;
          dishStats[dishName].totalQuantity += item.quantity;
          dishStats[dishName].totalRevenue += (item.price || 0) * item.quantity;
          dishStats[dishName].categories.add(category);
          dishStats[dishName].seasons[season]++;

          // Статистика по категориям
          categoryStats[category] =
            (categoryStats[category] || 0) + item.quantity;

          // Сезонная статистика
          if (!seasonalStats[season][dishName]) {
            seasonalStats[season][dishName] = 0;
          }
          seasonalStats[season][dishName] += item.quantity;
        });
      }
    });

    return { dishStats, categoryStats, seasonalStats };
  };

  // Прогнозирование спроса
  const generateDemandForecast = (holidayDemand, dishStats) => {
    const forecast = {};
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // Определяем ближайший праздник
    let nextHoliday = null;
    let daysToHoliday = 0;

    if (currentMonth === 12 || currentMonth === 1) {
      nextHoliday = "новый год";
      daysToHoliday =
        currentMonth === 12 ? 31 - currentDay : 31 - currentDay + 31;
    } else if (currentMonth === 3 && currentDay < 8) {
      nextHoliday = "8 марта";
      daysToHoliday = 8 - currentDay;
    } else if (currentMonth === 3 && currentDay >= 20 && currentDay <= 22) {
      nextHoliday = "навруз";
      daysToHoliday = 0;
    }

    if (nextHoliday && holidayDemand[nextHoliday]) {
      const holidayData = holidayDemand[nextHoliday];
      const avgOrdersPerDay = holidayData.orders / 30; // Примерно 30 дней праздничного периода
      const expectedGrowth = Math.min(avgOrdersPerDay * 1.5, 50); // Максимум 50% роста

      forecast[nextHoliday] = {
        expectedOrders: Math.round(holidayData.orders * 1.2), // 20% роста
        expectedGrowth: Math.round(expectedGrowth),
        popularDishes: Object.entries(holidayData.dishes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([dish, count]) => ({ dish, count })),
        daysToHoliday,
        recommendations: generateHolidayRecommendations(
          nextHoliday,
          holidayData
        ),
      };
    }

    return forecast;
  };

  // Генерация рекомендаций для праздников
  const generateHolidayRecommendations = (holiday, holidayData) => {
    const recommendations = [];

    if (holiday === "новый год") {
      recommendations.push({
        type: "menu",
        title: "Новогоднее меню",
        description:
          "Добавьте праздничные блюда: оливье, селедка под шубой, торт",
        priority: "high",
      });
      recommendations.push({
        type: "inventory",
        title: "Закупки",
        description:
          "Закупите заранее: майонез, селедку, мандарины, шампанское",
        priority: "high",
      });
    } else if (holiday === "8 марта") {
      recommendations.push({
        type: "menu",
        title: "Меню к 8 марта",
        description: "Сделайте акцент на десерты, цветы, красивое оформление",
        priority: "high",
      });
    } else if (holiday === "навруз") {
      recommendations.push({
        type: "menu",
        title: "Навруз меню",
        description: "Традиционные блюда: сумаляк, халва, плов с сухофруктами",
        priority: "high",
      });
    }

    return recommendations;
  };

  // Генерация рекомендаций по планированию
  const generatePlanningRecommendations = (
    dishStats,
    categoryStats,
    seasonalStats
  ) => {
    const recommendations = [];

    // Топ-5 самых популярных блюд
    const topDishes = Object.entries(dishStats)
      .sort(([, a], [, b]) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

    if (topDishes.length > 0) {
      recommendations.push({
        type: "popular_dishes",
        title: "Самые популярные блюда",
        description:
          "Эти блюда заказывают чаще всего - убедитесь, что они всегда в наличии",
        dishes: topDishes.map(([dish, stats]) => ({
          name: dish,
          orders: stats.totalOrders,
          revenue: stats.totalRevenue,
        })),
        priority: "high",
      });
    }

    // Рекомендации по категориям
    const topCategories = Object.entries(categoryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    topCategories.forEach(([category, count]) => {
      recommendations.push({
        type: "category",
        title: `Категория "${category}"`,
        description: `Популярная категория (${count} заказов). Рассмотрите расширение ассортимента`,
        priority: "medium",
      });
    });

    // Сезонные рекомендации
    const currentSeason = getCurrentSeason();
    const seasonalDishes = seasonalStats[currentSeason];
    const topSeasonalDishes = Object.entries(seasonalDishes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topSeasonalDishes.length > 0) {
      recommendations.push({
        type: "seasonal",
        title: `${getSeasonName(currentSeason)}ние блюда`,
        description: `В ${getSeasonName(
          currentSeason
        ).toLowerCase()} популярны эти блюда`,
        dishes: topSeasonalDishes.map(([dish, count]) => ({
          name: dish,
          count,
        })),
        priority: "medium",
      });
    }

    // Рекомендации по закупкам
    const lowStockDishes = Object.entries(dishStats)
      .filter(([, stats]) => stats.totalOrders > 5 && stats.totalRevenue < 1000)
      .slice(0, 3);

    if (lowStockDishes.length > 0) {
      recommendations.push({
        type: "inventory",
        title: "Потенциал для роста",
        description:
          "Эти блюда заказывают, но они приносят мало дохода. Рассмотрите оптимизацию",
        dishes: lowStockDishes.map(([dish, stats]) => ({
          name: dish,
          orders: stats.totalOrders,
          revenue: stats.totalRevenue,
        })),
        priority: "low",
      });
    }

    return recommendations;
  };

  // Вспомогательные функции
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  };

  const getSeasonName = (season) => {
    const names = {
      spring: "Весенн",
      summer: "Летн",
      autumn: "Осенн",
      winter: "Зимн",
    };
    return names[season] || "Сезонн";
  };

  // Основная функция анализа
  const performAnalysis = () => {
    console.log("👨‍🍳 ChefPlanningAssistant: Starting analysis...");
    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        // Анализируем спрос по праздникам
        const holidayDemand = analyzeHolidayDemand(allOrders);
        console.log(
          "👨‍🍳 ChefPlanningAssistant: Holiday demand analyzed:",
          holidayDemand
        );

        // Анализируем популярность блюд
        const { dishStats, categoryStats, seasonalStats } =
          analyzeDishPopularity(allOrders);
        console.log(
          "👨‍🍳 ChefPlanningAssistant: Dish popularity analyzed:",
          dishStats
        );

        // Генерируем прогноз спроса
        const forecast = generateDemandForecast(holidayDemand, dishStats);
        console.log(
          "👨‍🍳 ChefPlanningAssistant: Demand forecast generated:",
          forecast
        );

        // Генерируем рекомендации по планированию
        const recommendations = generatePlanningRecommendations(
          dishStats,
          categoryStats,
          seasonalStats
        );
        console.log(
          "👨‍🍳 ChefPlanningAssistant: Planning recommendations generated:",
          recommendations
        );

        setDemandForecast(forecast);
        setPlanningRecommendations(recommendations);
        setIsAnalyzing(false);

        showSuccess(
          `Анализ завершен! Сгенерировано ${recommendations.length} рекомендаций`
        );
      } catch (error) {
        console.error("Error during analysis:", error);
        setIsAnalyzing(false);
        showError("Ошибка при анализе данных");
      }
    }, 3000);
  };

  return (
    <div
      className="chef-planning-assistant"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "15px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <div
        className="assistant-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0, color: "#333" }}>
          👨‍🍳 Помощник по планированию
        </h3>
        <button
          onClick={performAnalysis}
          disabled={isAnalyzing}
          style={{
            background: isAnalyzing
              ? "#ccc"
              : "linear-gradient(135deg, #ff6b6b, #ff8e53)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: isAnalyzing ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {isAnalyzing ? "🔄 Анализирую..." : "📊 Анализировать спрос"}
        </button>
      </div>

      {allOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#666",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>👨‍🍳</div>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>
            Нет данных для анализа
          </div>
          <div style={{ fontSize: "14px" }}>
            Дождитесь первых заказов для получения рекомендаций
          </div>
        </div>
      ) : (
        <div className="assistant-content">
          {/* Прогноз спроса */}
          {demandForecast && Object.keys(demandForecast).length > 0 && (
            <div
              className="demand-forecast"
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                padding: "20px",
                borderRadius: "15px",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
                📈 Прогноз спроса
              </h4>
              {Object.entries(demandForecast).map(([holiday, forecast]) => (
                <div
                  key={holiday}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10px",
                      fontSize: "16px",
                    }}
                  >
                    {holiday === "новый год"
                      ? "Новый год"
                      : holiday === "8 марта"
                      ? "8 марта"
                      : holiday === "навруз"
                      ? "Навруз"
                      : holiday === "ураза"
                      ? "Ураза-байрам"
                      : holiday === "масленица"
                      ? "Масленица"
                      : holiday}
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                    Ожидается рост заказов на{" "}
                    <strong>{forecast.expectedGrowth}%</strong>
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "10px" }}>
                    Популярные блюда:{" "}
                    {forecast.popularDishes.map((d) => d.dish).join(", ")}
                  </div>
                  {forecast.daysToHoliday > 0 && (
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>
                      До праздника: {forecast.daysToHoliday} дней
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Рекомендации по планированию */}
          {planningRecommendations.length > 0 && (
            <div className="planning-recommendations">
              <h4 style={{ color: "#333", marginBottom: "15px" }}>
                💡 Рекомендации по планированию:
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "15px",
                }}
              >
                {planningRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      background:
                        rec.priority === "high"
                          ? "linear-gradient(135deg, #ff6b6b, #ff8e53)"
                          : rec.priority === "medium"
                          ? "linear-gradient(135deg, #667eea, #764ba2)"
                          : "linear-gradient(135deg, #28a745, #20c997)",
                      color: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      border:
                        rec.priority === "high" ? "2px solid #ff4757" : "none",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "8px",
                        fontSize: "16px",
                      }}
                    >
                      {rec.title}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        marginBottom: "10px",
                        opacity: 0.9,
                      }}
                    >
                      {rec.description}
                    </div>
                    {rec.dishes && rec.dishes.length > 0 && (
                      <div style={{ fontSize: "12px" }}>
                        <strong>Детали:</strong>
                        <ul style={{ margin: "5px 0 0 15px", padding: 0 }}>
                          {rec.dishes.slice(0, 3).map((dish, i) => (
                            <li key={i}>
                              {dish.name}{" "}
                              {dish.orders ? `(${dish.orders} заказов)` : ""}
                              {dish.revenue ? ` - ${dish.revenue}₽` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChefPlanningAssistant;
