// Интегрированная система ценообразования
// Объединяет открытые API, краудсорсинг, улучшенные моковые данные

import { openDataAPI } from './openDataAPI';
import { crowdsourcingPrices } from './crowdsourcingPrices';
import { enhancedMockData } from './enhancedMockData';

export class IntegratedPricingSystem {
  constructor() {
    this.sources = {
      openData: openDataAPI,
      crowdsourcing: crowdsourcingPrices,
      mockData: enhancedMockData
    };
    this.weights = {
      openData: 0.4,      // 40% - официальные данные
      crowdsourcing: 0.3, // 30% - данные пользователей
      mockData: 0.3       // 30% - улучшенные моковые данные
    };
  }

  // Получение интегрированной цены
  async getIntegratedPrice(productName, region = 'default', options = {}) {
    const {
      useOpenData = true,
      useCrowdsourcing = true,
      useMockData = true,
      fallbackToMock = true
    } = options;

    const results = [];
    const errors = [];

    // Получаем данные из всех источников
    if (useOpenData) {
      try {
        const openDataResult = await this.sources.openData.getProductPrices(productName, region);
        if (openDataResult && !openDataResult.fallback) {
          results.push({
            source: 'openData',
            price: openDataResult.averagePrice,
            confidence: openDataResult.confidence,
            minPrice: openDataResult.minPrice,
            maxPrice: openDataResult.maxPrice,
            data: openDataResult
          });
        }
      } catch (error) {
        errors.push({ source: 'openData', error: error.message });
      }
    }

    if (useCrowdsourcing) {
      try {
        const crowdsourcingResult = this.sources.crowdsourcing.getPrices(productName, region);
        if (crowdsourcingResult) {
          results.push({
            source: 'crowdsourcing',
            price: crowdsourcingResult.averagePrice,
            confidence: crowdsourcingResult.confidence,
            minPrice: crowdsourcingResult.minPrice,
            maxPrice: crowdsourcingResult.maxPrice,
            data: crowdsourcingResult
          });
        }
      } catch (error) {
        errors.push({ source: 'crowdsourcing', error: error.message });
      }
    }

    if (useMockData) {
      try {
        const mockResult = this.sources.mockData.getPrice(productName, region);
        if (mockResult) {
          results.push({
            source: 'mockData',
            price: mockResult.regionalPrice,
            confidence: 0.6, // Средняя уверенность для моковых данных
            minPrice: mockResult.regionalPrice * 0.9,
            maxPrice: mockResult.regionalPrice * 1.1,
            data: mockResult
          });
        }
      } catch (error) {
        errors.push({ source: 'mockData', error: error.message });
      }
    }

    // Если нет данных и разрешен fallback
    if (results.length === 0 && fallbackToMock) {
      try {
        const fallbackResult = this.sources.mockData.getPrice(productName, region);
        if (fallbackResult) {
          results.push({
            source: 'fallback',
            price: fallbackResult.regionalPrice,
            confidence: 0.3,
            minPrice: fallbackResult.regionalPrice * 0.8,
            maxPrice: fallbackResult.regionalPrice * 1.2,
            data: fallbackResult
          });
        }
      } catch (error) {
        errors.push({ source: 'fallback', error: error.message });
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: 'Не удалось получить данные о ценах',
        errors: errors,
        productName: productName,
        region: region
      };
    }

    // Вычисляем взвешенную среднюю цену
    const integratedPrice = this.calculateWeightedPrice(results);
    
    return {
      success: true,
      productName: productName,
      region: region,
      integratedPrice: integratedPrice.price,
      confidence: integratedPrice.confidence,
      minPrice: integratedPrice.minPrice,
      maxPrice: integratedPrice.maxPrice,
      priceRange: integratedPrice.maxPrice - integratedPrice.minPrice,
      sources: results.length,
      sourceData: results,
      errors: errors,
      lastUpdated: new Date().toISOString()
    };
  }

  // Расчет взвешенной средней цены
  calculateWeightedPrice(results) {
    let totalWeight = 0;
    let weightedSum = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalConfidence = 0;

    for (const result of results) {
      const weight = this.weights[result.source] || 0.1;
      const adjustedWeight = weight * result.confidence;
      
      totalWeight += adjustedWeight;
      weightedSum += result.price * adjustedWeight;
      totalConfidence += result.confidence;
      
      minPrice = Math.min(minPrice, result.minPrice);
      maxPrice = Math.max(maxPrice, result.maxPrice);
    }

    const averagePrice = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    const averageConfidence = results.length > 0 ? totalConfidence / results.length : 0;

    return {
      price: averagePrice,
      confidence: Math.min(0.95, averageConfidence),
      minPrice: minPrice === Infinity ? averagePrice * 0.9 : minPrice,
      maxPrice: maxPrice === -Infinity ? averagePrice * 1.1 : maxPrice
    };
  }

  // Получение цен для нескольких продуктов
  async getMultiplePrices(productNames, region = 'default', options = {}) {
    const results = [];
    
    for (const productName of productNames) {
      try {
        const price = await this.getIntegratedPrice(productName, region, options);
        results.push(price);
      } catch (error) {
        results.push({
          success: false,
          productName: productName,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Получение рекомендаций по ценообразованию
  getPricingRecommendations(productName, region = 'default') {
    const recommendations = [];
    
    // Получаем данные из всех источников
    const openData = this.sources.openData.getProductPrices(productName, region);
    const crowdsourcing = this.sources.crowdsourcing.getPrices(productName, region);
    const mockData = this.sources.mockData.getPrice(productName, region);
    
    // Анализируем разброс цен
    const prices = [];
    if (openData && !openData.fallback) prices.push(openData.averagePrice);
    if (crowdsourcing) prices.push(crowdsourcing.averagePrice);
    if (mockData) prices.push(mockData.regionalPrice);
    
    if (prices.length > 1) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      if (priceRange / averagePrice > 0.3) {
        recommendations.push({
          type: 'warning',
          message: `Большой разброс цен (${priceRange}₽). Рекомендуется дополнительная верификация.`
        });
      }
    }
    
    // Анализируем сезонность
    if (mockData) {
      const seasonal = this.sources.mockData.getSeasonalRecommendations(region);
      const productCategory = mockData.category;
      const seasonalRec = seasonal.find(s => s.category === productCategory);
      
      if (seasonalRec) {
        recommendations.push({
          type: 'info',
          message: seasonalRec.recommendation
        });
      }
    }
    
    // Анализируем региональные различия
    const regionalStats = this.sources.mockData.getRegionalStatistics(region);
    if (regionalStats.multiplier > 1.1) {
      recommendations.push({
        type: 'info',
        message: `В регионе ${region} цены выше среднего на ${Math.round((regionalStats.multiplier - 1) * 100)}%`
      });
    }
    
    return recommendations;
  }

  // Получение статистики системы
  getSystemStatistics() {
    const openDataStats = this.sources.openData.getStatistics();
    const crowdsourcingStats = this.sources.crowdsourcing.getStatistics();
    
    return {
      openData: openDataStats,
      crowdsourcing: crowdsourcingStats,
      weights: this.weights,
      lastUpdated: new Date().toISOString()
    };
  }

  // Обновление весов источников
  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  // Получение истории изменений цен
  getPriceHistory(productName, region = 'default', days = 30) {
    // Симуляция истории цен
    const history = [];
    const basePrice = this.sources.mockData.getPrice(productName, region);
    
    if (!basePrice) return [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const price = this.sources.mockData.getPrice(productName, region, date);
      if (price) {
        history.push({
          date: date.toISOString().split('T')[0],
          price: price.regionalPrice,
          seasonal: price.seasonal,
          category: price.category
        });
      }
    }
    
    return history;
  }

  // Получение прогноза цен
  getPriceForecast(productName, region = 'default', days = 7) {
    const history = this.getPriceHistory(productName, region, 30);
    if (history.length < 7) return null;
    
    // Простой линейный прогноз
    const recentPrices = history.slice(-7).map(h => h.price);
    const trend = this.calculateTrend(recentPrices);
    
    const forecast = [];
    const lastPrice = recentPrices[recentPrices.length - 1];
    
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const forecastPrice = Math.round(lastPrice + (trend * i));
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        price: forecastPrice,
        confidence: Math.max(0.3, 0.8 - (i * 0.1)) // Уверенность снижается со временем
      });
    }
    
    return forecast;
  }

  // Расчет тренда
  calculateTrend(prices) {
    if (prices.length < 2) return 0;
    
    const n = prices.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = prices.reduce((sum, price) => sum + price, 0);
    const sumXY = prices.reduce((sum, price, index) => sum + (price * index), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }
}

// Экспорт экземпляра
export const integratedPricingSystem = new IntegratedPricingSystem();
