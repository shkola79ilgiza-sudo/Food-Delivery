// Утилиты для расчета зоны доставки

/**
 * Рассчитывает расстояние между двумя точками по формуле гаверсинуса
 * @param {number} lat1 - Широта первой точки
 * @param {number} lon1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lon2 - Долгота второй точки
 * @returns {number} Расстояние в километрах
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Радиус Земли в километрах
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

/**
 * Проверяет, находится ли адрес клиента в зоне доставки повара
 * @param {string} chefAddress - Адрес кухни повара
 * @param {string} clientAddress - Адрес клиента
 * @param {number} maxDistance - Максимальное расстояние доставки в км (по умолчанию 5)
 * @returns {Promise<{inZone: boolean, distance: number, message: string}>}
 */
export const checkDeliveryZone = async (chefAddress, clientAddress, maxDistance = 5) => {
  try {
    // В реальном приложении здесь был бы вызов API геокодирования
    // Для демо используем случайные координаты
    const chefCoords = await geocodeAddress(chefAddress);
    const clientCoords = await geocodeAddress(clientAddress);
    
    const distance = calculateDistance(
      chefCoords.lat, 
      chefCoords.lon, 
      clientCoords.lat, 
      clientCoords.lon
    );
    
    const inZone = distance <= maxDistance;
    
    return {
      inZone,
      distance: Math.round(distance * 10) / 10,
      message: inZone 
        ? `Доставка возможна (${Math.round(distance * 10) / 10} км)`
        : `Доставка невозможна (${Math.round(distance * 10) / 10} км, максимум ${maxDistance} км)`
    };
  } catch (error) {
    console.error('Ошибка при проверке зоны доставки:', error);
    return {
      inZone: false,
      distance: 0,
      message: 'Ошибка при определении адресов'
    };
  }
};

/**
 * Получает координаты адреса (демо-функция)
 * В реальном приложении здесь был бы вызов Google Maps API или Yandex Maps API
 * @param {string} address - Адрес для геокодирования
 * @returns {Promise<{lat: number, lon: number}>}
 */
const geocodeAddress = async (address) => {
  // Демо-данные для Казани
  const demoCoords = {
    'казань': { lat: 55.8304, lon: 49.0661 },
    'центр': { lat: 55.7961, lon: 49.1064 },
    'ново-савиновский': { lat: 55.8500, lon: 49.1000 },
    'приволжский': { lat: 55.8000, lon: 49.2000 },
    'вахитовский': { lat: 55.7900, lon: 49.1200 },
    'московский': { lat: 55.8200, lon: 49.0800 },
    'кировский': { lat: 55.8400, lon: 49.1400 },
    'советский': { lat: 55.7800, lon: 49.1600 }
  };
  
  // Ищем совпадения в демо-данных
  const addressLower = address.toLowerCase();
  for (const [key, coords] of Object.entries(demoCoords)) {
    if (addressLower.includes(key)) {
      return coords;
    }
  }
  
  // Если не найдено, возвращаем случайные координаты в пределах Казани
  return {
    lat: 55.8304 + (Math.random() - 0.5) * 0.1,
    lon: 49.0661 + (Math.random() - 0.5) * 0.1
  };
};

/**
 * Получает список поваров в зоне доставки для клиента
 * @param {string} clientAddress - Адрес клиента
 * @param {Array} chefs - Массив поваров с адресами
 * @param {number} maxDistance - Максимальное расстояние в км
 * @returns {Promise<Array>} Массив поваров в зоне доставки
 */
export const getChefsInDeliveryZone = async (clientAddress, chefs, maxDistance = 5) => {
  const chefsInZone = [];
  
  for (const chef of chefs) {
    if (chef.kitchenAddress) {
      const zoneCheck = await checkDeliveryZone(chef.kitchenAddress, clientAddress, maxDistance);
      if (zoneCheck.inZone) {
        chefsInZone.push({
          ...chef,
          distance: zoneCheck.distance,
          deliveryMessage: zoneCheck.message
        });
      }
    }
  }
  
  // Сортируем по расстоянию (ближайшие первыми)
  return chefsInZone.sort((a, b) => a.distance - b.distance);
};

/**
 * Валидирует адрес кухни
 * @param {string} address - Адрес для валидации
 * @returns {Object} Результат валидации
 */
export const validateKitchenAddress = (address) => {
  if (!address || address.trim().length < 10) {
    return {
      isValid: false,
      message: 'Адрес должен содержать минимум 10 символов'
    };
  }
  
  // Проверяем наличие ключевых слов адреса
  const addressKeywords = ['улица', 'ул.', 'проспект', 'пр.', 'переулок', 'пер.', 'дом', 'д.', 'квартира', 'кв.'];
  const hasKeywords = addressKeywords.some(keyword => 
    address.toLowerCase().includes(keyword)
  );
  
  if (!hasKeywords) {
    return {
      isValid: false,
      message: 'Укажите более подробный адрес (улица, дом, квартира)'
    };
  }
  
  return {
    isValid: true,
    message: 'Адрес корректен'
  };
};
