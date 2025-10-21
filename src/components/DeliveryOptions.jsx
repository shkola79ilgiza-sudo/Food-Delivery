import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "../contexts/ToastContext";

const DeliveryOptions = ({ order, onDeliveryOptionChange }) => {
  const { showSuccess } = useToast(); // showError не используется в текущей реализации
  const [selectedOption, setSelectedOption] = useState(
    order?.deliveryOption || "pickup"
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryRadius, setDeliveryRadius] = useState(10);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [courierInfo, setCourierInfo] = useState(null);

  const deliveryOptions = useMemo(
    () => [
      {
        id: "pickup",
        name: "Самовывоз",
        icon: "🏪",
        description: "Забрать заказ самостоятельно",
        fee: 0,
        estimatedTime: "15-30 мин",
        color: "#4CAF50",
      },
      {
        id: "chef_delivery",
        name: "Доставка поваром",
        icon: "👨‍🍳",
        description: "Повар доставляет заказ лично",
        fee: 100,
        estimatedTime: "30-60 мин",
        color: "#2196F3",
        maxRadius: 15,
      },
      {
        id: "courier_partner",
        name: "Курьерская служба",
        icon: "🚚",
        description: "Доставка через партнеров (Яндекс Go, inDriver)",
        fee: 150,
        estimatedTime: "45-90 мин",
        color: "#FF9800",
      },
    ],
    []
  );

  const calculateDeliveryDetails = useCallback(() => {
    const option = deliveryOptions.find((opt) => opt.id === selectedOption);
    if (!option) return;

    let fee = option.fee;
    let estimatedTime = option.estimatedTime;

    // Дополнительные расчеты для доставки поваром
    if (selectedOption === "chef_delivery") {
      if (deliveryRadius > 10) {
        fee += Math.round((deliveryRadius - 10) * 10); // +10₽ за каждый км свыше 10
      }
      estimatedTime = `${30 + deliveryRadius * 2}-${
        60 + deliveryRadius * 2
      } мин`;
    }

    // Дополнительные расчеты для курьерской службы
    if (selectedOption === "courier_partner") {
      // Имитация расчета на основе адреса
      if (
        deliveryAddress.includes("центр") ||
        deliveryAddress.includes("центр")
      ) {
        fee += 50; // Доплата за центр города
      }
      estimatedTime = "45-90 мин";
    }

    setDeliveryFee(fee);
    setEstimatedDeliveryTime(estimatedTime);
  }, [selectedOption, deliveryAddress, deliveryRadius, deliveryOptions]);

  useEffect(() => {
    calculateDeliveryDetails();
  }, [calculateDeliveryDetails]);

  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId);
    const option = deliveryOptions.find((opt) => opt.id === optionId);

    if (onDeliveryOptionChange) {
      onDeliveryOptionChange({
        option: optionId,
        fee: option.fee,
        estimatedTime: option.estimatedTime,
        address: deliveryAddress,
        radius: deliveryRadius,
      });
    }
  };

  const handleAddressChange = (address) => {
    setDeliveryAddress(address);
    if (onDeliveryOptionChange) {
      onDeliveryOptionChange({
        option: selectedOption,
        fee: deliveryFee,
        estimatedTime: estimatedDeliveryTime,
        address: address,
        radius: deliveryRadius,
      });
    }
  };

  const simulateCourierAssignment = () => {
    if (selectedOption !== "courier_partner") return;

    // Имитация назначения курьера
    const couriers = [
      { name: "Алексей", rating: 4.8, eta: "25 мин", vehicle: "🚗" },
      { name: "Мария", rating: 4.9, eta: "35 мин", vehicle: "🛵" },
      { name: "Дмитрий", rating: 4.7, eta: "20 мин", vehicle: "🚗" },
    ];

    const assignedCourier =
      couriers[Math.floor(Math.random() * couriers.length)];
    setCourierInfo(assignedCourier);
    showSuccess(
      `Курьер ${assignedCourier.name} назначен! ETA: ${assignedCourier.eta}`
    );
  };

  const selectedDeliveryOption = deliveryOptions.find(
    (opt) => opt.id === selectedOption
  );

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
      <h3
        style={{
          color: "#2D5016",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        🚚 Опции доставки
      </h3>

      {/* Выбор опции доставки */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionChange(option.id)}
              style={{
                padding: "15px",
                borderRadius: "12px",
                border:
                  selectedOption === option.id
                    ? `3px solid ${option.color}`
                    : "2px solid #e0e0e0",
                background:
                  selectedOption === option.id ? `${option.color}15` : "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                if (selectedOption !== option.id) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOption !== option.id) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                {option.icon}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: selectedOption === option.id ? option.color : "#333",
                  marginBottom: "5px",
                }}
              >
                {option.name}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                {option.description}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: option.color,
                }}
              >
                {option.fee === 0 ? "Бесплатно" : `${option.fee}₽`}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {option.estimatedTime}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Дополнительные настройки */}
      {selectedOption !== "pickup" && (
        <div
          style={{
            background: "#f8f9fa",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h4 style={{ color: "#2D5016", marginBottom: "15px" }}>
            📍 Настройки доставки
          </h4>

          {/* Адрес доставки */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Адрес доставки:
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Введите адрес доставки"
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Радиус доставки (только для доставки поваром) */}
          {selectedOption === "chef_delivery" && (
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Радиус доставки: {deliveryRadius} км
              </label>
              <input
                type="range"
                min="5"
                max="25"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  background: "#e0e0e0",
                  outline: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "5px",
                }}
              >
                <span>5 км</span>
                <span>25 км</span>
              </div>
            </div>
          )}

          {/* Назначение курьера */}
          {selectedOption === "courier_partner" && (
            <div style={{ marginBottom: "15px" }}>
              <button
                onClick={simulateCourierAssignment}
                style={{
                  background: "#FF9800",
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
                🚚 Назначить курьера
              </button>
            </div>
          )}

          {/* Информация о курьере */}
          {courierInfo && (
            <div
              style={{
                background: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "15px",
              }}
            >
              <h5 style={{ color: "#856404", marginBottom: "8px" }}>
                🚚 Назначенный курьер:
              </h5>
              <div style={{ fontSize: "14px", color: "#856404" }}>
                <div>
                  <strong>Имя:</strong> {courierInfo.name}
                </div>
                <div>
                  <strong>Рейтинг:</strong> ⭐ {courierInfo.rating}
                </div>
                <div>
                  <strong>Транспорт:</strong> {courierInfo.vehicle}
                </div>
                <div>
                  <strong>ETA:</strong> {courierInfo.eta}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Итоговая информация */}
      <div
        style={{
          background: selectedDeliveryOption.color + "15",
          border: `2px solid ${selectedDeliveryOption.color}`,
          borderRadius: "10px",
          padding: "15px",
        }}
      >
        <h4
          style={{ color: selectedDeliveryOption.color, marginBottom: "10px" }}
        >
          📋 Итоговая информация
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          <div>
            <strong>Способ:</strong> {selectedDeliveryOption.name}
          </div>
          <div>
            <strong>Стоимость:</strong>{" "}
            {deliveryFee === 0 ? "Бесплатно" : `${deliveryFee}₽`}
          </div>
          <div>
            <strong>Время:</strong> {estimatedDeliveryTime}
          </div>
          {deliveryAddress && (
            <div>
              <strong>Адрес:</strong> {deliveryAddress}
            </div>
          )}
          {selectedOption === "chef_delivery" && (
            <div>
              <strong>Радиус:</strong> {deliveryRadius} км
            </div>
          )}
        </div>
      </div>

      {/* SLA информация */}
      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          background: "#e8f5e8",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#2D5016",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          📋 SLA гарантии:
        </div>
        <div>• Повар принимает заказ в течение 10 минут</div>
        <div>• Время приготовления ±15 минут от заявленного</div>
        <div>• Время доставки ±20 минут от расчетного</div>
        <div>• При нарушении SLA - компенсация клиенту</div>
      </div>
    </div>
  );
};

export default DeliveryOptions;
