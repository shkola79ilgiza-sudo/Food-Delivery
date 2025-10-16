/**
 * API Client для подключения к Backend
 * Backend: http://localhost:3001/api
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Получить токен из localStorage
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Сохранить токен в localStorage
const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Удалить токен из localStorage
const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Базовый fetch с обработкой ошибок
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка сервера');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  // Регистрация
  register: async (userData) => {
    // Для регистрации не нужен токен авторизации
    const headers = {
      'Content-Type': 'application/json',
    };

    console.log('🔍 Register request data:', userData);
    console.log('🔍 Register URL:', `${API_BASE_URL}/auth/register`);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      console.log('🔍 Register response status:', response.status);
      console.log('🔍 Register response headers:', response.headers);

      const data = await response.json();

      if (!response.ok) {
        console.error('🔍 Register error response:', data);
        throw new Error(data.message || 'Ошибка регистрации');
      }
      
      if (data.token) {
        setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Register API Error:', error);
      throw error;
    }
  },

  // Логин
  login: async (email, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  },

  // Логаут
  logout: () => {
    removeToken();
  },

  // Получить текущего пользователя
  getMe: async () => {
    return await fetchAPI('/users/me');
  },

  // Обновить профиль
  updateProfile: async (profileData) => {
    return await fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// ============================================
// DISHES API
// ============================================

export const dishesAPI = {
  // Получить все блюда
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchAPI(`/dishes${queryString ? '?' + queryString : ''}`);
  },

  // Получить блюдо по ID
  getById: async (id) => {
    return await fetchAPI(`/dishes/${id}`);
  },

  // Получить популярные блюда
  getPopular: async () => {
    return await fetchAPI('/dishes/popular');
  },

  // Получить новые блюда
  getNew: async () => {
    return await fetchAPI('/dishes/new');
  },

  // Получить блюда повара
  getByChef: async (chefId) => {
    return await fetchAPI(`/dishes/chef/${chefId}`);
  },

  // Получить мои блюда (для повара)
  getMyDishes: async () => {
    return await fetchAPI('/dishes/my/dishes');
  },

  // Создать блюдо (для повара)
  create: async (dishData) => {
    return await fetchAPI('/dishes', {
      method: 'POST',
      body: JSON.stringify(dishData),
    });
  },

  // Обновить блюдо (для повара)
  update: async (id, dishData) => {
    return await fetchAPI(`/dishes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dishData),
    });
  },

  // Удалить блюдо (для повара)
  delete: async (id) => {
    return await fetchAPI(`/dishes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ORDERS API
// ============================================

export const ordersAPI = {
  // Создать заказ
  create: async (orderData) => {
    return await fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Получить мои заказы (для клиента)
  getMyOrders: async () => {
    return await fetchAPI('/orders/my/orders');
  },

  // Получить заказы повара
  getChefOrders: async () => {
    return await fetchAPI('/orders/chef/orders');
  },

  // Получить заказ по ID
  getById: async (id) => {
    return await fetchAPI(`/orders/${id}`);
  },

  // Обновить статус заказа (для повара)
  updateStatus: async (id, status) => {
    return await fetchAPI(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Отменить заказ (для клиента)
  cancel: async (id) => {
    return await fetchAPI(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  // Получить статистику заказов
  getStats: async () => {
    return await fetchAPI('/orders/stats/overview');
  },
};

// ============================================
// REVIEWS API
// ============================================

export const reviewsAPI = {
  // Создать отзыв
  create: async (reviewData) => {
    return await fetchAPI('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Получить все отзывы
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchAPI(`/reviews${queryString ? '?' + queryString : ''}`);
  },

  // Получить отзыв по ID
  getById: async (id) => {
    return await fetchAPI(`/reviews/${id}`);
  },

  // Получить мои отзывы
  getMyReviews: async () => {
    return await fetchAPI('/reviews/my/reviews');
  },

  // Обновить отзыв
  update: async (id, reviewData) => {
    return await fetchAPI(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  },

  // Удалить отзыв
  delete: async (id) => {
    return await fetchAPI(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Получить статистику отзывов
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchAPI(`/reviews/stats/overview${queryString ? '?' + queryString : ''}`);
  },
};

// ============================================
// AI API
// ============================================

export const aiAPI = {
  // Прогноз эластичности спроса
  predictDemandElasticity: async (data) => {
    return await fetchAPI('/ai/demand-elasticity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Анализ социальных трендов
  analyzeSocialTrends: async (data) => {
    return await fetchAPI('/ai/social-trends', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Прогноз рисков и задержек
  predictRisks: async (data) => {
    return await fetchAPI('/ai/risk-prediction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Анализ отзыва (Sentiment Analysis)
  analyzeSentiment: async (text, reviewId) => {
    return await fetchAPI('/ai/sentiment-analysis', {
      method: 'POST',
      body: JSON.stringify({ text, reviewId }),
    });
  },

  // Пакетный анализ отзывов
  batchAnalyzeSentiment: async (params) => {
    return await fetchAPI('/ai/batch-sentiment-analysis', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Персональные рекомендации
  getRecommendations: async (limit = 5) => {
    return await fetchAPI(`/ai/recommendations?limit=${limit}`);
  },

  // Похожие блюда
  getSimilarDishes: async (dishId, limit = 5) => {
    return await fetchAPI(`/ai/similar-dishes?dishId=${dishId}&limit=${limit}`);
  },
};

// Экспорт токен-функций
export { getToken, setToken, removeToken };

// Экспорт базового URL
export { API_BASE_URL };

