/**
 * Утилиты для безопасной аутентификации
 * Использует httpOnly cookies вместо localStorage
 * @author Food Delivery Team
 * @version 2.0.0
 */

/**
 * Безопасная отправка запросов с автоматическими cookies
 * @param {string} url - URL для запроса
 * @param {Object} options - Опции fetch
 * @returns {Promise<Response>}
 */
export const secureFetch = async (url, options = {}) => {
  const { headers, credentials, body, ...restOptions } = options;
  
  // Устанавливаем JSON Content-Type только если body не FormData и Content-Type не указан
  const shouldSetJsonHeader = !(body instanceof FormData) && 
    !headers?.['Content-Type'] && 
    !headers?.['content-type'];
  
  const mergedHeaders = {
    ...(shouldSetJsonHeader && { 'Content-Type': 'application/json' }),
    ...headers,
  };

  return fetch(url, {
    credentials: credentials ?? 'include', // Автоматически отправляем cookies
    body,
    ...restOptions,
    headers: mergedHeaders,
  });
};

/**
 * Получение информации о текущем пользователе
 * @returns {Promise<Object>} - Данные пользователя или null
 */
export const getCurrentUser = async () => {
  try {
    const response = await secureFetch('/api/auth/me');
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    return null;
  }
};

/**
 * Безопасный выход из системы
 * @returns {Promise<boolean>} - Успешность выхода
 */
export const secureLogout = async () => {
  try {
    const response = await secureFetch('/api/auth/logout', {
      method: 'POST',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Ошибка выхода из системы:', error);
    return false;
  }
};

/**
 * Проверка, аутентифицирован ли пользователь
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return user !== null;
};

/**
 * Получение роли пользователя
 * @returns {Promise<string|null>} - Роль пользователя или null
 */
export const getUserRole = async () => {
  const user = await getCurrentUser();
  return user?.role || null;
};

/**
 * Fallback для демо-режима (когда backend недоступен)
 * Проверяет наличие демо-токена в localStorage
 * @returns {Object|null} - Демо-пользователь или null
 */
export const getDemoUser = () => {
  try {
    const demoToken = localStorage.getItem('demoAuthToken');
    const demoUser = localStorage.getItem('demoUser');
    
    if (demoToken && demoUser) {
      return JSON.parse(demoUser);
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка получения демо-пользователя:', error);
    return null;
  }
};

/**
 * Установка демо-пользователя (для fallback режима)
 * @param {Object} user - Данные пользователя
 * @param {string} token - Демо-токен
 */
export const setDemoUser = (user, token) => {
  try {
    localStorage.setItem('demoUser', JSON.stringify(user));
    localStorage.setItem('demoAuthToken', token);
  } catch (error) {
    console.error('Ошибка сохранения демо-пользователя:', error);
  }
};

/**
 * Очистка демо-данных
 */
export const clearDemoUser = () => {
  try {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoAuthToken');
  } catch (error) {
    console.error('Ошибка очистки демо-данных:', error);
  }
};
