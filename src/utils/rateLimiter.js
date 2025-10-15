/**
 * Rate Limiter для AI-функций
 * Защита от спама API и контроля расходов
 * @author Food Delivery Team
 * @version 1.0.0
 */

const RATE_LIMITS = {
  // AI генерация меню: 10 запросов в час
  HOLIDAY_SET_MENU: {
    requests: 10,
    window: 3600000, // 1 час в миллисекундах
    key: 'ai_holiday_set_menu'
  },
  
  // AI генерация промо: 15 запросов в час
  HOLIDAY_PROMO: {
    requests: 15,
    window: 3600000, // 1 час в миллисекундах
    key: 'ai_holiday_promo'
  },
  
  // AI анализ фото: 20 запросов в час
  PHOTO_ANALYSIS: {
    requests: 20,
    window: 3600000, // 1 час в миллисекундах
    key: 'ai_photo_analysis'
  }
};

/**
 * Получение данных о лимитах из localStorage
 * @param {string} key - Ключ для хранения данных
 * @returns {Object} - Данные о лимитах
 */
const getRateLimitData = (key) => {
  try {
    const data = localStorage.getItem(`rate_limit_${key}`);
    return data ? JSON.parse(data) : { requests: [], resetTime: Date.now() };
  } catch (error) {
    console.error('Ошибка получения данных rate limit:', error);
    return { requests: [], resetTime: Date.now() };
  }
};

/**
 * Сохранение данных о лимитах в localStorage
 * @param {string} key - Ключ для хранения данных
 * @param {Object} data - Данные для сохранения
 */
const setRateLimitData = (key, data) => {
  try {
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка сохранения данных rate limit:', error);
  }
};

/**
 * Проверка, можно ли выполнить запрос
 * @param {string} type - Тип AI-функции
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export const checkRateLimit = (type) => {
  const limit = RATE_LIMITS[type];
  
  if (!limit) {
    console.warn(`Неизвестный тип rate limit: ${type}`);
    return { allowed: true, remaining: Infinity, resetTime: null };
  }
  
  const now = Date.now();
  const data = getRateLimitData(limit.key);
  
  // Очищаем старые запросы
  const validRequests = data.requests.filter(timestamp => 
    now - timestamp < limit.window
  );
  
  // Проверяем лимит
  const remaining = limit.requests - validRequests.length;
  const allowed = remaining > 0;
  
  // Обновляем данные
  const updatedData = {
    requests: validRequests,
    resetTime: data.resetTime
  };
  
  setRateLimitData(limit.key, updatedData);
  
  return {
    allowed,
    remaining: Math.max(0, remaining),
    resetTime: data.resetTime + limit.window
  };
};

/**
 * Регистрация выполненного запроса
 * @param {string} type - Тип AI-функции
 */
export const recordRequest = (type) => {
  const limit = RATE_LIMITS[type];
  
  if (!limit) {
    console.warn(`Неизвестный тип rate limit: ${type}`);
    return;
  }
  
  const now = Date.now();
  const data = getRateLimitData(limit.key);
  
  // Добавляем новый запрос
  const updatedData = {
    requests: [...data.requests, now],
    resetTime: data.resetTime
  };
  
  setRateLimitData(limit.key, updatedData);
};

/**
 * Получение времени до сброса лимита в читаемом формате
 * @param {number} resetTime - Время сброса в миллисекундах
 * @returns {string} - Время в читаемом формате
 */
export const getTimeUntilReset = (resetTime) => {
  if (!resetTime) return '';
  
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff <= 0) return 'Сейчас';
  
  const minutes = Math.ceil(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}ч ${remainingMinutes}м`;
  } else {
    return `${minutes}м`;
  }
};

/**
 * Хук для использования rate limiting в React компонентах
 * @param {string} type - Тип AI-функции
 * @returns {Object} - { checkLimit: Function, recordRequest: Function, getTimeUntilReset: Function }
 */
export const useRateLimit = (type) => {
  const checkLimit = () => checkRateLimit(type);
  const recordLimitRequest = () => recordRequest(type);
  const formatTimeUntilReset = (resetTime) => getTimeUntilReset(resetTime);
  
  return {
    checkLimit,
    recordRequest: recordLimitRequest,
    getTimeUntilReset: formatTimeUntilReset
  };
};

/**
 * Декоратор для автоматической проверки rate limit
 * @param {string} type - Тип AI-функции
 * @param {Function} fn - Функция для выполнения
 * @returns {Function} - Обернутая функция с проверкой лимита
 */
export const withRateLimit = (type, fn) => {
  return async (...args) => {
    const { allowed, remaining, resetTime } = checkRateLimit(type);
    
    if (!allowed) {
      const timeUntilReset = getTimeUntilReset(resetTime);
      throw new Error(
        `Превышен лимит запросов для ${type}. Попробуйте снова через ${timeUntilReset}.`
      );
    }
    
    try {
      const result = await fn(...args);
      recordRequest(type);
      return result;
    } catch (error) {
      throw error;
    }
  };
};
