import { navigateTo } from "../utils/navigation";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

// ❌ УДАЛЕНО: localStorage для токенов
// ✅ ТОКЕНЫ ТЕПЕРЬ В httpOnly cookies (управляются сервером)

// Базовый fetch с автоматической отправкой cookies
const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // 🔒 Автоматически отправляет httpOnly cookies
    });

    // Проверяем, есть ли тело ответа
    const contentType = response.headers.get("content-type");
    const hasJsonContent =
      contentType && contentType.includes("application/json");

    const data = hasJsonContent ? await response.json() : {};

    if (!response.ok) {
      // Специальная обработка 401 (Unauthorized)
      if (response.status === 401) {
        // Пытаемся обновить токен
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Повторяем запрос с новым токеном
          return fetchAPI(endpoint, options);
        } else {
          // Токен не удалось обновить - редирект на логин
          navigateTo("/login");
          throw new Error("Сессия истекла");
        }
      }

      throw new Error(data.message || `Ошибка ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);

    // Интеграция с Sentry (добавим позже)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { api_endpoint: endpoint },
      });
    }

    throw error;
  }
};

// 🔄 Обновление access token через refresh token
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Отправляет refresh token cookie
    });

    return response.ok;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

// ============================================
// 🔐 AUTH API
// ============================================

export const authAPI = {
  // Регистрация
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка регистрации");
      }

      // ✅ Токены автоматически установлены в cookies сервером
      return data;
    } catch (error) {
      console.error("Register API Error:", error);
      throw error;
    }
  },

  // Логин
  login: async (email, password) => {
    const data = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // ✅ Токены автоматически установлены в cookies сервером
    return data;
  },

  // Логаут
  logout: async () => {
    try {
      await fetchAPI("/auth/logout", {
        method: "POST",
      });

      // Редирект на главную
      navigateTo("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Редирект даже при ошибке
      navigateTo("/");
    }
  },

  // Получить текущего пользователя
  getMe: async () => {
    return await fetchAPI("/users/me");
  },

  // Обновить профиль
  updateProfile: async (profileData) => {
    return await fetchAPI("/users/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // 🔄 Обновить access token
  refreshToken: async () => {
    return await refreshAccessToken();
  },
};

// ============================================
// 🍽️ DISHES API
// ============================================

export const dishesAPI = {
  // Получить все блюда
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchAPI(`/dishes${queryString ? "?" + queryString : ""}`);
  },

  // Получить блюдо по ID
  getById: async (id) => {
    return await fetchAPI(`/dishes/${id}`);
  },

  // Получить популярные блюда
  getPopular: async () => {
    return await fetchAPI("/dishes/popular");
  },

  // Создать блюдо
  create: async (dishData) => {
    return await fetchAPI("/dishes", {
      method: "POST",
      body: JSON.stringify(dishData),
    });
  },

  // Обновить блюдо
  update: async (id, dishData) => {
    return await fetchAPI(`/dishes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dishData),
    });
  },

  // Удалить блюдо
  delete: async (id) => {
    return await fetchAPI(`/dishes/${id}`, {
      method: "DELETE",
    });
  },

  // Получить блюда повара
  getByChef: async (chefId) => {
    return await fetchAPI(`/chefs/${chefId}/dishes`);
  },
};

// ============================================
// 📦 ORDERS API
// ============================================

export const ordersAPI = {
  // Создать заказ
  create: async (orderData) => {
    return await fetchAPI("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  // Получить заказы клиента
  getClientOrders: async () => {
    return await fetchAPI("/orders/client");
  },

  // Получить заказы повара
  getChefOrders: async () => {
    return await fetchAPI("/orders/chef");
  },

  // Получить заказ по ID
  getById: async (id) => {
    return await fetchAPI(`/orders/${id}`);
  },

  // Обновить статус заказа
  updateStatus: async (id, status) => {
    return await fetchAPI(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Отменить заказ
  cancel: async (id, reason) => {
    return await fetchAPI(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

// ============================================
// 💳 PAYMENTS API
// ============================================

export const paymentsAPI = {
  // Создать платеж
  create: async (paymentData) => {
    return await fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },

  // Получить статус платежа
  getStatus: async (paymentId) => {
    return await fetchAPI(`/payments/${paymentId}`);
  },

  // Вернуть платеж
  refund: async (paymentId, amount, reason) => {
    return await fetchAPI(`/payments/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify({ amount, reason }),
    });
  },
};

// ============================================
// 👨‍🍳 CHEFS API
// ============================================

export const chefsAPI = {
  // Получить всех поваров
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await fetchAPI(`/chefs${queryString ? "?" + queryString : ""}`);
  },

  // Получить повара по ID
  getById: async (id) => {
    return await fetchAPI(`/chefs/${id}`);
  },

  // Обновить профиль повара
  updateProfile: async (chefData) => {
    return await fetchAPI("/chefs/profile", {
      method: "PUT",
      body: JSON.stringify(chefData),
    });
  },
};

// ============================================
// 💬 REVIEWS API
// ============================================

export const reviewsAPI = {
  // Создать отзыв
  create: async (reviewData) => {
    return await fetchAPI("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  // Получить отзывы блюда
  getByDish: async (dishId) => {
    return await fetchAPI(`/dishes/${dishId}/reviews`);
  },

  // Получить отзывы повара
  getByChef: async (chefId) => {
    return await fetchAPI(`/chefs/${chefId}/reviews`);
  },
};

// ============================================
// 📊 ANALYTICS API
// ============================================

export const analyticsAPI = {
  // Получить статистику повара
  getChefStats: async () => {
    return await fetchAPI("/analytics/chef");
  },

  // Получить популярные блюда
  getPopularDishes: async (period = "7d") => {
    return await fetchAPI(`/analytics/popular-dishes?period=${period}`);
  },

  // Получить статистику заказов
  getOrderStats: async (startDate, endDate) => {
    return await fetchAPI(
      `/analytics/orders?start=${startDate}&end=${endDate}`
    );
  },
};

// ============================================
// 🔔 NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  // Получить уведомления
  getAll: async () => {
    return await fetchAPI("/notifications");
  },

  // Отметить как прочитанное
  markAsRead: async (notificationId) => {
    return await fetchAPI(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  // Отметить все как прочитанные
  markAllAsRead: async () => {
    return await fetchAPI("/notifications/read-all", {
      method: "PATCH",
    });
  },
};

// Export default для backward compatibility
export default {
  auth: authAPI,
  dishes: dishesAPI,
  orders: ordersAPI,
  payments: paymentsAPI,
  chefs: chefsAPI,
  reviews: reviewsAPI,
  analytics: analyticsAPI,
  notifications: notificationsAPI,
};
