import React, { useState } from 'react';
import './Rating.css';

const Rating = ({ 
  rating = 0, 
  maxRating = 5, 
  onRatingChange, 
  readOnly = false, 
  size = 'medium',
  showValue = false,
  showCount = false,
  count = 0,
  allowHalf = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      setCurrentRating(value);
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || currentRating;

  return (
    <div className={`rating rating-${size} ${readOnly ? 'rating-readonly' : ''}`}>
      <div className="rating-stars">
        {[...Array(maxRating)].map((_, index) => {
          const value = index + 1;
          const isFilled = value <= displayRating;
          const isHalf = value === Math.ceil(displayRating) && displayRating % 1 !== 0;
          
          return (
            <span
              key={index}
              className={`star ${isFilled ? 'star-filled' : ''} ${isHalf ? 'star-half' : ''}`}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
            >
              ★
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="rating-value">
          {currentRating.toFixed(1)}/{maxRating}
        </span>
      )}
      {showCount && (
        <span className="rating-count">
          ({count})
        </span>
      )}
    </div>
  );
};

export default Rating;
