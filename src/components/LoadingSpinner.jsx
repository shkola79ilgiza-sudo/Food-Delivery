/**
 * Компонент загрузки для Code Splitting
 */

import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    </div>
  );
}
