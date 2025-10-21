import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";

const ChefTiers = ({ chefId, onTierChange }) => {
  const { showSuccess, showError } = useToast();
  const [currentTier, setCurrentTier] = useState("free");
  const [tierData, setTierData] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");

  const tiers = {
    free: {
      name: "Бесплатный",
      icon: "🆓",
      price: 0,
      color: "#6c757d",
      features: [
        "До 10 блюд в меню",
        "Базовые статистики",
        "Стандартная поддержка",
        "Комиссия 20% с заказа",
        "Обычное размещение в каталоге",
      ],
      limits: {
        maxDishes: 10,
        maxOrdersPerDay: 20,
        commissionRate: 0.2,
        prioritySupport: false,
        analytics: "basic",
        promotion: "standard",
      },
    },
    pro: {
      name: "Профессиональный",
      icon: "⭐",
      price: 1999,
      color: "#007bff",
      features: [
        "До 50 блюд в меню",
        "Расширенная аналитика",
        "Приоритетная поддержка",
        "Комиссия 15% с заказа",
        "Продвижение в каталоге",
        "Календарь слотов работы",
        "SLA мониторинг",
      ],
      limits: {
        maxDishes: 50,
        maxOrdersPerDay: 100,
        commissionRate: 0.15,
        prioritySupport: true,
        analytics: "advanced",
        promotion: "priority",
        slotsCalendar: true,
        slaMonitoring: true,
      },
    },
    business: {
      name: "Бизнес",
      icon: "💎",
      price: 4999,
      color: "#28a745",
      features: [
        "Неограниченное количество блюд",
        "Полная аналитика и отчеты",
        "VIP поддержка 24/7",
        "Комиссия 10% с заказа",
        "Топ размещение в каталоге",
        "Все функции Pro",
        "Персональный менеджер",
        "Интеграции с внешними сервисами",
        "Белый лейбл",
      ],
      limits: {
        maxDishes: -1, // неограниченно
        maxOrdersPerDay: -1, // неограниченно
        commissionRate: 0.1,
        prioritySupport: true,
        analytics: "enterprise",
        promotion: "top",
        slotsCalendar: true,
        slaMonitoring: true,
        personalManager: true,
        integrations: true,
        whiteLabel: true,
      },
    },
  };

  const loadChefTier = useCallback(() => {
    try {
      const savedTier = localStorage.getItem(`chef_tier_${chefId}`) || "free";
      const savedTierData = JSON.parse(
        localStorage.getItem(`chef_tier_data_${chefId}`) || "{}"
      );

      setCurrentTier(savedTier);
      setTierData(savedTierData);
    } catch (error) {
      console.error("Error loading chef tier:", error);
      setCurrentTier("free");
      setTierData({});
    }
  }, [chefId]);

  useEffect(() => {
    loadChefTier();
  }, [loadChefTier]);

  const upgradeTier = (newTier) => {
    try {
      const tierInfo = tiers[newTier];

      // Сохраняем новый тариф
      localStorage.setItem(`chef_tier_${chefId}`, newTier);
      localStorage.setItem(
        `chef_tier_data_${chefId}`,
        JSON.stringify({
          tier: newTier,
          upgradedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 дней
          paymentStatus: "pending",
        })
      );

      setCurrentTier(newTier);
      setTierData({
        tier: newTier,
        upgradedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        paymentStatus: "pending",
      });

      if (onTierChange) {
        onTierChange(newTier, tierInfo);
      }

      showSuccess(`Тариф обновлен на "${tierInfo.name}"!`);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error("Error upgrading tier:", error);
      showError("Ошибка обновления тарифа");
    }
  };

  const getCurrentTierInfo = () => tiers[currentTier];
  const getTierProgress = () => {
    const tierInfo = getCurrentTierInfo();
    const limits = tierInfo.limits;

    // Получаем текущие данные повара
    const chefDishes = JSON.parse(
      localStorage.getItem(`demo_menu_${chefId}`) || "[]"
    );
    const chefOrders = JSON.parse(
      localStorage.getItem("clientOrders") || "[]"
    ).filter((order) => order.chefId === chefId);

    const todayOrders = chefOrders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    });

    return {
      dishesUsed: chefDishes.length,
      dishesLimit: limits.maxDishes,
      ordersToday: todayOrders.length,
      ordersLimit: limits.maxOrdersPerDay,
      commissionRate: limits.commissionRate,
    };
  };

  const progress = getTierProgress();

  return (
    <div
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
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            color: "#2D5016",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          💎 Тарифный план
        </h3>
        <button
          onClick={() => setShowUpgradeModal(true)}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ⬆️ Обновить тариф
        </button>
      </div>

      {/* Текущий тариф */}
      <div
        style={{
          background: getCurrentTierInfo().color + "15",
          border: `2px solid ${getCurrentTierInfo().color}`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <span style={{ fontSize: "32px" }}>{getCurrentTierInfo().icon}</span>
          <div>
            <h4
              style={{
                color: getCurrentTierInfo().color,
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {getCurrentTierInfo().name}
            </h4>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "14px",
                color: "#666",
              }}
            >
              {getCurrentTierInfo().price === 0
                ? "Бесплатно"
                : `${getCurrentTierInfo().price}₽/месяц`}
            </p>
          </div>
        </div>

        {/* Прогресс использования */}
        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>
              Блюда в меню
            </span>
            <span style={{ fontSize: "14px", color: "#666" }}>
              {progress.dishesUsed} /{" "}
              {progress.dishesLimit === -1 ? "∞" : progress.dishesLimit}
            </span>
          </div>
          {progress.dishesLimit !== -1 && (
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#e0e0e0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    (progress.dishesUsed / progress.dishesLimit) * 100,
                    100
                  )}%`,
                  height: "100%",
                  backgroundColor: getCurrentTierInfo().color,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>
            Заказы сегодня
          </span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {progress.ordersToday} /{" "}
            {progress.ordersLimit === -1 ? "∞" : progress.ordersLimit}
          </span>
        </div>
        {progress.ordersLimit !== -1 && (
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  (progress.ordersToday / progress.ordersLimit) * 100,
                  100
                )}%`,
                height: "100%",
                backgroundColor: getCurrentTierInfo().color,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>
            Комиссия платформы
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: getCurrentTierInfo().color,
            }}
          >
            {Math.round(progress.commissionRate * 100)}%
          </span>
        </div>
      </div>

      {/* Возможности тарифа */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ color: "#2D5016", marginBottom: "15px" }}>
          🎯 Возможности тарифа
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "10px",
          }}
        >
          {getCurrentTierInfo().features.map((feature, index) => (
            <div
              key={index}
              style={{
                padding: "10px 15px",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: getCurrentTierInfo().color }}>✓</span>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Статистика доходов */}
      <div
        style={{
          background: "#e8f5e8",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#2D5016", marginBottom: "10px" }}>
          📊 Статистика доходов
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            fontSize: "14px",
          }}
        >
          <div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              Заказов за месяц
            </div>
            <div style={{ fontWeight: "bold", color: "#2D5016" }}>
              {
                JSON.parse(localStorage.getItem("clientOrders") || "[]")
                  .filter((order) => order.chefId === chefId)
                  .filter((order) => {
                    const orderDate = new Date(
                      order.createdAt || order.timestamp
                    );
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return orderDate > monthAgo;
                  }).length
              }
            </div>
          </div>
          <div>
            <div style={{ color: "#666", fontSize: "12px" }}>Общий доход</div>
            <div style={{ fontWeight: "bold", color: "#2D5016" }}>
              {JSON.parse(localStorage.getItem("clientOrders") || "[]")
                .filter((order) => order.chefId === chefId)
                .reduce((sum, order) => sum + (order.total || 0), 0)}
              ₽
            </div>
          </div>
          <div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              Комиссия платформы
            </div>
            <div style={{ fontWeight: "bold", color: "#2D5016" }}>
              {Math.round(
                JSON.parse(localStorage.getItem("clientOrders") || "[]")
                  .filter((order) => order.chefId === chefId)
                  .reduce((sum, order) => sum + (order.total || 0), 0) *
                  progress.commissionRate
              )}
              ₽
            </div>
          </div>
          <div>
            <div style={{ color: "#666", fontSize: "12px" }}>Ваш доход</div>
            <div style={{ fontWeight: "bold", color: "#2D5016" }}>
              {Math.round(
                JSON.parse(localStorage.getItem("clientOrders") || "[]")
                  .filter((order) => order.chefId === chefId)
                  .reduce((sum, order) => sum + (order.total || 0), 0) *
                  (1 - progress.commissionRate)
              )}
              ₽
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно обновления тарифа */}
      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                padding: "20px 25px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                color: "white",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                💎 Обновление тарифа
              </h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{ padding: "25px", maxHeight: "60vh", overflowY: "auto" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                }}
              >
                {Object.entries(tiers).map(([tierKey, tier]) => (
                  <div
                    key={tierKey}
                    onClick={() => setSelectedTier(tierKey)}
                    style={{
                      padding: "20px",
                      borderRadius: "15px",
                      border:
                        selectedTier === tierKey
                          ? `3px solid ${tier.color}`
                          : "2px solid #e0e0e0",
                      background:
                        selectedTier === tierKey ? `${tier.color}15` : "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTier !== tierKey) {
                        e.target.style.transform = "translateY(-5px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(0,0,0,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTier !== tierKey) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  >
                    {currentTier === tierKey && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: tier.color,
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        ТЕКУЩИЙ
                      </div>
                    )}

                    <div style={{ textAlign: "center", marginBottom: "15px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                        {tier.icon}
                      </div>
                      <h3
                        style={{
                          color: tier.color,
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {tier.name}
                      </h3>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: tier.color,
                          marginTop: "5px",
                        }}
                      >
                        {tier.price === 0 ? "Бесплатно" : `${tier.price}₽/мес`}
                      </div>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      {tier.features.map((feature, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "6px 0",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ color: tier.color }}>✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTier && (
                <div
                  style={{
                    marginTop: "25px",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ marginBottom: "15px", color: "#333" }}>
                    Выбран тариф: {tiers[selectedTier].name}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      style={{
                        background: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => upgradeTier(selectedTier)}
                      style={{
                        background: tiers[selectedTier].color,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Обновить тариф
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefTiers;
