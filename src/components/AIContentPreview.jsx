/**
 * Компонент предпросмотра AI-контента перед публикацией
 * Позволяет редактировать и настраивать сгенерированный контент
 * @author Food Delivery Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const AIContentPreview = ({ 
  type, // 'menu', 'promo', 'photo'
  content, // Сгенерированный контент
  onEdit, // Функция редактирования
  onPublish, // Функция публикации
  onRegenerate, // Функция перегенерации
  onClose // Функция закрытия
}) => {
  const { t } = useLanguage();
  const { setToast } = useToast();
  
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedContent(content);
    setHasChanges(false);
  }, [content]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setEditedContent(editedContent);
    setIsEditing(false);
    setHasChanges(true);
    setToast({ type: 'success', message: '✅ Изменения сохранены!' });
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
    setToast({ type: 'info', message: 'Изменения отменены' });
  };

  const handlePublish = async () => {
    try {
      await onPublish(editedContent);
      setToast({ type: 'success', message: '🎉 Контент опубликован!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Ошибка публикации: ' + error.message });
    }
  };

  const handleRegenerate = async () => {
    try {
      await onRegenerate();
      setToast({ type: 'info', message: '🔄 Перегенерируем контент...' });
    } catch (error) {
      setToast({ type: 'error', message: 'Ошибка перегенерации: ' + error.message });
    }
  };

  const renderMenuPreview = () => (
    <div style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        🍽️ Предпросмотр праздничного меню
      </h3>
      
      {editedContent && (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* Заголовок меню */}
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>
              {editedContent.title || 'Праздничное меню'}
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              {editedContent.description || 'Специальное предложение'}
            </p>
          </div>

          {/* Блюда в меню */}
          <div style={{ padding: '20px' }}>
            {editedContent.dishes && editedContent.dishes.map((dish, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 0',
                borderBottom: index < editedContent.dishes.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {dish.name}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {dish.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#4CAF50',
                    fontSize: '16px'
                  }}>
                    {dish.price}₽
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Цена набора */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center',
            borderTop: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '5px' }}>
              Цена набора
            </div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#4CAF50'
            }}>
              {editedContent.totalPrice || '0'}₽
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPromoPreview = () => (
    <div style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        📱 Предпросмотр промо-текста
      </h3>
      
      {editedContent && (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* Превью для соцсетей */}
          <div style={{
            backgroundColor: '#1877f2',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {editedContent.text || 'Промо-текст'}
          </div>

          {/* Хештеги */}
          {editedContent.hashtags && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                Хештеги:
              </div>
              <div style={{ color: '#1877f2' }}>
                {editedContent.hashtags}
              </div>
            </div>
          )}

          {/* Email версия */}
          {editedContent.emailVersion && (
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                Email версия:
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                {editedContent.emailVersion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPhotoAnalysisPreview = () => (
    <div style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        📊 Предпросмотр анализа фото
      </h3>
      
      {editedContent && (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* Описание блюда */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
              Описание блюда
            </h4>
            <p style={{ margin: 0, lineHeight: '1.5' }}>
              {editedContent.description || 'Описание блюда'}
            </p>
          </div>

          {/* Ингредиенты */}
          {editedContent.ingredients && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                Ингредиенты
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {editedContent.ingredients.map((ingredient, index) => (
                  <span key={index} style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Пищевая ценность */}
          {editedContent.nutrition && (
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                Пищевая ценность
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#4CAF50' }}>
                    {editedContent.nutrition.calories || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>ккал</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#FF9800' }}>
                    {editedContent.nutrition.protein || 0}г
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>белок</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPreview = () => {
    switch (type) {
      case 'menu':
        return renderMenuPreview();
      case 'promo':
        return renderPromoPreview();
      case 'photo':
        return renderPhotoAnalysisPreview();
      default:
        return <div>Неизвестный тип контента</div>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            👁️ Предпросмотр AI-контента
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        {/* Предпросмотр контента */}
        {renderPreview()}

        {/* Кнопки действий */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <button
            onClick={handleRegenerate}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F57C00'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FF9800'}
          >
            🔄 Перегенерировать
          </button>
          
          <button
            onClick={isEditing ? handleSave : handleEdit}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: isEditing ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = isEditing ? '#45a049' : '#1976D2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = isEditing ? '#4CAF50' : '#2196F3'}
          >
            {isEditing ? '💾 Сохранить' : '✏️ Редактировать'}
          </button>
          
          {isEditing && (
            <button
              onClick={handleCancel}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
            >
              ❌ Отмена
            </button>
          )}
          
          <button
            onClick={handlePublish}
            disabled={isEditing}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: isEditing ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isEditing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isEditing) e.target.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              if (!isEditing) e.target.style.backgroundColor = '#4CAF50';
            }}
          >
            🚀 Опубликовать
          </button>
        </div>

        {/* Индикатор изменений */}
        {hasChanges && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e8f5e8',
            border: '1px solid #4CAF50',
            borderRadius: '5px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#2e7d32'
          }}>
            ✅ У вас есть несохраненные изменения
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContentPreview;
