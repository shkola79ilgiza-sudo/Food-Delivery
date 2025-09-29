// Система компьютерного зрения для определения веса и порций
// Использует камеру для анализа ингредиентов и их количества

export class ComputerVisionNutrition {
  constructor() {
    this.isSupported = this.checkSupport();
    this.camera = null;
    this.stream = null;
    this.referenceObjects = this.loadReferenceObjects();
    this.volumeEstimator = new VolumeEstimator();
    this.weightEstimator = new WeightEstimator();
  }

  // Проверка поддержки камеры
  checkSupport() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Загрузка эталонных объектов
  loadReferenceObjects() {
    const saved = localStorage.getItem('referenceObjects');
    return saved ? JSON.parse(saved) : {
      // Стандартные эталоны для сравнения
      coins: { diameter: 21, weight: 5.7 }, // 5 рублей
      cards: { width: 85.6, height: 53.98 }, // Банковская карта
      phones: { width: 70, height: 140 }, // Средний смартфон
      hands: { palmWidth: 80, fingerLength: 70 }, // Средняя рука
      plates: { diameter: 200 }, // Стандартная тарелка
      cups: { height: 100, diameter: 80 } // Стандартная чашка
    };
  }

  // Инициализация камеры
  async initializeCamera() {
    if (!this.isSupported) {
      throw new Error('Камера не поддерживается');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Задняя камера
        }
      });

      return this.stream;
    } catch (error) {
      console.error('Ошибка инициализации камеры:', error);
      throw error;
    }
  }

  // Анализ ингредиента по фото
  async analyzeIngredient(imageData) {
    try {
      // 1. Определение типа ингредиента
      const ingredientType = await this.identifyIngredientType(imageData);
      
      // 2. Оценка объема/веса
      const volumeEstimate = await this.estimateVolume(imageData);
      const weightEstimate = await this.estimateWeight(imageData, ingredientType);
      
      // 3. Расчет питательной ценности
      const nutrition = this.calculateNutritionFromVisual(ingredientType, weightEstimate);
      
      return {
        ingredientType,
        estimatedWeight: weightEstimate,
        estimatedVolume: volumeEstimate,
        nutrition,
        confidence: this.calculateConfidence(ingredientType, weightEstimate),
        method: 'computer_vision'
      };
    } catch (error) {
      console.error('Ошибка анализа:', error);
      return null;
    }
  }

  // Определение типа ингредиента по изображению
  async identifyIngredientType(imageData) {
    // Простой анализ цветов и форм
    const colorAnalysis = this.analyzeColors(imageData);
    const shapeAnalysis = this.analyzeShapes(imageData);
    const textureAnalysis = this.analyzeTexture(imageData);
    
    // Комбинированный анализ
    const features = {
      ...colorAnalysis,
      ...shapeAnalysis,
      ...textureAnalysis
    };
    
    return this.classifyIngredient(features);
  }

  // Анализ цветов
  analyzeColors(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    const imageDataArray = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let r = 0, g = 0, b = 0;
    const pixelCount = imageDataArray.length / 4;
    
    for (let i = 0; i < imageDataArray.length; i += 4) {
      r += imageDataArray[i];
      g += imageDataArray[i + 1];
      b += imageDataArray[i + 2];
    }
    
    const avgR = r / pixelCount;
    const avgG = g / pixelCount;
    const avgB = b / pixelCount;
    
    return {
      dominantColor: { r: avgR, g: avgG, b: avgB },
      brightness: (avgR + avgG + avgB) / 3,
      saturation: this.calculateSaturation(avgR, avgG, avgB)
    };
  }

  // Анализ форм
  analyzeShapes(imageData) {
    // Простой анализ контуров
    const edges = this.detectEdges(imageData);
    const shapes = this.identifyShapes(edges);
    
    return {
      shapeCount: shapes.length,
      dominantShape: shapes[0]?.type || 'unknown',
      complexity: this.calculateComplexity(edges)
    };
  }

  // Анализ текстуры
  analyzeTexture(imageData) {
    // Анализ изменений яркости
    const texture = this.calculateTexture(imageData);
    
    return {
      roughness: texture.roughness,
      smoothness: texture.smoothness,
      pattern: texture.pattern
    };
  }

  // Классификация ингредиента
  classifyIngredient(features) {
    // Простая классификация на основе правил
    const rules = [
      {
        condition: (f) => f.dominantColor.r > 200 && f.dominantColor.g > 150 && f.dominantColor.b < 100,
        ingredient: 'морковь',
        confidence: 0.8
      },
      {
        condition: (f) => f.dominantColor.r > 200 && f.dominantColor.g < 100 && f.dominantColor.b < 100,
        ingredient: 'помидор',
        confidence: 0.8
      },
      {
        condition: (f) => f.dominantColor.r < 100 && f.dominantColor.g > 150 && f.dominantColor.b < 100,
        ingredient: 'огурец',
        confidence: 0.8
      },
      {
        condition: (f) => f.dominantColor.r > 150 && f.dominantColor.g > 150 && f.dominantColor.b < 100,
        ingredient: 'картофель',
        confidence: 0.7
      },
      {
        condition: (f) => f.brightness > 200 && f.smoothness > 0.8,
        ingredient: 'сыр',
        confidence: 0.7
      },
      {
        condition: (f) => f.dominantColor.r > 180 && f.dominantColor.g > 120 && f.dominantColor.b < 80,
        ingredient: 'мясо',
        confidence: 0.6
      }
    ];
    
    for (const rule of rules) {
      if (rule.condition(features)) {
        return {
          name: rule.ingredient,
          confidence: rule.confidence
        };
      }
    }
    
    return {
      name: 'неизвестный',
      confidence: 0.3
    };
  }

  // Оценка объема
  async estimateVolume(imageData) {
    return this.volumeEstimator.estimate(imageData);
  }

  // Оценка веса
  async estimateWeight(imageData, ingredientType) {
    return this.weightEstimator.estimate(imageData, ingredientType);
  }

  // Расчет питательной ценности
  calculateNutritionFromVisual(ingredientType, weight) {
    // Используем базу данных для расчета
    const nutritionPer100g = this.getNutritionForIngredient(ingredientType.name);
    const factor = weight / 100;
    
    return {
      calories: Math.round(nutritionPer100g.calories * factor),
      protein: Math.round(nutritionPer100g.protein * factor * 10) / 10,
      carbs: Math.round(nutritionPer100g.carbs * factor * 10) / 10,
      fat: Math.round(nutritionPer100g.fat * factor * 10) / 10
    };
  }

  // Получение питательной ценности ингредиента
  getNutritionForIngredient(ingredientName) {
    const nutritionDatabase = {
      'морковь': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
      'помидор': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      'огурец': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1 },
      'картофель': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      'сыр': { calories: 113, protein: 7, carbs: 1, fat: 9 },
      'мясо': { calories: 250, protein: 26, carbs: 0, fat: 15 }
    };
    
    return nutritionDatabase[ingredientName] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  // Расчет уверенности
  calculateConfidence(ingredientType, weight) {
    const baseConfidence = ingredientType.confidence || 0.5;
    const weightConfidence = weight > 0 ? 0.8 : 0.3;
    
    return Math.min(0.95, (baseConfidence + weightConfidence) / 2);
  }

  // Вспомогательные методы
  calculateSaturation(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  }

  detectEdges(imageData) {
    // Простое обнаружение краев
    const edges = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        const neighbors = [
          data[((y - 1) * width + x) * 4],
          data[((y + 1) * width + x) * 4],
          data[(y * width + (x - 1)) * 4],
          data[(y * width + (x + 1)) * 4]
        ];
        
        const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / 4;
        const edgeStrength = Math.abs(brightness - avgNeighbor);
        
        if (edgeStrength > 30) {
          edges.push({ x, y, strength: edgeStrength });
        }
      }
    }
    
    return edges;
  }

  identifyShapes(edges) {
    // Простая идентификация форм
    return edges.length > 100 ? [{ type: 'complex' }] : [{ type: 'simple' }];
  }

  calculateComplexity(edges) {
    return Math.min(1, edges.length / 1000);
  }

  calculateTexture(imageData) {
    // Простой анализ текстуры
    return {
      roughness: 0.5,
      smoothness: 0.5,
      pattern: 'none'
    };
  }

  // Остановка камеры
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

// Класс для оценки объема
class VolumeEstimator {
  estimate(imageData) {
    // Простая оценка объема на основе размера объекта
    const objectArea = this.calculateObjectArea(imageData);
    const estimatedVolume = objectArea * 0.1; // Примерная формула
    
    return Math.round(estimatedVolume);
  }

  calculateObjectArea(imageData) {
    // Подсчет пикселей объекта
    const data = imageData.data;
    let objectPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > 50) { // Порог для определения объекта
        objectPixels++;
      }
    }
    
    return objectPixels;
  }
}

// Класс для оценки веса
class WeightEstimator {
  estimate(imageData, ingredientType) {
    const volume = new VolumeEstimator().estimate(imageData);
    const density = this.getDensity(ingredientType.name);
    
    return Math.round(volume * density);
  }

  getDensity(ingredientName) {
    const densities = {
      'морковь': 0.6,
      'помидор': 0.7,
      'огурец': 0.6,
      'картофель': 0.7,
      'сыр': 1.0,
      'мясо': 1.0
    };
    
    return densities[ingredientName] || 0.8;
  }
}

// Экспорт экземпляра
export const computerVisionNutrition = new ComputerVisionNutrition();
