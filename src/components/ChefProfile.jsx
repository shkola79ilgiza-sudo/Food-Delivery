import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import VerificationBadges from './VerificationBadges';
import ChefTiers from './ChefTiers';
import { getChefData } from '../api/adapter';
import '../App.css';

const ChefProfile = ({ onClose }) => {
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    avatar: '👨‍🍳',
    location: '',
    description: '',
    specialties: [],
    cuisines: [],
    dishes: [],
    priceCategory: 'Средняя',
    deliveryTime: '60-90 мин',
    workingHours: 'Пн-Пт 09:00-20:00',
    rating: 4.5,
    reviewsCount: 0,
    // Новые поля для выезда
    availableForTravel: false,
    travelRadius: 10, // км
    travelFee: 0, // базовая плата за выезд
    travelDiscount: 0, // скидка при заказе на сумму
    minOrderAmount: 1000, // минимальная сумма заказа для выезда
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    try {
      const savedProfile = localStorage.getItem('chefProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading chef profile:', error);
    }

    // Загружаем данные верификации повара
    const chefId = localStorage.getItem('chefEmail') || 'demo-chef';
    getChefData(chefId).then(chefData => {
      setProfile(prev => ({
        ...prev,
        ...chefData,
        // Сохраняем локальные настройки
        location: prev.location,
        description: prev.description,
        specialties: prev.specialties,
        cuisines: prev.cuisines,
        dishes: prev.dishes,
        priceCategory: prev.priceCategory,
        deliveryTime: prev.deliveryTime,
        workingHours: prev.workingHours,
        availableForTravel: prev.availableForTravel,
        travelRadius: prev.travelRadius,
        travelFee: prev.travelFee,
        travelDiscount: prev.travelDiscount,
        minOrderAmount: prev.minOrderAmount
      }));
    });
  };

  const saveProfile = () => {
    try {
      localStorage.setItem('chefProfile', JSON.stringify(profile));
      showSuccess('Профиль сохранен');
    } catch (error) {
      console.error('Error saving chef profile:', error);
      showError('Ошибка сохранения профиля');
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setProfile(prev => ({
      ...prev,
      [field]: items
    }));
  };

  return (
    <div className="chef-profile-overlay" onClick={onClose}>
      <div className="chef-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chef-profile-header">
          <h3>👨‍🍳 Настройки профиля повара</h3>
          <button onClick={onClose} className="back-button">✕</button>
        </div>

        <div className="chef-profile-content">
          <div className="profile-section">
            <h4>Основная информация</h4>
            <div className="form-group">
              <label>Имя повара:</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
            
            <div className="form-group">
              <label>Эмодзи аватар:</label>
              <input
                type="text"
                value={profile.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                placeholder="👨‍🍳"
              />
            </div>

            <div className="form-group">
              <label>Местоположение:</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Город, район"
              />
            </div>

            <div className="form-group">
              <label>Описание:</label>
              <textarea
                value={profile.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Расскажите о себе и своем опыте"
                rows={3}
              />
            </div>
          </div>

          {/* Бейджи верификации */}
          <div className="profile-section">
            <h4>Статус верификации</h4>
            <VerificationBadges chef={profile} showTooltips={true} />
          </div>

          {/* Тарифный план */}
          <div className="profile-section">
            <ChefTiers 
              chefId={localStorage.getItem('chefEmail') || 'demo-chef'}
              onTierChange={(tier, tierInfo) => {
                console.log('Tier changed:', tier, tierInfo);
                showSuccess(`Тариф обновлен на "${tierInfo.name}"`);
              }}
            />
          </div>

          <div className="profile-section">
            <h4>Специализация</h4>
            <div className="form-group">
              <label>Специализации (через запятую):</label>
              <input
                type="text"
                value={profile.specialties.join(', ')}
                onChange={(e) => handleArrayChange('specialties', e.target.value)}
                placeholder="Русская кухня, Выпечка, Домашние обеды"
              />
            </div>

            <div className="form-group">
              <label>Кухни (через запятую):</label>
              <input
                type="text"
                value={profile.cuisines.join(', ')}
                onChange={(e) => handleArrayChange('cuisines', e.target.value)}
                placeholder="Русская, Татарская, Европейская"
              />
            </div>

            <div className="form-group">
              <label>Популярные блюда (через запятую):</label>
              <input
                type="text"
                value={profile.dishes.join(', ')}
                onChange={(e) => handleArrayChange('dishes', e.target.value)}
                placeholder="Борщ, Пельмени, Пирожки"
              />
            </div>
          </div>

          <div className="profile-section">
            <h4>Услуги и цены</h4>
            <div className="form-group">
              <label>Ценовая категория:</label>
              <select
                value={profile.priceCategory}
                onChange={(e) => handleInputChange('priceCategory', e.target.value)}
              >
                <option value="Низкая">Низкая</option>
                <option value="Средняя">Средняя</option>
                <option value="Высокая">Высокая</option>
              </select>
            </div>

            <div className="form-group">
              <label>Время доставки:</label>
              <input
                type="text"
                value={profile.deliveryTime}
                onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                placeholder="60-90 мин"
              />
            </div>

            <div className="form-group">
              <label>Часы работы:</label>
              <input
                type="text"
                value={profile.workingHours}
                onChange={(e) => handleInputChange('workingHours', e.target.value)}
                placeholder="Пн-Пт 09:00-20:00"
              />
            </div>
          </div>

          <div className="profile-section">
            <h4>🚗 Выездные услуги</h4>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.availableForTravel}
                  onChange={(e) => handleInputChange('availableForTravel', e.target.checked)}
                />
                <span>Готов к выезду на дом</span>
              </label>
            </div>

            {profile.availableForTravel && (
              <>
                <div className="form-group">
                  <label>Радиус выезда (км):</label>
                  <input
                    type="number"
                    value={profile.travelRadius}
                    onChange={(e) => handleInputChange('travelRadius', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Базовая плата за выезд (₽):</label>
                  <input
                    type="number"
                    value={profile.travelFee}
                    onChange={(e) => handleInputChange('travelFee', parseInt(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Минимальная сумма заказа для выезда (₽):</label>
                  <input
                    type="number"
                    value={profile.minOrderAmount}
                    onChange={(e) => handleInputChange('minOrderAmount', parseInt(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Скидка при заказе от (₽):</label>
                  <input
                    type="number"
                    value={profile.travelDiscount}
                    onChange={(e) => handleInputChange('travelDiscount', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
              </>
            )}
          </div>

          <div className="profile-actions">
            <button onClick={saveProfile} className="save-btn">
              💾 Сохранить профиль
            </button>
            <button onClick={onClose} className="cancel-btn">
              ❌ Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;
