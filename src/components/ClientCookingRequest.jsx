import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const ClientCookingRequest = ({ dish, onClose, onRequestSubmit }) => {
  // const { t } = useLanguage(); // Не используется в текущей реализации
  const [formData, setFormData] = useState({
    products: [],
    description: "",
    preferredTime: "",
    budget: "",
    specialRequests: "",
    contactPhone: "",
    address: "",
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestData = {
        dishId: dish.id,
        chefId: dish.chefId,
        ...formData,
        images: uploadedImages.map((img) => img.file),
        type: dish.isMasterClass
          ? "master_class"
          : dish.isConsultation
          ? "consultation"
          : "cooking",
        estimatedTime: dish.estimatedTime,
        minOrderValue: dish.minOrderValue,
      };

      await onRequestSubmit(requestData);
      onClose();
    } catch (error) {
      console.error("Error submitting cooking request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-cooking-modal">
      <div className="client-cooking-overlay" onClick={onClose}>
        <div
          className="client-cooking-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="client-cooking-header">
            <h2>🍳 {dish.name}</h2>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="client-cooking-body">
            <p className="dish-description">{dish.description}</p>

            <form onSubmit={handleSubmit} className="cooking-request-form">
              {/* Загрузка фото продуктов */}
              <div className="form-group">
                <label>📸 Фото ваших продуктов</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                {uploadedImages.length > 0 && (
                  <div className="uploaded-images">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="image-preview">
                        <img src={img.preview} alt="Product" />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Описание желаемого блюда */}
              <div className="form-group">
                <label>🍽️ Опишите желаемое блюдо</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Например: Хочу приготовить борщ с мясом, у меня есть говядина, свекла, капуста..."
                  rows="4"
                  required
                />
              </div>

              {/* Предпочтительное время */}
              <div className="form-group">
                <label>⏰ Когда удобно готовить?</label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Выберите время</option>
                  <option value="morning">Утром (9:00-12:00)</option>
                  <option value="afternoon">Днем (12:00-17:00)</option>
                  <option value="evening">Вечером (17:00-21:00)</option>
                  <option value="flexible">Гибкий график</option>
                </select>
              </div>

              {/* Бюджет */}
              <div className="form-group">
                <label>💰 Ваш бюджет (руб.)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Минимум 500 руб."
                  min={dish.minOrderValue}
                  required
                />
                <small>Минимальная стоимость: {dish.minOrderValue} руб.</small>
              </div>

              {/* Особые пожелания */}
              <div className="form-group">
                <label>📝 Особые пожелания</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Аллергии, диетические ограничения, предпочтения по специям..."
                  rows="3"
                />
              </div>

              {/* Контактные данные */}
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
                <label>🏠 Адрес доставки</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Улица, дом, квартира"
                  required
                />
              </div>

              {/* Информация о поваре */}
              <div className="chef-info">
                <h4>👨‍🍳 Повар: {dish.chef}</h4>
                <p>⭐ Рейтинг: {dish.rating}/5</p>
                <p>⏱️ Время приготовления: {dish.estimatedTime}</p>
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? "Отправляем..." : "Отправить запрос"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCookingRequest;
