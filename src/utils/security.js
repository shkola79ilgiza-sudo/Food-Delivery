/**
 * Утилиты для безопасности
 * Валидация, санитизация, защита от XSS
 */

// Валидация email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация пароля
export const validatePassword = (password) => {
  // Минимум 8 символов, хотя бы одна буква и одна цифра
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// Валидация телефона
export const validatePhone = (phone) => {
  // Российский формат: +7XXXXXXXXXX
  const phoneRegex = /^\+7\d{10}$/;
  return phoneRegex.test(phone);
};

// Санитизация HTML (защита от XSS)
export const sanitizeHTML = (str) => {
  if (!str) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  
  const reg = /[&<>"'/]/ig;
  return str.replace(reg, (match) => map[match]);
};

// Санитизация ввода пользователя
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Удаляем опасные символы
  return input
    .trim()
    .replace(/[<>]/g, '') // Удаляем HTML теги
    .replace(/javascript:/gi, '') // Удаляем javascript:
    .replace(/on\w+=/gi, ''); // Удаляем обработчики событий
};

// Валидация URL
export const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    // Разрешаем только http и https
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Безопасное хранение токена (с шифрованием)
export const secureStorage = {
  // Простое XOR шифрование (для демонстрации)
  // В продакшене использовать crypto-js или Web Crypto API
  encrypt: (text, key = 'default-key') => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result); // Base64 encode
  },
  
  decrypt: (encrypted, key = 'default-key') => {
    try {
      const text = atob(encrypted); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch {
      return null;
    }
  },
  
  setItem: (key, value) => {
    const encrypted = secureStorage.encrypt(value);
    localStorage.setItem(key, encrypted);
  },
  
  getItem: (key) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return secureStorage.decrypt(encrypted);
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  }
};

// Проверка силы пароля
export const checkPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  const levels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный', 'Очень сильный'];
  
  return {
    score: strength,
    level: levels[Math.min(strength, 5)],
    isStrong: strength >= 4
  };
};

// Rate limiting на клиенте
export const rateLimiter = {
  attempts: {},
  
  // Проверить, можно ли выполнить действие
  canPerform: (action, maxAttempts = 5, windowMs = 60000) => {
    const now = Date.now();
    const key = action;
    
    if (!rateLimiter.attempts[key]) {
      rateLimiter.attempts[key] = [];
    }
    
    // Удалить старые попытки
    rateLimiter.attempts[key] = rateLimiter.attempts[key].filter(
      timestamp => now - timestamp < windowMs
    );
    
    // Проверить лимит
    if (rateLimiter.attempts[key].length >= maxAttempts) {
      return false;
    }
    
    // Добавить новую попытку
    rateLimiter.attempts[key].push(now);
    return true;
  },
  
  // Получить оставшееся время до следующей попытки
  getRetryAfter: (action, windowMs = 60000) => {
    const key = action;
    if (!rateLimiter.attempts[key] || rateLimiter.attempts[key].length === 0) {
      return 0;
    }
    
    const oldestAttempt = Math.min(...rateLimiter.attempts[key]);
    const retryAfter = windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, retryAfter);
  }
};

// Защита от CSRF
export const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Валидация данных формы
export const validateFormData = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    // Проверка обязательности
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} обязательно для заполнения`;
      return;
    }
    
    // Проверка минимальной длины
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} должно быть не менее ${rule.minLength} символов`;
      return;
    }
    
    // Проверка максимальной длины
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} должно быть не более ${rule.maxLength} символов`;
      return;
    }
    
    // Проверка email
    if (rule.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Неверный формат email';
      return;
    }
    
    // Проверка телефона
    if (rule.type === 'phone' && !validatePhone(value)) {
      errors[field] = 'Неверный формат телефона (+7XXXXXXXXXX)';
      return;
    }
    
    // Проверка пароля
    if (rule.type === 'password' && !validatePassword(value)) {
      errors[field] = 'Пароль должен содержать минимум 8 символов, буквы и цифры';
      return;
    }
    
    // Кастомная валидация
    if (rule.validate && !rule.validate(value)) {
      errors[field] = rule.message || `Неверное значение ${field}`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Пример использования:
/*
const formData = {
  email: 'test@test.com',
  password: 'password123',
  phone: '+79001234567'
};

const rules = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'password', minLength: 8 },
  phone: { required: true, type: 'phone' }
};

const { isValid, errors } = validateFormData(formData, rules);
if (!isValid) {
  console.log('Ошибки валидации:', errors);
}
*/

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  sanitizeHTML,
  sanitizeInput,
  validateURL,
  secureStorage,
  checkPasswordStrength,
  rateLimiter,
  generateCSRFToken,
  validateFormData
};

