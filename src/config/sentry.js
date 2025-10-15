/**
 * 📊 Sentry Configuration для мониторинга ошибок
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';
const RELEASE = process.env.REACT_APP_VERSION || '2.0.0';

/**
 * Инициализация Sentry
 */
export const initSentry = () => {
  // Не инициализируем в development без DSN
  if (!SENTRY_DSN || ENVIRONMENT === 'development') {
    console.log('🔍 Sentry: Development mode, monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Трассировка навигации
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],

    // Performance monitoring - отправлять 10% транзакций
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Ошибки - отправлять все в production, 50% в staging
    sampleRate: ENVIRONMENT === 'production' ? 1.0 : 0.5,

    // Настройка фильтрации ошибок
    beforeSend(event, hint) {
      // Игнорируем известные ошибки браузера
      const error = hint.originalException;
      
      if (error && error.message) {
        // Игнорируем ошибки расширений браузера
        if (error.message.match(/chrome-extension/i)) {
          return null;
        }
        
        // Игнорируем ошибки сети (обрабатываем отдельно)
        if (error.message.match(/network/i) || error.message.match(/failed to fetch/i)) {
          return null;
        }
      }

      // Добавляем пользовательские данные
      const user = localStorage.getItem('userId');
      if (user) {
        event.user = {
          id: user,
        };
      }

      return event;
    },

    // Настройка breadcrumbs (следы активности)
    beforeBreadcrumb(breadcrumb, hint) {
      // Не отправляем слишком много console.log
      if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
        return null;
      }
      
      return breadcrumb;
    },

    // Игнорируем определенные URL
    ignoreErrors: [
      // Ошибки браузера
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      // Ошибки сторонних библиотек
      'Script error.',
    ],
  });

  console.log('✅ Sentry initialized:', { environment: ENVIRONMENT, release: RELEASE });
};

/**
 * Установить пользователя для Sentry
 */
export const setSentryUser = (user) => {
  if (!user) return;
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: `${user.firstName} ${user.lastName}`,
    role: user.role,
  });
};

/**
 * Очистить пользователя (при логауте)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Установить контекст для ошибки
 */
export const setSentryContext = (context, data) => {
  Sentry.setContext(context, data);
};

/**
 * Добавить breadcrumb вручную
 */
export const addSentryBreadcrumb = (message, category, level = 'info', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture исключение вручную
 */
export const captureSentryException = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: context,
  });
};

/**
 * Capture сообщение вручную
 */
export const captureSentryMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    contexts: context,
  });
};

/**
 * Начать транзакцию для performance monitoring
 */
export const startSentryTransaction = (name, op = 'custom') => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Performance measurement для конкретных действий
 */
export const measurePerformance = async (name, fn) => {
  const transaction = startSentryTransaction(name, 'function');
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    captureSentryException(error, { transaction: name });
    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Wrapper для API запросов с мониторингом
 */
export const monitoredFetch = async (url, options = {}) => {
  const transaction = startSentryTransaction(`API ${options.method || 'GET'} ${url}`, 'http.client');
  
  try {
    const response = await fetch(url, options);
    
    transaction.setHttpStatus(response.status);
    transaction.setData('url', url);
    transaction.setData('method', options.method || 'GET');
    
    if (!response.ok) {
      transaction.setStatus('http_error');
      captureSentryMessage(`HTTP ${response.status} on ${url}`, 'warning', {
        http: {
          status_code: response.status,
          url,
          method: options.method || 'GET',
        },
      });
    } else {
      transaction.setStatus('ok');
    }
    
    return response;
  } catch (error) {
    transaction.setStatus('network_error');
    captureSentryException(error, {
      http: {
        url,
        method: options.method || 'GET',
      },
    });
    throw error;
  } finally {
    transaction.finish();
  }
};

// Export для использования в компонентах
export default {
  init: initSentry,
  setUser: setSentryUser,
  clearUser: clearSentryUser,
  setContext: setSentryContext,
  addBreadcrumb: addSentryBreadcrumb,
  captureException: captureSentryException,
  captureMessage: captureSentryMessage,
  measurePerformance,
  monitoredFetch,
};

