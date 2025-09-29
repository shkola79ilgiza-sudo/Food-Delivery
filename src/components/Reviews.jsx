import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import Rating from './Rating';
import './Reviews.css';

const Reviews = ({ 
  dishId, 
  chefId, 
  reviews = [], 
  onAddReview, 
  onUpdateReview, 
  onDeleteReview,
  canAddReview = true,
  canEditReview = false,
  canDeleteReview = false 
}) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    author: ''
  });
  const [editingReview, setEditingReview] = useState(null);

  const handleAddReview = () => {
    if (newReview.rating === 0) {
      showError(t.ratingRequired);
      return;
    }
    if (!newReview.comment.trim()) {
      showError(t.commentRequired);
      return;
    }

    const review = {
      id: Date.now(),
      dishId,
      chefId,
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      author: newReview.author.trim() || t.anonymous,
      date: new Date().toISOString(),
      helpful: 0
    };

    onAddReview(review);
    setNewReview({ rating: 0, comment: '', author: '' });
    setShowAddForm(false);
    showSuccess(t.reviewAdded);
  };

  const handleUpdateReview = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setEditingReview(review);
      setNewReview({
        rating: review.rating,
        comment: review.comment,
        author: review.author
      });
      setShowAddForm(true);
    }
  };

  const handleSaveUpdate = () => {
    if (newReview.rating === 0) {
      showError(t.ratingRequired);
      return;
    }
    if (!newReview.comment.trim()) {
      showError(t.commentRequired);
      return;
    }

    const updatedReview = {
      ...editingReview,
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      author: newReview.author.trim() || t.anonymous,
      updatedAt: new Date().toISOString()
    };

    onUpdateReview(updatedReview);
    
    // Сбрасываем все состояния
    setNewReview({ rating: 0, comment: '', author: '' });
    setEditingReview(null);
    setShowAddForm(false);
    
    showSuccess(t.reviewUpdated);
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm(t.confirmDeleteReview)) {
      onDeleteReview(reviewId);
      showSuccess(t.reviewDeleted);
    }
  };

  const handleHelpful = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      const updatedReview = {
        ...review,
        helpful: review.helpful + 1
      };
      onUpdateReview(updatedReview);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h3>{t.reviews} ({reviews.length})</h3>
        {canAddReview && (
          <button 
            className="add-review-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? t.cancel : t.addReview}
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="rating-summary">
          <div className="rating-overview">
            <div className="average-rating">
              <span className="rating-number">{averageRating.toFixed(1)}</span>
              <Rating 
                rating={averageRating} 
                readOnly={true} 
                size="large" 
                showValue={false}
              />
              <span className="rating-count">{reviews.length} {t.reviews}</span>
            </div>
            <div className="rating-distribution">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating}★</span>
                  <div className="rating-progress">
                    <div 
                      className="rating-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Review Form */}
      {showAddForm && (
        <div className="review-form">
          <h4>{editingReview ? t.editReview : t.addReview}</h4>
          <div className="form-group">
            <label>{t.rating}:</label>
            <Rating
              rating={newReview.rating}
              onRatingChange={(rating) => setNewReview({...newReview, rating})}
              readOnly={false}
              size="medium"
              showValue={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="review-comment">{t.comment}:</label>
            <textarea
              id="review-comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              placeholder={t.writeReview}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label htmlFor="review-author">{t.yourName} ({t.optional}):</label>
            <input
              id="review-author"
              type="text"
              value={newReview.author}
              onChange={(e) => setNewReview({...newReview, author: e.target.value})}
              placeholder={t.anonymous}
            />
          </div>
          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setEditingReview(null);
                setNewReview({ rating: 0, comment: '', author: '' });
              }}
            >
              {t.cancel}
            </button>
            <button 
              className="btn-primary"
              onClick={editingReview ? handleSaveUpdate : handleAddReview}
            >
              {editingReview ? t.save : t.addReview}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>{t.noReviews}</p>
            {canAddReview && (
              <button 
                className="btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                {t.beFirstToReview}
              </button>
            )}
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="review-author">
                  <strong>{review.author}</strong>
                  <Rating 
                    rating={review.rating} 
                    readOnly={true} 
                    size="small" 
                    showValue={false}
                  />
                </div>
                <div className="review-date">
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
              <div className="review-actions">
                <button 
                  className="helpful-btn"
                  onClick={() => handleHelpful(review.id)}
                >
                  👍 {t.helpful} ({review.helpful})
                </button>
                {canEditReview && (
                  <button 
                    className="edit-btn"
                    onClick={() => handleUpdateReview(review.id)}
                  >
                    {t.edit}
                  </button>
                )}
                {canDeleteReview && (
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    {t.delete}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
