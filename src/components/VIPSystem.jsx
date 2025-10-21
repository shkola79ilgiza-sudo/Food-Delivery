import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useLanguage } from "../contexts/LanguageContext"; // Не используется в текущей реализации
// import { useToast } from "../contexts/ToastContext"; // Не используется в текущей реализации

const VIPSystem = () => {
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    joinDate: new Date().toISOString(),
    currentLevel: "Bronze",
    points: 0,
  });
  const [achievements, setAchievements] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  // const { t } = useLanguage(); // Не используется в этом компоненте
  // const { showSuccess } = useToast(); // Не используется в этом компоненте

  // VIP уровни
  const vipLevels = [
    {
      name: "Bronze",
      icon: "🥉",
      color: "#cd7f32",
      minOrders: 0,
      minSpent: 0,
      benefits: ["Базовая поддержка", "Стандартная доставка"],
      discount: 0,
    },
    {
      name: "Silver",
      icon: "🥈",
      color: "#c0c0c0",
      minOrders: 5,
      minSpent: 5000,
      benefits: ["Приоритетная поддержка", "Быстрая доставка", "Скидка 5%"],
      discount: 5,
    },
    {
      name: "Gold",
      icon: "🥇",
      color: "#ffa500",
      minOrders: 15,
      minSpent: 15000,
      benefits: [
        "Персональный менеджер",
        "Экспресс доставка",
        "Скидка 10%",
        "Эксклюзивные блюда",
      ],
      discount: 10,
    },
    {
      name: "Platinum",
      icon: "💎",
      color: "#e5e4e2",
      minOrders: 30,
      minSpent: 30000,
      benefits: [
        "VIP поддержка 24/7",
        "Бесплатная доставка",
        "Скидка 15%",
        "Персональные предложения",
      ],
      discount: 15,
    },
    {
      name: "Diamond",
      icon: "👑",
      color: "#ffd700",
      minOrders: 50,
      minSpent: 50000,
      benefits: [
        "Консьерж-сервис",
        "Бесплатная доставка",
        "Скидка 20%",
        "Эксклюзивные мероприятия",
      ],
      discount: 20,
    },
  ];

  // Достижения
  const mockAchievements = useMemo(
    () => [
      {
        id: 1,
        name: "Первый заказ",
        description: "Сделали первый заказ",
        icon: "🎯",
        unlocked: true,
        unlockedAt: "2024-01-15",
        points: 50,
      },
      {
        id: 2,
        name: "Постоянный клиент",
        description: "Сделали 10 заказов",
        icon: "🔄",
        unlocked: false,
        points: 200,
      },
      {
        id: 3,
        name: "Гурман",
        description: "Попробовали 20 разных блюд",
        icon: "🍽️",
        unlocked: false,
        points: 300,
      },
      {
        id: 4,
        name: "Экономист",
        description: "Потратили 10,000₽",
        icon: "💰",
        unlocked: false,
        points: 500,
      },
      {
        id: 5,
        name: "Критик",
        description: "Оставили 10 отзывов",
        icon: "⭐",
        unlocked: false,
        points: 150,
      },
    ],
    []
  );

  // Специальные предложения
  const mockSpecialOffers = useMemo(
    () => [
      {
        id: 1,
        title: "VIP-завтрак",
        description: "Эксклюзивный завтрак от шеф-повара",
        discount: "20%",
        validUntil: "2024-12-31",
        level: "Gold",
        icon: "🍳",
      },
      {
        id: 2,
        title: "Персональная дегустация",
        description: "Дегустация новых блюд перед запуском",
        discount: "Бесплатно",
        validUntil: "2024-12-31",
        level: "Platinum",
        icon: "🍷",
      },
      {
        id: 3,
        title: "Мастер-класс",
        description: "Кулинарный мастер-класс с поваром",
        discount: "50%",
        validUntil: "2024-12-31",
        level: "Diamond",
        icon: "👨‍🍳",
      },
    ],
    []
  );

  const loadUserData = useCallback(() => {
    try {
      const savedStats = localStorage.getItem("userVIPStats");
      const savedAchievements = localStorage.getItem("userAchievements");

      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setUserStats(stats);
      }

      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      } else {
        setAchievements(mockAchievements);
      }

      setSpecialOffers(mockSpecialOffers);
    } catch (error) {
      console.error("Error loading VIP data:", error);
    }
  }, [mockAchievements, mockSpecialOffers]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const getCurrentLevel = () => {
    return (
      vipLevels.find(
        (level) =>
          userStats.totalOrders >= level.minOrders &&
          userStats.totalSpent >= level.minSpent
      ) || vipLevels[0]
    );
  };

  const getNextLevel = () => {
    const currentLevelIndex = vipLevels.findIndex(
      (level) =>
        userStats.totalOrders >= level.minOrders &&
        userStats.totalSpent >= level.minSpent
    );

    return currentLevelIndex < vipLevels.length - 1
      ? vipLevels[currentLevelIndex + 1]
      : null;
  };

  const calculateProgress = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();

    if (!nextLevel) return { orders: 100, spent: 100 };

    const ordersProgress = Math.min(
      ((userStats.totalOrders - currentLevel.minOrders) /
        (nextLevel.minOrders - currentLevel.minOrders)) *
        100,
      100
    );

    const spentProgress = Math.min(
      ((userStats.totalSpent - currentLevel.minSpent) /
        (nextLevel.minSpent - currentLevel.minSpent)) *
        100,
      100
    );

    return { orders: ordersProgress, spent: spentProgress };
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = calculateProgress();

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "15px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <h3
        style={{
          color: "#2D5016",
          marginBottom: "20px",
          fontSize: "20px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        👑 VIP-система
      </h3>

      {/* Текущий уровень */}
      <div
        style={{
          background: `linear-gradient(135deg, ${currentLevel.color}20, ${currentLevel.color}40)`,
          border: `3px solid ${currentLevel.color}`,
          borderRadius: "20px",
          padding: "25px",
          marginBottom: "25px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Декоративные элементы */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            background: `${currentLevel.color}30`,
            borderRadius: "50%",
            opacity: 0.3,
          }}
        ></div>

        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "100px",
            height: "100px",
            background: `${currentLevel.color}20`,
            borderRadius: "50%",
            opacity: 0.2,
          }}
        ></div>

        <div
          style={{
            fontSize: "48px",
            marginBottom: "15px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {currentLevel.icon}
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: currentLevel.color,
            marginBottom: "10px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {currentLevel.name}
        </div>

        <div
          style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Участник с {new Date(userStats.joinDate).toLocaleDateString("ru-RU")}
        </div>

        {/* Статистика */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "15px",
            marginTop: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: currentLevel.color,
                marginBottom: "5px",
              }}
            >
              {userStats.totalOrders}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
              }}
            >
              Заказов
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: currentLevel.color,
                marginBottom: "5px",
              }}
            >
              {userStats.totalSpent.toLocaleString()}₽
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
              }}
            >
              Потрачено
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: currentLevel.color,
                marginBottom: "5px",
              }}
            >
              {currentLevel.discount}%
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
              }}
            >
              Скидка
            </div>
          </div>
        </div>
      </div>

      {/* Прогресс до следующего уровня */}
      {nextLevel && (
        <div
          style={{
            background: "#f8f9fa",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "25px",
          }}
        >
          <h4
            style={{
              color: "#2D5016",
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            🎯 До уровня {nextLevel.name} {nextLevel.icon}
          </h4>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              <span>
                Заказы: {userStats.totalOrders} / {nextLevel.minOrders}
              </span>
              <span>{Math.round(progress.orders)}%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e0e0e0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress.orders}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${nextLevel.color}, ${nextLevel.color}80)`,
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              <span>
                Потрачено: {userStats.totalSpent.toLocaleString()}₽ /{" "}
                {nextLevel.minSpent.toLocaleString()}₽
              </span>
              <span>{Math.round(progress.spent)}%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e0e0e0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress.spent}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${nextLevel.color}, ${nextLevel.color}80)`,
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Привилегии текущего уровня */}
      <div
        style={{
          background: "linear-gradient(135deg, #d4edda, #c3e6cb)",
          border: "1px solid #c3e6cb",
          borderRadius: "15px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <h4
          style={{
            color: "#155724",
            marginBottom: "15px",
            fontSize: "18px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          ✨ Ваши привилегии
        </h4>

        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >
          {currentLevel.benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#155724",
              }}
            >
              <span style={{ fontSize: "16px" }}>✅</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Достижения */}
      <div style={{ marginBottom: "25px" }}>
        <h4
          style={{
            color: "#2D5016",
            marginBottom: "15px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          🏆 Достижения
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              style={{
                background: achievement.unlocked
                  ? "linear-gradient(135deg, #d4edda, #c3e6cb)"
                  : "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                border: `2px solid ${
                  achievement.unlocked ? "#c3e6cb" : "#e0e0e0"
                }`,
                borderRadius: "15px",
                padding: "15px",
                textAlign: "center",
                opacity: achievement.unlocked ? 1 : 0.7,
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                  opacity: achievement.unlocked ? 1 : 0.5,
                }}
              >
                {achievement.icon}
              </div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: achievement.unlocked ? "#155724" : "#666",
                  marginBottom: "5px",
                }}
              >
                {achievement.name}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: achievement.unlocked ? "#155724" : "#666",
                  marginBottom: "10px",
                }}
              >
                {achievement.description}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: achievement.unlocked ? "#155724" : "#666",
                }}
              >
                {achievement.unlocked
                  ? "✅ Разблокировано"
                  : `+${achievement.points} очков`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Специальные предложения */}
      <div>
        <h4
          style={{
            color: "#2D5016",
            marginBottom: "15px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          🎁 Специальные предложения
        </h4>

        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {specialOffers
            .filter(
              (offer) =>
                vipLevels.findIndex((level) => level.name === offer.level) <=
                vipLevels.findIndex((level) => level.name === currentLevel.name)
            )
            .map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: "linear-gradient(135deg, #fff3cd, #ffeaa7)",
                  border: "1px solid #ffeaa7",
                  borderRadius: "15px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                  }}
                >
                  {offer.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#856404",
                      marginBottom: "5px",
                    }}
                  >
                    {offer.title}
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#856404",
                      marginBottom: "10px",
                    }}
                  >
                    {offer.description}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#856404",
                      }}
                    >
                      Скидка: {offer.discount}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#856404",
                        background: "rgba(255, 255, 255, 0.7)",
                        padding: "4px 8px",
                        borderRadius: "10px",
                      }}
                    >
                      До{" "}
                      {new Date(offer.validUntil).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default VIPSystem;
