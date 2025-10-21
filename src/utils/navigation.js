/**
 * 🔄 Navigation utility для работы с React Router вне компонентов
 * Используется в API файлах и утилитах
 */

// Глобальная переменная для хранения функции навигации
let navigateFunction = null;

// Функция для установки navigate функции из React Router
export const setNavigateFunction = (navigate) => {
  navigateFunction = navigate;
};

// Функция для навигации (используется в API файлах)
export const navigateTo = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback для случаев, когда navigate функция не установлена
    console.warn('Navigate function not set, using window.location.href as fallback');
    window.location.href = path;
  }
};

// Функция для получения текущего пути
export const getCurrentPath = () => {
  return window.location.pathname;
};

// Функция для проверки, находимся ли мы на определенном пути
export const isCurrentPath = (path) => {
  return getCurrentPath() === path;
};
