import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { useParams, useNavigate } from 'react-router-dom';
import Rating from './Rating';

const DishPassport = () => {
  const { dishId, chefId } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [chef, setChef] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chefRating, setChefRating] = useState(0);
  const [chefReviewsCount, setChefReviewsCount] = useState(0);
  const [dishRating, setDishRating] = useState(0);
  const [dishReviewsCount, setDishReviewsCount] = useState(0);
  const [reviews, setReviews] = useState([]);

  const loadDishData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем данные блюда
      const dishes = JSON.parse(localStorage.getItem(`demo_menu_${chefId}`) || '[]');
      const foundDish = dishes.find(d => d.id === dishId);
      
      if (foundDish) {
        setDish(foundDish);
        
        // Генерируем QR-код
        const qrData = JSON.stringify({
          dishId: foundDish.id,
          name: foundDish.name,
          chefId: chefId,
          timestamp: new Date().toISOString()
        });
        
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        setQrCode(qrCodeUrl);
        
        // Загружаем отзывы (демо-данные)
        const reviews = JSON.parse(localStorage.getItem(`dish_reviews_${dishId}`) || '[]');
        setReviews(reviews);
        
        // Вычисляем средний рейтинг
        if (reviews.length > 0) {
          const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
          setDishRating(avgRating);
          setDishReviewsCount(reviews.length);
        }
      } else {
        console.error('Блюдо не найдено');
        navigate('/chef/menu');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных блюда:', error);
    } finally {
      setLoading(false);
    }
  }, [dishId, chefId, navigate]);

  useEffect(() => {
    loadDishData();
  }, [dishId, chefId, loadDishData]);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date') {
      return 'Не указано';
    }
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpecializationName = (specialization) => {
    const specializations = {
      'general': 'Общая кухня',
      'tatar': 'Татарская кухня',
      'european': 'Европейская кухня',
      'asian': 'Азиатская кухня',
      'vegetarian': 'Вегетарианская кухня',
      'halal': 'Халяльная кухня'
    };
    return specializations[specialization] || specialization;
  };

  const getCategoryName = (categoryId) => {
    const categories = {
      'halal': 'Халяль меню',
      'preparations': 'Заготовки',
      'bakery': 'Выпечка',
      'tatar': 'Татарская кухня',
      'soups': 'Супы',
      'salads': 'Салаты',
      'desserts': 'Десерты',
      'diet': 'Диет меню по калориям',
      'client_products': 'Готовка с продуктами от клиента',
      'master_class': 'Кулинарный мастер класс',
      'help_cooking': 'Помощь в готовке до приезда гостей',
      'mainDishes': 'Основные блюда'
    };
    return categories[categoryId] || categoryId || 'Не указано';
  };

  const getDishHistory = () => {
    if (!dish) return [];
    
    const history = [];
    
    // Создание блюда
    if (dish.createdAt) {
      history.push({
        date: dish.createdAt,
        action: 'Создание блюда',
        description: 'Блюдо добавлено в меню повара'
      });
    } else {
      // Если нет даты создания, используем текущую дату
      history.push({
        date: new Date().toISOString(),
        action: 'Создание блюда',
        description: 'Блюдо добавлено в меню повара'
      });
    }
    
    // Обновление рецепта
    if (dish.updatedAt && dish.updatedAt !== dish.createdAt) {
      history.push({
        date: dish.updatedAt,
        action: 'Обновление рецепта',
        description: 'Рецепт блюда был обновлен'
      });
    }
    
    // Статистика заказов
    if (dish.orders && dish.orders > 0) {
      history.push({
        date: new Date().toISOString(),
        action: 'Статистика заказов',
        description: `Заказано ${dish.orders} раз`
      });
    }
    
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return (
      <div className="dish-passport">
        <div className="loading">Загрузка паспорта блюда...</div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="dish-passport">
        <div className="error-message">
          <h2>❌ Ошибка</h2>
          <p>{error || 'Блюдо не найдено'}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dish-passport">
      <div className="passport-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Назад
        </button>
        <h1>📋 Паспорт блюда</h1>
        <div className="qr-code-section">
          <img src={qrCode} alt="QR-код блюда" className="qr-code" />
          <p className="qr-note">Отсканируйте QR-код для получения информации о блюде</p>
        </div>
      </div>

      <div className="passport-content">
        {/* Основная информация о блюде */}
        <div className="dish-info-section">
          <div className="dish-image">
            {(dish.image || dish.photo) ? (
              <img src={dish.image || dish.photo} alt={dish.name} />
            ) : (
              <div className="no-image">🍽️</div>
            )}
          </div>
          <div className="dish-details">
            <h2>{dish.name}</h2>
            <p className="dish-description">{dish.description}</p>
            <div className="dish-meta">
              <span className="price">{dish.price} ₽</span>
              <span className="category">{getCategoryName(dish.category_id || dish.category)}</span>
              <div className="dish-rating">
                <Rating 
                  rating={dishRating} 
                  readOnly={true} 
                  size="medium" 
                  showValue={true}
                  showCount={true}
                  count={dishReviewsCount}
                />
                {dishRating === 0 && (
                  <span className="no-rating">Пока нет оценок</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Информация о поваре */}
        <div className="chef-info-section">
          <h3>👨‍🍳 Повар</h3>
          <div className="chef-details">
            <div className="chef-avatar">
              {chef?.avatar ? (
                <img src={chef.avatar} alt={chef.name} />
              ) : (
                <div className="avatar-placeholder">
                  {chef?.name ? chef.name.charAt(0).toUpperCase() : (chef?.email ? chef.email.charAt(0).toUpperCase() : 'П')}
                </div>
              )}
            </div>
            <div className="chef-info">
              <h4>{chef?.name || 'Не указано'}</h4>
              <p className="chef-email">{chef?.email || chefId}</p>
              <p className="chef-specialization">
                Специализация: {getSpecializationName(chef?.specialization) || 'Не указано'}
              </p>
              <p className="chef-experience">Опыт: {chef?.experience || '0'} лет</p>
              <div className="chef-rating">
                <span className="rating-label">Рейтинг:</span>
                <span className="rating-value">
                  {chefRating > 0 ? `⭐ ${chefRating.toFixed(1)}/5` : 'Пока нет оценок'}
                </span>
                {chefReviewsCount > 0 && (
                  <span className="reviews-count">({chefReviewsCount} отзывов)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ингредиенты и питательная ценность */}
        <div className="nutrition-section">
          <h3>🥗 Ингредиенты и питательная ценность</h3>
          <div className="ingredients">
            <h4>Ингредиенты:</h4>
            <p className="ingredients-text">{dish.ingredients || 'Не указаны'}</p>
          </div>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="nutrition-label">Калории:</span>
              <span className="nutrition-value">{dish.calories || 'Н/Д'} ккал</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Белки:</span>
              <span className="nutrition-value">{dish.protein || 'Н/Д'} г</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Углеводы:</span>
              <span className="nutrition-value">{dish.carbs || 'Н/Д'} г</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Жиры:</span>
              <span className="nutrition-value">{dish.fat || 'Н/Д'} г</span>
            </div>
          </div>
        </div>

        {/* История блюда */}
        <div className="history-section">
          <h3>📈 История блюда</h3>
          <div className="history-timeline">
            {getDishHistory().map((event, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {formatDate(event.date)}
                </div>
                <div className="history-content">
                  <h4>{event.action}</h4>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="additional-info-section">
          <h3>ℹ️ Дополнительная информация</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Дата создания:</span>
              <span className="info-value">{dish.createdAt ? formatDate(dish.createdAt) : 'Не указано'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Последнее обновление:</span>
              <span className="info-value">{dish.updatedAt ? formatDate(dish.updatedAt) : (dish.createdAt ? formatDate(dish.createdAt) : 'Не указано')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Статус:</span>
              <span className="info-value status-active">Активно</span>
            </div>
            <div className="info-item">
              <span className="info-label">Верификация:</span>
              <span className="info-value status-verified">✅ Проверено</span>
            </div>
          </div>
        </div>

        {/* Галерея фотографий */}
        {(dish.before_photo || dish.after_photo) && (
          <div className="photos-section">
            <h3>📸 Фотографии процесса приготовления</h3>
            <div className="photos-grid">
              {dish.before_photo && (
                <div className="photo-item">
                  <h4>До приготовления</h4>
                  <img src={dish.before_photo} alt="До приготовления" className="process-photo" />
                </div>
              )}
              {dish.after_photo && (
                <div className="photo-item">
                  <h4>После приготовления</h4>
                  <img src={dish.after_photo} alt="После приготовления" className="process-photo" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishPassport;
