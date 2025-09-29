import React from 'react';

const StarRating = ({ rating, onRatingChange, interactive = false, size = 'medium' }) => {
  const sizeClasses = {
    small: { fontSize: '14px', gap: '2px' },
    medium: { fontSize: '18px', gap: '4px' },
    large: { fontSize: '24px', gap: '6px' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: currentSize.gap,
      fontSize: currentSize.fontSize
    }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleStarClick(star)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rating ? '#ffd700' : '#ddd',
            transition: 'color 0.2s ease',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (interactive) {
              e.target.style.color = '#ffd700';
            }
          }}
          onMouseLeave={(e) => {
            if (interactive) {
              e.target.style.color = star <= rating ? '#ffd700' : '#ddd';
            }
          }}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span style={{ 
          marginLeft: '8px', 
          fontSize: '12px', 
          color: '#666',
          fontWeight: 'bold'
        }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
