// Демонстрация интегрированной системы ценообразования
// Показывает данные из всех источников: открытые API, краудсорсинг, улучшенные моковые данные

import React, { useState, useEffect, useCallback } from "react";
import { integratedPricingSystem } from "../utils/integratedPricingSystem";
import { openDataAPI } from "../utils/openDataAPI";
import { crowdsourcingPrices } from "../utils/crowdsourcingPrices";
import { enhancedMockData } from "../utils/enhancedMockData";
import PriceCrowdsourcing from "./PriceCrowdsourcing";

const IntegratedPricingDemo = () => {
  const [productName, setProductName] = useState("мясо");
  const [region, setRegion] = useState("moscow");
  const [loading, setLoading] = useState(false);
  const [integratedData, setIntegratedData] = useState(null);
  const [sourceData, setSourceData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);

    try {
      // Получаем интегрированные данные
      const integrated = await integratedPricingSystem.getIntegratedPrice(
        productName,
        region
      );
      setIntegratedData(integrated);

      // Получаем данные из отдельных источников
      const [openData, crowdsourcing, mockData] = await Promise.allSettled([
        openDataAPI.getProductPrices(productName, region),
        Promise.resolve(crowdsourcingPrices.getPrices(productName, region)),
        Promise.resolve(enhancedMockData.getPrice(productName, region)),
      ]);

      setSourceData({
        openData: openData.status === "fulfilled" ? openData.value : null,
        crowdsourcing:
          crowdsourcing.status === "fulfilled" ? crowdsourcing.value : null,
        mockData: mockData.status === "fulfilled" ? mockData.value : null,
      });

      // Получаем рекомендации
      const recs = integratedPricingSystem.getPricingRecommendations(
        productName,
        region
      );
      setRecommendations(recs);

      // Получаем статистику
      const stats = integratedPricingSystem.getSystemStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  }, [productName, region]);

  // Загрузка данных при изменении продукта или региона
  useEffect(() => {
    if (productName) {
      loadAllData();
    }
  }, [productName, region, loadAllData]);

  const getSourceIcon = (source) => {
    const icons = {
      openData: "🏛️",
      crowdsourcing: "👥",
      mockData: "📊",
      fallback: "⚠️",
    };
    return icons[source] || "❓";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "#27ae60";
    if (confidence >= 0.6) return "#f39c12";
    return "#e74c3c";
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
        margin: "20px 0",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          color: "#2c3e50",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>🔗</span>
        Интегрированная система ценообразования
      </h2>

      {/* Управление */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Продукт:
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Введите название продукта"
            style={{
              padding: "8px 12px",
              border: "2px solid #e9ecef",
              borderRadius: "6px",
              fontSize: "14px",
              minWidth: "200px",
            }}
          />
        </div>

        <div>
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
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "2px solid #e9ecef",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <option value="moscow">Москва</option>
            <option value="spb">Санкт-Петербург</option>
            <option value="ekaterinburg">Екатеринбург</option>
            <option value="novosibirsk">Новосибирск</option>
            <option value="krasnodar">Краснодар</option>
            <option value="volgograd">Волгоград</option>
            <option value="tatarstan">Татарстан</option>
            <option value="bashkortostan">Башкортостан</option>
            <option value="chelyabinsk">Челябинск</option>
            <option value="omsk">Омск</option>
            <option value="samara">Самара</option>
            <option value="rostov">Ростов-на-Дону</option>
            <option value="ufa">Уфа</option>
            <option value="krasnoyarsk">Красноярск</option>
            <option value="voronezh">Воронеж</option>
            <option value="perm">Пермь</option>
            <option value="volgograd">Волгоград</option>
            <option value="saratov">Саратов</option>
            <option value="tyumen">Тюмень</option>
            <option value="toljatti">Тольятти</option>
            <option value="izhevsk">Ижевск</option>
            <option value="barnaul">Барнаул</option>
            <option value="ulyanovsk">Ульяновск</option>
            <option value="vladivostok">Владивосток</option>
            <option value="yaroslavl">Ярославль</option>
            <option value="makhachkala">Махачкала</option>
            <option value="tomsk">Томск</option>
            <option value="orenburg">Оренбург</option>
            <option value="kemerovo">Кемерово</option>
            <option value="ryazan">Рязань</option>
            <option value="astrakhan">Астрахань</option>
            <option value="naberezhnye_chelny">Набережные Челны</option>
            <option value="penza">Пенза</option>
            <option value="lipetsk">Липецк</option>
            <option value="tula">Тула</option>
            <option value="kirov">Киров</option>
            <option value="cheboksary">Чебоксары</option>
            <option value="kaliningrad">Калининград</option>
            <option value="bryansk">Брянск</option>
            <option value="ivanovo">Иваново</option>
            <option value="magnitogorsk">Магнитогорск</option>
            <option value="tver">Тверь</option>
            <option value="stavropol">Ставрополь</option>
            <option value="nizhny_tagil">Нижний Тагил</option>
            <option value="belgorod">Белгород</option>
            <option value="arkhangelsk">Архангельск</option>
            <option value="vladimir">Владимир</option>
            <option value="sevastopol">Севастополь</option>
            <option value="chita">Чита</option>
            <option value="kursk">Курск</option>
            <option value="kaluga">Калуга</option>
            <option value="smolensk">Смоленск</option>
            <option value="murmansk">Мурманск</option>
            <option value="kamchatka">Камчатка</option>
            <option value="sakhalin">Сахалин</option>
            <option value="yakutia">Якутия</option>
            <option value="tuva">Тува</option>
            <option value="khakassia">Хакасия</option>
            <option value="altai">Алтай</option>
            <option value="buryatia">Бурятия</option>
            <option value="kalmykia">Калмыкия</option>
            <option value="karelia">Карелия</option>
            <option value="komi">Коми</option>
            <option value="mari_el">Марий Эл</option>
            <option value="mordovia">Мордовия</option>
            <option value="udmurtia">Удмуртия</option>
            <option value="chuvashia">Чувашия</option>
            <option value="adygea">Адыгея</option>
            <option value="altai_republic">Алтай</option>
            <option value="ingushetia">Ингушетия</option>
            <option value="kabardino_balkaria">Кабардино-Балкария</option>
            <option value="karachay_cherkessia">Карачаево-Черкесия</option>
            <option value="north_ossetia">Северная Осетия</option>
            <option value="chechnya">Чечня</option>
            <option value="dagestan">Дагестан</option>
          </select>
        </div>

        <button
          onClick={loadAllData}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: loading ? "#95a5a6" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            alignSelf: "flex-end",
          }}
        >
          {loading ? "Загрузка..." : "Обновить"}
        </button>
      </div>

      {/* Интегрированный результат */}
      {integratedData && integratedData.success && (
        <div
          style={{
            background: "#e8f5e8",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #c3e6c3",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#155724",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🎯</span>
            Интегрированная цена
          </h3>
          <div
            style={{ fontSize: "18px", fontWeight: "bold", color: "#155724" }}
          >
            {integratedData.integratedPrice}₽
          </div>
          <div style={{ fontSize: "14px", color: "#155724", marginTop: "5px" }}>
            Уверенность: {Math.round(integratedData.confidence * 100)}% |
            Диапазон: {integratedData.minPrice}₽ - {integratedData.maxPrice}₽ |
            Источников: {integratedData.sources}
          </div>
        </div>
      )}

      {/* Данные по источникам */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            margin: "0 0 15px 0",
            color: "#2c3e50",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📊</span>
          Данные по источникам
        </h3>

        <div style={{ display: "grid", gap: "15px" }}>
          {/* Открытые API */}
          {sourceData.openData && (
            <div
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
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <span>{getSourceIcon("openData")}</span>
                <strong>Открытые API (Росстат, открытые данные)</strong>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {sourceData.openData.averagePrice}₽
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>
                Диапазон: {sourceData.openData.minPrice}₽ -{" "}
                {sourceData.openData.maxPrice}₽ | Уверенность:{" "}
                {Math.round(sourceData.openData.confidence * 100)}%
              </div>
            </div>
          )}

          {/* Краудсорсинг */}
          {sourceData.crowdsourcing && (
            <div
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
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <span>{getSourceIcon("crowdsourcing")}</span>
                <strong>Краудсорсинг (данные пользователей)</strong>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {sourceData.crowdsourcing.averagePrice}₽
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>
                Подтверждений: {sourceData.crowdsourcing.verificationCount} |
                Уверенность:{" "}
                {Math.round(sourceData.crowdsourcing.confidence * 100)}% |
                {sourceData.crowdsourcing.verified
                  ? "✅ Верифицировано"
                  : "⏳ Ожидает подтверждения"}
              </div>
            </div>
          )}

          {/* Улучшенные моковые данные */}
          {sourceData.mockData && (
            <div
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
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <span>{getSourceIcon("mockData")}</span>
                <strong>Улучшенные моковые данные</strong>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {sourceData.mockData.regionalPrice}₽
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>
                Базовая цена: {sourceData.mockData.basePrice}₽ | Региональный
                множитель: {sourceData.mockData.regionalMultiplier}x | Сезонный
                фактор: {sourceData.mockData.seasonalFactor}x |
                {sourceData.mockData.seasonal}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Рекомендации */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💡</span>
            Рекомендации
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  background: rec.type === "warning" ? "#fff3cd" : "#d1ecf1",
                  borderRadius: "6px",
                  border: `1px solid ${
                    rec.type === "warning" ? "#ffeaa7" : "#bee5eb"
                  }`,
                  fontSize: "14px",
                }}
              >
                <strong>{rec.type === "warning" ? "⚠️ " : "ℹ️ "}</strong>
                {rec.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Статистика системы */}
      {statistics && (
        <div
          style={{
            background: "#e8f4f8",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #bee5eb",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#0c5460",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>📈</span>
            Статистика системы
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            <div>
              <strong>Открытые API:</strong>
              <br />
              Запросов: {statistics.openData.totalRequests}
              <br />
              Кэш: {Math.round(statistics.openData.cacheHitRate * 100)}%
            </div>
            <div>
              <strong>Краудсорсинг:</strong>
              <br />
              Продуктов: {statistics.crowdsourcing.totalProducts}
              <br />
              Верифицировано: {statistics.crowdsourcing.verifiedProducts}
            </div>
            <div>
              <strong>Веса источников:</strong>
              <br />
              Открытые API: {Math.round(statistics.weights.openData * 100)}%
              <br />
              Краудсорсинг: {Math.round(statistics.weights.crowdsourcing * 100)}
              %<br />
              Моковые данные: {Math.round(statistics.weights.mockData * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Краудсорсинг */}
      <PriceCrowdsourcing
        productName={productName}
        onPriceAdded={() => loadAllData()}
      />
    </div>
  );
};

export default IntegratedPricingDemo;
