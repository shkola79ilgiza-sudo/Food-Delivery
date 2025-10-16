// Утилита для безопасного сохранения данных в localStorage
export const safeSetClientOrders = (orders) => {
  try {
    // Проверяем валидность данных
    if (!Array.isArray(orders)) {
      console.error('safeSetClientOrders: orders must be an array');
      return [];
    }
    
    // Ограничиваем количество заказов (оставляем последние 50)
    const limitedOrders = orders.slice(-50);
    localStorage.setItem('clientOrders', JSON.stringify(limitedOrders));
    console.log('✅ Client orders saved successfully:', limitedOrders.length);
    return limitedOrders;
  } catch (error) {
    console.warn('localStorage quota exceeded, keeping only last 10 orders');
    // Если все еще не помещается, оставляем только последние 10 заказов
    const minimalOrders = orders.slice(-10);
    try {
      localStorage.setItem('clientOrders', JSON.stringify(minimalOrders));
      console.log('✅ Client orders saved with reduced size:', minimalOrders.length);
      return minimalOrders;
    } catch (retryError) {
      console.error('Failed to save even minimal orders:', retryError);
      // В крайнем случае очищаем и оставляем только последний заказ
      const lastOrder = orders.slice(-1);
      try {
        localStorage.setItem('clientOrders', JSON.stringify(lastOrder));
        console.log('✅ Client orders saved with minimal size:', lastOrder.length);
        return lastOrder;
      } catch (finalError) {
        console.error('Failed to save any orders:', finalError);
        localStorage.removeItem('clientOrders');
        return [];
      }
    }
  }
};

// Универсальная функция для безопасного сохранения любых данных
export const safeSetItem = (key, data, maxItems = 50) => {
  try {
    // Проверяем валидность ключа
    if (!key || typeof key !== 'string') {
      console.error('safeSetItem: key must be a non-empty string');
      return null;
    }
    
    const limitedData = Array.isArray(data) ? data.slice(-maxItems) : data;
    localStorage.setItem(key, JSON.stringify(limitedData));
    console.log(`✅ Data saved successfully for key: ${key}`);
    return limitedData;
  } catch (error) {
    console.warn(`localStorage quota exceeded for ${key}, reducing size`);
    if (Array.isArray(data)) {
      const minimalData = data.slice(-10);
      try {
        localStorage.setItem(key, JSON.stringify(minimalData));
        console.log(`✅ Data saved with reduced size for key: ${key}`);
        return minimalData;
      } catch (retryError) {
        console.error(`Failed to save even minimal data for ${key}:`, retryError);
        const lastItem = data.slice(-1);
        try {
          localStorage.setItem(key, JSON.stringify(lastItem));
          console.log(`✅ Data saved with minimal size for key: ${key}`);
          return lastItem;
        } catch (finalError) {
          console.error(`Failed to save any data for ${key}:`, finalError);
          localStorage.removeItem(key);
          return [];
        }
      }
    } else {
      // Для не-массивов просто очищаем ключ
      localStorage.removeItem(key);
      console.log(`❌ Removed key ${key} due to storage error`);
      return null;
    }
  }
};

// Функция для безопасного получения данных из localStorage
export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing data for key ${key}:`, error);
    // Очищаем поврежденные данные
    localStorage.removeItem(key);
    return defaultValue;
  }
};

// Функция для безопасного удаления данных из localStorage
export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    console.log(`✅ Data removed for key: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};
