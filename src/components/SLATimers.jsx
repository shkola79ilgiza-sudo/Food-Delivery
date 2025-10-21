import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "../contexts/ToastContext";

const SLATimers = ({ order, onSLAViolation, onCompensation }) => {
  const { showSuccess, showError, showWarning } = useToast();
  // const [currentTime, setCurrentTime] = useState(new Date()); // Не используется
  const [slaStatus, setSlaStatus] = useState("pending");
  const [violations, setViolations] = useState([]);
  const [compensations, setCompensations] = useState([]);

  const slaThresholds = useMemo(
    () => ({
      acceptance: 10, // минут на принятие заказа
      preparation: 15, // минут отклонение времени приготовления
      delivery: 20, // минут отклонение времени доставки
      total: 60, // минут общее время выполнения заказа
    }),
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      checkSLA();
    }, 1000);

    return () => clearInterval(timer);
  }, [checkSLA]);

  const checkSLA = useCallback(() => {
    if (!order) return;

    try {
      const now = new Date();
      const orderTime = new Date(order.createdAt);

      // Проверяем валидность даты
      if (isNaN(orderTime.getTime())) {
        console.error("Invalid order creation date:", order.createdAt);
        return;
      }

      const timeDiff = (now - orderTime) / (1000 * 60); // в минутах

      const newViolations = [];
      // const newCompensations = []; // Не используется в этом блоке

      // Проверка принятия заказа
      if (
        order.status === "pending_confirmation" &&
        timeDiff > slaThresholds.acceptance
      ) {
        if (!violations.find((v) => v.type === "acceptance")) {
          newViolations.push({
            id: `acceptance-${Date.now()}`,
            type: "acceptance",
            message: "Превышено время принятия заказа",
            threshold: slaThresholds.acceptance,
            actual: Math.round(timeDiff),
            severity: "high",
            compensation: 50, // 50₽ компенсация
          });
        }
      }

      // Проверка времени приготовления
      if (order.status === "preparing") {
        const preparationStartTime =
          order.preparationStartTime || order.cookingStartTime;
        const preparationTime = preparationStartTime
          ? (now - new Date(preparationStartTime)) / (1000 * 60)
          : timeDiff;

        const estimatedTime =
          order.estimatedPreparationTime || order.cookingDuration || 30;

        if (preparationTime > estimatedTime + slaThresholds.preparation) {
          if (!violations.find((v) => v.type === "preparation")) {
            newViolations.push({
              id: `preparation-${Date.now()}`,
              type: "preparation",
              message: "Превышено время приготовления",
              threshold: estimatedTime + slaThresholds.preparation,
              actual: Math.round(preparationTime),
              severity: "medium",
              compensation: 100, // 100₽ компенсация
            });
          }
        }
      }

      // Проверка времени доставки
      if (order.status === "delivering") {
        const deliveryTime = order.deliveryStartTime
          ? (now - new Date(order.deliveryStartTime)) / (1000 * 60)
          : 0;

        if (
          deliveryTime >
          (order.estimatedDeliveryTime || 30) + slaThresholds.delivery
        ) {
          if (!violations.find((v) => v.type === "delivery")) {
            newViolations.push({
              id: `delivery-${Date.now()}`,
              type: "delivery",
              message: "Превышено время доставки",
              threshold:
                (order.estimatedDeliveryTime || 30) + slaThresholds.delivery,
              actual: Math.round(deliveryTime),
              severity: "high",
              compensation: 150, // 150₽ компенсация
            });
          }
        }
      }

      // Проверка общего времени выполнения
      if (timeDiff > slaThresholds.total) {
        if (!violations.find((v) => v.type === "total")) {
          newViolations.push({
            id: `total-${Date.now()}`,
            type: "total",
            message: "Превышено общее время выполнения заказа",
            threshold: slaThresholds.total,
            actual: Math.round(timeDiff),
            severity: "critical",
            compensation: 200, // 200₽ компенсация
          });
        }
      }

      // Обновляем нарушения
      if (newViolations.length > 0) {
        const updatedViolations = [...violations, ...newViolations];
        setViolations(updatedViolations);

        // Отправляем уведомления
        newViolations.forEach((violation) => {
          if (onSLAViolation) {
            onSLAViolation(violation);
          }

          // Показываем предупреждение
          if (violation.severity === "critical") {
            showError(`🚨 КРИТИЧЕСКОЕ НАРУШЕНИЕ SLA: ${violation.message}`);
          } else if (violation.severity === "high") {
            showWarning(`⚠️ Нарушение SLA: ${violation.message}`);
          }
        });
      }

      // Обновляем статус SLA
      updateSLAStatus(timeDiff);
    } catch (error) {
      console.error("Error in checkSLA:", error);
    }
  }, [
    order,
    slaThresholds,
    violations,
    onSLAViolation,
    showWarning,
    showError,
    updateSLAStatus,
  ]);

  const updateSLAStatus = useCallback(
    (timeDiff) => {
      if (order.status === "completed") {
        setSlaStatus("completed");
      } else if (violations.length > 0) {
        setSlaStatus("violated");
      } else if (timeDiff > slaThresholds.total * 0.8) {
        setSlaStatus("warning");
      } else {
        setSlaStatus("on_track");
      }
    },
    [order.status, violations.length, slaThresholds.total]
  );

  const getTimeRemaining = () => {
    if (!order) return null;

    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timeDiff = (now - orderTime) / (1000 * 60);
    const remaining = slaThresholds.total - timeDiff;

    return remaining > 0 ? remaining : 0;
  };

  const getStatusColor = () => {
    switch (slaStatus) {
      case "completed":
        return "#4CAF50";
      case "violated":
        return "#F44336";
      case "warning":
        return "#FF9800";
      case "on_track":
        return "#2196F3";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusIcon = () => {
    switch (slaStatus) {
      case "completed":
        return "✅";
      case "violated":
        return "🚨";
      case "warning":
        return "⚠️";
      case "on_track":
        return "⏰";
      default:
        return "⏳";
    }
  };

  const applyCompensation = (violation) => {
    const compensation = {
      id: `compensation-${Date.now()}`,
      violationId: violation.id,
      amount: violation.compensation,
      type: "automatic",
      appliedAt: new Date().toISOString(),
      status: "applied",
    };

    setCompensations((prev) => [...prev, compensation]);

    if (onCompensation) {
      onCompensation(compensation);
    }

    showSuccess(
      `💰 Компенсация ${violation.compensation}₽ применена автоматически`
    );
  };

  const getOrderProgress = () => {
    if (!order) return 0;

    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timeDiff = (now - orderTime) / (1000 * 60);

    return Math.min((timeDiff / slaThresholds.total) * 100, 100);
  };

  if (!order) return null;

  const timeRemaining = getTimeRemaining();
  const progress = getOrderProgress();

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
          ⏰ SLA Мониторинг
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 15px",
            background: getStatusColor() + "20",
            borderRadius: "20px",
            border: `2px solid ${getStatusColor()}`,
          }}
        >
          <span style={{ fontSize: "20px" }}>{getStatusIcon()}</span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: getStatusColor(),
              textTransform: "uppercase",
            }}
          >
            {slaStatus === "on_track"
              ? "В норме"
              : slaStatus === "warning"
              ? "Предупреждение"
              : slaStatus === "violated"
              ? "Нарушение"
              : slaStatus === "completed"
              ? "Завершено"
              : "Ожидание"}
          </span>
        </div>
      </div>

      {/* Прогресс-бар времени */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
            Общее время выполнения
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: timeRemaining > 0 ? "#2D5016" : "#F44336",
            }}
          >
            {timeRemaining > 0
              ? `${Math.round(timeRemaining)} мин осталось`
              : "Время истекло"}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "#e0e0e0",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor:
                progress > 80
                  ? "#F44336"
                  : progress > 60
                  ? "#FF9800"
                  : "#4CAF50",
              transition: "width 0.3s ease",
              borderRadius: "6px",
            }}
          />
        </div>
      </div>

      {/* Детали SLA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Принятие заказа
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
            ≤ {slaThresholds.acceptance} мин
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Компенсация: 50₽
          </div>
        </div>

        <div
          style={{
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Время приготовления
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
            ± {slaThresholds.preparation} мин
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Компенсация: 100₽
          </div>
        </div>

        <div
          style={{
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Время доставки
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
            ± {slaThresholds.delivery} мин
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Компенсация: 150₽
          </div>
        </div>

        <div
          style={{
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Общее время
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
            ≤ {slaThresholds.total} мин
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Компенсация: 200₽
          </div>
        </div>
      </div>

      {/* Нарушения SLA */}
      {violations.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#F44336", marginBottom: "15px" }}>
            🚨 Нарушения SLA ({violations.length})
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {violations.map((violation) => (
              <div
                key={violation.id}
                style={{
                  padding: "12px",
                  background:
                    violation.severity === "critical" ? "#ffebee" : "#fff3e0",
                  border: `2px solid ${
                    violation.severity === "critical" ? "#F44336" : "#FF9800"
                  }`,
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color:
                        violation.severity === "critical"
                          ? "#F44336"
                          : "#FF9800",
                      marginBottom: "4px",
                    }}
                  >
                    {violation.message}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Порог: {violation.threshold} мин | Факт: {violation.actual}{" "}
                    мин
                  </div>
                </div>
                <button
                  onClick={() => applyCompensation(violation)}
                  style={{
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  💰 {violation.compensation}₽
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Примененные компенсации */}
      {compensations.length > 0 && (
        <div>
          <h4 style={{ color: "#4CAF50", marginBottom: "15px" }}>
            💰 Примененные компенсации ({compensations.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {compensations.map((compensation) => (
              <div
                key={compensation.id}
                style={{
                  padding: "10px",
                  background: "#e8f5e8",
                  border: "1px solid #4CAF50",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                }}
              >
                <span>Компенсация {compensation.amount}₽</span>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {new Date(compensation.appliedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Статистика */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "10px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          📊 Статистика заказа:
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "10px",
          }}
        >
          <div>
            Статус: <strong>{order.status}</strong>
          </div>
          <div>
            Время выполнения:{" "}
            <strong>
              {Math.round(
                (new Date() - new Date(order.createdAt)) / (1000 * 60)
              )}{" "}
              мин
            </strong>
          </div>
          <div>
            Нарушения: <strong>{violations.length}</strong>
          </div>
          <div>
            Компенсации:{" "}
            <strong>
              {compensations.reduce((sum, c) => sum + c.amount, 0)}₽
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLATimers;
