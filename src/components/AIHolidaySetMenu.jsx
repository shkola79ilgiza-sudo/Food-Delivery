/**
 * 🎄 AI-Конструктор Праздничных Сет-Меню (UI Компонент)
 * 
 * Позволяет поварам создавать готовые праздничные наборы
 * одним кликом с помощью AI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import aiHolidaySetMenuGenerator from '../utils/aiHolidaySetMenuGenerator';
import { useRateLimit } from '../utils/rateLimiter';

const AIHolidaySetMenu = ({ chefDishes, onSetCreated, onClose }) => {
  const { t } = useLanguage();
  const { setToast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState('');
  const [selectedType, setSelectedType] = useState('family');
  const [generatedSets, setGeneratedSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  
  // Ref для управления фокусом модального окна
  const dialogRef = useRef(null);
  
  // Rate limiting для AI генерации
  const { checkLimit, recordRequest, getTimeUntilReset } = useRateLimit('HOLIDAY_SET_MENU');

  useEffect(() => {
    // Загружаем предстоящие праздники
    const holidays = aiHolidaySetMenuGenerator.getCurrentMonthHolidays();
    setUpcomingHolidays(holidays);

    // Автоматически выбираем ближайший праздник
    const upcoming = aiHolidaySetMenuGenerator.getUpcomingHoliday();
    setSelectedHoliday(upcoming);
  }, []);
  
  // Фокус на модальном окне только при монтировании
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleGenerateSet = async () => {
    if (!selectedHoliday) {
      setToast({ type: 'error', message: 'Выберите праздник' });
      return;
    }

    // Проверяем rate limit
    const { allowed, remaining, resetTime } = checkLimit();
    
    if (!allowed) {
      const timeUntilReset = getTimeUntilReset(resetTime);
      setToast({ 
        type: 'error', 
        message: `Превышен лимит генерации (10/час). Попробуйте снова через ${timeUntilReset}.` 
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await aiHolidaySetMenuGenerator.generateHolidaySet(
        chefDishes,
        selectedHoliday,
        selectedType
      );

      if (result.success) {
        // Регистрируем успешный запрос
        recordRequest();
        setSelectedSet(result.set);
        setToast({ 
          type: 'success', 
          message: `✅ Сет-меню сгенерировано! Осталось запросов: ${remaining - 1}` 
        });
      } else {
        setToast({ type: 'error', message: result.error });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Ошибка генерации: ' + error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariants = async () => {
    if (!selectedHoliday) {
      setToast({ type: 'error', message: 'Выберите праздник' });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await aiHolidaySetMenuGenerator.generateMultipleVariants(
        chefDishes,
        selectedHoliday
      );

      if (result.success && result.variants.length > 0) {
        setGeneratedSets(result.variants);
        setToast({ type: 'success', message: `✅ Сгенерировано ${result.variants.length} вариантов!` });
      } else {
        setToast({ type: 'error', message: 'Не удалось создать варианты' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Ошибка: ' + error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSet = () => {
    if (!selectedSet) {
      setToast({ type: 'error', message: 'Сначала сгенерируйте набор' });
      return;
    }

    if (onSetCreated) {
      onSetCreated(selectedSet);
    }

    setToast({ type: 'success', message: '✅ Сет-меню сохранено!' });
    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div 
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        overflow: 'auto'
      }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose?.(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-holiday-setmenu-title"
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        ref={dialogRef}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 id="ai-holiday-setmenu-title" style={{ margin: 0, color: '#333' }}>
            AI-Конструктор Праздничных Сет-Меню
          </h2>
          {(() => {
            const { remaining, resetTime } = checkLimit();
            return (
              <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                <div>Осталось: {remaining}/10 запросов</div>
                {remaining < 3 && (
                  <div style={{ color: '#ff6b35' }}>
                    Лимит: {getTimeUntilReset(resetTime)}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            🎄 AI-Конструктор Праздничных Сет-Меню
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>

        {/* Информация */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            <strong>🤖 AI создаст готовый праздничный набор из ваших блюд!</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            <li>Автоматический подбор блюд под праздник</li>
            <li>Расчёт цены с оптимальной маржой</li>
            <li>Готовое продающее описание</li>
            <li>Расчёт КБЖУ на персону</li>
          </ul>
        </div>

        {/* Выбор праздника */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            🎉 Выберите праздник:
          </label>
          <select
            value={selectedHoliday}
            onChange={(e) => setSelectedHoliday(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Выберите праздник --</option>
            {Object.keys(aiHolidaySetMenuGenerator.holidays).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Подсказка о ближайших праздниках */}
          {upcomingHolidays.length > 0 && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              background: '#fff3cd',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              <strong>📅 Ближайшие праздники:</strong> {upcomingHolidays.map(h => h.name).join(', ')}
            </div>
          )}
        </div>

        {/* Выбор типа набора */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            👥 Выберите количество персон:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {Object.keys(aiHolidaySetMenuGenerator.setTypes).map(typeKey => {
              const typeData = aiHolidaySetMenuGenerator.setTypes[typeKey];
              const isSelected = selectedType === typeKey;

              return (
                <button
                  key={typeKey}
                  onClick={() => setSelectedType(typeKey)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #2196f3' : '2px solid #e0e0e0',
                    background: isSelected ? '#e3f2fd' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{typeData.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {typeData.persons} персон
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Кнопки генерации */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={handleGenerateSet}
            disabled={isGenerating || !selectedHoliday}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isGenerating || !selectedHoliday ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              opacity: isGenerating || !selectedHoliday ? 0.6 : 1
            }}
          >
            {isGenerating ? '🔄 Генерация...' : '🎁 Создать сет-меню'}
          </button>

          <button
            onClick={handleGenerateVariants}
            disabled={isGenerating || !selectedHoliday}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isGenerating || !selectedHoliday ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              opacity: isGenerating || !selectedHoliday ? 0.6 : 1
            }}
          >
            {isGenerating ? '🔄 Генерация...' : '🎲 3 варианта'}
          </button>
        </div>

        {/* Отображение сгенерированного набора */}
        {selectedSet && (
          <div style={{
            border: `3px solid ${selectedSet.color}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            background: `linear-gradient(135deg, ${selectedSet.color}15, ${selectedSet.color}05)`
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: selectedSet.color }}>
              {selectedSet.name}
            </h3>

            {/* Промо-текст */}
            <div style={{
              background: selectedSet.color,
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {selectedSet.promoText}
            </div>

            {/* Описание */}
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#555', marginBottom: '15px' }}>
              {selectedSet.description}
            </p>

            {/* Состав набора */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>📦 Состав набора:</h4>
              {selectedSet.dishes.map((dish, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  background: 'white',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div>
                    <strong>{dish.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {dish.portionsPerDish} порций
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: selectedSet.color }}>
                    {dish.price}₽
                  </div>
                </div>
              ))}
            </div>

            {/* Цены */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Обычная цена</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#999', textDecoration: 'line-through' }}>
                  {selectedSet.pricing.recommendedPrice}₽
                </div>
              </div>

              <div style={{
                padding: '15px',
                background: `linear-gradient(135deg, ${selectedSet.color}30, ${selectedSet.color}10)`,
                borderRadius: '8px',
                textAlign: 'center',
                border: `2px solid ${selectedSet.color}`
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  Праздничная цена (-{selectedSet.pricing.discount}%)
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: selectedSet.color }}>
                  {selectedSet.pricing.discountedPrice}₽
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                  Экономия: {selectedSet.pricing.savings}₽
                </div>
              </div>
            </div>

            {/* КБЖУ */}
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>🍽️ КБЖУ на персону:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '13px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                    {selectedSet.pricing.nutrition.perPerson.calories}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>ккал</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#4ecdc4' }}>
                    {selectedSet.pricing.nutrition.perPerson.protein}г
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>белки</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#ffe66d' }}>
                    {selectedSet.pricing.nutrition.perPerson.carbs}г
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>углеводы</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#a8e6cf' }}>
                    {selectedSet.pricing.nutrition.perPerson.fat}г
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>жиры</div>
                </div>
              </div>
            </div>

            {/* AI-рекомендации по оптимизации */}
            {(() => {
              const tips = aiHolidaySetMenuGenerator.generateOptimizationTips(selectedSet);
              if (tips.length === 0) return null;

              return (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>💡 AI-Рекомендации:</h4>
                  {tips.map((tip, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px',
                        background: tip.type === 'warning' ? '#fff3cd' : tip.type === 'info' ? '#d1ecf1' : '#d4edda',
                        borderLeft: `4px solid ${tip.type === 'warning' ? '#ffc107' : tip.type === 'info' ? '#17a2b8' : '#28a745'}`,
                        borderRadius: '4px',
                        marginBottom: '8px',
                        fontSize: '13px'
                      }}
                    >
                      {tip.message}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Теги */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedSet.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      background: `${selectedSet.color}20`,
                      color: selectedSet.color,
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Дедлайн заказа */}
            {selectedSet.validUntil && (
              <div style={{
                background: '#fff3cd',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ⏰ Последний день заказа: {selectedSet.validUntil}
              </div>
            )}
          </div>
        )}

        {/* Отображение нескольких вариантов */}
        {generatedSets.length > 0 && !selectedSet && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>🎲 Выберите вариант набора:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {generatedSets.map((set, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSet(set)}
                  style={{
                    border: `2px solid ${set.color}`,
                    borderRadius: '8px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: `${set.color}05`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${set.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: set.color, fontSize: '15px' }}>
                    {set.name}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                    {set.dishes.length} блюд • {set.persons} персон
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: set.color }}>
                    {set.pricing.discountedPrice}₽
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through' }}>
                    {set.pricing.recommendedPrice}₽
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#e0e0e0',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Отмена
          </button>

          {selectedSet && (
            <button
              onClick={handleSaveSet}
              style={{
                flex: 2,
                padding: '12px',
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✅ Сохранить набор
            </button>
          )}
        </div>

        {/* Информация о блюдах повара */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666',
          textAlign: 'center'
        }}>
          📊 Доступно блюд в меню: <strong>{chefDishes.length}</strong>
        </div>
      </div>
    </div>
  );
};

export default AIHolidaySetMenu;

