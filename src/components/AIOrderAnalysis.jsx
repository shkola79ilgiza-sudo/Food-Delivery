import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import { aiOrderAnalyzer } from "../utils/aiOrderAnalyzer"; // Named export - правильно

const AIOrderAnalysis = ({ orders = [], userGoals = "healthy", onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const performAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      console.log("🔍 Starting AI Order Analysis...");
      const result = await aiOrderAnalyzer.analyzeOrderHistory(
        orders,
        userGoals
      );
      console.log("📊 Analysis result:", result);
      setAnalysis(result);
      showSuccess("AI-анализ завершен! Получите персональные рекомендации.");
    } catch (error) {
      console.error("❌ Analysis error:", error);
      showError("Ошибка при анализе заказов. Попробуйте еще раз.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [orders, userGoals, showSuccess, showError]);

  useEffect(() => {
    if (orders.length > 0) {
      performAnalysis();
    }
  }, [orders, userGoals, performAnalysis]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "positive":
        return "✅";
      case "neutral":
        return "ℹ️";
      default:
        return "📊";
    }
  };

  if (isAnalyzing) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🤖</div>
        <h3 style={{ color: "#333", marginBottom: "10px" }}>
          AI анализирует ваши заказы...
        </h3>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Изучаем ваши предпочтения и готовим персональные рекомендации
        </p>
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "#f0f0f0",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "70%",
              height: "100%",
              background: "linear-gradient(90deg, #4caf50, #8bc34a)",
              animation: "loading 2s ease-in-out infinite",
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📊</div>
        <h3 style={{ color: "#333", marginBottom: "10px" }}>
          Нет данных для анализа
        </h3>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Сделайте несколько заказов, чтобы получить AI-рекомендации
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "15px",
        padding: "25px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: "15px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#333",
              margin: "0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            🤖 AI Анализ заказов
          </h2>
          <p style={{ color: "#666", margin: "5px 0 0 0", fontSize: "14px" }}>
            Персональные рекомендации на основе {orders.length} заказов
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#999",
              padding: "5px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Метрики здоровья */}
      {analysis.visualMetrics && (
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ color: "#333", marginBottom: "15px" }}>
            📊 Ваши метрики
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            {/* Оценка здоровья */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: analysis.visualMetrics.healthScoreChart.color,
                  marginBottom: "5px",
                }}
              >
                {analysis.visualMetrics.healthScoreChart.value}/100
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>
                Оценка здоровья
              </div>
            </div>

            {/* Средний чек */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                {analysis.visualMetrics.averageHealthyOrderValue.value}₽
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>Средний чек</div>
              <div
                style={{
                  fontSize: "12px",
                  color:
                    analysis.visualMetrics.averageHealthyOrderValue.status ===
                    "above"
                      ? "#4caf50"
                      : "#ff9800",
                }}
              >
                {analysis.visualMetrics.averageHealthyOrderValue.status ===
                "above"
                  ? "Выше нормы"
                  : "Ниже нормы"}
              </div>
            </div>

            {/* Риск диабета */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color:
                    analysis.visualMetrics.diabeticRiskMeter.level === "high"
                      ? "#f44336"
                      : analysis.visualMetrics.diabeticRiskMeter.level ===
                        "medium"
                      ? "#ff9800"
                      : "#4caf50",
                  marginBottom: "5px",
                }}
              >
                {analysis.visualMetrics.diabeticRiskMeter.level === "high"
                  ? "Высокий"
                  : analysis.visualMetrics.diabeticRiskMeter.level === "medium"
                  ? "Средний"
                  : "Низкий"}
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>
                Риск диабета
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Слепые зоны */}
      {analysis.insights?.blindSpots &&
        analysis.insights.blindSpots.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>
              🔍 Слепые зоны
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {analysis.insights.blindSpots.map((spot, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(244, 67, 54, 0.1)",
                    border: `2px solid ${getSeverityColor(spot.severity)}`,
                    borderRadius: "10px",
                    padding: "15px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                  onClick={() => setSelectedInsight(spot)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>⚠️</span>
                    <h4 style={{ margin: "0", color: "#333" }}>{spot.title}</h4>
                    <span
                      style={{
                        background: getSeverityColor(spot.severity),
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {spot.severity}
                    </span>
                  </div>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                    {spot.description}
                  </p>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      color: "#999",
                      fontSize: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    Влияние: {spot.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Рекомендации */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ color: "#333", marginBottom: "15px" }}>
            💡 Рекомендации
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(76, 175, 80, 0.1)",
                  border: "2px solid #4caf50",
                  borderRadius: "10px",
                  padding: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>
                    {getPriorityIcon(rec.priority)}
                  </span>
                  <h4 style={{ margin: "0", color: "#333" }}>{rec.title}</h4>
                </div>
                <p
                  style={{
                    margin: "0 0 5px 0",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  <strong>Действие:</strong> {rec.action}
                </p>
                <p
                  style={{
                    margin: "0",
                    color: "#4caf50",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  Польза: {rec.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инсайты */}
      {analysis.insights?.insights && analysis.insights.insights.length > 0 && (
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ color: "#333", marginBottom: "15px" }}>
            🧠 Ключевые инсайты
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {analysis.insights.insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  background:
                    insight.type === "warning"
                      ? "rgba(244, 67, 54, 0.1)"
                      : insight.type === "positive"
                      ? "rgba(76, 175, 80, 0.1)"
                      : "rgba(33, 150, 243, 0.1)",
                  border: `2px solid ${
                    insight.type === "warning"
                      ? "#f44336"
                      : insight.type === "positive"
                      ? "#4caf50"
                      : "#2196f3"
                  }`,
                  borderRadius: "10px",
                  padding: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>
                    {getInsightIcon(insight.type)}
                  </span>
                  <p style={{ margin: "0", color: "#333", fontWeight: "bold" }}>
                    {insight.message}
                  </p>
                </div>
                {insight.data && (
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                    {insight.data}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Альтернативы */}
      {analysis.insights?.alternatives &&
        analysis.insights.alternatives.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>
              🔄 Альтернативы
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {analysis.insights.alternatives.map((alt, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 152, 0, 0.1)",
                    border: "2px solid #ff9800",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>🔄</span>
                    <h4 style={{ margin: "0", color: "#333" }}>
                      Замените "{alt.current}"
                    </h4>
                  </div>
                  <p
                    style={{
                      margin: "0 0 5px 0",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    <strong>Предлагаем:</strong> {alt.suggested}
                  </p>
                  <p
                    style={{
                      margin: "0",
                      color: "#ff9800",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    Причина: {alt.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Кнопка обновления */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={performAnalysis}
          style={{
            background: "linear-gradient(135deg, #4caf50, #45a049)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
          }}
        >
          🔄 Обновить анализ
        </button>
      </div>

      {/* CSS для анимации */}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AIOrderAnalysis;
