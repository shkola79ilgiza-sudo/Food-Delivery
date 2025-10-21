// Компонент для отображения анализа конкурентных цен
// Показывает сравнение с ресторанами и дает рекомендации

import React, { useState, useEffect, useCallback } from "react";
import { realPriceProvider } from "../utils/realPriceDataProvider";
import { competitivePriceAnalyzer } from "../utils/competitivePriceAnalyzer";

const CompetitivePriceAnalysis = ({ dishData, onPriceRecommendation }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Инициализация анализаторов
  useEffect(() => {
    competitivePriceAnalyzer.setPriceProvider(realPriceProvider);
  }, []);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await competitivePriceAnalyzer.analyzeCompetitivePricing(
        dishData
      );
      setAnalysis(result);

      // Передаем рекомендацию по цене родительскому компоненту
      if (onPriceRecommendation && result.recommendations.length > 0) {
        const priceRecommendation = result.recommendations.find(
          (r) => r.suggestedPrice
        );
        if (priceRecommendation) {
          onPriceRecommendation(priceRecommendation.suggestedPrice);
        }
      }
    } catch (err) {
      setError("Ошибка анализа конкурентных цен");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  }, [dishData, onPriceRecommendation]);

  // Запуск анализа при изменении данных блюда
  useEffect(() => {
    if (dishData && dishData.name) {
      runAnalysis();
    }
  }, [dishData, runAnalysis]);

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            border: "2px solid #007bff",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ margin: "10px 0 0 0", color: "#6c757d" }}>
          Анализируем конкурентные цены...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#f8d7da",
          color: "#721c24",
          borderRadius: "8px",
          border: "1px solid #f5c6cb",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>⚠️ Ошибка анализа</h4>
        <p style={{ margin: "0" }}>{error}</p>
        <button
          onClick={runAnalysis}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

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
      {/* Заголовок */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "15px",
          borderBottom: "2px solid #f8f9fa",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "15px",
          }}
        >
          <span style={{ color: "white", fontSize: "18px" }}>📊</span>
        </div>
        <div>
          <h3 style={{ margin: "0", color: "#2c3e50" }}>
            Анализ конкурентных цен
          </h3>
          <p
            style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px" }}
          >
            {analysis.dishName} • Уверенность:{" "}
            {Math.round(analysis.confidence * 100)}%
          </p>
        </div>
      </div>

      {/* Общий балл */}
      <div
        style={{
          background:
            analysis.overallScore >= 70
              ? "#d4edda"
              : analysis.overallScore >= 50
              ? "#fff3cd"
              : "#f8d7da",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2c3e50" }}>
          {analysis.overallScore}/100
        </div>
        <div style={{ fontSize: "14px", color: "#6c757d", marginTop: "5px" }}>
          {analysis.overallScore >= 70
            ? "Отличная позиция"
            : analysis.overallScore >= 50
            ? "Хорошая позиция"
            : "Требует внимания"}
        </div>
      </div>

      {/* Сравнение с ресторанами */}
      {analysis.competitors.restaurants.count > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4
            style={{
              color: "#2c3e50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            🏪 Сравнение с ресторанами
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <div
              style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  marginBottom: "5px",
                }}
              >
                Ваша цена
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {analysis.currentPrice}₽
              </div>
            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  marginBottom: "5px",
                }}
              >
                Средняя в ресторанах
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {analysis.competitors.restaurants.averagePrice}₽
              </div>
            </div>

            <div
              style={{
                background:
                  analysis.priceAnalysis.vsRestaurants.advantage.level ===
                  "high"
                    ? "#d4edda"
                    : analysis.priceAnalysis.vsRestaurants.advantage.level ===
                      "medium"
                    ? "#fff3cd"
                    : "#f8d7da",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  marginBottom: "5px",
                }}
              >
                {analysis.priceAnalysis.vsRestaurants.advantage.absolute > 0
                  ? "Экономия"
                  : "Переплата"}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color:
                    analysis.priceAnalysis.vsRestaurants.advantage.absolute > 0
                      ? "#28a745"
                      : "#dc3545",
                }}
              >
                {Math.abs(
                  analysis.priceAnalysis.vsRestaurants.advantage.absolute
                )}
                ₽
              </div>
              <div style={{ fontSize: "12px", color: "#6c757d" }}>
                ({analysis.priceAnalysis.vsRestaurants.advantage.percentage}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Рекомендации */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4
            style={{
              color: "#2c3e50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            💡 Рекомендации
          </h4>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  background:
                    rec.impact === "positive"
                      ? "#d4edda"
                      : rec.impact === "warning"
                      ? "#fff3cd"
                      : rec.impact === "critical"
                      ? "#f8d7da"
                      : "#e2e3e5",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      marginRight: "8px",
                      color:
                        rec.impact === "positive"
                          ? "#28a745"
                          : rec.impact === "warning"
                          ? "#ffc107"
                          : rec.impact === "critical"
                          ? "#dc3545"
                          : "#6c757d",
                    }}
                  >
                    {rec.impact === "positive"
                      ? "✅"
                      : rec.impact === "warning"
                      ? "⚠️"
                      : rec.impact === "critical"
                      ? "🚨"
                      : "ℹ️"}
                  </span>
                  <strong
                    style={{
                      color: "#2c3e50",
                      fontSize: "14px",
                    }}
                  >
                    {rec.title}
                  </strong>
                </div>

                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "#495057",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  {rec.message}
                </p>

                {rec.suggestedPrice && (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#2c3e50",
                    }}
                  >
                    Рекомендуемая цена: {rec.suggestedPrice}₽
                  </div>
                )}
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
          borderRadius: "8px",
          fontSize: "12px",
          color: "#6c757d",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            Ресторанов проанализировано:{" "}
            {analysis.competitors.restaurants.count}
          </span>
          <span>
            Магазинов проанализировано: {analysis.competitors.stores.count}
          </span>
        </div>
        <div style={{ marginTop: "5px", textAlign: "center" }}>
          Обновлено: {new Date(analysis.lastUpdated).toLocaleString("ru-RU")}
        </div>
      </div>
    </div>
  );
};

export default CompetitivePriceAnalysis;
