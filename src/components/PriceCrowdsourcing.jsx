// Компонент для краудсорсинга цен от пользователей
// Позволяет добавлять и обновлять цены продуктов

import React, { useState, useEffect, useCallback } from "react";
import { crowdsourcingPrices } from "../utils/crowdsourcingPrices";

const PriceCrowdsourcing = ({ productName, onPriceAdded }) => {
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("moscow");
  const [source, setSource] = useState("manual");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [existingPrices, setExistingPrices] = useState(null);

  const loadExistingPrices = useCallback(() => {
    const prices = crowdsourcingPrices.getAllPricesForProduct(productName);
    setExistingPrices(prices);
  }, [productName]);

  // Загрузка существующих цен при изменении продукта
  useEffect(() => {
    if (productName) {
      loadExistingPrices();
    }
  }, [productName, loadExistingPrices]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!price || parseFloat(price) <= 0) {
      setMessage("Пожалуйста, введите корректную цену");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const userInfo = {
        userId: localStorage.getItem("userId") || "anonymous",
        source: source,
        confidence: source === "photo" ? 0.8 : source === "receipt" ? 0.9 : 0.5,
      };

      const result = crowdsourcingPrices.addUserPrice(
        productName,
        parseFloat(price),
        location,
        userInfo
      );

      setMessage("Цена успешно добавлена! Спасибо за участие в краудсорсинге.");
      setPrice("");

      // Обновляем список цен
      loadExistingPrices();

      // Уведомляем родительский компонент
      if (onPriceAdded) {
        onPriceAdded(result);
      }
    } catch (error) {
      setMessage("Ошибка при добавлении цены. Попробуйте еще раз.");
      console.error("Crowdsourcing error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = (productName, location, userId) => {
    const success = crowdsourcingPrices.verifyPrice(
      productName,
      location,
      userId
    );
    if (success) {
      setMessage("Цена подтверждена! Спасибо за верификацию.");
      loadExistingPrices();
    } else {
      setMessage("Вы уже подтверждали эту цену ранее.");
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "#27ae60"; // Зеленый
    if (confidence >= 0.6) return "#f39c12"; // Оранжевый
    return "#e74c3c"; // Красный
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return "Высокая";
    if (confidence >= 0.6) return "Средняя";
    return "Низкая";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        border: "1px solid #e9ecef",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          color: "#2c3e50",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>👥</span>
        Краудсорсинг цен
      </h3>

      {/* Форма добавления цены */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Продукт: {productName}
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Цена (₽):
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Введите цену за 100г"
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #e9ecef",
              borderRadius: "6px",
              fontSize: "16px",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Регион:
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #e9ecef",
              borderRadius: "6px",
              fontSize: "16px",
            }}
          >
            <option value="moscow">Москва</option>
            <option value="spb">Санкт-Петербург</option>
            <option value="ekaterinburg">Екатеринбург</option>
            <option value="novosibirsk">Новосибирск</option>
            <option value="krasnodar">Краснодар</option>
            <option value="volgograd">Волгоград</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Источник:
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #e9ecef",
              borderRadius: "6px",
              fontSize: "16px",
            }}
          >
            <option value="manual">Ручной ввод</option>
            <option value="photo">Фото чека</option>
            <option value="receipt">Сканирование чека</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px",
            background: submitting ? "#95a5a6" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: submitting ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {submitting ? "Добавление..." : "Добавить цену"}
        </button>
      </form>

      {/* Сообщения */}
      {message && (
        <div
          style={{
            padding: "10px",
            background: message.includes("успешно") ? "#d4edda" : "#f8d7da",
            color: message.includes("успешно") ? "#155724" : "#721c24",
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      {/* Существующие цены */}
      {existingPrices && existingPrices.length > 0 && (
        <div>
          <h4
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>📊</span>
            Существующие цены
          </h4>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {existingPrices.map((priceData, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#2c3e50" }}>
                    {priceData.location} - {priceData.averagePrice}₽
                  </div>
                  <div
                    style={{
                      padding: "4px 8px",
                      background: getConfidenceColor(priceData.confidence),
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getConfidenceText(priceData.confidence)}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginBottom: "8px",
                  }}
                >
                  Подтверждений: {priceData.verificationCount} | Источников:{" "}
                  {priceData.sources} |
                  {priceData.verified
                    ? "✅ Верифицировано"
                    : "⏳ Ожидает подтверждения"}
                </div>

                <button
                  onClick={() =>
                    handleVerify(
                      productName,
                      priceData.location,
                      localStorage.getItem("userId") || "anonymous"
                    )
                  }
                  style={{
                    padding: "6px 12px",
                    background: "#27ae60",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Подтвердить цену
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Статистика краудсорсинга */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e8f4f8",
          borderRadius: "8px",
          border: "1px solid #bee5eb",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#0c5460" }}>
          📈 Статистика краудсорсинга
        </h4>
        <div style={{ fontSize: "14px", color: "#0c5460" }}>
          {(() => {
            const stats = crowdsourcingPrices.getStatistics();
            return (
              <>
                <div>Всего продуктов: {stats.totalProducts}</div>
                <div>Верифицировано: {stats.verifiedProducts}</div>
                <div>Всего цен: {stats.totalPrices}</div>
                <div>
                  Средняя уверенность:{" "}
                  {Math.round(stats.averageConfidence * 100)}%
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default PriceCrowdsourcing;
