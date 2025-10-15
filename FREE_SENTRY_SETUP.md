# 🆓 Бесплатная настройка Sentry (Developer Plan)

## Шаг 1: Регистрация на Sentry

1. Перейдите на https://sentry.io/signup/
2. Выберите **"Developer Plan"** (FREE)
   - ✅ 5,000 errors/month
   - ✅ 10,000 transactions/month
   - ✅ 1 project
   - ✅ Unlimited team members

3. Создайте организацию: `fooddelivery`

## Шаг 2: Создание проекта

1. Нажмите **"Create Project"**
2. Выберите платформу: **React**
3. Название проекта: `fooddelivery-frontend`
4. Alert frequency: **Alert me on every new issue**

5. Скопируйте DSN (будет примерно таким):
```
https://1234567890abcdef@o123456.ingest.sentry.io/1234567
```

## Шаг 3: Установка в проект

```bash
cd C:\Users\User\Desktop\fooddelivery-frontend

# Установка Sentry
npm install --save @sentry/react @sentry/tracing
```

## Шаг 4: Обновление .env файла

```bash
# Добавить в .env
REACT_APP_SENTRY_DSN=https://YOUR_DSN_HERE@o123456.ingest.sentry.io/1234567
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=2.0.0
```

## Шаг 5: Инициализация Sentry в приложении

### Обновить src/index.js:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// 🔍 Инициализация Sentry (только если есть DSN)
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    release: process.env.REACT_APP_VERSION || '2.0.0',
    
    integrations: [
      new BrowserTracing(),
    ],

    // Performance Monitoring - 10% в production
    tracesSampleRate: process.env.REACT_APP_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Отправлять все ошибки
    sampleRate: 1.0,
    
    // Игнорировать известные ошибки
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection',
    ],
  });

  console.log('✅ Sentry initialized');
} else {
  console.log('⚠️ Sentry DSN not found, monitoring disabled');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Шаг 6: Тестирование

### Добавить тестовую кнопку (временно):

```javascript
// В любом компоненте, например ClientMenu.jsx
const testSentry = () => {
  console.log('🧪 Testing Sentry...');
  Sentry.captureMessage('Test message from frontend', 'info');
  
  // Тест ошибки
  try {
    throw new Error('Test error for Sentry');
  } catch (error) {
    Sentry.captureException(error);
  }
  
  alert('Sentry test sent! Check your Sentry dashboard.');
};

// В JSX
<button onClick={testSentry} style={{padding: '10px', background: '#f0f0f0'}}>
  🧪 Test Sentry
</button>
```

## Шаг 7: Проверка в Sentry Dashboard

1. Откройте https://sentry.io/
2. Перейдите в проект `fooddelivery-frontend`
3. Перейдите в **Issues**
4. Вы должны увидеть:
   - Test message
   - Test error

## Бонус: Автоматическое логирование пользователя

```javascript
// После успешного логина
import * as Sentry from '@sentry/react';

const handleLogin = async (email, password) => {
  const data = await authAPI.login(email, password);
  
  // Установить пользователя в Sentry
  if (window.Sentry) {
    Sentry.setUser({
      id: data.user.id,
      email: data.user.email,
      username: `${data.user.firstName} ${data.user.lastName}`,
    });
  }
  
  // ... остальная логика
};

// При логауте
const handleLogout = () => {
  // Очистить пользователя в Sentry
  if (window.Sentry) {
    Sentry.setUser(null);
  }
  
  authAPI.logout();
};
```

## Преимущества бесплатного плана:

✅ **Автоматический error tracking**
- JavaScript errors
- Unhandled promises
- Console errors

✅ **Performance monitoring**
- Page load times
- API call latencies
- Component render times

✅ **User tracking**
- Кто столкнулся с ошибкой
- Браузер и ОС
- URL и действия

✅ **Alerts**
- Email уведомления о новых ошибках
- Slack интеграция (бесплатно)

## Лимиты бесплатного плана:

- 5,000 errors/month ≈ 166 errors/day
- Для MVP это **БОЛЕЕ ЧЕМ ДОСТАТОЧНО!**
- Если превысите - просто перестанут отправляться новые ошибки до следующего месяца

## Когда нужен платный план?

Только когда:
- > 5,000 errors/month (у вас много багов 😅)
- Нужно больше 1 проекта
- Нужны advanced features (custom alerts, data retention)

**Для MVP - FREE PLAN ИДЕАЛЕН!** 🎉

