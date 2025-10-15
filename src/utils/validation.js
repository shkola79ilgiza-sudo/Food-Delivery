/**
 * Утилиты для валидации данных в Food Delivery приложении
 * @author Food Delivery Team
 * @version 1.1.0
 */

/**
 * Валидация email адреса
 * @param {string} email - Email для валидации
 * @returns {boolean} - true если email валидный
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Валидация пароля
 * @param {string} password - Пароль для валидации
 * @returns {object} - Объект с результатом валидации
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    errors: []
  };
  
  if (!password || typeof password !== 'string') {
    result.errors.push('Пароль обязателен');
    return result;
  }
  
  if (password.length < 6) {
    result.errors.push('Пароль должен содержать минимум 6 символов');
  }
  
  if (password.length > 128) {
    result.errors.push('Пароль не должен превышать 128 символов');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    result.errors.push('Пароль должен содержать хотя бы одну букву');
  }
  
  if (!/\d/.test(password)) {
    result.errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  
  result.isValid = result.errors.length === 0;
  return result;
};

/**
 * Валидация телефона
 * @param {string} phone - Номер телефона для валидации
 * @returns {boolean} - true если номер валидный
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Убираем все символы кроме цифр
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Проверяем длину (от 10 до 15 цифр)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Валидация цены блюда
 * @param {number} price - Цена для валидации
 * @returns {boolean} - true если цена валидная
 */
export const validatePrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return false;
  }
  
  return price > 0 && price <= 10000; // Максимум 10000 рублей
};

/**
 * Валидация названия блюда
 * @param {string} name - Название для валидации
 * @returns {boolean} - true если название валидное
 */
export const validateDishName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
};

/**
 * Валидация описания блюда
 * @param {string} description - Описание для валидации
 * @returns {boolean} - true если описание валидное
 */
export const validateDishDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return false;
  }
  
  const trimmedDescription = description.trim();
  return trimmedDescription.length >= 10 && trimmedDescription.length <= 500;
};

/**
 * Валидация корзины покупок
 * @param {Array} cart - Корзина для валидации
 * @returns {Object} - { isValid: boolean, errors: Array<string> }
 */
export const validateCart = (cart) => {
  const errors = [];
  
  if (!Array.isArray(cart)) {
    errors.push('Корзина должна быть массивом');
    return { isValid: false, errors };
  }
  
  if (cart.length === 0) {
    errors.push('Корзина пуста');
    return { isValid: false, errors };
  }
  
  // Проверяем на дублированные IDs
  const ids = cart.map(item => item.id).filter(Boolean);
  const uniqueIds = [...new Set(ids)];
  
  if (ids.length !== uniqueIds.length) {
    errors.push('Обнаружены дублированные ID в корзине');
  }
  
  // Проверяем каждый элемент корзины
  cart.forEach((item, index) => {
    if (!item.id) {
      errors.push(`Элемент ${index + 1}: отсутствует ID`);
    }
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`Элемент ${index + 1}: неверное название`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Элемент ${index + 1}: неверное количество`);
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      errors.push(`Элемент ${index + 1}: неверная цена`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Валидация массива блюд на дублированные ID
 * @param {Array} dishes - Массив блюд для валидации
 * @returns {Object} - { isValid: boolean, duplicates: Array<string> }
 */
export const validateDishesForDuplicates = (dishes) => {
  if (!Array.isArray(dishes)) {
    return { isValid: false, duplicates: [] };
  }
  
  const ids = dishes.map(dish => dish.id).filter(Boolean);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  return {
    isValid: duplicates.length === 0,
    duplicates: [...new Set(duplicates)]
  };
};