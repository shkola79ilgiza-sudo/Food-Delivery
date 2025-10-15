# 🚨 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ БЕЗОПАСНОСТИ

## 1. УДАЛИТЬ JWT ИЗ LOCALSTORAGE (КРИТИЧНО!)

### Проблема:
```javascript
// src/api/backend.js - ОПАСНО!
const getToken = () => {
  return localStorage.getItem('auth_token'); // XSS уязвимость!
};
```

### Решение:
```javascript
// Заменить на httpOnly cookies
// Управление токенами только на сервере
const getToken = () => {
  // Токены автоматически отправляются в cookies
  return null; // Не храним в localStorage
};
```

## 2. ДОБАВИТЬ RATE LIMITING

### Backend (Express):
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток входа
  message: 'Слишком много попыток входа'
});

app.use('/auth/login', authLimiter);
```

## 3. НАСТРОИТЬ CORS БЕЗОПАСНОСТЬ

### Backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // Только ваш домен
  credentials: true, // Для cookies
  optionsSuccessStatus: 200
}));
```

## 4. ДОБАВИТЬ SECURITY HEADERS

### Backend:
```javascript
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

## 5. НАСТРОИТЬ SENTRY

### Frontend:
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Backend:
```javascript
const Sentry = require('@sentry/node');
Sentry.init({
  dsn: process.env.SENTRY_DSN
});
```

## 6. СОЗДАТЬ .ENV ФАЙЛЫ

### Frontend (.env):
```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_ENVIRONMENT=production
```

### Backend (.env):
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=super_secure_secret_256_bits
SENTRY_DSN=your_sentry_dsn
REDIS_URL=redis://localhost:6379
FRONTEND_URL=https://yourdomain.com
```

## 7. НАСТРОИТЬ BACKUP

### PostgreSQL:
```bash
# Ежедневный backup
pg_dump your_database > backup_$(date +%Y%m%d).sql

# Автоматизация через cron
0 2 * * * /path/to/backup_script.sh
```

## 8. ДОБАВИТЬ HEALTH CHECKS

### Backend:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## ПРИОРИТЕТ ИСПРАВЛЕНИЙ:
1. 🚨 Удалить JWT из localStorage (СЕГОДНЯ!)
2. 🔒 Добавить rate limiting (СЕГОДНЯ!)
3. 📊 Настроить Sentry (ЗАВТРА)
4. 💾 Настроить backup (НА ЭТОЙ НЕДЕЛЕ)
5. 🏥 Добавить health checks (НА ЭТОЙ НЕДЕЛЕ)

## КОМАНДЫ ДЛЯ БЫСТРОГО ИСПРАВЛЕНИЯ:

```bash
# Установить зависимости безопасности
npm install express-rate-limit helmet cors @sentry/node @sentry/react

# Создать backup скрипт
mkdir scripts
echo '#!/bin/bash\npg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql' > scripts/backup.sh
chmod +x scripts/backup.sh
```
