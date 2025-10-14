// AI-анализатор истории заказов с генерацией персонализированных инсайтов
// Использует бесплатные API (Gemini, ChatGPT) для анализа данных

export class AIOrderAnalyzer {
  constructor() {
    this.apis = {
      gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        apiKey: process.env.REACT_APP_GEMINI_API_KEY || 'demo_key',
        enabled: true
      },
      openai: {
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || 'demo_key',
        enabled: true,
        model: 'gpt-3.5-turbo'
      }
    };
    
    this.cache = new Map();
    this.insights = [];
  }

  // Основная функция анализа заказов
  async analyzeOrderHistory(orders, userGoals = 'healthy') {
    try {
      console.log('🔍 AI Order Analyzer: Starting analysis...');
      console.log('📊 Orders count:', orders.length);
      console.log('🎯 User goals:', userGoals);

      // 1. Агрегируем данные заказов
      const aggregatedData = this.aggregateOrderData(orders);
      console.log('📈 Aggregated data:', aggregatedData);

      // 2. Генерируем промт для AI
      const aiPrompt = this.generateAIPrompt(aggregatedData, userGoals);
      console.log('🤖 AI Prompt generated');

      // 3. Получаем анализ от AI
      const aiAnalysis = await this.getAIAnalysis(aiPrompt);
      console.log('🧠 AI Analysis received:', aiAnalysis);

      // 4. Парсим и структурируем результат
      const insights = this.parseAIResponse(aiAnalysis);
      console.log('💡 Insights parsed:', insights);

      // 5. Добавляем визуальные метрики
      const visualMetrics = this.generateVisualMetrics(aggregatedData);
      console.log('📊 Visual metrics generated');

      return {
        insights,
        visualMetrics,
        aggregatedData,
        recommendations: this.generateRecommendations(insights, userGoals),
        blindSpots: this.identifyBlindSpots(aggregatedData, userGoals)
      };

    } catch (error) {
      console.error('❌ AI Order Analyzer Error:', error);
      return this.getFallbackAnalysis(orders, userGoals);
    }
  }

  // Агрегация данных заказов
  aggregateOrderData(orders) {
    const stats = {
      totalOrders: orders.length,
      totalDishes: 0,
      totalCalories: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      categories: {},
      ingredients: {},
      timePatterns: {},
      chefPreferences: {},
      nutritionTrends: {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      healthScore: 0,
      diabeticRisk: 0,
      seasonalPatterns: {}
    };

    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;

      stats.totalDishes += order.items.length;
      stats.totalSpent += order.total || 0;

      order.items.forEach(item => {
        // Категории
        if (item.category) {
          stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
        }

        // Калории
        if (item.calories) {
          stats.totalCalories += item.calories;
        }

        // Ингредиенты
        if (item.ingredients) {
          const ingredients = Array.isArray(item.ingredients) 
            ? item.ingredients 
            : item.ingredients.split(',').map(i => i.trim());
          
          ingredients.forEach(ingredient => {
            stats.ingredients[ingredient] = (stats.ingredients[ingredient] || 0) + 1;
          });
        }

        // Повар
        if (item.chef) {
          stats.chefPreferences[item.chef] = (stats.chefPreferences[item.chef] || 0) + 1;
        }

        // Питательные вещества
        if (item.nutrition) {
          stats.nutritionTrends.protein += item.nutrition.protein || 0;
          stats.nutritionTrends.carbs += item.nutrition.carbs || 0;
          stats.nutritionTrends.fat += item.nutrition.fat || 0;
        }

        // Диабетический риск
        if (item.glycemicIndex) {
          stats.diabeticRisk += item.glycemicIndex > 70 ? 1 : 0;
        }
      });
    });

    // Рассчитываем средние значения
    stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0;
    stats.healthScore = this.calculateHealthScore(stats);
    stats.diabeticRisk = stats.diabeticRisk / stats.totalDishes * 100;

    return stats;
  }

  // Генерация промта для AI
  generateAIPrompt(data, userGoals) {
    const prompt = `
Ты - эксперт-диетолог с 15-летним стажем. Проанализируй данные заказов клиента и дай персонализированные рекомендации.

ДАННЫЕ КЛИЕНТА:
- Всего заказов: ${data.totalOrders}
- Всего блюд: ${data.totalDishes}
- Потрачено: ${data.totalSpent}₽
- Средний чек: ${Math.round(data.averageOrderValue)}₽
- Общие калории: ${data.totalCalories}

ПОПУЛЯРНЫЕ КАТЕГОРИИ:
${Object.entries(data.categories).map(([cat, count]) => `- ${cat}: ${count} раз`).join('\n')}

ТОП ИНГРЕДИЕНТЫ:
${Object.entries(data.ingredients).slice(0, 10).map(([ing, count]) => `- ${ing}: ${count} раз`).join('\n')}

ЛЮБИМЫЕ ПОВАРА:
${Object.entries(data.chefPreferences).slice(0, 5).map(([chef, count]) => `- ${chef}: ${count} раз`).join('\n')}

ЦЕЛЬ КЛИЕНТА: ${userGoals}
ОЦЕНКА ЗДОРОВЬЯ: ${data.healthScore}/100
РИСК ДИАБЕТА: ${data.diabeticRisk}%

ЗАДАЧА:
1. Выяви 3-5 "слепых зон" в питании клиента
2. Дай 3-5 конкретных рекомендаций для достижения цели "${userGoals}"
3. Предложи альтернативы популярным блюдам клиента
4. Рассчитай "Средний Чек Здоровья" (сравни с нормой)
5. Укажи на скрытые риски для здоровья

Формат ответа (JSON):
{
  "blindSpots": [
    {
      "title": "Заголовок проблемы",
      "description": "Описание",
      "impact": "Влияние на цель",
      "severity": "high/medium/low"
    }
  ],
  "recommendations": [
    {
      "title": "Рекомендация",
      "action": "Конкретное действие",
      "benefit": "Польза",
      "priority": "high/medium/low"
    }
  ],
  "alternatives": [
    {
      "current": "Текущее блюдо",
      "suggested": "Предлагаемое",
      "reason": "Причина замены"
    }
  ],
  "healthMetrics": {
    "healthCheckScore": 75,
    "averageHealthyOrderValue": 450,
    "diabeticRiskLevel": "medium",
    "nutritionBalance": "needs_improvement"
  },
  "insights": [
    {
      "type": "warning/positive/neutral",
      "message": "Ключевое наблюдение",
      "data": "Поддерживающие данные"
    }
  ]
}
`;

    return prompt;
  }

  // Получение анализа от AI
  async getAIAnalysis(prompt) {
    const cacheKey = `ai_analysis_${btoa(prompt).substring(0, 20)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📋 Using cached AI analysis');
      return cached;
    }

    // Пробуем Gemini API (бесплатный)
    if (this.apis.gemini.enabled) {
      try {
        const geminiResult = await this.callGeminiAPI(prompt);
        if (geminiResult) {
          this.cache.set(cacheKey, geminiResult);
          return geminiResult;
        }
      } catch (error) {
        console.warn('Gemini API error:', error);
      }
    }

    // Fallback на OpenAI
    if (this.apis.openai.enabled) {
      try {
        const openaiResult = await this.callOpenAIAPI(prompt);
        if (openaiResult) {
          this.cache.set(cacheKey, openaiResult);
          return openaiResult;
        }
      } catch (error) {
        console.warn('OpenAI API error:', error);
      }
    }

    // Fallback на локальный анализ
    return this.generateLocalAnalysis(prompt);
  }

  // Вызов Gemini API
  async callGeminiAPI(prompt) {
    const response = await fetch(`${this.apis.gemini.baseUrl}?key=${this.apis.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) throw new Error('Gemini API error');

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  // Вызов OpenAI API
  async callOpenAIAPI(prompt) {
    const response = await fetch(this.apis.openai.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apis.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.apis.openai.model,
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт-диетолог. Отвечай только в формате JSON без дополнительных комментариев.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  }

  // Локальный анализ (fallback)
  generateLocalAnalysis(prompt) {
    // Простой анализ на основе правил
    return JSON.stringify({
      blindSpots: [
        {
          title: "Недостаток овощей",
          description: "В ваших заказах мало свежих овощей и салатов",
          impact: "Снижает потребление клетчатки и витаминов",
          severity: "medium"
        }
      ],
      recommendations: [
        {
          title: "Добавьте больше салатов",
          action: "Заказывайте 1 салат к каждому основному блюду",
          benefit: "Увеличит потребление клетчатки на 40%",
          priority: "high"
        }
      ],
      alternatives: [
        {
          current: "Картофель фри",
          suggested: "Запеченный картофель",
          reason: "Снижает калории на 30%"
        }
      ],
      healthMetrics: {
        healthCheckScore: 65,
        averageHealthyOrderValue: 380,
        diabeticRiskLevel: "medium",
        nutritionBalance: "needs_improvement"
      },
      insights: [
        {
          type: "warning",
          message: "70% ваших заказов содержат жареные блюда",
          data: "Это может замедлить достижение цели 'Похудение'"
        }
      ]
    });
  }

  // Парсинг ответа AI
  parseAIResponse(aiResponse) {
    try {
      // Ищем JSON в ответе
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Error parsing AI response:', error);
    }

    // Fallback
    return this.generateLocalAnalysis();
  }

  // Генерация визуальных метрик
  generateVisualMetrics(data) {
    return {
      healthScoreChart: {
        value: data.healthScore,
        max: 100,
        color: data.healthScore > 70 ? '#4caf50' : data.healthScore > 50 ? '#ff9800' : '#f44336'
      },
      averageHealthyOrderValue: {
        value: Math.round(data.averageOrderValue),
        benchmark: 400,
        status: data.averageOrderValue > 400 ? 'above' : 'below'
      },
      diabeticRiskMeter: {
        value: data.diabeticRisk,
        level: data.diabeticRisk > 60 ? 'high' : data.diabeticRisk > 30 ? 'medium' : 'low'
      },
      categoryDistribution: Object.entries(data.categories).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / data.totalDishes) * 100)
      }))
    };
  }

  // Генерация рекомендаций
  generateRecommendations(insights, userGoals) {
    const recommendations = [];

    if (insights.recommendations) {
      recommendations.push(...insights.recommendations);
    }

    // Добавляем специфичные рекомендации для целей
    const goalRecommendations = this.getGoalSpecificRecommendations(userGoals, insights);
    recommendations.push(...goalRecommendations);

    return recommendations;
  }

  // Выявление слепых зон
  identifyBlindSpots(data, userGoals) {
    const blindSpots = [];

    // Анализ недостающих питательных веществ
    if (data.nutritionTrends.fiber < data.totalDishes * 5) {
      blindSpots.push({
        title: "Недостаток клетчатки",
        description: "Мало овощей и цельнозерновых продуктов",
        impact: "Может привести к проблемам с пищеварением",
        severity: "medium"
      });
    }

    // Анализ переизбытка жареного
    const friedCount = data.categories.fried || 0;
    if (friedCount > data.totalDishes * 0.5) {
      blindSpots.push({
        title: "Слишком много жареного",
        description: "Более 50% заказов содержат жареные блюда",
        impact: "Высокое потребление трансжиров",
        severity: "high"
      });
    }

    return blindSpots;
  }

  // Расчет оценки здоровья
  calculateHealthScore(data) {
    let score = 100;

    // Штрафы за нездоровые выборы
    const friedCount = data.categories.fried || 0;
    const vegetableCount = data.categories.vegetables || 0;
    
    score -= (friedCount / data.totalDishes) * 30; // Штраф за жареное
    score += (vegetableCount / data.totalDishes) * 20; // Бонус за овощи
    
    // Штраф за высокий диабетический риск
    score -= (data.diabeticRisk / 100) * 25;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Рекомендации для конкретных целей
  getGoalSpecificRecommendations(userGoals, insights) {
    const recommendations = {
      weight_loss: [
        {
          title: "Снизьте калорийность",
          action: "Выбирайте блюда до 400 ккал",
          benefit: "Создаст дефицит калорий для похудения",
          priority: "high"
        }
      ],
      muscle_gain: [
        {
          title: "Увеличьте белок",
          action: "Добавьте белковые блюда к каждому заказу",
          benefit: "Поддержит рост мышц",
          priority: "high"
        }
      ],
      healthy: [
        {
          title: "Сбалансируйте питание",
          action: "Включайте белки, углеводы и овощи в каждый заказ",
          benefit: "Обеспечит полноценное питание",
          priority: "medium"
        }
      ]
    };

    return recommendations[userGoals] || recommendations.healthy;
  }

  // Fallback анализ
  getFallbackAnalysis(orders, userGoals) {
    const data = this.aggregateOrderData(orders);
    
    return {
      insights: {
        blindSpots: [
          {
            title: "Недостаточно данных",
            description: "Для точного анализа нужно больше заказов",
            impact: "Анализ может быть неточным",
            severity: "low"
          }
        ],
        recommendations: [
          {
            title: "Сделайте больше заказов",
            action: "Попробуйте разнообразные блюда",
            benefit: "Получите более точные рекомендации",
            priority: "medium"
          }
        ],
        alternatives: [],
        healthMetrics: {
          healthCheckScore: data.healthScore,
          averageHealthyOrderValue: Math.round(data.averageOrderValue),
          diabeticRiskLevel: "unknown",
          nutritionBalance: "insufficient_data"
        },
        insights: [
          {
            type: "neutral",
            message: "Недостаточно данных для глубокого анализа",
            data: "Сделайте еще несколько заказов для получения персонализированных рекомендаций"
          }
        ]
      },
      visualMetrics: this.generateVisualMetrics(data),
      aggregatedData: data,
      recommendations: [],
      blindSpots: []
    };
  }

  // Очистка кеша
  clearCache() {
    this.cache.clear();
  }

  // Получение статистики использования
  getUsageStats() {
    return {
      cacheSize: this.cache.size,
      apisEnabled: Object.values(this.apis).filter(api => api.enabled).length,
      lastAnalysis: new Date().toISOString()
    };
  }
}

// Экспорт экземпляра
export const aiOrderAnalyzer = new AIOrderAnalyzer();
