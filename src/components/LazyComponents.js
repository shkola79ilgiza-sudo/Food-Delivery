/**
 * Ленивая загрузка компонентов по ролям
 * Code Splitting для оптимизации размера бандла
 * @author Food Delivery Team
 * @version 1.0.0
 */

import { lazy } from 'react';
import { Component } from 'react';

// Клиентские компоненты (загружаются для всех пользователей)
export const ClientMenu = lazy(() => import('./ClientMenu'));
export const ClientLogin = lazy(() => import('./ClientLogin'));
export const ClientRegister = lazy(() => import('./ClientRegister'));
export const Checkout = lazy(() => import('./Checkout'));
export const QuickOrder = lazy(() => import('./QuickOrder'));

// Поварские компоненты (загружаются только для поваров)
export const ChefMenu = lazy(() => import('./ChefMenu'));
export const ChefProfile = lazy(() => import('./ChefProfile'));
export const ChefOrderDetails = lazy(() => import('./ChefOrderDetails'));
export const ChefHelpGuestRequests = lazy(() => import('./ChefHelpGuestRequests'));

// AI компоненты (загружаются только при необходимости)
export const AIHolidaySetMenu = lazy(() => import('./AIHolidaySetMenu'));
export const AIHolidayPromo = lazy(() => import('./AIHolidayPromo'));
export const AIPhotoAnalyzer = lazy(() => import('./AIPhotoAnalyzer'));

// Админские компоненты (загружаются только для админов)
export const AdminPanel = lazy(() => import('./AdminPanel'));
export const AdminUsers = lazy(() => import('./AdminUsers'));
export const AdminStatistics = lazy(() => import('./AdminStatistics'));

// Специальные компоненты
export const FarmersMarket = lazy(() => import('./FarmersMarket'));
export const TimeSlotPicker = lazy(() => import('./TimeSlotPicker'));

// Компоненты загрузки
export const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #4CAF50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <div style={{
      color: '#666',
      fontSize: '14px'
    }}>
      Загрузка...
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service (e.g., Sentry)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#d32f2f'
        }}>
          <h3>Ошибка загрузки компонента</h3>
          <p>Попробуйте обновить страницу</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Обновить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
