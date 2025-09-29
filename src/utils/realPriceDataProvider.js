// Система получения реальных цен на продукты из открытых источников
// Интеграция с API магазинов, статистики и агрегаторов

export class RealPriceDataProvider {
  constructor() {
    this.apiEndpoints = this.initializeAPIEndpoints();
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 минут
  }

  // Инициализация API эндпоинтов
  initializeAPIEndpoints() {
    return {
      // Федеральная служба статистики
      rosstat: {
        baseUrl: 'https://rosstat.gov.ru/api',
        endpoints: {
          foodPrices: '/food-prices',
          inflation: '/inflation'
        }
      },
      
      // API магазинов (симуляция реальных API)
      stores: {
        magnit: {
          baseUrl: 'https://api.magnit.ru/v1',
          endpoints: {
            products: '/products',
            prices: '/prices'
          },
          headers: {
            'Authorization': 'Bearer YOUR_MAGNIT_API_KEY'
          }
        },
        ashan: {
          baseUrl: 'https://api.ashan.ru/v1',
          endpoints: {
            products: '/products',
            prices: '/prices'
          },
          headers: {
            'Authorization': 'Bearer YOUR_ASHAN_API_KEY'
          }
        },
        korzinka: {
          baseUrl: 'https://api.korzinka.ru/v1',
          endpoints: {
            products: '/products',
            prices: '/prices'
          },
          headers: {
            'Authorization': 'Bearer YOUR_KORZINKA_API_KEY'
          }
        },
        metro: {
          baseUrl: 'https://api.metro.ru/v1',
          endpoints: {
            products: '/products',
            prices: '/prices'
          },
          headers: {
            'Authorization': 'Bearer YOUR_METRO_API_KEY'
          }
        }
      },
      
      // API агрегаторов доставки
      delivery: {
        yandexEda: {
          baseUrl: 'https://eda.yandex.ru/api/v2',
          endpoints: {
            restaurants: '/restaurants',
            menu: '/menu',
            prices: '/prices'
          }
        },
        deliveryClub: {
          baseUrl: 'https://api.delivery-club.ru/v1',
          endpoints: {
            restaurants: '/restaurants',
            menu: '/menu',
            prices: '/prices'
          }
        },
        uberEats: {
          baseUrl: 'https://api.ubereats.com/v1',
          endpoints: {
            restaurants: '/restaurants',
            menu: '/menu',
            prices: '/prices'
          }
        }
      }
    };
  }

  // Получение цен на продукты из всех источников
  async getProductPrices(productName, region = 'moscow') {
    const cacheKey = `${productName}_${region}`;
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      console.log(`🔍 Поиск цен для: "${productName}"`);
      
      const prices = await Promise.allSettled([
        this.getStorePrices(productName, region),
        this.getRestaurantPrices(productName, region),
        this.getStatisticalPrices(productName, region)
      ]);

      console.log('📊 Результаты поиска цен:', prices);

      const result = this.aggregatePrices(prices, productName);
      
      console.log('✅ Итоговый результат:', result);
      
      // Сохраняем в кэш
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Ошибка получения цен:', error);
      return this.getFallbackPrices(productName);
    }
  }

  // Получение цен из магазинов
  async getStorePrices(productName, region) {
    const storePrices = [];
    
    for (const [storeName, storeConfig] of Object.entries(this.apiEndpoints.stores)) {
      try {
        const price = await this.fetchStorePrice(storeName, productName, region, storeConfig);
        if (price) {
          storePrices.push({
            store: storeName,
            price: price.price,
            unit: price.unit,
            availability: price.availability,
            lastUpdated: price.lastUpdated
          });
        }
      } catch (error) {
        console.warn(`Ошибка получения цены из ${storeName}:`, error);
      }
    }

    return storePrices;
  }

  // Получение цены из конкретного магазина
  async fetchStorePrice(storeName, productName, region, config) {
    // Симуляция API запроса (в реальности здесь будет fetch)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Моковые данные на основе реальных цен
    const mockPrices = this.getMockStorePrices(storeName, productName);
    return mockPrices;
  }

  // Моковые данные цен магазинов (на основе реальных цен)
  getMockStorePrices(storeName, productName) {
    const basePrices = {
      // Мясо и птица
      'говядина': { magnit: 180, ashan: 200, korzinka: 190, metro: 170 },
      'курица': { magnit: 120, ashan: 140, korzinka: 130, metro: 110 },
      'свинина': { magnit: 150, ashan: 170, korzinka: 160, metro: 140 },
      'баранина': { magnit: 200, ashan: 220, korzinka: 210, metro: 190 },
      'индейка': { magnit: 140, ashan: 160, korzinka: 150, metro: 130 },
      'утка': { magnit: 200, ashan: 220, korzinka: 210, metro: 190 },
      
      // Рыба и морепродукты
      'лосось': { magnit: 250, ashan: 280, korzinka: 270, metro: 240 },
      'треска': { magnit: 150, ashan: 170, korzinka: 160, metro: 140 },
      'горбуша': { magnit: 120, ashan: 140, korzinka: 130, metro: 110 },
      'креветки': { magnit: 300, ashan: 350, korzinka: 320, metro: 280 },
      
      // Овощи
      'помидоры': { magnit: 60, ashan: 70, korzinka: 65, metro: 55 },
      'огурцы': { magnit: 50, ashan: 60, korzinka: 55, metro: 45 },
      'картофель': { magnit: 25, ashan: 30, korzinka: 28, metro: 22 },
      'лук': { magnit: 15, ashan: 18, korzinka: 16, metro: 12 },
      'морковь': { magnit: 20, ashan: 25, korzinka: 22, metro: 18 },
      'капуста': { magnit: 18, ashan: 22, korzinka: 20, metro: 16 },
      'свекла': { magnit: 22, ashan: 28, korzinka: 25, metro: 20 },
      'чеснок': { magnit: 40, ashan: 50, korzinka: 45, metro: 35 },
      
      // Молочные продукты
      'молоко': { magnit: 40, ashan: 45, korzinka: 42, metro: 38 },
      'сыр': { magnit: 200, ashan: 250, korzinka: 220, metro: 180 },
      'творог': { magnit: 80, ashan: 100, korzinka: 90, metro: 75 },
      'сметана': { magnit: 60, ashan: 75, korzinka: 68, metro: 55 },
      'масло': { magnit: 120, ashan: 150, korzinka: 135, metro: 110 },
      
      // Крупы и макароны
      'рис': { magnit: 30, ashan: 35, korzinka: 32, metro: 28 },
      'макароны': { magnit: 25, ashan: 30, korzinka: 27, metro: 22 },
      'гречка': { magnit: 35, ashan: 40, korzinka: 37, metro: 32 },
      'овсянка': { magnit: 28, ashan: 35, korzinka: 32, metro: 25 },
      
      // Хлеб и выпечка
      'хлеб': { magnit: 20, ashan: 25, korzinka: 22, metro: 18 },
      'мука': { magnit: 35, ashan: 40, korzinka: 37, metro: 32 },
      
      // Специи и приправы
      'соль': { magnit: 8, ashan: 10, korzinka: 9, metro: 7 },
      'перец': { magnit: 15, ashan: 20, korzinka: 18, metro: 12 },
      'лавровый лист': { magnit: 12, ashan: 15, korzinka: 13, metro: 10 },
      'томатная паста': { magnit: 40, ashan: 50, korzinka: 45, metro: 35 },
      'майонез': { magnit: 60, ashan: 75, korzinka: 68, metro: 55 }
    };

    const productKey = this.findProductKey(productName, basePrices);
    if (!productKey) return null;

    const price = basePrices[productKey][storeName];
    if (!price) return null;

    return {
      price: price,
      unit: '100г',
      availability: Math.random() > 0.1, // 90% вероятность наличия
      lastUpdated: new Date().toISOString()
    };
  }

  // Поиск ключа продукта в базе
  findProductKey(productName, basePrices) {
    const name = productName.toLowerCase().trim();
    console.log(`🔍 Поиск ключа для: "${name}"`);
    
    // Сначала ищем точное совпадение
    if (basePrices[name]) {
      console.log(`✅ Точное совпадение: "${name}"`);
      return name;
    }
    
    // Затем ищем частичное совпадение
    for (const key of Object.keys(basePrices)) {
      if (name.includes(key) || key.includes(name)) {
        console.log(`✅ Частичное совпадение: "${key}" для "${name}"`);
        return key;
      }
    }
    
    // Поиск по словам
    const words = name.split(/[\s,;]+/);
    console.log(`🔍 Слова для поиска:`, words);
    for (const word of words) {
      if (word.length > 2 && basePrices[word]) {
        console.log(`✅ Совпадение по слову: "${word}" для "${name}"`);
        return word;
      }
    }
    
    console.log(`❌ Ключ не найден для: "${name}"`);
    return null;
  }

  // Получение цен из ресторанов
  async getRestaurantPrices(dishName, region) {
    const restaurantPrices = [];
    
    for (const [serviceName, serviceConfig] of Object.entries(this.apiEndpoints.delivery)) {
      try {
        const prices = await this.fetchRestaurantPrices(serviceName, dishName, region, serviceConfig);
        restaurantPrices.push(...prices);
      } catch (error) {
        console.warn(`Ошибка получения цен из ${serviceName}:`, error);
      }
    }

    return restaurantPrices;
  }

  // Получение цен из конкретного сервиса доставки
  async fetchRestaurantPrices(serviceName, dishName, region, config) {
    // Симуляция API запроса
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Моковые данные на основе реальных цен ресторанов
    const mockRestaurantPrices = this.getMockRestaurantPrices(serviceName, dishName);
    return mockRestaurantPrices;
  }

  // Моковые данные цен ресторанов
  getMockRestaurantPrices(serviceName, dishName) {
    const dishPrices = {
      'борщ': { min: 120, avg: 180, max: 250 },
      'солянка': { min: 140, avg: 200, max: 280 },
      'солянка мясная': { min: 150, avg: 220, max: 300 },
      'цезарь': { min: 150, avg: 220, max: 300 },
      'плов': { min: 200, avg: 280, max: 350 },
      'паста': { min: 180, avg: 250, max: 320 },
      'паста карбонара': { min: 220, avg: 300, max: 380 },
      'стейк': { min: 400, avg: 600, max: 800 },
      'салат': { min: 100, avg: 150, max: 200 },
      'суп': { min: 100, avg: 150, max: 200 },
      'пицца': { min: 300, avg: 450, max: 600 },
      'роллы': { min: 200, avg: 300, max: 400 },
      'шашлык': { min: 250, avg: 350, max: 450 },
      'окрошка': { min: 120, avg: 180, max: 250 },
      'щи': { min: 100, avg: 150, max: 200 },
      'рагу': { min: 180, avg: 250, max: 320 },
      'жаркое': { min: 200, avg: 280, max: 350 }
    };

    const dishKey = this.findDishKey(dishName, dishPrices);
    if (!dishKey) return [];

    const priceRange = dishPrices[dishKey];
    const restaurants = [
      { name: 'Ресторан "Премиум"', price: priceRange.max, rating: 4.8 },
      { name: 'Кафе "Средний класс"', price: priceRange.avg, rating: 4.2 },
      { name: 'Столовая "Бюджет"', price: priceRange.min, rating: 3.8 },
      { name: 'Домашняя кухня', price: Math.round(priceRange.avg * 0.7), rating: 4.5 }
    ];

    return restaurants.map(restaurant => ({
      service: serviceName,
      restaurant: restaurant.name,
      dish: dishName,
      price: restaurant.price,
      rating: restaurant.rating,
      lastUpdated: new Date().toISOString()
    }));
  }

  // Поиск ключа блюда
  findDishKey(dishName, dishPrices) {
    const name = dishName.toLowerCase().trim();
    console.log(`🍽️ Поиск блюда для: "${name}"`);
    
    // Сначала ищем точное совпадение
    if (dishPrices[name]) {
      console.log(`✅ Точное совпадение блюда: "${name}"`);
      return name;
    }
    
    // Затем ищем частичное совпадение
    for (const key of Object.keys(dishPrices)) {
      if (name.includes(key) || key.includes(name)) {
        console.log(`✅ Частичное совпадение блюда: "${key}" для "${name}"`);
        return key;
      }
    }
    
    // Поиск по словам
    const words = name.split(/[\s,;]+/);
    console.log(`🔍 Слова блюда для поиска:`, words);
    for (const word of words) {
      if (word.length > 3 && dishPrices[word]) {
        console.log(`✅ Совпадение по слову блюда: "${word}" для "${name}"`);
        return word;
      }
    }
    
    console.log(`❌ Блюдо не найдено для: "${name}"`);
    return null;
  }

  // Получение статистических цен
  async getStatisticalPrices(productName, region) {
    try {
      // Симуляция запроса к Росстату
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return {
        source: 'rosstat',
        product: productName,
        region: region,
        averagePrice: this.getStatisticalAveragePrice(productName),
        inflation: 5.2, // Процент инфляции
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Ошибка получения статистических данных:', error);
      return null;
    }
  }

  // Статистические средние цены
  getStatisticalAveragePrice(productName) {
    const statisticalPrices = {
      'говядина': 190,
      'курица': 130,
      'свинина': 160,
      'лосось': 260,
      'треска': 160,
      'помидоры': 65,
      'огурцы': 55,
      'картофель': 28,
      'лук': 16,
      'морковь': 22,
      'молоко': 42,
      'сыр': 220,
      'хлеб': 22,
      'рис': 32,
      'макароны': 27
    };

    const productKey = this.findProductKey(productName, statisticalPrices);
    return statisticalPrices[productKey] || 100;
  }

  // Агрегация цен из всех источников
  aggregatePrices(prices, productName) {
    const storePrices = prices[0].status === 'fulfilled' ? prices[0].value : [];
    const restaurantPrices = prices[1].status === 'fulfilled' ? prices[1].value : [];
    const statisticalData = prices[2].status === 'fulfilled' ? prices[2].value : null;

    // Расчет средних цен
    const storeAverage = this.calculateAverage(storePrices.map(p => p.price));
    const restaurantAverage = this.calculateAverage(restaurantPrices.map(p => p.price));
    const statisticalAverage = statisticalData ? statisticalData.averagePrice : null;

    return {
      product: productName,
      storePrices: {
        data: storePrices,
        average: storeAverage,
        min: Math.min(...storePrices.map(p => p.price)),
        max: Math.max(...storePrices.map(p => p.price))
      },
      restaurantPrices: {
        data: restaurantPrices,
        average: restaurantAverage,
        min: Math.min(...restaurantPrices.map(p => p.price)),
        max: Math.max(...restaurantPrices.map(p => p.price))
      },
      statistical: statisticalData,
      recommendations: this.generatePriceRecommendations(storeAverage, restaurantAverage, statisticalAverage),
      lastUpdated: new Date().toISOString()
    };
  }

  // Расчет среднего значения
  calculateAverage(prices) {
    if (prices.length === 0) return 0;
    return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  }

  // Генерация рекомендаций по ценообразованию
  generatePriceRecommendations(storeAverage, restaurantAverage, statisticalAverage) {
    const recommendations = [];

    if (storeAverage && restaurantAverage) {
      // Рекомендация на основе сравнения с ресторанами
      const homeKitchenPrice = Math.round(restaurantAverage * 0.6); // 40% дешевле ресторанов
      recommendations.push({
        type: 'competitive',
        message: `В ресторанах ${restaurantAverage}₽, у вас можно продавать за ${homeKitchenPrice}₽ и всё равно быть выгоднее`,
        suggestedPrice: homeKitchenPrice,
        savings: restaurantAverage - homeKitchenPrice
      });
    }

    if (statisticalAverage) {
      // Рекомендация на основе статистики
      const statisticalPrice = Math.round(statisticalAverage * 1.5); // 50% наценка
      recommendations.push({
        type: 'statistical',
        message: `По статистике средняя цена ${statisticalAverage}₽, рекомендуемая цена ${statisticalPrice}₽`,
        suggestedPrice: statisticalPrice,
        markup: 50
      });
    }

    return recommendations;
  }

  // Резервные цены при ошибке API
  getFallbackPrices(productName) {
    return {
      product: productName,
      storePrices: { data: [], average: 0, min: 0, max: 0 },
      restaurantPrices: { data: [], average: 0, min: 0, max: 0 },
      statistical: null,
      recommendations: [{
        type: 'fallback',
        message: 'Используются базовые цены из-за недоступности API',
        suggestedPrice: 100
      }],
      lastUpdated: new Date().toISOString()
    };
  }

  // Очистка кэша
  clearCache() {
    this.cache.clear();
  }

  // Получение статистики по ценам
  getPriceStatistics() {
    const stats = {
      totalProducts: this.cache.size,
      averageStorePrice: 0,
      averageRestaurantPrice: 0,
      priceRange: { min: Infinity, max: 0 },
      lastUpdate: new Date().toISOString()
    };

    // Расчет статистики из кэша
    const allPrices = Array.from(this.cache.values()).map(item => item.data);
    
    if (allPrices.length > 0) {
      const storePrices = allPrices.flatMap(item => item.storePrices.data.map(p => p.price));
      const restaurantPrices = allPrices.flatMap(item => item.restaurantPrices.data.map(p => p.price));
      
      stats.averageStorePrice = this.calculateAverage(storePrices);
      stats.averageRestaurantPrice = this.calculateAverage(restaurantPrices);
      
      const allPricesFlat = [...storePrices, ...restaurantPrices];
      if (allPricesFlat.length > 0) {
        stats.priceRange.min = Math.min(...allPricesFlat);
        stats.priceRange.max = Math.max(...allPricesFlat);
      }
    }

    return stats;
  }
}

// Экспорт экземпляра
export const realPriceProvider = new RealPriceDataProvider();
