import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const ChefSlotsCalendar = ({ chefId, onSlotsUpdate, onClose }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState({});
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    maxOrders: 10,
    priceMultiplier: 1.0,
    isActive: true
  });

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  useEffect(() => {
    loadSlots();
  }, [chefId]);

  const loadSlots = () => {
    try {
      const savedSlots = localStorage.getItem(`chef_slots_${chefId}`) || '{}';
      setSlots(JSON.parse(savedSlots));
    } catch (error) {
      console.error('Error loading slots:', error);
      setSlots({});
    }
  };

  const saveSlots = (updatedSlots) => {
    try {
      localStorage.setItem(`chef_slots_${chefId}`, JSON.stringify(updatedSlots));
      setSlots(updatedSlots);
      if (onSlotsUpdate) {
        onSlotsUpdate(updatedSlots);
      }
    } catch (error) {
      console.error('Error saving slots:', error);
      showError('Ошибка сохранения слотов');
    }
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Понедельник
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const toggleSlot = (date, timeSlot) => {
    const dateKey = getDateKey(date);
    const updatedSlots = { ...slots };
    
    if (!updatedSlots[dateKey]) {
      updatedSlots[dateKey] = {};
    }
    
    if (updatedSlots[dateKey][timeSlot]) {
      delete updatedSlots[dateKey][timeSlot];
    } else {
      updatedSlots[dateKey][timeSlot] = {
        startTime: timeSlot,
        endTime: getNextTimeSlot(timeSlot),
        maxOrders: 10,
        priceMultiplier: 1.0,
        isActive: true,
        currentOrders: 0
      };
    }
    
    saveSlots(updatedSlots);
  };

  const getNextTimeSlot = (currentSlot) => {
    const currentIndex = timeSlots.indexOf(currentSlot);
    return currentIndex < timeSlots.length - 1 ? timeSlots[currentIndex + 1] : '24:00';
  };

  const updateSlotSettings = (date, timeSlot, settings) => {
    const dateKey = getDateKey(date);
    const updatedSlots = { ...slots };
    
    if (updatedSlots[dateKey] && updatedSlots[dateKey][timeSlot]) {
      updatedSlots[dateKey][timeSlot] = {
        ...updatedSlots[dateKey][timeSlot],
        ...settings
      };
      saveSlots(updatedSlots);
    }
  };

  const copySlotsToWeek = () => {
    const weekDates = getWeekDates(selectedDate);
    const sourceDateKey = getDateKey(selectedDate);
    const sourceSlots = slots[sourceDateKey] || {};
    
    const updatedSlots = { ...slots };
    
    weekDates.forEach(date => {
      const dateKey = getDateKey(date);
      updatedSlots[dateKey] = { ...sourceSlots };
    });
    
    saveSlots(updatedSlots);
    showSuccess('Слоты скопированы на всю неделю!');
  };

  const clearDaySlots = (date) => {
    const dateKey = getDateKey(date);
    const updatedSlots = { ...slots };
    delete updatedSlots[dateKey];
    saveSlots(updatedSlots);
    showSuccess('Слоты дня очищены!');
  };

  const getSlotStatus = (date, timeSlot) => {
    const dateKey = getDateKey(date);
    const slot = slots[dateKey]?.[timeSlot];
    
    if (!slot) return 'inactive';
    if (!slot.isActive) return 'disabled';
    if (slot.currentOrders >= slot.maxOrders) return 'full';
    return 'active';
  };

  const getSlotColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'full': return '#FF9800';
      case 'disabled': return '#9E9E9E';
      default: return '#E0E0E0';
    }
  };

  const weekDates = getWeekDates(currentDate);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => {
              console.log('🔍 ChefSlotsCalendar - chefId:', chefId);
              console.log('🔍 ChefSlotsCalendar - onClose available:', !!onClose);
              
              if (onClose) {
                // Если есть функция onClose, используем её
                onClose();
              } else {
                // Иначе пытаемся навигацию
                try {
                  navigate(`/chef/${encodeURIComponent(chefId)}/menu`);
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  // Fallback to history back
                  window.history.back();
                }
              }
            }}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ← Назад
          </button>
          <h3 style={{ color: '#2D5016', margin: 0 }}>
            📅 Календарь слотов работы
          </h3>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            style={{
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 'bold'
            }}
            title="Инструкция по использованию"
          >
            ❓ Помощь
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ← Предыдущая неделя
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Сегодня
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Следующая неделя →
          </button>
        </div>
      </div>

      {/* Инструкции по использованию */}
      {showInstructions && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '2px solid #2196f3',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h4 style={{ color: '#1976d2', margin: 0, fontSize: '16px' }}>
              📖 Инструкция по использованию календаря слотов
            </h4>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1976d2' }}>🎯 Основная функция:</strong><br/>
              Планируйте когда вы будете доступны для приема заказов от клиентов.
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1976d2' }}>🖱️ Как использовать:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><strong>Клик по ячейке</strong> - включает/выключает слот для конкретного времени и дня</li>
                <li><strong>Навигация</strong> - используйте кнопки "Предыдущая неделя" и "Следующая неделя"</li>
                <li><strong>Копирование</strong> - нажмите "Копировать на неделю" чтобы скопировать слоты выбранного дня</li>
                <li><strong>Очистка</strong> - кнопка "Очистить день" удаляет все слоты выбранного дня</li>
              </ul>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1976d2' }}>🎨 Цветовая индикация:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>🟢 Зеленый</span> - Доступен для заказов</li>
                <li><span style={{ color: '#FF9800', fontWeight: 'bold' }}>🟠 Оранжевый</span> - Заполнен (достигнут лимит заказов)</li>
                <li><span style={{ color: '#9E9E9E', fontWeight: 'bold' }}>⚫ Серый</span> - Отключен поваром</li>
                <li><span style={{ color: '#E0E0E0', fontWeight: 'bold' }}>⚪ Белый</span> - Неактивен</li>
              </ul>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1976d2' }}>⚙️ Настройки слота:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><strong>Максимум заказов</strong> - лимит заказов в час (по умолчанию: 10)</li>
                <li><strong>Множитель цены</strong> - возможность увеличить цену в пиковые часы</li>
                <li><strong>Текущие заказы</strong> - счетчик принятых заказов (формат: текущие/максимум)</li>
              </ul>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#1976d2' }}>💡 Советы:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Планируйте слоты заранее на неделю вперед</li>
                <li>Устанавливайте реалистичные лимиты заказов</li>
                <li>Используйте повышение цен в пиковые часы</li>
                <li>Регулярно проверяйте статистику недели</li>
              </ul>
            </div>
            
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '12px',
              color: '#856404'
            }}>
              <strong>💾 Автосохранение:</strong> Все изменения сохраняются автоматически в браузере.
            </div>
          </div>
        </div>
      )}

      {/* Заголовок недели */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        gap: '5px',
        marginBottom: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>Время</div>
        {weekDates.map((date, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            {daysOfWeek[index]}
            <br />
            {date.getDate()}
          </div>
        ))}
      </div>

      {/* Сетка слотов */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        gap: '5px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {timeSlots.map(timeSlot => (
          <React.Fragment key={timeSlot}>
            {/* Время */}
            <div style={{
              padding: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#2D5016',
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {timeSlot}
            </div>
            
            {/* Слоты для каждого дня */}
            {weekDates.map((date, dayIndex) => {
              const status = getSlotStatus(date, timeSlot);
              const slot = slots[getDateKey(date)]?.[timeSlot];
              
              return (
                <div
                  key={`${timeSlot}-${dayIndex}`}
                  onClick={() => toggleSlot(date, timeSlot)}
                  style={{
                    padding: '8px',
                    fontSize: '10px',
                    textAlign: 'center',
                    background: getSlotColor(status),
                    color: status === 'inactive' ? '#666' : 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: selectedDate.getDate() === date.getDate() ? '2px solid #2D5016' : '1px solid transparent',
                    minHeight: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (status !== 'inactive') {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {slot && (
                    <>
                      <div style={{ fontWeight: 'bold' }}>
                        {slot.currentOrders}/{slot.maxOrders}
                      </div>
                      <div style={{ fontSize: '8px', opacity: 0.8 }}>
                        {slot.priceMultiplier > 1 ? `+${Math.round((slot.priceMultiplier - 1) * 100)}%` : ''}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Легенда */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Легенда:</div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#4CAF50', borderRadius: '2px' }}></div>
            <span>Доступен</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#FF9800', borderRadius: '2px' }}></div>
            <span>Заполнен</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#9E9E9E', borderRadius: '2px' }}></div>
            <span>Отключен</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#E0E0E0', borderRadius: '2px' }}></div>
            <span>Неактивен</span>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div style={{
        marginTop: '15px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={copySlotsToWeek}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          📋 Копировать на неделю
        </button>
        <button
          onClick={() => clearDaySlots(selectedDate)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🗑️ Очистить день
        </button>
      </div>

      {/* Статистика */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#e8f5e8',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📊 Статистика недели:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>Всего слотов:</span> {
              Object.values(slots).reduce((total, daySlots) => total + Object.keys(daySlots).length, 0)
            }
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Активных:</span> {
              Object.values(slots).reduce((total, daySlots) => 
                total + Object.values(daySlots).filter(slot => slot.isActive).length, 0
              )
            }
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Заполненных:</span> {
              Object.values(slots).reduce((total, daySlots) => 
                total + Object.values(daySlots).filter(slot => slot.currentOrders >= slot.maxOrders).length, 0
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefSlotsCalendar;
