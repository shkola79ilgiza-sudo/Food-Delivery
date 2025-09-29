import React, { useState } from 'react';

const HelpGuestRequest = ({ dish, onClose, onRequestSubmit }) => {
  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    numberOfGuests: '',
    eventType: '',
    budget: '',
    specialRequests: '',
    contactPhone: '',
    address: '',
    dietaryRestrictions: '',
    preferredCuisine: '',
    servingStyle: ''
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
        type: 'help_guest',
        estimatedTime: dish.estimatedTime,
        minOrderValue: dish.minOrderValue,
        maxGuests: dish.maxGuests,
        includesPlanning: dish.includesPlanning,
        includesServing: dish.includesServing,
        includesCleanup: dish.includesCleanup,
        isExpress: dish.isExpress,
        isFullService: dish.isFullService
      };
      
      await onRequestSubmit(requestData);
      onClose();
    } catch (error) {
      console.error('Error submitting help guest request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="help-guest-modal">
      <div className="help-guest-overlay" onClick={onClose}>
        <div className="help-guest-content" onClick={(e) => e.stopPropagation()}>
          <div className="help-guest-header">
            <h2>👥 {dish.name}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="help-guest-body">
            <p className="dish-description">{dish.description}</p>
            
            <form onSubmit={handleSubmit} className="help-guest-form">
              {/* Основная информация о мероприятии */}
              <div className="form-section">
                <h3>📅 Информация о мероприятии</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>📅 Дата мероприятия</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>⏰ Время начала</label>
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>👥 Количество гостей</label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleInputChange}
                      min="1"
                      max={dish.maxGuests || 50}
                      required
                    />
                    <small>Максимум: {dish.maxGuests || 50} гостей</small>
                  </div>
                  
                  <div className="form-group">
                    <label>🎉 Тип мероприятия</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Выберите тип</option>
                      <option value="birthday">День рождения</option>
                      <option value="anniversary">Юбилей</option>
                      <option value="wedding">Свадьба</option>
                      <option value="corporate">Корпоратив</option>
                      <option value="family">Семейный ужин</option>
                      <option value="holiday">Праздник</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Кулинарные предпочтения */}
              <div className="form-section">
                <h3>🍽️ Кулинарные предпочтения</h3>
                
                <div className="form-group">
                  <label>🌍 Предпочитаемая кухня</label>
                  <select
                    name="preferredCuisine"
                    value={formData.preferredCuisine}
                    onChange={handleInputChange}
                  >
                    <option value="">Любая</option>
                    <option value="russian">Русская</option>
                    <option value="tatar">Татарская</option>
                    <option value="european">Европейская</option>
                    <option value="asian">Азиатская</option>
                    <option value="mediterranean">Средиземноморская</option>
                    <option value="american">Американская</option>
                    <option value="mixed">Смешанная</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>🍽️ Стиль подачи</label>
                  <select
                    name="servingStyle"
                    value={formData.servingStyle}
                    onChange={handleInputChange}
                  >
                    <option value="">Выберите стиль</option>
                    <option value="buffet">Фуршет</option>
                    <option value="sit-down">Сидячий ужин</option>
                    <option value="family-style">Семейный стиль</option>
                    <option value="cocktail">Коктейльная вечеринка</option>
                    <option value="bbq">Барбекю</option>
                  </select>
                </div>

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
              </div>

              {/* Бюджет и особые пожелания */}
              <div className="form-section">
                <h3>💰 Бюджет и детали</h3>
                
                <div className="form-group">
                  <label>💰 Бюджет (руб.)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder={`Минимум ${dish.minOrderValue} руб.`}
                    min={dish.minOrderValue}
                    required
                  />
                  <small>Минимальная стоимость: {dish.minOrderValue} руб.</small>
                </div>

                <div className="form-group">
                  <label>📝 Особые пожелания</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Особые пожелания по меню, декору, сервировке..."
                    rows="4"
                  />
                </div>
              </div>

              {/* Контактные данные */}
              <div className="form-section">
                <h3>📞 Контактные данные</h3>
                
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
                  <label>🏠 Адрес проведения</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Улица, дом, квартира"
                    required
                  />
                </div>
              </div>

              {/* Информация о поваре */}
              <div className="chef-info">
                <h4>👨‍🍳 Повар: {dish.chef}</h4>
                <p>⭐ Рейтинг: {dish.rating}/5</p>
                <p>⏱️ Время работы: {dish.estimatedTime}</p>
                {dish.includesPlanning && <p>📋 Включает планирование меню</p>}
                {dish.includesServing && <p>🍽️ Включает сервировку</p>}
                {dish.includesCleanup && <p>🧹 Включает уборку</p>}
                {dish.isExpress && <p>⚡ Экспресс-услуга</p>}
                {dish.isFullService && <p>🌟 Полный сервис</p>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                  Отмена
                </button>
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  {isSubmitting ? 'Отправляем...' : 'Отправить запрос'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuestRequest;
