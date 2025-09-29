import React, { useState } from 'react';

const MasterClassRequest = ({ dish, onClose, onRequestSubmit }) => {
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '',
    numberOfParticipants: '',
    skillLevel: '',
    dietaryRestrictions: '',
    specialRequests: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    groupType: '',
    ageGroup: '',
    languagePreference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const requestData = {
        dishId: dish.id,
        chefId: dish.chefId,
        ...formData,
        type: 'master_class',
        estimatedTime: dish.estimatedTime,
        minOrderValue: dish.minOrderValue,
        maxParticipants: dish.maxParticipants,
        difficulty: dish.difficulty,
        cuisine: dish.cuisine,
        includesIngredients: dish.includesIngredients,
        includesRecipe: dish.includesRecipe,
        includesCertificate: dish.includesCertificate,
        isBaking: dish.isBaking,
        isBasic: dish.isBasic,
        isEastern: dish.isEastern
      };
      
      await onRequestSubmit(requestData);
      onClose();
    } catch (error) {
      console.error('Error submitting master class request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="master-class-modal">
      <div className="master-class-overlay" onClick={onClose}>
        <div className="master-class-content" onClick={(e) => e.stopPropagation()}>
          <div className="master-class-header">
            <h2>🎓 {dish.name}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="master-class-body">
            <p className="dish-description">{dish.description}</p>
            
            <form onSubmit={handleSubmit} className="master-class-form">
              {/* Основная информация о мастер-классе */}
              <div className="form-section">
                <h3>📅 Информация о мастер-классе</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>📅 Предпочтительная дата</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>⏰ Предпочтительное время</label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>👥 Количество участников</label>
                    <input
                      type="number"
                      name="numberOfParticipants"
                      value={formData.numberOfParticipants}
                      onChange={handleInputChange}
                      min="1"
                      max={dish.maxParticipants || 20}
                      required
                    />
                    <small>Максимум: {dish.maxParticipants || 20} участников</small>
                  </div>
                  
                  <div className="form-group">
                    <label>🎯 Уровень навыков</label>
                    <select
                      name="skillLevel"
                      value={formData.skillLevel}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Выберите уровень</option>
                      <option value="beginner">Начинающий</option>
                      <option value="intermediate">Средний</option>
                      <option value="advanced">Продвинутый</option>
                      <option value="mixed">Смешанный</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Детали группы */}
              <div className="form-section">
                <h3>👥 Детали группы</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>👨‍👩‍👧‍👦 Тип группы</label>
                    <select
                      name="groupType"
                      value={formData.groupType}
                      onChange={handleInputChange}
                    >
                      <option value="">Выберите тип</option>
                      <option value="friends">Друзья</option>
                      <option value="family">Семья</option>
                      <option value="couple">Пара</option>
                      <option value="corporate">Корпоратив</option>
                      <option value="individual">Индивидуально</option>
                      <option value="children">Детская группа</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>👶 Возрастная группа</label>
                    <select
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Выберите возраст</option>
                      <option value="children">Дети (6-12 лет)</option>
                      <option value="teens">Подростки (13-17 лет)</option>
                      <option value="adults">Взрослые (18+ лет)</option>
                      <option value="seniors">Пожилые (60+ лет)</option>
                      <option value="mixed">Смешанная группа</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>🗣️ Язык проведения</label>
                  <select
                    name="languagePreference"
                    value={formData.languagePreference}
                    onChange={handleInputChange}
                  >
                    <option value="">Выберите язык</option>
                    <option value="russian">Русский</option>
                    <option value="tatar">Татарский</option>
                    <option value="english">Английский</option>
                    <option value="mixed">Смешанный</option>
                  </select>
                </div>
              </div>

              {/* Кулинарные предпочтения */}
              <div className="form-section">
                <h3>🍽️ Кулинарные предпочтения</h3>
                
                <div className="form-group">
                  <label>🚫 Диетические ограничения</label>
                  <textarea
                    name="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleInputChange}
                    placeholder="Аллергии, вегетарианство, веганство, халяль, кошер и т.д."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>📝 Особые пожелания</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Особые пожелания по мастер-классу, блюдам, которые хотите изучить..."
                    rows="4"
                  />
                </div>
              </div>

              {/* Контактные данные */}
              <div className="form-section">
                <h3>📞 Контактные данные</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>📞 Телефон для связи</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 123-45-67"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>📧 Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>🏠 Адрес проведения</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Улица, дом, квартира или название места"
                    required
                  />
                </div>
              </div>

              {/* Информация о мастер-классе */}
              <div className="chef-info">
                <h4>👨‍🍳 Мастер-класс: {dish.name}</h4>
                <p>⭐ Рейтинг: {dish.rating}/5</p>
                <p>⏱️ Продолжительность: {dish.estimatedTime}</p>
                <p>🎯 Сложность: {dish.difficulty}</p>
                <p>🌍 Кухня: {dish.cuisine}</p>
                <p>👥 Максимум участников: {dish.maxParticipants}</p>
                <p>💰 Стоимость: от {dish.minOrderValue} руб.</p>
                {dish.includesIngredients && <p>🥘 Включает все ингредиенты</p>}
                {dish.includesRecipe && <p>📋 Включает рецепты</p>}
                {dish.includesCertificate && <p>🏆 Включает сертификат</p>}
                {dish.isBaking && <p>🥖 Специализация: Выпечка</p>}
                {dish.isBasic && <p>📚 Уровень: Для начинающих</p>}
                {dish.isEastern && <p>🌶️ Специализация: Восточная кухня</p>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                  Отмена
                </button>
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  {isSubmitting ? 'Отправляем...' : 'Записаться на мастер-класс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterClassRequest;
