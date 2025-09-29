import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Функция для создания ленивых компонентов с обработкой ошибок
export const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback || <LoadingSpinner text="Загрузка компонента..." />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Предзагруженные ленивые компоненты для лучшей производительности
export const LazyAdminDashboard = createLazyComponent(() => import('./AdminDashboard'));
export const LazyAdminUsers = createLazyComponent(() => import('./AdminUsers'));
export const LazyAdminOrders = createLazyComponent(() => import('./AdminOrders'));
export const LazyAdminChefs = createLazyComponent(() => import('./AdminChefs'));
export const LazyAdminFinance = createLazyComponent(() => import('./AdminFinance'));
export const LazyAdminSettings = createLazyComponent(() => import('./AdminSettings'));
export const LazyAICoach = createLazyComponent(() => import('./AICoach'));
export const LazyAIChefAssistant = createLazyComponent(() => import('./AIChefAssistant'));
export const LazyFarmersMarket = createLazyComponent(() => import('./FarmersMarket'));
export const LazyDishPassport = createLazyComponent(() => import('./DishPassport'));

// HOC для добавления ленивой загрузки к любому компоненту
export const withLazyLoading = (WrappedComponent, fallback = null) => {
  return (props) => (
    <Suspense fallback={fallback || <LoadingSpinner text="Загрузка..." />}>
      <WrappedComponent {...props} />
    </Suspense>
  );
};
