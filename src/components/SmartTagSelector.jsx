import React, { useState, useEffect, useCallback } from "react";
import { smartTagging } from "../utils/smartTagging";

const SmartTagSelector = ({ dish, selectedTags = [], onTagsChange }) => {
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDish = useCallback(() => {
    setIsAnalyzing(true);
    try {
      const tags = smartTagging.analyzeDish(dish);
      const formatted = smartTagging.formatTags(tags);
      setSuggestedTags(formatted);
    } catch (error) {
      console.error("Ошибка анализа тегов:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [dish]);

  useEffect(() => {
    if (dish && (dish.calories || dish.protein || dish.carbs || dish.fat)) {
      analyzeDish();
    }
  }, [dish, analyzeDish]);

  const toggleTag = (tagId) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return "#4caf50";
    if (confidence >= 70) return "#ff9800";
    return "#f44336";
  };

  if (isAnalyzing) {
    return (
      <div
        style={{
          padding: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>🤖</div>
        <div>AI анализирует блюдо и подбирает теги...</div>
      </div>
    );
  }

  if (suggestedTags.length === 0) {
    return null;
  }

  const displayedTags = showAllTags ? suggestedTags : suggestedTags.slice(0, 5);

  return (
    <div
      style={{
        padding: "20px",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        borderRadius: "12px",
        color: "white",
        marginTop: "20px",
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "24px" }}>🏷️</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              Smart Tagging
            </div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>
              AI предлагает {suggestedTags.length}{" "}
              {suggestedTags.length === 1 ? "тег" : "тегов"}
            </div>
          </div>
        </div>
        <button
          onClick={analyzeDish}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            padding: "8px 12px",
            borderRadius: "20px",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          🔄 Обновить
        </button>
      </div>

      {/* Теги */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        {displayedTags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag.id);

          return (
            <div
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              style={{
                padding: "10px 15px",
                background: isSelected
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.15)",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: isSelected
                  ? "2px solid rgba(255,255,255,0.8)"
                  : "2px solid transparent",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = isSelected
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.15)";
              }}
            >
              {/* Название тега */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span>{tag.emoji}</span>
                <span>{tag.name}</span>
                {isSelected && <span>✓</span>}
              </div>

              {/* Уверенность */}
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.9,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "4px",
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${tag.confidence}%`,
                      height: "100%",
                      background: getConfidenceColor(tag.confidence),
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span>{tag.confidence.toFixed(0)}%</span>
              </div>

              {/* Причина (при наведении) */}
              {tag.reason && (
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.8,
                    fontStyle: "italic",
                    marginTop: "3px",
                  }}
                >
                  {tag.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопка "Показать все" */}
      {suggestedTags.length > 5 && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              borderRadius: "20px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            {showAllTags
              ? "▲ Показать меньше"
              : `▼ Показать все (${suggestedTags.length})`}
          </button>
        </div>
      )}

      {/* Инфо */}
      <div
        style={{
          marginTop: "15px",
          padding: "12px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "8px",
          fontSize: "12px",
          lineHeight: "1.5",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          💡 Как это работает:
        </div>
        <div style={{ opacity: 0.9 }}>
          AI анализирует КБЖУ, ингредиенты и другие параметры блюда,
          автоматически предлагая релевантные теги для фильтрации. Нажмите на
          тег, чтобы добавить его к блюду.
        </div>
      </div>
    </div>
  );
};

export default SmartTagSelector;
