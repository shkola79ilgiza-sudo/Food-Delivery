import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';

const ComplaintSystem = ({ orderId, chefId, onComplaintSubmitted }) => {
  const { showSuccess, showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  
  console.log('ComplaintSystem render - showForm:', showForm);
  console.log('ComplaintSystem render - orderId:', orderId, 'chefId:', chefId);

  // Эффект: блокируем скролл страницы при открытом модальном окне
  useEffect(() => {
    if (showForm) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous || 'auto';
      };
    }
  }, [showForm]);
  const [complaint, setComplaint] = useState({
    type: 'lowRisk',
    category: '',
    description: '',
    photos: [],
    contactInfo: '',
    resolutionPreference: 'refund'
  });

  const complaintCategories = {
    lowRisk: [
      { value: 'taste', label: 'Вкус не соответствует описанию' },
      { value: 'appearance', label: 'Внешний вид блюда' },
      { value: 'temperature', label: 'Температура подачи' },
      { value: 'portion', label: 'Размер порции' },
      { value: 'delivery_time', label: 'Время доставки' },
      { value: 'packaging', label: 'Упаковка' },
      { value: 'service', label: 'Качество обслуживания' }
    ],
    highRisk: [
      { value: 'food_poisoning', label: 'Пищевое отравление' },
      { value: 'foreign_object', label: 'Посторонний предмет в еде' },
      { value: 'spoiled_food', label: 'Испорченные продукты' },
      { value: 'allergic_reaction', label: 'Аллергическая реакция' },
      { value: 'hygiene', label: 'Нарушение санитарных норм' },
      { value: 'fraud', label: 'Мошенничество' }
    ]
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setComplaint(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const removePhoto = (photoId) => {
    setComplaint(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaint.category || !complaint.description.trim()) {
      showError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const complaintData = {
        id: `complaint-${Date.now()}`,
        orderId,
        chefId,
        type: complaint.type,
        category: complaint.category,
        description: complaint.description,
        photos: complaint.photos.map(photo => ({
          name: photo.name,
          size: photo.file.size,
          type: photo.file.type
        })),
        contactInfo: complaint.contactInfo,
        resolutionPreference: complaint.resolutionPreference,
        status: 'pending',
        createdAt: new Date().toISOString(),
        priority: complaint.type === 'highRisk' ? 'high' : 'normal'
      };

      // Сохраняем жалобу в localStorage
      const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      complaints.unshift(complaintData);
      localStorage.setItem('complaints', JSON.stringify(complaints));

      // Создаем уведомление для администратора
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      adminNotifications.unshift({
        id: `admin-notification-${Date.now()}`,
        type: 'complaint',
        title: `Новая жалоба ${complaint.type === 'highRisk' ? '(ВЫСОКИЙ РИСК)' : ''}`,
        message: `Жалоба от клиента: ${complaint.description.substring(0, 100)}...`,
        data: complaintData,
        createdAt: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));

      showSuccess('Жалоба отправлена! Мы рассмотрим её в течение 24 часов.');
      
      if (onComplaintSubmitted) {
        onComplaintSubmitted(complaintData);
      }
      
      setShowForm(false);
      setComplaint({
        type: 'lowRisk',
        category: '',
        description: '',
        photos: [],
        contactInfo: '',
        resolutionPreference: 'refund'
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showError('Ошибка при отправке жалобы');
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => {
          console.log('Complaint button clicked, setting showForm to true');
          setShowForm(true);
        }}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#c82333';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#dc3545';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        🚨 Подать жалобу
      </button>
    );
  }

  console.log('Rendering complaint form with showForm:', showForm);
  
  return (
    <>
      <style>
        {`
          .complaint-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.55) !important; /* dim overlay */
            z-index: 2147483647 !important;
            overflow: auto !important;
            isolation: isolate !important;
            contain: layout style paint !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            padding: 32px 16px !important;
            box-sizing: border-box !important;
          }
          
          .complaint-overlay * {
            isolation: isolate !important;
          }
          
          /* Убираем глобальное скрытие страницы; полагаемся на overlay */
        `}
      </style>
    {createPortal(
      <div 
        className="complaint-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.55)',
          zIndex: 2147483647,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
      {/* Основной контейнер модального окна */}
      <div style={{
        background: 'linear-gradient(135deg, #e8f4fd, #f0f8ff)',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        zIndex: 1000000
      }}>
        {/* Заголовок с кнопкой назад */}
        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          borderBottom: '1px solid rgba(44, 62, 80, 0.1)'
        }}>
        <button
          onClick={() => {
            console.log('Back button clicked, setting showForm to false');
            setShowForm(false);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#000',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '10px 15px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          ← Назад
        </button>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            flex: 1
          }}>
            🚨 Подача жалобы
          </h2>
        </div>
        </div>
        
        {/* Содержимое формы */}
        <div style={{
          padding: '24px'
        }}>

        {/* Форма */}
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* Тип жалобы */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Тип жалобы:
            </label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="lowRisk"
                  checked={complaint.type === 'lowRisk'}
                  onChange={(e) => setComplaint(prev => ({ ...prev, type: e.target.value, category: '' }))}
                />
                <span style={{ fontSize: '14px' }}>🟡 Обычная жалоба</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="highRisk"
                  checked={complaint.type === 'highRisk'}
                  onChange={(e) => setComplaint(prev => ({ ...prev, type: e.target.value, category: '' }))}
                />
                <span style={{ fontSize: '14px', color: '#dc3545', fontWeight: 'bold' }}>🔴 Критическая жалоба</span>
              </label>
            </div>
          </div>

          {/* Категория */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Категория жалобы: *
            </label>
            <select
              value={complaint.category}
              onChange={(e) => setComplaint(prev => ({ ...prev, category: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                transition: 'border-color 0.3s ease'
              }}
              required
            >
              <option value="">Выберите категорию</option>
              {complaintCategories[complaint.type].map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Описание */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Описание проблемы: *
            </label>
            <textarea
              value={complaint.description}
              onChange={(e) => setComplaint(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Подробно опишите проблему..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                minHeight: '80px',
                resize: 'vertical',
                transition: 'border-color 0.3s ease'
              }}
              required
            />
          </div>

          {/* Фото */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Фотографии (необязательно):
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px dashed #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            
            {complaint.photos.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {complaint.photos.map(photo => (
                  <div key={photo.id} style={{ position: 'relative' }}>
                    <img
                      src={photo.preview}
                      alt={photo.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Контактная информация */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333'
            }}>
              Контактная информация:
            </label>
            <input
              type="text"
              value={complaint.contactInfo}
              onChange={(e) => setComplaint(prev => ({ ...prev, contactInfo: e.target.value }))}
              placeholder="Телефон или email для связи"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          {/* Предпочтение по решению */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333'
            }}>
              Предпочтительное решение:
            </label>
            <select
              value={complaint.resolutionPreference}
              onChange={(e) => setComplaint(prev => ({ ...prev, resolutionPreference: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            >
              <option value="refund">Полный возврат средств</option>
              <option value="partial_refund">Частичный возврат</option>
              <option value="replacement">Замена блюда</option>
              <option value="bonus">Бонус на следующий заказ</option>
              <option value="apology">Извинения</option>
            </select>
          </div>

          {/* Кнопки */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '2px solid #e9ecef'
          }}>
            <button
              type="button"
              onClick={() => {
                console.log('Cancel button clicked, setting showForm to false');
                setShowForm(false);
              }}
              style={{
                background: 'linear-gradient(135deg, #6c757d, #495057)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(108, 117, 125, 0.3)'
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              style={{
                background: complaint.type === 'highRisk' ? 'linear-gradient(135deg, #dc3545, #c82333)' : 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: complaint.type === 'highRisk' ? '0 4px 8px rgba(220, 53, 69, 0.3)' : '0 4px 8px rgba(40, 167, 69, 0.3)'
              }}
            >
              {complaint.type === 'highRisk' ? '🚨 Отправить критическую жалобу' : '📝 Отправить жалобу'}
            </button>
          </div>
        </form>
        </div>
      </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default ComplaintSystem;
