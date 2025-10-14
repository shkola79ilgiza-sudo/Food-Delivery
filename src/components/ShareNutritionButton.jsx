import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const ShareNutritionButton = ({ dish }) => {
  const [showModal, setShowModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('myfitnesspal');

  // Обработка клавиши Escape для закрытия модального окна
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      // Предотвращаем скролл страницы когда модальное окно открыто
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  /**
   * Генерирует стандартизированный JSON для экспорта
   */
  const generateNutritionJSON = () => {
    // Проверяем, что dish существует
    if (!dish) {
      console.error('Dish object is undefined');
      return {
        name: 'Неизвестное блюдо',
        serving_size: 100,
        serving_unit: 'g',
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        ingredients: '',
        description: '',
        category: '',
        source: 'FoodDelivery App',
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
    }

    const baseData = {
      name: dish.name || 'Блюдо',
      serving_size: dish.weight || 100,
      serving_unit: 'g',
      calories: parseFloat(dish.calories) || 0,
      protein: parseFloat(dish.protein) || 0,
      carbohydrates: parseFloat(dish.carbs) || 0,
      fat: parseFloat(dish.fat) || 0,
      fiber: parseFloat(dish.fiber) || 0,
      sugar: parseFloat(dish.sugar) || 0,
      sodium: parseFloat(dish.sodium) || 0,
      // Дополнительные данные
      ingredients: dish.ingredients || '',
      description: dish.description || '',
      category: dish.category || '',
      // Метаданные
      source: 'FoodDelivery App',
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Форматы для разных приложений
    const formats = {
      myfitnesspal: {
        ...baseData,
        app: 'MyFitnessPal',
        format: 'mfp_v1'
      },
      yazio: {
        food_name: baseData.name,
        portion_size: baseData.serving_size,
        portion_unit: baseData.serving_unit,
        energy_kcal: baseData.calories,
        protein_g: baseData.protein,
        carbs_g: baseData.carbohydrates,
        fat_g: baseData.fat,
        fiber_g: baseData.fiber,
        sugar_g: baseData.sugar,
        sodium_mg: baseData.sodium,
        app: 'YAZIO',
        format: 'yazio_v1'
      },
      cronometer: {
        ...baseData,
        app: 'Cronometer',
        format: 'cronometer_v1'
      },
      universal: {
        ...baseData,
        app: 'Universal',
        format: 'universal_v1'
      }
    };

    return formats[selectedFormat] || formats.universal;
  };

  /**
   * Генерирует QR-код с данными
   */
  const generateQRCode = async (e) => {
    // Предотвращаем отправку формы
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const nutritionData = generateNutritionJSON();
      const jsonString = JSON.stringify(nutritionData);
      
      // Проверяем размер данных (QR-код имеет ограничения)
      if (jsonString.length > 2000) {
        // Если данные слишком большие, создаем сокращенную версию
        const shortData = {
          name: nutritionData.name,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbohydrates,
          fat: nutritionData.fat,
          source: 'FoodDelivery App'
        };
        const shortJsonString = JSON.stringify(shortData);
        
        const qrUrl = await QRCode.toDataURL(shortJsonString, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          width: 300,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeUrl(qrUrl);
        setShowModal(true);
      } else {
        // Генерируем QR-код с полными данными
        const qrUrl = await QRCode.toDataURL(jsonString, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          width: 300,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeUrl(qrUrl);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Ошибка генерации QR-кода:', error);
      
      // Fallback: показываем модальное окно без QR-кода
      setQrCodeUrl('');
      setShowModal(true);
      
      // Показываем уведомление об ошибке
      alert('⚠️ QR-код не удалось сгенерировать, но вы можете скачать JSON файл');
    }
  };

  /**
   * Скачивает JSON файл
   */
  const downloadJSON = () => {
    const nutritionData = generateNutritionJSON();
    const jsonString = JSON.stringify(nutritionData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrition-${dish?.name || 'dish'}-${selectedFormat}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Копирует JSON в буфер обмена
   */
  const copyToClipboard = async () => {
    try {
      const nutritionData = generateNutritionJSON();
      const jsonString = JSON.stringify(nutritionData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert('✅ Данные скопированы в буфер обмена!');
    } catch (error) {
      console.error('Ошибка копирования:', error);
      alert('❌ Не удалось скопировать данные');
    }
  };

  /**
   * Скачивает QR-код как изображение
   */
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `nutrition-qr-${dish?.name || 'dish'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Кнопка "Поделиться КБЖУ" */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          generateQRCode(e);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        }}
      >
        <span style={{ fontSize: '18px' }}>📊</span>
        <span>Поделиться КБЖУ</span>
      </button>

      {/* Модальное окно */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={(e) => {
            // Закрываем модальное окно только при клике на фон (не на содержимое)
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>📊</span>
                <span>Поделиться КБЖУ</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>

            {/* Выбор формата */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#555'
              }}>
                Выберите приложение:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {[
                  { id: 'myfitnesspal', name: 'MyFitnessPal', icon: '🍎' },
                  { id: 'yazio', name: 'YAZIO', icon: '🥗' },
                  { id: 'cronometer', name: 'Cronometer', icon: '📈' },
                  { id: 'universal', name: 'Универсальный', icon: '🌐' }
                ].map(format => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setSelectedFormat(format.id)}
                    style={{
                      padding: '12px',
                      background: selectedFormat === format.id 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#f5f5f5',
                      color: selectedFormat === format.id ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center'
                    }}
                  >
                    <span>{format.icon}</span>
                    <span>{format.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* QR-код */}
            {qrCodeUrl && (
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '20px',
                background: '#f9f9f9',
                borderRadius: '15px'
              }}>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '10px'
                  }}
                />
                <p style={{
                  marginTop: '15px',
                  fontSize: '12px',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  Отсканируйте QR-код в приложении {selectedFormat === 'myfitnesspal' ? 'MyFitnessPal' : selectedFormat === 'yazio' ? 'YAZIO' : selectedFormat === 'cronometer' ? 'Cronometer' : 'для трекинга питания'} для быстрого импорта данных
                </p>
              </div>
            )}

            {/* Кнопки действий */}
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={downloadQRCode}
                style={{
                  padding: '12px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#45a049'}
                onMouseLeave={(e) => e.target.style.background = '#4caf50'}
              >
                <span>⬇️</span>
                <span>Скачать QR-код</span>
              </button>

              <button
                type="button"
                onClick={downloadJSON}
                style={{
                  padding: '12px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#1976d2'}
                onMouseLeave={(e) => e.target.style.background = '#2196f3'}
              >
                <span>💾</span>
                <span>Скачать JSON</span>
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                style={{
                  padding: '12px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f57c00'}
                onMouseLeave={(e) => e.target.style.background = '#ff9800'}
              >
                <span>📋</span>
                <span>Копировать JSON</span>
              </button>
            </div>

            {/* Инструкция */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#e3f2fd',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#1976d2',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                💡 Как использовать:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Отсканируйте QR-код в приложении трекера</li>
                <li>Или скачайте JSON и импортируйте вручную</li>
                <li>Данные автоматически добавятся в ваш дневник питания</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareNutritionButton;

