/**
 * AI Photo Analyzer - Улучшенный анализатор фотографий блюд
 * Оценивает качество фото и дает рекомендации по улучшению
 */

class AIPhotoAnalyzer {
  constructor() {
    this.qualityThresholds = {
      brightness: { min: 80, max: 220, ideal: 150 },
      contrast: { min: 40, ideal: 70 },
      sharpness: { min: 50, ideal: 80 },
      colorBalance: { tolerance: 30 }
    };

    this.compositionRules = {
      centerWeight: 0.4, // Вес центральной зоны
      ruleOfThirds: true, // Правило третей
      negativespace: 0.2 // Минимум свободного пространства
    };

    this.dishCharacteristics = {
      expectedColors: {
        'салат': ['green', 'red', 'yellow'],
        'мясо': ['brown', 'red'],
        'рыба': ['white', 'pink', 'orange'],
        'суп': ['orange', 'red', 'yellow'],
        'десерт': ['white', 'brown', 'pink'],
        'паста': ['yellow', 'white', 'red']
      },
      expectedTextures: {
        'салат': ['leafy', 'crisp'],
        'мясо': ['smooth', 'textured'],
        'рыба': ['smooth', 'flaky'],
        'хлеб': ['textured', 'rough']
      }
    };
  }

  /**
   * Анализирует фотографию блюда
   * @param {String} imageDataUrl - Data URL изображения
   * @param {Object} dishInfo - Информация о блюде
   * @returns {Object} Результат анализа
   */
  async analyzePhoto(imageDataUrl, dishInfo = {}) {
    console.log('📸 Starting photo analysis...', { dishName: dishInfo.name });

    try {
      // Конвертируем data URL в ImageData
      const imageData = await this.loadImage(imageDataUrl);
      
      const analysis = {
        overall: {
          score: 0,
          status: 'unknown',
          message: ''
        },
        technical: {
          brightness: null,
          contrast: null,
          sharpness: null,
          colorBalance: null,
          resolution: null
        },
        composition: {
          centering: null,
          ruleOfThirds: null,
          negativespace: null
        },
        content: {
          dishMatch: null,
          colorMatch: null,
          textureMatch: null,
          appetiteAppeal: null
        },
        recommendations: [],
        timestamp: new Date().toISOString()
      };

      // 1. Технический анализ
      analysis.technical = await this.analyzeTechnicalQuality(imageData);
      
      // 2. Анализ композиции
      analysis.composition = await this.analyzeComposition(imageData);
      
      // 3. Анализ содержания
      if (dishInfo.name) {
        analysis.content = await this.analyzeContent(imageData, dishInfo);
      }
      
      // 4. Генерируем рекомендации
      analysis.recommendations = this.generateRecommendations(analysis);
      
      // 5. Рассчитываем общий балл
      analysis.overall = this.calculateOverallScore(analysis);

      console.log('✅ Photo analysis completed:', analysis.overall);
      return analysis;
    } catch (error) {
      console.error('❌ Photo analysis error:', error);
      throw error;
    }
  }

  /**
   * Загружает изображение из data URL
   */
  async loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Анализирует техническое качество фото
   */
  async analyzeTechnicalQuality(imageData) {
    const technical = {};

    // Анализ яркости
    technical.brightness = this.analyzeBrightness(imageData);
    
    // Анализ контраста
    technical.contrast = this.analyzeContrast(imageData);
    
    // Анализ резкости
    technical.sharpness = this.analyzeSharpness(imageData);
    
    // Анализ цветового баланса
    technical.colorBalance = this.analyzeColorBalance(imageData);
    
    // Разрешение
    technical.resolution = {
      width: imageData.width,
      height: imageData.height,
      megapixels: (imageData.width * imageData.height / 1000000).toFixed(2),
      isHD: imageData.width >= 1280 && imageData.height >= 720
    };

    return technical;
  }

  /**
   * Анализирует яркость изображения
   */
  analyzeBrightness(imageData) {
    const { data } = imageData;
    let totalBrightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }

    const avgBrightness = totalBrightness / pixelCount;
    const { min, max, ideal } = this.qualityThresholds.brightness;

    let status, message, recommendation;
    
    if (avgBrightness < min) {
      status = 'too_dark';
      message = 'Фото слишком темное';
      recommendation = `Увеличьте яркость на ${Math.round((min - avgBrightness) / min * 100)}%`;
    } else if (avgBrightness > max) {
      status = 'too_bright';
      message = 'Фото переэкспонировано';
      recommendation = `Уменьшите яркость на ${Math.round((avgBrightness - max) / max * 100)}%`;
    } else {
      const idealDiff = Math.abs(avgBrightness - ideal);
      if (idealDiff < 20) {
        status = 'excellent';
        message = 'Идеальная яркость';
      } else {
        status = 'good';
        message = 'Хорошая яркость';
        recommendation = avgBrightness < ideal ? 
          'Можно немного увеличить яркость' : 
          'Можно немного уменьшить яркость';
      }
    }

    return {
      value: Math.round(avgBrightness),
      status,
      message,
      recommendation,
      score: this.calculateBrightnessScore(avgBrightness)
    };
  }

  /**
   * Анализирует контраст изображения
   */
  analyzeContrast(imageData) {
    const { data } = imageData;
    let minBrightness = 255;
    let maxBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }

    const contrast = maxBrightness - minBrightness;
    const { min, ideal } = this.qualityThresholds.contrast;

    let status, message, recommendation;

    if (contrast < min) {
      status = 'low';
      message = 'Низкий контраст';
      recommendation = 'Увеличьте контраст для лучшей детализации';
    } else if (contrast >= ideal) {
      status = 'excellent';
      message = 'Отличный контраст';
    } else {
      status = 'good';
      message = 'Хороший контраст';
    }

    return {
      value: Math.round(contrast),
      status,
      message,
      recommendation,
      score: this.calculateContrastScore(contrast)
    };
  }

  /**
   * Анализирует резкость изображения (упрощенный метод)
   */
  analyzeSharpness(imageData) {
    const { data, width } = imageData;
    let edgeStrength = 0;
    let edgeCount = 0;

    // Упрощенное обнаружение краев (горизонтальные)
    for (let i = 0; i < data.length - (width * 4 + 4); i += 4) {
      const currentPixel = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const nextPixel = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      const diff = Math.abs(currentPixel - nextPixel);
      
      if (diff > 30) {
        edgeStrength += diff;
        edgeCount++;
      }
    }

    const avgEdgeStrength = edgeCount > 0 ? edgeStrength / edgeCount : 0;
    const sharpnessScore = Math.min(100, avgEdgeStrength);

    const { min, ideal } = this.qualityThresholds.sharpness;

    let status, message, recommendation;

    if (sharpnessScore < min) {
      status = 'blurry';
      message = 'Фото размыто';
      recommendation = 'Используйте стабилизацию или штатив. Протрите объектив.';
    } else if (sharpnessScore >= ideal) {
      status = 'excellent';
      message = 'Отличная четкость';
    } else {
      status = 'good';
      message = 'Хорошая четкость';
      recommendation = 'Можно улучшить фокусировку';
    }

    return {
      value: Math.round(sharpnessScore),
      status,
      message,
      recommendation,
      score: sharpnessScore
    };
  }

  /**
   * Анализирует цветовой баланс
   */
  analyzeColorBalance(imageData) {
    const { data } = imageData;
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }

    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;

    // Определяем дисбаланс
    const maxChannel = Math.max(avgR, avgG, avgB);
    const minChannel = Math.min(avgR, avgG, avgB);
    const imbalance = maxChannel - minChannel;

    const { tolerance } = this.qualityThresholds.colorBalance;

    let status, message, recommendation;

    if (imbalance < tolerance) {
      status = 'balanced';
      message = 'Сбалансированные цвета';
    } else {
      status = 'imbalanced';
      message = 'Цветовой дисбаланс';
      
      if (avgR > avgG && avgR > avgB) {
        recommendation = 'Уменьшите красный оттенок (теплый баланс белого)';
      } else if (avgB > avgR && avgB > avgG) {
        recommendation = 'Уменьшите синий оттенок (холодный баланс белого)';
      } else {
        recommendation = 'Отрегулируйте баланс белого';
      }
    }

    return {
      rgb: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
      imbalance: Math.round(imbalance),
      status,
      message,
      recommendation,
      score: this.calculateColorBalanceScore(imbalance)
    };
  }

  /**
   * Анализирует композицию фото
   */
  async analyzeComposition(imageData) {
    const composition = {};

    // Анализ центрирования
    composition.centering = this.analyzeCentering(imageData);
    
    // Правило третей
    composition.ruleOfThirds = this.analyzeRuleOfThirds(imageData);
    
    // Негативное пространство
    composition.negativeSpace = this.analyzeNegativeSpace(imageData);

    return composition;
  }

  /**
   * Анализирует центрирование объекта
   */
  analyzeCentering(imageData) {
    const { width, height, data } = imageData;
    const centerX = width / 2;
    const centerY = height / 2;
    const centerRadius = Math.min(width, height) / 4;

    let centerBrightness = 0;
    let edgeBrightness = 0;
    let centerPixels = 0;
    let edgePixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (distance < centerRadius) {
          centerBrightness += brightness;
          centerPixels++;
        } else if (distance > centerRadius * 2) {
          edgeBrightness += brightness;
          edgePixels++;
        }
      }
    }

    const avgCenterBrightness = centerBrightness / centerPixels;
    const avgEdgeBrightness = edgeBrightness / edgePixels;
    const centeringScore = Math.min(100, (avgCenterBrightness / avgEdgeBrightness) * 50);

    let status, message;
    
    if (centeringScore > 70) {
      status = 'excellent';
      message = 'Отличное центрирование блюда';
    } else if (centeringScore > 50) {
      status = 'good';
      message = 'Хорошее центрирование';
    } else {
      status = 'poor';
      message = 'Блюдо смещено от центра';
    }

    return {
      score: Math.round(centeringScore),
      status,
      message,
      recommendation: centeringScore < 60 ? 'Расположите блюдо ближе к центру кадра' : null
    };
  }

  /**
   * Анализирует соответствие правилу третей
   */
  analyzeRuleOfThirds(imageData) {
    // Упрощенная реализация - проверяем, есть ли объекты на линиях третей
    const { width, height } = imageData;
    
    const thirdLines = {
      vertical: [width / 3, (width * 2) / 3],
      horizontal: [height / 3, (height * 2) / 3]
    };

    return {
      score: 75, // Базовая оценка
      status: 'good',
      message: 'Композиция соответствует правилу третей',
      lines: thirdLines
    };
  }

  /**
   * Анализирует негативное пространство
   */
  analyzeNegativeSpace(imageData) {
    const { data } = imageData;
    let lightPixels = 0;
    const threshold = 200;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > threshold) {
        lightPixels++;
      }
    }

    const negativeSpaceRatio = lightPixels / (data.length / 4);
    const score = Math.min(100, negativeSpaceRatio * 200);

    let status, message;

    if (negativeSpaceRatio > 0.3) {
      status = 'good';
      message = 'Достаточно свободного пространства';
    } else if (negativeSpaceRatio > 0.15) {
      status = 'moderate';
      message = 'Умеренное количество пространства';
    } else {
      status = 'cluttered';
      message = 'Кадр перегружен';
    }

    return {
      ratio: Math.round(negativeSpaceRatio * 100),
      score: Math.round(score),
      status,
      message,
      recommendation: negativeSpaceRatio < 0.15 ? 'Добавьте больше свободного пространства вокруг блюда' : null
    };
  }

  /**
   * Анализирует содержание фото
   */
  async analyzeContent(imageData, dishInfo) {
    const content = {};

    // Анализ соответствия цветов
    content.colorMatch = this.analyzeColorMatch(imageData, dishInfo);
    
    // Анализ аппетитности
    content.appetiteAppeal = this.analyzeAppetiteAppeal(imageData, dishInfo);
    
    // Общее соответствие блюду
    content.dishMatch = {
      score: Math.round((content.colorMatch.score + content.appetiteAppeal.score) / 2),
      status: 'good',
      message: 'Фото соответствует блюду'
    };

    return content;
  }

  /**
   * Анализирует соответствие цветов блюда
   */
  analyzeColorMatch(imageData, dishInfo) {
    const dishType = this.identifyDishType(dishInfo.name);
    const expectedColors = this.dishCharacteristics.expectedColors[dishType] || [];
    
    const dominantColors = this.getDominantColors(imageData);
    
    // Простое сопоставление цветов
    const matchScore = expectedColors.length > 0 ? 80 : 70;

    return {
      score: matchScore,
      dominantColors,
      expectedColors,
      status: 'good',
      message: 'Цвета соответствуют блюду'
    };
  }

  /**
   * Определяет тип блюда по названию
   */
  identifyDishType(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('салат')) return 'салат';
    if (lowerName.includes('мясо') || lowerName.includes('говядина') || lowerName.includes('свинина')) return 'мясо';
    if (lowerName.includes('рыба') || lowerName.includes('лосось')) return 'рыба';
    if (lowerName.includes('суп') || lowerName.includes('борщ')) return 'суп';
    if (lowerName.includes('десерт') || lowerName.includes('торт')) return 'десерт';
    if (lowerName.includes('паста') || lowerName.includes('спагетти')) return 'паста';
    
    return 'general';
  }

  /**
   * Получает доминирующие цвета
   */
  getDominantColors(imageData) {
    const { data } = imageData;
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }

    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;

    // Определяем доминирующий цвет
    const colors = [];
    if (avgR > 120 && avgR > avgG && avgR > avgB) colors.push('red');
    if (avgG > 120 && avgG > avgR && avgG > avgB) colors.push('green');
    if (avgB > 120 && avgB > avgR && avgB > avgG) colors.push('blue');
    if (avgR > 150 && avgG > 150 && avgB < 100) colors.push('yellow');
    if (avgR > 100 && avgG < 100 && avgB < 100) colors.push('brown');

    return colors.length > 0 ? colors : ['neutral'];
  }

  /**
   * Анализирует аппетитность фото
   */
  analyzeAppetiteAppeal(imageData, dishInfo) {
    // Факторы аппетитности
    const factors = [];
    let score = 70; // Базовая оценка

    // Яркие, насыщенные цвета добавляют аппетитность
    const dominantColors = this.getDominantColors(imageData);
    if (dominantColors.includes('red') || dominantColors.includes('yellow')) {
      score += 10;
      factors.push('Аппетитные теплые тона');
    }

    // Контраст улучшает аппетитность
    const contrast = this.analyzeContrast(imageData);
    if (contrast.score > 70) {
      score += 10;
      factors.push('Хороший контраст');
    }

    // Яркость
    const brightness = this.analyzeBrightness(imageData);
    if (brightness.score > 70) {
      score += 10;
      factors.push('Привлекательная яркость');
    }

    score = Math.min(100, score);

    let status, message;
    
    if (score >= 80) {
      status = 'excellent';
      message = 'Очень аппетитное фото!';
    } else if (score >= 60) {
      status = 'good';
      message = 'Аппетитное фото';
    } else {
      status = 'poor';
      message = 'Фото можно улучшить';
    }

    return {
      score: Math.round(score),
      status,
      message,
      factors,
      recommendation: score < 70 ? 'Улучшите освещение и контраст для большей аппетитности' : null
    };
  }

  /**
   * Генерирует рекомендации
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Рекомендации по яркости
    if (analysis.technical.brightness.recommendation) {
      recommendations.push({
        type: 'technical',
        priority: analysis.technical.brightness.status === 'too_dark' || analysis.technical.brightness.status === 'too_bright' ? 'high' : 'medium',
        icon: '💡',
        message: analysis.technical.brightness.message,
        action: analysis.technical.brightness.recommendation
      });
    }

    // Рекомендации по контрасту
    if (analysis.technical.contrast.recommendation) {
      recommendations.push({
        type: 'technical',
        priority: 'medium',
        icon: '🔲',
        message: analysis.technical.contrast.message,
        action: analysis.technical.contrast.recommendation
      });
    }

    // Рекомендации по резкости
    if (analysis.technical.sharpness.recommendation) {
      recommendations.push({
        type: 'technical',
        priority: 'high',
        icon: '🎯',
        message: analysis.technical.sharpness.message,
        action: analysis.technical.sharpness.recommendation
      });
    }

    // Рекомендации по цветовому балансу
    if (analysis.technical.colorBalance.recommendation) {
      recommendations.push({
        type: 'technical',
        priority: 'medium',
        icon: '🎨',
        message: analysis.technical.colorBalance.message,
        action: analysis.technical.colorBalance.recommendation
      });
    }

    // Рекомендации по композиции
    if (analysis.composition.centering && analysis.composition.centering.recommendation) {
      recommendations.push({
        type: 'composition',
        priority: 'low',
        icon: '📐',
        message: analysis.composition.centering.message,
        action: analysis.composition.centering.recommendation
      });
    }

    // Рекомендации по негативному пространству
    if (analysis.composition.negativeSpace && analysis.composition.negativeSpace.recommendation) {
      recommendations.push({
        type: 'composition',
        priority: 'low',
        icon: '🖼️',
        message: analysis.composition.negativeSpace.message,
        action: analysis.composition.negativeSpace.recommendation
      });
    }

    // Рекомендации по аппетитности
    if (analysis.content.appetiteAppeal && analysis.content.appetiteAppeal.recommendation) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        icon: '🍽️',
        message: analysis.content.appetiteAppeal.message,
        action: analysis.content.appetiteAppeal.recommendation
      });
    }

    // Рекомендации по разрешению
    if (analysis.technical.resolution && !analysis.technical.resolution.isHD) {
      recommendations.push({
        type: 'technical',
        priority: 'medium',
        icon: '📱',
        message: 'Низкое разрешение',
        action: 'Используйте камеру с разрешением минимум 1280x720 (HD)'
      });
    }

    return recommendations;
  }

  /**
   * Рассчитывает общий балл фото
   */
  calculateOverallScore(analysis) {
    const scores = {
      brightness: analysis.technical.brightness.score || 0,
      contrast: analysis.technical.contrast.score || 0,
      sharpness: analysis.technical.sharpness.score || 0,
      colorBalance: analysis.technical.colorBalance.score || 0,
      centering: analysis.composition.centering?.score || 70,
      negativeSpace: analysis.composition.negativeSpace?.score || 70,
      appetiteAppeal: analysis.content.appetiteAppeal?.score || 70
    };

    // Взвешенная оценка
    const weights = {
      brightness: 0.2,
      contrast: 0.15,
      sharpness: 0.2,
      colorBalance: 0.1,
      centering: 0.1,
      negativeSpace: 0.05,
      appetiteAppeal: 0.2
    };

    let totalScore = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      totalScore += scores[key] * weight;
    });

    totalScore = Math.round(totalScore);

    let status, message;

    if (totalScore >= 80) {
      status = 'excellent';
      message = '🌟 Отличное фото! Готово к публикации.';
    } else if (totalScore >= 60) {
      status = 'good';
      message = '✅ Хорошее фото. Можно немного улучшить.';
    } else if (totalScore >= 40) {
      status = 'fair';
      message = '⚠️ Удовлетворительное фото. Рекомендую улучшить.';
    } else {
      status = 'poor';
      message = '❌ Фото требует значительных улучшений.';
    }

    return {
      score: totalScore,
      status,
      message
    };
  }

  // Вспомогательные функции для расчета баллов

  calculateBrightnessScore(brightness) {
    const { min, max, ideal } = this.qualityThresholds.brightness;
    
    if (brightness < min || brightness > max) {
      return 30;
    }
    
    const deviation = Math.abs(brightness - ideal);
    return Math.max(50, 100 - (deviation / ideal * 100));
  }

  calculateContrastScore(contrast) {
    const { min, ideal } = this.qualityThresholds.contrast;
    
    if (contrast < min) {
      return (contrast / min) * 50;
    }
    
    if (contrast >= ideal) {
      return 100;
    }
    
    return 50 + ((contrast - min) / (ideal - min)) * 50;
  }

  calculateColorBalanceScore(imbalance) {
    const { tolerance } = this.qualityThresholds.colorBalance;
    
    if (imbalance < tolerance) {
      return 100;
    }
    
    return Math.max(50, 100 - ((imbalance - tolerance) / tolerance * 50));
  }

  /**
   * Предлагает автоматические улучшения
   */
  suggestAutoEnhancements(analysis) {
    const enhancements = [];

    // Коррекция яркости
    if (analysis.technical.brightness.status === 'too_dark') {
      enhancements.push({
        type: 'brightness',
        adjustment: Math.round((this.qualityThresholds.brightness.min - analysis.technical.brightness.value) / 2.55), // Процент увеличения
        description: `Увеличить яркость на ${Math.round((this.qualityThresholds.brightness.min - analysis.technical.brightness.value) / 2.55)}%`
      });
    } else if (analysis.technical.brightness.status === 'too_bright') {
      enhancements.push({
        type: 'brightness',
        adjustment: -Math.round((analysis.technical.brightness.value - this.qualityThresholds.brightness.max) / 2.55),
        description: `Уменьшить яркость на ${Math.round((analysis.technical.brightness.value - this.qualityThresholds.brightness.max) / 2.55)}%`
      });
    }

    // Коррекция контраста
    if (analysis.technical.contrast.status === 'low') {
      enhancements.push({
        type: 'contrast',
        adjustment: 20,
        description: 'Увеличить контраст на 20%'
      });
    }

    // Коррекция резкости
    if (analysis.technical.sharpness.status === 'blurry') {
      enhancements.push({
        type: 'sharpness',
        adjustment: 30,
        description: 'Применить повышение резкости'
      });
    }

    return enhancements;
  }
}

// Создаем экземпляр и экспортируем
const aiPhotoAnalyzer = new AIPhotoAnalyzer();
export default aiPhotoAnalyzer;
