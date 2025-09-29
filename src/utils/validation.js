// Утилиты для валидации данных

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

export const validateDishData = (dishData) => {
  const errors = {};
  
  if (!validateRequired(dishData.name)) {
    errors.name = 'Название блюда обязательно';
  } else if (!validateMinLength(dishData.name, 2)) {
    errors.name = 'Название должно содержать минимум 2 символа';
  }
  
  if (!validateRequired(dishData.description)) {
    errors.description = 'Описание блюда обязательно';
  } else if (!validateMinLength(dishData.description, 10)) {
    errors.description = 'Описание должно содержать минимум 10 символов';
  }
  
  if (!validateRequired(dishData.price)) {
    errors.price = 'Цена обязательна';
  } else if (!validateNumber(dishData.price, 0.01, 10000)) {
    errors.price = 'Цена должна быть от 0.01 до 10000';
  }
  
  if (!validateRequired(dishData.category)) {
    errors.category = 'Категория обязательна';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateOrderData = (orderData) => {
  const errors = {};
  
  if (!validateRequired(orderData.customerName)) {
    errors.customerName = 'Имя получателя обязательно';
  }
  
  if (!validateRequired(orderData.customerPhone)) {
    errors.customerPhone = 'Телефон обязателен';
  } else if (!validatePhone(orderData.customerPhone)) {
    errors.customerPhone = 'Неверный формат телефона';
  }
  
  if (!validateRequired(orderData.deliveryAddress)) {
    errors.deliveryAddress = 'Адрес доставки обязателен';
  }
  
  if (!validateRequired(orderData.deliveryTime)) {
    errors.deliveryTime = 'Время доставки обязательно';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Удаляем потенциально опасные символы
    .substring(0, 1000); // Ограничиваем длину
};

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  
  return phone;
};
