import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const OrderLifecycleTest = () => {
  const { showSuccess, showError, showInfo } = useToast();
  
  const [testStep, setTestStep] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);

  const testSteps = [
    {
      id: 'create_order',
      name: 'Создание заказа',
      description: 'Клиент создает заказ с блюдами',
      action: createTestOrder
    },
    {
      id: 'chef_notification',
      name: 'Уведомление повара',
      description: 'Повар получает уведомление о новом заказе',
      action: testChefNotification
    },
    {
      id: 'chef_acceptance',
      name: 'Принятие заказа',
      description: 'Повар принимает заказ',
      action: testChefAcceptance
    },
    {
      id: 'cooking_start',
      name: 'Начало приготовления',
      description: 'Повар начинает готовить',
      action: testCookingStart
    },
    {
      id: 'cooking_timer',
      name: 'Таймер приготовления',
      description: 'Проверка таймера и SLA',
      action: testCookingTimer
    },
    {
      id: 'order_ready',
      name: 'Заказ готов',
      description: 'Повар отмечает заказ как готовый',
      action: testOrderReady
    },
    {
      id: 'delivery_start',
      name: 'Начало доставки',
      description: 'Курьер забирает заказ',
      action: testDeliveryStart
    },
    {
      id: 'order_delivered',
      name: 'Заказ доставлен',
      description: 'Клиент получает заказ',
      action: testOrderDelivered
    },
    {
      id: 'order_completed',
      name: 'Заказ завершен',
      description: 'Заказ помечается как выполненный',
      action: testOrderCompleted
    }
  ];

  // Создание тестового заказа
  function createTestOrder() {
    try {
      const testOrder = {
        id: `test-order-${Date.now()}`,
        clientId: 'test-client',
        clientName: 'Тестовый Клиент',
        chefId: 'test-chef',
        chefName: 'Тестовый Повар',
        items: [
          {
            id: 'test-dish-1',
            name: 'Тестовый Борщ',
            price: 350,
            quantity: 1,
            category: 'russian',
            cookingTime: 45
          },
          {
            id: 'test-dish-2',
            name: 'Тестовый Плов',
            price: 450,
            quantity: 1,
            category: 'tatar',
            cookingTime: 60
          }
        ],
        total: 800,
        subtotal: 800,
        deliveryFee: 150,
        deliveryCost: 150,
        discount: 0,
        status: 'pending_confirmation',
        createdAt: new Date().toISOString(),
        estimatedPreparationTime: 60,
        estimatedDeliveryTime: 30,
        deliveryAddress: 'Тестовый адрес, д. 1, кв. 1',
        clientPhone: '+7 (999) 123-45-67',
        comment: 'Тестовый заказ для проверки системы'
      };

      // Сохраняем заказ в localStorage
      const existingOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const updatedOrders = [testOrder, ...existingOrders];
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));
      
      setCurrentOrder(testOrder);
      setClientOrders(updatedOrders);
      
      return {
        success: true,
        message: 'Тестовый заказ создан успешно',
        data: testOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка создания заказа: ${error.message}`,
        error: error
      };
    }
  }

  // Тест уведомления повара
  function testChefNotification() {
    try {
      // Создаем уведомление для повара
      const notification = {
        id: `notification-${Date.now()}`,
        type: 'new_order',
        title: 'Новый заказ!',
        message: `Получен новый заказ #${currentOrder.id}`,
        orderId: currentOrder.id,
        chefId: currentOrder.chefId,
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'high'
      };

      // Сохраняем уведомление
      const existingNotifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      const updatedNotifications = [notification, ...existingNotifications];
      localStorage.setItem('chefNotifications', JSON.stringify(updatedNotifications));

      return {
        success: true,
        message: 'Повар получил уведомление о новом заказе',
        data: notification
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка уведомления: ${error.message}`,
        error: error
      };
    }
  }

  // Тест принятия заказа поваром
  function testChefAcceptance() {
    try {
      // Обновляем статус заказа
      const updatedOrder = {
        ...currentOrder,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        chefAcceptedAt: new Date().toISOString()
      };

      // Обновляем в localStorage
      const updatedOrders = clientOrders.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      );
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));

      setCurrentOrder(updatedOrder);
      setClientOrders(updatedOrders);

      return {
        success: true,
        message: 'Повар принял заказ',
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка принятия заказа: ${error.message}`,
        error: error
      };
    }
  }

  // Тест начала приготовления
  function testCookingStart() {
    try {
      const cookingStartTime = new Date().toISOString();
      const updatedOrder = {
        ...currentOrder,
        status: 'preparing',
        cookingStartTime: cookingStartTime,
        preparationStartTime: cookingStartTime,
        cookingDuration: currentOrder.estimatedPreparationTime || 60,
        updatedAt: new Date().toISOString()
      };

      // Обновляем в localStorage
      const updatedOrders = clientOrders.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      );
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));

      setCurrentOrder(updatedOrder);
      setClientOrders(updatedOrders);

      return {
        success: true,
        message: 'Повар начал приготовление',
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка начала приготовления: ${error.message}`,
        error: error
      };
    }
  }

  // Тест таймера приготовления
  function testCookingTimer() {
    try {
      if (!currentOrder.cookingStartTime) {
        throw new Error('Время начала приготовления не установлено');
      }

      const startTime = new Date(currentOrder.cookingStartTime);
      const now = new Date();
      const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60));
      const remainingMinutes = (currentOrder.cookingDuration || 60) - elapsedMinutes;

      // Проверяем SLA
      const slaThresholds = {
        preparation: 15, // минут отклонение
        total: 90 // минут общее время
      };

      const isOverdue = remainingMinutes <= 0;
      const isUrgent = remainingMinutes <= 10 && remainingMinutes > 0;
      const slaViolation = elapsedMinutes > (currentOrder.cookingDuration || 60) + slaThresholds.preparation;

      return {
        success: true,
        message: `Таймер работает: прошло ${elapsedMinutes} мин, осталось ${remainingMinutes} мин`,
        data: {
          elapsedMinutes,
          remainingMinutes,
          isOverdue,
          isUrgent,
          slaViolation,
          slaThresholds
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка таймера: ${error.message}`,
        error: error
      };
    }
  }

  // Тест готовности заказа
  function testOrderReady() {
    try {
      const updatedOrder = {
        ...currentOrder,
        status: 'ready',
        readyAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Обновляем в localStorage
      const updatedOrders = clientOrders.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      );
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));

      setCurrentOrder(updatedOrder);
      setClientOrders(updatedOrders);

      return {
        success: true,
        message: 'Заказ готов к выдаче',
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка готовности: ${error.message}`,
        error: error
      };
    }
  }

  // Тест начала доставки
  function testDeliveryStart() {
    try {
      const deliveryStartTime = new Date().toISOString();
      const updatedOrder = {
        ...currentOrder,
        status: 'in_delivery',
        deliveryStartTime: deliveryStartTime,
        courierId: 'test-courier',
        courierName: 'Тестовый Курьер',
        updatedAt: new Date().toISOString()
      };

      // Обновляем в localStorage
      const updatedOrders = clientOrders.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      );
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));

      setCurrentOrder(updatedOrder);
      setClientOrders(updatedOrders);

      return {
        success: true,
        message: 'Курьер забрал заказ',
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка доставки: ${error.message}`,
        error: error
      };
    }
  }

  // Тест доставки заказа
  function testOrderDelivered() {
    try {
      const deliveredAt = new Date().toISOString();
      const updatedOrder = {
        ...currentOrder,
        status: 'delivered',
        deliveredAt: deliveredAt,
        updatedAt: new Date().toISOString()
      };

      // Обновляем в localStorage
      const updatedOrders = clientOrders.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      );
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));

      setCurrentOrder(updatedOrder);
      setClientOrders(updatedOrders);

      return {
        success: true,
        message: 'Заказ доставлен клиенту',
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка доставки: ${error.message}`,
        error: error
      };
    }
  }

  // Тест завершения заказа
  function testOrderCompleted() {
    try {
      const completedAt = new Date().toISOString();
      const updatedOrder = {
        ...currentOrder,
        status: 'completed',
        completedAt: completedAt,
        updatedAt: new Date().toISOString()
      };

      // Обновляем в localStorage
      const updatedOrders = clientOrders.map(order => 
        order.id === currentOrder.id ? updatedOrder : order
      );
      localStorage.setItem('clientOrders', JSON.stringify(updatedOrders));

      setCurrentOrder(updatedOrder);
      setClientOrders(updatedOrders);

      return {
        success: true,
        message: 'Заказ успешно завершен',
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка завершения: ${error.message}`,
        error: error
      };
    }
  }

  // Запуск полного теста
  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setTestStep(0);

    showInfo('🧪 Начинаем полный тест жизненного цикла заказа...');

    for (let i = 0; i < testSteps.length; i++) {
      const step = testSteps[i];
      setTestStep(i + 1);
      
      try {
        showInfo(`⏳ Выполняем: ${step.name}...`);
        
        const result = await step.action();
        
        const testResult = {
          step: i + 1,
          name: step.name,
          description: step.description,
          success: result.success,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        };

        setTestResults(prev => [...prev, testResult]);

        if (result.success) {
          showSuccess(`✅ ${step.name}: ${result.message}`);
        } else {
          showError(`❌ ${step.name}: ${result.message}`);
          break; // Останавливаем тест при ошибке
        }

        // Небольшая задержка между шагами
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const testResult = {
          step: i + 1,
          name: step.name,
          description: step.description,
          success: false,
          message: `Критическая ошибка: ${error.message}`,
          error: error,
          timestamp: new Date().toISOString()
        };

        setTestResults(prev => [...prev, testResult]);
        showError(`💥 Критическая ошибка в ${step.name}: ${error.message}`);
        break;
      }
    }

    setIsRunning(false);
    
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    if (successCount === totalCount) {
      showSuccess(`🎉 Все тесты пройдены успешно! (${successCount}/${totalCount})`);
    } else {
      showError(`⚠️ Тесты завершены с ошибками: ${successCount}/${totalCount}`);
    }
  };

  // Очистка тестовых данных
  const clearTestData = () => {
    try {
      // Очищаем тестовые заказы
      const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const filteredOrders = orders.filter(order => !order.id.startsWith('test-order-'));
      localStorage.setItem('clientOrders', JSON.stringify(filteredOrders));

      // Очищаем тестовые уведомления
      const notifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      const filteredNotifications = notifications.filter(notif => !notif.id.startsWith('notification-'));
      localStorage.setItem('chefNotifications', JSON.stringify(filteredNotifications));

      setCurrentOrder(null);
      setClientOrders(filteredOrders);
      setTestResults([]);
      setTestStep(0);

      showSuccess('🧹 Тестовые данные очищены');
    } catch (error) {
      showError(`Ошибка очистки: ${error.message}`);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#2D5016', marginBottom: '20px' }}>
        🧪 Тест жизненного цикла заказа
      </h1>

      {/* Панель управления */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Управление тестом</h3>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={runFullTest}
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              background: isRunning ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isRunning ? '⏳ Тест выполняется...' : '🚀 Запустить полный тест'}
          </button>

          <button
            onClick={clearTestData}
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🧹 Очистить тестовые данные
          </button>
        </div>

        {isRunning && (
          <div style={{
            background: '#e3f2fd',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #2196f3'
          }}>
            <strong>Прогресс:</strong> {testStep} / {testSteps.length} шагов
            <div style={{
              width: '100%',
              height: '10px',
              background: '#e0e0e0',
              borderRadius: '5px',
              marginTop: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(testStep / testSteps.length) * 100}%`,
                height: '100%',
                background: '#2196f3',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Текущий заказ */}
      {currentOrder && (
        <div style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <h3 style={{ marginBottom: '10px' }}>📦 Текущий тестовый заказ</h3>
          <div style={{ fontSize: '14px' }}>
            <p><strong>ID:</strong> {currentOrder.id}</p>
            <p><strong>Статус:</strong> {currentOrder.status}</p>
            <p><strong>Клиент:</strong> {currentOrder.clientName}</p>
            <p><strong>Повар:</strong> {currentOrder.chefName}</p>
            <p><strong>Сумма:</strong> {currentOrder.total}₽</p>
            <p><strong>Блюда:</strong> {currentOrder.items.map(item => `${item.name} (${item.quantity}шт)`).join(', ')}</p>
            {currentOrder.cookingStartTime && (
              <p><strong>Начало приготовления:</strong> {new Date(currentOrder.cookingStartTime).toLocaleString()}</p>
            )}
            {currentOrder.readyAt && (
              <p><strong>Готов:</strong> {new Date(currentOrder.readyAt).toLocaleString()}</p>
            )}
            {currentOrder.deliveredAt && (
              <p><strong>Доставлен:</strong> {new Date(currentOrder.deliveredAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Результаты тестов */}
      {testResults.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '15px' }}>📊 Результаты тестов</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Общая статистика:</strong>
            <span style={{ marginLeft: '10px' }}>
              ✅ Успешно: {testResults.filter(r => r.success).length} / 
              ❌ Ошибок: {testResults.filter(r => !r.success).length} / 
              📊 Всего: {testResults.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: result.success ? '#d4edda' : '#f8d7da',
                  background: result.success ? '#d4edda' : '#f8d7da'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: result.success ? '#155724' : '#721c24' }}>
                      {result.success ? '✅' : '❌'} Шаг {result.step}: {result.name}
                    </strong>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#6c757d' }}>
                      {result.description}
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: result.success ? '#155724' : '#721c24' }}>
                      {result.message}
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                {result.data && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#6c757d' }}>
                      Показать данные
                    </summary>
                    <pre style={{
                      fontSize: '11px',
                      background: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px',
                      marginTop: '5px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Информация о тесте */}
      <div style={{
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '10px',
        marginTop: '20px',
        border: '1px solid #2196f3'
      }}>
        <h4 style={{ marginBottom: '10px' }}>ℹ️ Информация о тесте</h4>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Этот тест проверяет полный жизненный цикл заказа от создания до завершения.
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Проверяемые компоненты:</strong> Cart, ChefKanban, SLATimers, Notifications, localStorage
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Тестовые данные:</strong> Создаются автоматически и могут быть очищены
        </p>
      </div>
    </div>
  );
};

export default OrderLifecycleTest;
