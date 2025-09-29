import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const FeedbackModal = ({ orderId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      showError('Пожалуйста, поставьте оценку');
      return;
    }

    if (review.trim().length < 10) {
      showError('Пожалуйста, напишите отзыв (минимум 10 символов)');
      return;
    }

    setSubmitting(true);

    try {
      // Сохраняем фидбек в localStorage
      const feedback = {
        id: `feedback-${Date.now()}`,
        orderId,
        rating,
        review: review.trim(),
        date: new Date().toISOString(),
        clientId: localStorage.getItem('clientId') || 'demo_client'
      };

      const existingFeedback = JSON.parse(localStorage.getItem('orderFeedback') || '[]');
      existingFeedback.push(feedback);
      localStorage.setItem('orderFeedback', JSON.stringify(existingFeedback));

      // Обновляем рейтинг повара
      updateChefRating(orderId, rating);

      showSuccess('Спасибо за ваш отзыв!');
      
      if (onSubmit) {
        onSubmit(feedback);
      }
      
      onClose();
    } catch (error) {
      showError('Ошибка при отправке отзыва');
      console.error('Feedback error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateChefRating = (orderId, newRating) => {
    try {
      // Получаем заказ
      const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
      const order = orders.find(o => o.id === orderId);
      
      if (order && order.items && order.items.length > 0) {
        const chefId = order.items[0].chefId;
        
        // Обновляем рейтинг повара
        const chefRatings = JSON.parse(localStorage.getItem('chefRatings') || '{}');
        if (!chefRatings[chefId]) {
          chefRatings[chefId] = { total: 0, count: 0, average: 0 };
        }
        
        chefRatings[chefId].total += newRating;
        chefRatings[chefId].count += 1;
        chefRatings[chefId].average = chefRatings[chefId].total / chefRatings[chefId].count;
        
        localStorage.setItem('chefRatings', JSON.stringify(chefRatings));
      }
    } catch (error) {
      console.error('Error updating chef rating:', error);
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onRatingChange(star)}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <h2>🍽️ Оцените ваш заказ</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="feedback-content">
          <div className="rating-section">
            <h3>Как вам понравилось блюдо?</h3>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
            />
            <div className="rating-text">
              {rating === 0 && 'Поставьте оценку'}
              {rating === 1 && '😞 Очень плохо'}
              {rating === 2 && '😕 Плохо'}
              {rating === 3 && '😐 Нормально'}
              {rating === 4 && '😊 Хорошо'}
              {rating === 5 && '😍 Отлично!'}
            </div>
          </div>

          <div className="review-section">
            <h3>Поделитесь впечатлениями</h3>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Расскажите, что вам понравилось или что можно улучшить..."
              className="review-textarea"
              rows="4"
            />
            <div className="character-count">
              {review.length}/500 символов
            </div>
          </div>

          <div className="feedback-actions">
            <button 
              onClick={onClose}
              className="cancel-btn"
              disabled={submitting}
            >
              Пропустить
            </button>
            <button 
              onClick={handleSubmit}
              className="submit-btn"
              disabled={submitting || rating === 0 || review.trim().length < 10}
            >
              {submitting ? 'Отправляем...' : 'Отправить отзыв'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
