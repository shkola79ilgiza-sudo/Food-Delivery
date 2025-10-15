/**
 * 🖼️ AI-Генератор Праздничных Промо-Текстов (UI Компонент)
 * 
 * Создаёт продающие тексты для праздничных акций.
 */

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import aiHolidayPromoGenerator from '../utils/aiHolidayPromoGenerator';

const AIHolidayPromo = ({ dish, onPromoGenerated, onClose }) => {
  const { t } = useLanguage();
  const { setToast } = useToast();

  const [selectedHoliday, setSelectedHoliday] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promoVariants, setPromoVariants] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('texts'); // texts, social, email

  const holidays = Object.keys(aiHolidayPromoGenerator.emotionalTriggers);

  const handleGenerate = async () => {
    if (!selectedHoliday) {
      setToast({ type: 'error', message: 'Выберите праздник' });
      return;
    }

    setIsGenerating(true);

    try {
      // Генерируем полный маркетинговый пакет
      const result = aiHolidayPromoGenerator.generateFullMarketingKit(dish, selectedHoliday);

      if (result.success) {
        setPromoVariants(result);
        setToast({ type: 'success', message: '✅ Промо-тексты сгенерированы!' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Ошибка: ' + error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUsePromo = (variant) => {
    setSelectedVariant(variant);
    if (onPromoGenerated) {
      onPromoGenerated({
        headline: variant.headline,
        description: variant.description,
        cta: variant.cta
      });
    }
    setToast({ type: 'success', message: '✅ Промо-текст применён!' });
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ type: 'success', message: '📋 Скопировано в буфер обмена!' });
  };

  return (
    <div style={{
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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
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
            🖼️ AI-Генератор Промо-Текстов
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

        {/* Информация о блюде */}
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            📝 Блюдо: <strong>{dish.name || 'Без названия'}</strong>
          </h3>
          <div style={{ fontSize: '13px', color: '#666' }}>
            {dish.description || 'Описание отсутствует'}
          </div>
          {dish.price && (
            <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
              💰 {dish.price}₽
            </div>
          )}
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
            {holidays.map(name => (
              <option key={name} value={name}>
                {aiHolidayPromoGenerator.getEmoji(name)} {name}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопка генерации */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedHoliday}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isGenerating || !selectedHoliday ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            marginBottom: '20px',
            opacity: isGenerating || !selectedHoliday ? 0.6 : 1
          }}
        >
          {isGenerating ? '🔄 Генерация...' : '🤖 Сгенерировать промо-тексты'}
        </button>

        {/* Результаты */}
        {promoVariants && (
          <div>
            {/* Табы */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              {[
                { id: 'texts', label: '📝 Тексты', count: promoVariants.textVariants.length },
                { id: 'social', label: '📱 Соцсети', count: 3 },
                { id: 'email', label: '📧 Email', count: 1 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === tab.id ? '#2196f3' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#666',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #2196f3' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Контент табов */}
            {activeTab === 'texts' && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>
                  💬 Варианты промо-текстов:
                </h3>

                {/* AI-предсказание лучшего варианта */}
                {(() => {
                  const prediction = aiHolidayPromoGenerator.predictBestVariant(promoVariants.textVariants);
                  return (
                    <div style={{
                      background: '#e8f5e9',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      fontSize: '13px',
                      borderLeft: '4px solid #4caf50'
                    }}>
                      <strong>🎯 AI-рекомендация:</strong> {prediction.recommendation}
                    </div>
                  );
                })()}

                {promoVariants.textVariants.map((variant, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      background: selectedVariant === variant ? '#e3f2fd' : 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        background: '#2196f3',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        Вариант {variant.variant}
                      </span>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        {variant.length} символов
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#333' }}>
                      {variant.headline}
                    </h4>

                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', margin: '0 0 15px 0' }}>
                      {variant.description}
                    </p>

                    <div style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: '#4caf50',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      marginBottom: '15px'
                    }}>
                      {variant.cta}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleUsePromo(variant)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✅ Использовать
                      </button>

                      <button
                        onClick={() => handleCopyToClipboard(`${variant.headline}\n\n${variant.description}\n\n${variant.cta}`)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        📋 Копировать
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'social' && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>
                  📱 Тексты для соцсетей:
                </h3>

                {Object.keys(promoVariants.socialMedia).map(platform => {
                  const banner = promoVariants.socialMedia[platform];
                  
                  return (
                    <div
                      key={platform}
                      style={{
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '15px'
                      }}
                    >
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', textTransform: 'capitalize' }}>
                        {platform === 'instagram' && '📸 Instagram'}
                        {platform === 'facebook' && '👥 Facebook'}
                        {platform === 'vk' && '🔵 ВКонтакте'}
                      </h4>

                      <div style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {banner.text}
                      </div>

                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                        Длина: {banner.length} символов • Хештеги: {banner.hashtags.length}
                      </div>

                      <button
                        onClick={() => handleCopyToClipboard(banner.text)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        📋 Копировать для {platform}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'email' && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>
                  📧 Email-рассылка:
                </h3>

                <div style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                      Тема письма:
                    </label>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {promoVariants.email.subject}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                      Текст письма:
                    </label>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      {promoVariants.email.body}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard(`${promoVariants.email.subject}\n\n${promoVariants.email.body}`)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    📋 Копировать email-шаблон
                  </button>
                </div>

                {/* SMS и Push */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📱 SMS:</h4>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      marginBottom: '10px'
                    }}>
                      {promoVariants.sms}
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(promoVariants.sms)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📋 Копировать
                    </button>
                  </div>

                  <div style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🔔 Push:</h4>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      marginBottom: '10px'
                    }}>
                      <strong>{promoVariants.push.title}</strong>
                      <br />
                      {promoVariants.push.body}
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(`${promoVariants.push.title}\n${promoVariants.push.body}`)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#9c27b0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📋 Копировать
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Кнопка закрытия */}
        {!promoVariants && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#fff3cd',
            borderRadius: '8px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            💡 <strong>Совет:</strong> Выберите праздник и нажмите "Сгенерировать" для создания 3 вариантов промо-текстов + тексты для соцсетей + email-шаблон!
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHolidayPromo;

