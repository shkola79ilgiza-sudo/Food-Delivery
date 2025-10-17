import { useEffect, useState } from 'react';

export const useBackgroundImage = (imagePath) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (imagePath) {
      // Пытаемся загрузить изображение из public папки
      const img = new Image();
      img.onload = () => {
        console.log(`Background image loaded successfully: ${imagePath}`);
        setImageUrl(imagePath);
      };
      img.onerror = () => {
        console.warn(`Failed to load background image: ${imagePath}`);
        setImageUrl('');
      };
      img.src = imagePath;
    }
  }, [imagePath]);

  return imageUrl;
};
