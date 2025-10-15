/**
 * Компонент выбора времени доставки
 * 30-минутные слоты с динамическим ценообразованием
 * @author Food Delivery Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TimeSlotPicker = ({ onSelect, selectedSlot = null }) => {
  const { t } = useLanguage();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(selectedSlot);

  // Генерация временных слотов
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Начинаем с ближайшего получаса
    const startHour = currentMinute < 30 ? currentHour : currentHour + 1;
    const startMinute = currentMinute < 30 ? 30 : 0;
    
    // Генерируем слоты на следующие 48 часов
    for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
      for (let hour = dayOffset === 0 ? startHour : 0; hour < 24; hour++) {
        for (let minute = dayOffset === 0 && hour === startHour ? startMinute : 0; minute < 60; minute += 30) {
          if (dayOffset === 0 && hour === startHour && minute === startMinute && currentMinute >= 25) {
            continue; // Пропускаем слишком близкий слот
          }
          
          const slotDate = new Date(now);
          slotDate.setDate(slotDate.getDate() + dayOffset);
          slotDate.setHours(hour, minute, 0, 0);
          
          // Рассчитываем цену доставки
          const basePrice = 150; // Базовая цена
          let deliveryPrice = basePrice;
          
          // Пиковые часы (12:00-14:00, 18:00-21:00) - +50₽
          if ((hour >= 12 && hour < 14) || (hour >= 18 && hour < 21)) {
            deliveryPrice += 50;
          }
          
          // Ночные часы (22:00-06:00) - +100₽
          if (hour >= 22 || hour < 6) {
            deliveryPrice += 100;
          }
          
          // Выходные - +30₽
          if (slotDate.getDay() === 0 || slotDate.getDay() === 6) {
            deliveryPrice += 30;
          }
          
          // Срочная доставка (в течение часа) - +100₽
          const timeDiff = slotDate.getTime() - now.getTime();
          if (timeDiff < 3600000) { // 1 час
            deliveryPrice += 100;
          }
          
          slots.push({
            id: `${dayOffset}-${hour}-${minute}`,
            time: slotDate,
            displayTime: slotDate.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            displayDate: slotDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short'
            }),
            price: deliveryPrice,
            isToday: dayOffset === 0,
            isAvailable: true
          });
        }
      }
    }
    
    return slots.slice(0, 24); // Показываем первые 24 слота
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, []);

  const handleSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    onSelect(slot);
  };

  const formatSlotTime = (slot) => {
    if (slot.isToday) {
      return `Сегодня, ${slot.displayTime}`;
    } else {
      return `${slot.displayDate}, ${slot.displayTime}`;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: '#333',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        🕐 Выберите время доставки
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '5px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fafafa'
      }}>
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => handleSlotSelect(slot)}
            style={{
              padding: '12px 16px',
              border: selectedTimeSlot?.id === slot.id 
                ? '2px solid #4CAF50' 
                : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: selectedTimeSlot?.id === slot.id 
                ? '#E8F5E8' 
                : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              if (selectedTimeSlot?.id !== slot.id) {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.borderColor = '#bbb';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTimeSlot?.id !== slot.id) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#ddd';
              }
            }}
          >
            <div style={{ 
              fontWeight: '600', 
              color: '#333',
              fontSize: '15px'
            }}>
              {formatSlotTime(slot)}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ 
                color: '#666',
                fontSize: '12px'
              }}>
                {slot.isToday ? 'Сегодня' : 'Завтра'}
              </span>
              
              <span style={{ 
                color: '#4CAF50',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {slot.price}₽
              </span>
            </div>
            
            {/* Индикаторы особенностей */}
            <div style={{ 
              display: 'flex', 
              gap: '4px',
              marginTop: '4px'
            }}>
              {slot.price > 200 && (
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#FFE0B2',
                  color: '#E65100',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  Пик
                </span>
              )}
              
              {slot.price > 250 && (
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#FFCDD2',
                  color: '#C62828',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  Ночь
                </span>
              )}
              
              {slot.price === 150 && (
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#C8E6C9',
                  color: '#2E7D32',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  Стандарт
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedTimeSlot && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#E8F5E8',
          borderRadius: '8px',
          border: '1px solid #4CAF50'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              fontWeight: '600',
              color: '#2E7D32'
            }}>
              ✅ Выбрано: {formatSlotTime(selectedTimeSlot)}
            </span>
            <span style={{ 
              fontWeight: '600',
              color: '#2E7D32',
              fontSize: '16px'
            }}>
              {selectedTimeSlot.price}₽
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
