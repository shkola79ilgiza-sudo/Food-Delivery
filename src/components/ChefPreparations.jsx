import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const ChefPreparations = ({ onClose }) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [preparations, setPreparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreparation, setSelectedPreparation] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed, cancelled

  useEffect(() => {
    loadPreparations();
  }, []);

  const loadPreparations = () => {
    try {
      const savedPreparations = JSON.parse(localStorage.getItem('chefPreparations') || '[]');
      
      // Если нет заготовок, создаем демо-данные
      if (savedPreparations.length === 0) {
        const demoPreparations = [
          {
            id: 'demo-prep-1',
            clientName: 'Елена Смирнова',
            preparationType: 'Полуфабрикаты',
            items: [
              { name: 'Пельмени', quantity: 50, unit: 'шт', price: 800 },
              { name: 'Вареники с картошкой', quantity: 30, unit: 'шт', price: 600 },
              { name: 'Котлеты', quantity: 20, unit: 'шт', price: 1000 }
            ],
            totalPrice: 2400,
            deliveryDate: new Date(Date.now() + 172800000).toISOString(), // послезавтра
            deliveryTime: '14:00',
            contactPhone: '+7 (999) 555-12-34',
            address: 'ул. Мира, д. 15, кв. 8',
            specialRequests: 'Заморозить в отдельных пакетах',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-prep-2',
            clientName: 'Александр Козлов',
            preparationType: 'Заготовки на зиму',
            items: [
              { name: 'Лечо', quantity: 10, unit: 'банок', price: 1500 },
              { name: 'Аджика', quantity: 5, unit: 'банок', price: 800 },
              { name: 'Маринованные огурцы', quantity: 15, unit: 'банок', price: 1200 }
            ],
            totalPrice: 3500,
            deliveryDate: new Date(Date.now() + 259200000).toISOString(), // через 3 дня
            deliveryTime: '16:00',
            contactPhone: '+7 (999) 777-88-99',
            address: 'пр. Строителей, д. 42',
            specialRequests: 'Использовать только натуральные консерванты',
            status: 'in_progress',
            createdAt: new Date(Date.now() - 86400000).toISOString() // вчера
          },
          {
            id: 'demo-prep-3',
            clientName: 'Мария Волкова',
            preparationType: 'Готовые блюда',
            items: [
              { name: 'Борщ', quantity: 5, unit: 'порций', price: 750 },
              { name: 'Плов', quantity: 3, unit: 'порций', price: 900 },
              { name: 'Салат Оливье', quantity: 4, unit: 'порций', price: 600 }
            ],
            totalPrice: 2250,
            deliveryDate: new Date().toISOString(),
            deliveryTime: '12:00',
            contactPhone: '+7 (999) 333-44-55',
            address: 'ул. Садовая, д. 7, кв. 12',
            specialRequests: 'Доставить в термоконтейнерах',
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000).toISOString() // 2 дня назад
          }
        ];
        
        setPreparations(demoPreparations);
        localStorage.setItem('chefPreparations', JSON.stringify(demoPreparations));
      } else {
        setPreparations(savedPreparations);
      }
    } catch (error) {
      console.error('Error loading preparations:', error);
      showError('Ошибка загрузки заготовок');
    } finally {
      setLoading(false);
    }
  };

  const updatePreparationStatus = (preparationId, newStatus) => {
    try {
      const updatedPreparations = preparations.map(preparation => 
        preparation.id === preparationId 
          ? { ...preparation, status: newStatus, updatedAt: new Date().toISOString() }
          : preparation
      );
      
      setPreparations(updatedPreparations);
      localStorage.setItem('chefPreparations', JSON.stringify(updatedPreparations));

      // Отправляем уведомление клиенту
      const preparation = preparations.find(p => p.id === preparationId);
      if (preparation) {
        const clientNotification = {
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'preparation_update',
          title: getStatusText(newStatus),
          message: getStatusMessage(newStatus, preparation),
          preparationId: preparationId,
          orderId: preparationId,
          timestamp: new Date().toISOString(),
          read: false
        };

        const clientNotifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
        const updatedClientNotifications = [clientNotification, ...clientNotifications].slice(0, 50);
        localStorage.setItem('clientNotifications', JSON.stringify(updatedClientNotifications));

        window.dispatchEvent(new CustomEvent('clientNotificationAdded', { 
          detail: clientNotification 
        }));
        window.dispatchEvent(new CustomEvent('clientNotificationsUpdated'));
      }

      showSuccess(`Заготовка ${getStatusText(newStatus).toLowerCase()}`);
    } catch (error) {
      console.error('Error updating preparation status:', error);
      showError('Ошибка обновления статуса');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Готово',
      cancelled: 'Отменено'
    };
    return statusMap[status] || status;
  };

  const getStatusMessage = (status, preparation) => {
    const statusMessages = {
      pending: 'Ваш заказ на заготовки ожидает начала работы',
      in_progress: `Повар начал готовить ваши заготовки. Доставка ${new Date(preparation.deliveryDate).toLocaleDateString('ru-RU')} в ${preparation.deliveryTime}`,
      completed: 'Ваши заготовки готовы! Повар доставит их в указанное время',
      cancelled: 'К сожалению, заказ на заготовки был отменен'
    };
    return statusMessages[status] || 'Статус заказа обновлен';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  };

  const filteredPreparations = preparations.filter(preparation => {
    if (filter === 'all') return true;
    return preparation.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>Загрузка заготовок...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Декоративные элементы фона */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'rgba(168, 237, 234, 0.15)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      
      {/* Эмодзи элементы */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '30px',
        opacity: 0.3,
        zIndex: 0
      }}>🥘</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        fontSize: '25px',
        opacity: 0.3,
        zIndex: 0
      }}>👨‍🍳</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        fontSize: '28px',
        opacity: 0.3,
        zIndex: 0
      }}>🍽️</div>
      
      {/* Основной контент */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            marginBottom: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '15px 20px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
              }}
            >
              ← Назад
            </button>
            <h2 style={{ 
              margin: 0, 
              color: '#2c3e50',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              🥘 Заготовки и полуфабрикаты
            </h2>
          </div>
          
          {/* Фильтры */}
          <div style={{ 
            marginBottom: '20px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '15px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: '2px solid rgba(168, 237, 234, 0.3)',
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#2c3e50',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <option value="all">Все заготовки</option>
              <option value="pending">Ожидают</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Готовы</option>
              <option value="cancelled">Отменены</option>
            </select>
          </div>
        </div>

        {filteredPreparations.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px', 
            color: '#2c3e50',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>🥘</div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              Нет заказов на заготовки
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '16px', 
              opacity: 0.7,
              color: '#666'
            }}>
              Клиенты еще не заказывали заготовки и полуфабрикаты
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPreparations.map(preparation => (
              <div
                key={preparation.id}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>
                      {preparation.clientName}
                    </h3>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      📅 Доставка: {formatDate(preparation.deliveryDate)} в {preparation.deliveryTime}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: getStatusColor(preparation.status),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusText(preparation.status)}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px' }}>
                    <div><strong>🥘 Тип:</strong> {preparation.preparationType}</div>
                    <div><strong>💰 Сумма:</strong> {preparation.totalPrice} ₽</div>
                    <div><strong>📞 Телефон:</strong> {preparation.contactPhone}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#333' }}>Заказанные позиции:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {preparation.items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '4px 0',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        <span>{item.name}</span>
                        <span>{item.quantity} {item.unit} - {item.price} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>

                {preparation.specialRequests && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#333' }}>Особые пожелания:</strong>
                    <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                      {preparation.specialRequests}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Кнопка подробнее */}
                  <button
                    onClick={() => setSelectedPreparation(preparation)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    👁️ Подробнее
                  </button>

                  {preparation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updatePreparationStatus(preparation.id, 'in_progress')}
                        style={{
                          background: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        🔄 Начать работу
                      </button>
                      <button
                        onClick={() => updatePreparationStatus(preparation.id, 'cancelled')}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ❌ Отменить
                      </button>
                    </>
                  )}
                  {preparation.status === 'in_progress' && (
                    <button
                      onClick={() => updatePreparationStatus(preparation.id, 'completed')}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Завершить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно с деталями заготовки */}
        {selectedPreparation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Детали заготовки</h3>
                <button
                  onClick={() => setSelectedPreparation(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <strong>Клиент:</strong> {selectedPreparation.clientName}
                </div>
                <div>
                  <strong>Тип заготовки:</strong> {selectedPreparation.preparationType}
                </div>
                <div>
                  <strong>Дата и время доставки:</strong> {formatDate(selectedPreparation.deliveryDate)} в {selectedPreparation.deliveryTime}
                </div>
                <div>
                  <strong>Телефон:</strong> {selectedPreparation.contactPhone}
                </div>
                <div>
                  <strong>Адрес:</strong> {selectedPreparation.address}
                </div>
                <div>
                  <strong>Общая сумма:</strong> {selectedPreparation.totalPrice} ₽
                </div>
                <div>
                  <strong>Заказанные позиции:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {selectedPreparation.items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '4px 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span>{item.name}</span>
                        <span>{item.quantity} {item.unit} - {item.price} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedPreparation.specialRequests && (
                  <div>
                    <strong>Особые пожелания:</strong> {selectedPreparation.specialRequests}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedPreparation(null)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefPreparations;
