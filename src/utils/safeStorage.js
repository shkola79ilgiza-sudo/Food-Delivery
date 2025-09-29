// Утилита для безопасного сохранения данных в localStorage
export const safeSetClientOrders = (orders) => {
  try {
    // Ограничиваем количество заказов (оставляем последние 50)
    const limitedOrders = orders.slice(-50);
    localStorage.setItem('clientOrders', JSON.stringify(limitedOrders));
    return limitedOrders;
  } catch (error) {
    console.warn('localStorage quota exceeded, keeping only last 10 orders');
    // Если все еще не помещается, оставляем только последние 10 заказов
    const minimalOrders = orders.slice(-10);
    try {
      localStorage.setItem('clientOrders', JSON.stringify(minimalOrders));
      return minimalOrders;
    } catch (retryError) {
      console.error('Failed to save even minimal orders:', retryError);
      // В крайнем случае очищаем и оставляем только последний заказ
      const lastOrder = orders.slice(-1);
      localStorage.setItem('clientOrders', JSON.stringify(lastOrder));
      return lastOrder;
    }
  }
};

// Универсальная функция для безопасного сохранения любых данных
export const safeSetItem = (key, data, maxItems = 50) => {
  try {
    const limitedData = Array.isArray(data) ? data.slice(-maxItems) : data;
    localStorage.setItem(key, JSON.stringify(limitedData));
    return limitedData;
  } catch (error) {
    console.warn(`localStorage quota exceeded for ${key}, reducing size`);
    if (Array.isArray(data)) {
      const minimalData = data.slice(-10);
      try {
        localStorage.setItem(key, JSON.stringify(minimalData));
        return minimalData;
      } catch (retryError) {
        console.error(`Failed to save even minimal data for ${key}:`, retryError);
        const lastItem = data.slice(-1);
        localStorage.setItem(key, JSON.stringify(lastItem));
        return lastItem;
      }
    } else {
      // Для не-массивов просто очищаем ключ
      localStorage.removeItem(key);
      return null;
    }
  }
};
