/**
 * Утилита для безопасного управления localStorage
 * Автоматически очищает старые данные при переполнении
 */

class StorageManager {
  constructor() {
    this.maxSize = 5 * 1024 * 1024; // 5 МБ (примерный лимит localStorage)
  }

  /**
   * Получить текущий размер localStorage в байтах
   */
  getCurrentSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Получить размер в читаемом формате
   */
  getReadableSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Проверить, заполнен ли localStorage более чем на X%
   */
  isAlmostFull(threshold = 80) {
    const currentSize = this.getCurrentSize();
    const percentFull = (currentSize / this.maxSize) * 100;
    return percentFull > threshold;
  }

  /**
   * Безопасное сохранение с автоматической очисткой
   */
  safeSetItem(key, value, onSuccess, onError) {
    try {
      localStorage.setItem(key, value);
      if (onSuccess) onSuccess();
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage переполнен!');
        console.log(`📊 Текущий размер: ${this.getReadableSize(this.getCurrentSize())}`);
        
        // Автоматическая очистка
        const cleaned = this.autoClean();
        
        if (cleaned) {
          // Пробуем сохранить снова
          try {
            localStorage.setItem(key, value);
            console.log('✅ Данные сохранены после очистки');
            if (onSuccess) onSuccess();
            return true;
          } catch (err) {
            console.error('❌ Не удалось сохранить даже после очистки');
            if (onError) onError(err);
            return false;
          }
        } else {
          if (onError) onError(e);
          return false;
        }
      } else {
        console.error('Ошибка сохранения в localStorage:', e);
        if (onError) onError(e);
        return false;
      }
    }
  }

  /**
   * Автоматическая очистка старых/больших данных
   */
  autoClean() {
    console.log('🧹 Начинаем автоматическую очистку localStorage...');
    
    // Приоритет удаления (от менее важного к более важному)
    const cleanupPriority = [
      'referenceObjects',    // Справочники (можно загрузить заново)
      'orderHistory',        // История заказов (старая)
      'clientOrders',        // Заказы клиента (старые)
      'dishes',              // Блюда (можно загрузить заново)
      'favorites',           // Избранное (менее критично)
      'deliveryInfo',        // Информация о доставке (можно ввести заново)
      'paymentInfo'          // Информация об оплате (можно ввести заново)
    ];
    
    let cleaned = false;
    const sizeBefore = this.getCurrentSize();
    
    for (const key of cleanupPriority) {
      if (localStorage.getItem(key)) {
        const itemSize = localStorage.getItem(key).length;
        localStorage.removeItem(key);
        console.log(`🗑️ Удалено: ${key} (${this.getReadableSize(itemSize)})`);
        cleaned = true;
        
        // Проверяем, достаточно ли места освободили
        const sizeAfter = this.getCurrentSize();
        const freed = sizeBefore - sizeAfter;
        
        if (freed > 1024 * 1024) { // Если освободили больше 1 МБ
          console.log(`✅ Освобождено: ${this.getReadableSize(freed)}`);
          break;
        }
      }
    }
    
    const sizeAfter = this.getCurrentSize();
    console.log(`📊 Размер после очистки: ${this.getReadableSize(sizeAfter)}`);
    
    return cleaned;
  }

  /**
   * Получить информацию о localStorage
   */
  getInfo() {
    const currentSize = this.getCurrentSize();
    const percentFull = (currentSize / this.maxSize) * 100;
    
    const items = [];
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        items.push({
          key,
          size: value.length,
          readableSize: this.getReadableSize(value.length)
        });
      }
    }
    
    // Сортируем по размеру (от большего к меньшему)
    items.sort((a, b) => b.size - a.size);
    
    return {
      totalSize: currentSize,
      readableSize: this.getReadableSize(currentSize),
      maxSize: this.maxSize,
      percentFull: percentFull.toFixed(2),
      itemsCount: items.length,
      items: items
    };
  }

  /**
   * Вывести информацию в консоль
   */
  logInfo() {
    const info = this.getInfo();
    console.log('📊 localStorage Info:');
    console.log(`   Размер: ${info.readableSize} / ${this.getReadableSize(info.maxSize)} (${info.percentFull}%)`);
    console.log(`   Элементов: ${info.itemsCount}`);
    console.log('   Топ-5 самых больших элементов:');
    info.items.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.key}: ${item.readableSize}`);
    });
  }

  /**
   * Полная очистка localStorage (осторожно!)
   */
  clearAll() {
    console.warn('⚠️ Полная очистка localStorage!');
    localStorage.clear();
    console.log('✅ localStorage очищен');
  }

  /**
   * Очистка только временных данных (безопасно)
   */
  clearTemp() {
    const tempKeys = [
      'referenceObjects',
      'orderHistory',
      'clientOrders',
      'dishes'
    ];
    
    tempKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Удалено: ${key}`);
      }
    });
    
    console.log('✅ Временные данные очищены');
  }
}

// Создаём глобальный экземпляр
const storageManager = new StorageManager();

// Экспортируем для использования в компонентах
export default storageManager;

// Добавляем в window для доступа из консоли (для отладки)
if (typeof window !== 'undefined') {
  window.storageManager = storageManager;
  console.log('💡 Доступ к storageManager через window.storageManager');
  console.log('   Команды:');
  console.log('   - storageManager.logInfo() - информация о localStorage');
  console.log('   - storageManager.clearTemp() - очистить временные данные');
  console.log('   - storageManager.clearAll() - полная очистка (осторожно!)');
}

