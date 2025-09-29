// Интеграция с внешними API питания для повышения точности
// USDA FoodData Central, Edamam Nutrition API, Spoonacular API

export class ExternalNutritionAPI {
  constructor() {
    this.apis = {
      usda: {
        baseUrl: 'https://api.nal.usda.gov/fdc/v1',
        apiKey: process.env.REACT_APP_USDA_API_KEY || 'demo_key',
        enabled: true
      },
      edamam: {
        baseUrl: 'https://api.edamam.com/api/nutrition-data',
        appId: process.env.REACT_APP_EDAMAM_APP_ID || 'demo_id',
        appKey: process.env.REACT_APP_EDAMAM_APP_KEY || 'demo_key',
        enabled: true
      },
      spoonacular: {
        baseUrl: 'https://api.spoonacular.com/food/ingredients',
        apiKey: process.env.REACT_APP_SPOONACULAR_API_KEY || 'demo_key',
        enabled: true
      }
    };
    
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 часа
    this.fallbackData = this.loadFallbackData();
  }

  // Загрузка резервных данных
  loadFallbackData() {
    const saved = localStorage.getItem('externalNutritionFallback');
    return saved ? JSON.parse(saved) : {};
  }

  // Сохранение резервных данных
  saveFallbackData() {
    localStorage.setItem('externalNutritionFallback', JSON.stringify(this.fallbackData));
  }

  // Основная функция поиска питательной ценности
  async findNutritionData(ingredient, quantity = 100) {
    const cacheKey = `${ingredient}_${quantity}`;
    
    // Проверяем кеш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Пробуем разные API по приоритету
    const results = await Promise.allSettled([
      this.searchUSDA(ingredient, quantity),
      this.searchEdamam(ingredient, quantity),
      this.searchSpoonacular(ingredient, quantity)
    ]);

    // Выбираем лучший результат
    const bestResult = this.selectBestResult(results, ingredient);
    
    // Кешируем результат
    this.cache.set(cacheKey, {
      data: bestResult,
      timestamp: Date.now()
    });

    return bestResult;
  }

  // Поиск в USDA FoodData Central
  async searchUSDA(ingredient, quantity) {
    if (!this.apis.usda.enabled) return null;

    try {
      const response = await fetch(
        `${this.apis.usda.baseUrl}/foods/search?query=${encodeURIComponent(ingredient)}&api_key=${this.apis.usda.apiKey}&pageSize=5`
      );
      
      if (!response.ok) throw new Error('USDA API error');
      
      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        const nutrients = this.extractUSDANutrients(food.foodNutrients);
        
        return {
          source: 'USDA',
          confidence: 0.95,
          nutrition: this.calculateNutritionForQuantity(nutrients, quantity),
          metadata: {
            description: food.description,
            brandOwner: food.brandOwner,
            dataType: food.dataType
          }
        };
      }
    } catch (error) {
      console.warn('USDA API error:', error);
    }
    
    return null;
  }

  // Поиск в Edamam Nutrition API
  async searchEdamam(ingredient, quantity) {
    if (!this.apis.edamam.enabled) return null;

    try {
      const response = await fetch(
        `${this.apis.edamam.baseUrl}?app_id=${this.apis.edamam.appId}&app_key=${this.apis.edamam.appKey}&ingr=${encodeURIComponent(quantity + 'g ' + ingredient)}`
      );
      
      if (!response.ok) throw new Error('Edamam API error');
      
      const data = await response.json();
      
      if (data.totalNutrients) {
        return {
          source: 'Edamam',
          confidence: 0.90,
          nutrition: this.extractEdamamNutrients(data.totalNutrients),
          metadata: {
            calories: data.calories,
            totalWeight: data.totalWeight,
            healthLabels: data.healthLabels
          }
        };
      }
    } catch (error) {
      console.warn('Edamam API error:', error);
    }
    
    return null;
  }

  // Поиск в Spoonacular API
  async searchSpoonacular(ingredient, quantity) {
    if (!this.apis.spoonacular.enabled) return null;

    try {
      const response = await fetch(
        `${this.apis.spoonacular.baseUrl}/search?query=${encodeURIComponent(ingredient)}&apiKey=${this.apis.spoonacular.apiKey}&number=1`
      );
      
      if (!response.ok) throw new Error('Spoonacular API error');
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        
        // Получаем детальную информацию
        const detailResponse = await fetch(
          `${this.apis.spoonacular.baseUrl}/${result.id}/information?apiKey=${this.apis.spoonacular.apiKey}&amount=${quantity}&unit=grams`
        );
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          
          return {
            source: 'Spoonacular',
            confidence: 0.85,
            nutrition: this.extractSpoonacularNutrients(detailData.nutrition),
            metadata: {
              name: detailData.name,
              image: detailData.image,
              category: detailData.category
            }
          };
        }
      }
    } catch (error) {
      console.warn('Spoonacular API error:', error);
    }
    
    return null;
  }

  // Извлечение питательных веществ из USDA
  extractUSDANutrients(nutrients) {
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    nutrients.forEach(nutrient => {
      const nutrientId = nutrient.nutrient?.id;
      const value = nutrient.amount || 0;

      switch (nutrientId) {
        case 1008: // Energy (kcal)
          nutrition.calories = value;
          break;
        case 1003: // Protein
          nutrition.protein = value;
          break;
        case 1005: // Carbohydrate, by difference
          nutrition.carbs = value;
          break;
        case 1004: // Total lipid (fat)
          nutrition.fat = value;
          break;
      }
    });

    return nutrition;
  }

  // Извлечение питательных веществ из Edamam
  extractEdamamNutrients(totalNutrients) {
    return {
      calories: totalNutrients.ENERC_KCAL?.quantity || 0,
      protein: totalNutrients.PROCNT?.quantity || 0,
      carbs: totalNutrients.CHOCDF?.quantity || 0,
      fat: totalNutrients.FAT?.quantity || 0
    };
  }

  // Извлечение питательных веществ из Spoonacular
  extractSpoonacularNutrients(nutrition) {
    const nutrients = nutrition.nutrients;
    
    return {
      calories: this.findNutrientValue(nutrients, 'Calories') || 0,
      protein: this.findNutrientValue(nutrients, 'Protein') || 0,
      carbs: this.findNutrientValue(nutrients, 'Carbohydrates') || 0,
      fat: this.findNutrientValue(nutrients, 'Fat') || 0
    };
  }

  // Поиск значения питательного вещества
  findNutrientValue(nutrients, name) {
    const nutrient = nutrients.find(n => n.name === name);
    return nutrient ? nutrient.amount : 0;
  }

  // Расчет питательной ценности для заданного количества
  calculateNutritionForQuantity(nutrition, quantity) {
    const factor = quantity / 100;
    
    return {
      calories: Math.round(nutrition.calories * factor),
      protein: Math.round(nutrition.protein * factor * 10) / 10,
      carbs: Math.round(nutrition.carbs * factor * 10) / 10,
      fat: Math.round(nutrition.fat * factor * 10) / 10
    };
  }

  // Выбор лучшего результата
  selectBestResult(results, ingredient) {
    const successful = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    if (successful.length === 0) {
      return this.getFallbackData(ingredient);
    }

    // Сортируем по уверенности
    successful.sort((a, b) => b.confidence - a.confidence);
    
    const best = successful[0];
    
    // Сохраняем в резервные данные
    this.fallbackData[ingredient.toLowerCase()] = best;
    this.saveFallbackData();
    
    return best;
  }

  // Получение резервных данных
  getFallbackData(ingredient) {
    const fallback = this.fallbackData[ingredient.toLowerCase()];
    
    if (fallback) {
      return {
        ...fallback,
        source: 'Fallback',
        confidence: 0.6
      };
    }
    
    return {
      source: 'Unknown',
      confidence: 0.3,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      metadata: { error: 'No data found' }
    };
  }

  // Включение/отключение API
  toggleAPI(apiName, enabled) {
    if (this.apis[apiName]) {
      this.apis[apiName].enabled = enabled;
    }
  }

  // Получение статистики использования
  getUsageStatistics() {
    return {
      cacheSize: this.cache.size,
      fallbackDataSize: Object.keys(this.fallbackData).length,
      apisEnabled: Object.values(this.apis).filter(api => api.enabled).length,
      lastUpdate: new Date().toISOString()
    };
  }

  // Очистка кеша
  clearCache() {
    this.cache.clear();
  }

  // Сброс всех данных
  reset() {
    this.cache.clear();
    this.fallbackData = {};
    this.saveFallbackData();
  }
}

// Экспорт экземпляра
export const externalNutritionAPI = new ExternalNutritionAPI();
