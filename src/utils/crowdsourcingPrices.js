// Система краудсорсинга для сбора реальных цен от пользователей
// Позволяет пользователям добавлять и обновлять цены продуктов

export class CrowdsourcingPrices {
  constructor() {
    this.userPrices = new Map();
    this.verificationThreshold = 3; // Минимум 3 подтверждения для достоверности
    this.loadFromStorage();
  }

  // Загрузка данных из localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('crowdsourced_prices');
      if (stored) {
        const data = JSON.parse(stored);
        this.userPrices = new Map(data);
      }
    } catch (error) {
      console.warn('Ошибка загрузки данных краудсорсинга:', error);
    }
  }

  // Сохранение данных в localStorage
  saveToStorage() {
    try {
      const data = Array.from(this.userPrices.entries());
      localStorage.setItem('crowdsourced_prices', JSON.stringify(data));
    } catch (error) {
      console.warn('Ошибка сохранения данных краудсорсинга:', error);
    }
  }

  // Добавление цены от пользователя
  addUserPrice(productName, price, location, userInfo = {}) {
    const priceData = {
      productName: productName.toLowerCase().trim(),
      price: parseFloat(price),
      location: location,
      userInfo: {
        userId: userInfo.userId || 'anonymous',
        timestamp: new Date().toISOString(),
        source: userInfo.source || 'manual', // manual, photo, receipt
        confidence: userInfo.confidence || 0.5
      },
      verified: false,
      verificationCount: 1
    };

    const key = `${productName}_${location}`;
    
    if (this.userPrices.has(key)) {
      // Обновляем существующую запись
      const existing = this.userPrices.get(key);
      existing.prices.push(priceData);
      existing.verificationCount += 1;
      
      // Пересчитываем среднюю цену
      existing.averagePrice = this.calculateAveragePrice(existing.prices);
      existing.lastUpdated = new Date().toISOString();
      
      // Проверяем достоверность
      if (existing.verificationCount >= this.verificationThreshold) {
        existing.verified = true;
      }
    } else {
      // Создаем новую запись
      this.userPrices.set(key, {
        productName: priceData.productName,
        location: location,
        prices: [priceData],
        averagePrice: priceData.price,
        verificationCount: 1,
        verified: false,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }

    this.saveToStorage();
    return priceData;
  }

  // Получение цен по продукту и локации
  getPrices(productName, location) {
    const key = `${productName}_${location}`;
    const data = this.userPrices.get(key);
    
    if (!data) return null;

    return {
      productName: data.productName,
      location: data.location,
      averagePrice: data.averagePrice,
      minPrice: Math.min(...data.prices.map(p => p.price)),
      maxPrice: Math.max(...data.prices.map(p => p.price)),
      verificationCount: data.verificationCount,
      verified: data.verified,
      confidence: this.calculateConfidence(data),
      lastUpdated: data.lastUpdated,
      sources: data.prices.length
    };
  }

  // Получение всех цен по продукту
  getAllPricesForProduct(productName) {
    const results = [];
    const searchName = productName.toLowerCase().trim();
    
    for (const [key, data] of this.userPrices.entries()) {
      if (data.productName.includes(searchName) || searchName.includes(data.productName)) {
        results.push({
          location: data.location,
          averagePrice: data.averagePrice,
          verificationCount: data.verificationCount,
          verified: data.verified,
          confidence: this.calculateConfidence(data)
        });
      }
    }
    
    return results;
  }

  // Расчет средней цены
  calculateAveragePrice(prices) {
    if (prices.length === 0) return 0;
    
    const total = prices.reduce((sum, price) => sum + price.price, 0);
    return Math.round(total / prices.length);
  }

  // Расчет уверенности в данных
  calculateConfidence(data) {
    let confidence = 0.3; // Базовая уверенность
    
    // Увеличиваем уверенность с количеством подтверждений
    confidence += Math.min(0.4, data.verificationCount * 0.1);
    
    // Увеличиваем уверенность если данные верифицированы
    if (data.verified) {
      confidence += 0.2;
    }
    
    // Учитываем разброс цен
    const prices = data.prices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const averagePrice = data.averagePrice;
    
    // Если разброс цен небольшой, увеличиваем уверенность
    if (priceRange / averagePrice < 0.3) {
      confidence += 0.1;
    }
    
    return Math.min(0.95, confidence);
  }

  // Верификация цены (подтверждение от другого пользователя)
  verifyPrice(productName, location, userId) {
    const key = `${productName}_${location}`;
    const data = this.userPrices.get(key);
    
    if (!data) return false;
    
    // Проверяем, что пользователь еще не подтверждал эту цену
    const hasUserVerified = data.prices.some(p => p.userInfo.userId === userId);
    if (hasUserVerified) return false;
    
    // Добавляем подтверждение
    data.verificationCount += 1;
    data.lastUpdated = new Date().toISOString();
    
    if (data.verificationCount >= this.verificationThreshold) {
      data.verified = true;
    }
    
    this.saveToStorage();
    return true;
  }

  // Получение статистики краудсорсинга
  getStatistics() {
    const totalProducts = this.userPrices.size;
    const verifiedProducts = Array.from(this.userPrices.values()).filter(d => d.verified).length;
    const totalPrices = Array.from(this.userPrices.values()).reduce((sum, d) => sum + d.prices.length, 0);
    
    return {
      totalProducts: totalProducts,
      verifiedProducts: verifiedProducts,
      totalPrices: totalPrices,
      verificationRate: totalProducts > 0 ? (verifiedProducts / totalProducts) : 0,
      averageConfidence: this.calculateAverageConfidence(),
      lastUpdated: new Date().toISOString()
    };
  }

  // Расчет средней уверенности
  calculateAverageConfidence() {
    if (this.userPrices.size === 0) return 0;
    
    const confidences = Array.from(this.userPrices.values()).map(d => this.calculateConfidence(d));
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  // Получение топ продуктов по количеству подтверждений
  getTopProducts(limit = 10) {
    const products = Array.from(this.userPrices.values())
      .sort((a, b) => b.verificationCount - a.verificationCount)
      .slice(0, limit);
    
    return products.map(p => ({
      productName: p.productName,
      location: p.location,
      averagePrice: p.averagePrice,
      verificationCount: p.verificationCount,
      verified: p.verified,
      confidence: this.calculateConfidence(p)
    }));
  }

  // Поиск продуктов по названию
  searchProducts(query) {
    const results = [];
    const searchQuery = query.toLowerCase().trim();
    
    for (const [key, data] of this.userPrices.entries()) {
      if (data.productName.includes(searchQuery)) {
        results.push({
          productName: data.productName,
          location: data.location,
          averagePrice: data.averagePrice,
          verificationCount: data.verificationCount,
          verified: data.verified,
          confidence: this.calculateConfidence(data)
        });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // Экспорт данных для анализа
  exportData() {
    return {
      products: Array.from(this.userPrices.entries()),
      statistics: this.getStatistics(),
      exportDate: new Date().toISOString()
    };
  }

  // Импорт данных
  importData(data) {
    try {
      if (data.products) {
        this.userPrices = new Map(data.products);
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      return false;
    }
  }

  // Очистка старых данных (старше 30 дней)
  cleanOldData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let cleaned = 0;
    for (const [key, data] of this.userPrices.entries()) {
      const lastUpdated = new Date(data.lastUpdated);
      if (lastUpdated < thirtyDaysAgo) {
        this.userPrices.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.saveToStorage();
    }
    
    return cleaned;
  }
}

// Экспорт экземпляра
export const crowdsourcingPrices = new CrowdsourcingPrices();
