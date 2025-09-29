// Утилиты для оптимизации производительности

// Функция для мемоизации результатов вычислений
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Функция для throttling (ограничение частоты вызовов)
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Функция для debouncing (задержка выполнения)
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
};

// Функция для виртуализации списков (упрощенная версия)
export const virtualizeList = (items, itemHeight, containerHeight, scrollTop) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight
  };
};

// Функция для оптимизации изображений
export const optimizeImage = (src, width, height, quality = 80) => {
  // В реальном приложении здесь была бы интеграция с CDN
  // или сервисом оптимизации изображений
  return `${src}?w=${width}&h=${height}&q=${quality}&f=webp`;
};

// Функция для предзагрузки ресурсов
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Функция для предзагрузки изображений
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Функция для измерения производительности
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Функция для очистки памяти
export const cleanupMemory = () => {
  if (window.gc) {
    window.gc();
  }
  
  // Очистка кешей
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};

// Функция для проверки производительности устройства
export const getDevicePerformance = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const memory = navigator.deviceMemory || 4; // Fallback to 4GB
  
  return {
    isSlowConnection: connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'),
    isLowMemory: memory < 4,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    connectionType: connection ? connection.effectiveType : 'unknown'
  };
};

// Функция для адаптивной загрузки контента
export const shouldLoadHeavyContent = () => {
  const performance = getDevicePerformance();
  return !performance.isSlowConnection && !performance.isLowMemory;
};
