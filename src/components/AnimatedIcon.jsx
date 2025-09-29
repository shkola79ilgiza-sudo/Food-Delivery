import React, { useState, useEffect } from 'react';
import IconSystem from './IconSystem';

const AnimatedIcon = ({ 
  name, 
  size = 24, 
  color = '#2c3e50',
  animation = 'bounce',
  duration = 1000,
  delay = 0,
  className = '',
  style = {},
  onClick,
  children
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animation === 'pulse' || animation === 'rotate') {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), duration);
      }, duration + delay);

      return () => clearInterval(interval);
    }
  }, [animation, duration, delay]);

  const handleClick = (e) => {
    if (onClick) {
      if (animation === 'bounce' || animation === 'shake') {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), duration);
      }
      onClick(e);
    }
  };

  const getAnimationStyle = () => {
    const baseStyle = {
      transition: `all ${duration}ms ease-in-out`,
      transform: 'scale(1)',
      ...style
    };

    if (!isAnimating) return baseStyle;

    switch (animation) {
      case 'bounce':
        return {
          ...baseStyle,
          transform: 'scale(1.2) translateY(-5px)',
          filter: 'brightness(1.3) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        };
      case 'pulse':
        return {
          ...baseStyle,
          transform: 'scale(1.1)',
          filter: 'brightness(1.2)'
        };
      case 'rotate':
        return {
          ...baseStyle,
          transform: 'rotate(360deg) scale(1.1)',
          filter: 'brightness(1.2)'
        };
      case 'shake':
        return {
          ...baseStyle,
          transform: 'translateX(-2px) scale(1.1)',
          filter: 'brightness(1.2)'
        };
      case 'glow':
        return {
          ...baseStyle,
          transform: 'scale(1.05)',
          filter: 'brightness(1.4) drop-shadow(0 0 10px currentColor)'
        };
      case 'float':
        return {
          ...baseStyle,
          transform: 'translateY(-3px) scale(1.05)',
          filter: 'brightness(1.2)'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      className={className}
      style={getAnimationStyle()}
      onClick={handleClick}
    >
      {children || <IconSystem name={name} size={size} color={color} />}
    </div>
  );
};

export default AnimatedIcon;
