# 🚀 Руководство по Deployment

## Содержание
1. [Подготовка окружения](#подготовка-окружения)
2. [Локальная разработка](#локальная-разработка)
3. [Staging deployment](#staging-deployment)
4. [Production deployment](#production-deployment)
5. [Мониторинг и логи](#мониторинг-и-логи)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)

---

## Подготовка окружения

### Требования
- Node.js 18.x+
- Docker 20.x+
- Docker Compose 2.x+
- Git
- SSL сертификаты (Let's Encrypt)

### Переменные окружения

#### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.fooddelivery.com

# Monitoring
REACT_APP_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=true
```

#### Backend (.env.production)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/fooddelivery_prod
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your_super_secure_secret_key_256_bits
JWT_REFRESH_SECRET=your_super_secure_refresh_secret
COOKIE_SECRET=your_cookie_secret

# API
PORT=3001
NODE_ENV=production
API_RATE_LIMIT=100

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Payment Providers
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
YOOKASSA_SHOP_ID=xxx
YOOKASSA_SECRET_KEY=xxx

# External Services
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=fooddelivery-prod
```

---

## Локальная разработка

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-org/fooddelivery-frontend.git
cd fooddelivery-frontend
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Создание .env файла
```bash
cp .env.example .env
# Отредактируйте .env с локальными настройками
```

### 4. Запуск в режиме разработки
```bash
npm start
```

Приложение откроется на `http://localhost:3000`

### 5. Запуск тестов
```bash
# Unit тесты
npm test

# E2E тесты
npm run test:e2e

# С coverage
npm test -- --coverage
```

### 6. Линтинг и форматирование
```bash
# ESLint
npm run lint

# Автоисправление
npm run lint:fix

# Prettier
npm run format
```

---

## Staging Deployment

### Автоматический deployment (через GitHub Actions)

1. **Push в ветку `develop`**
```bash
git checkout develop
git pull origin develop
git merge feature/your-feature
git push origin develop
```

2. **GitHub Actions автоматически:**
   - Запустит тесты
   - Соберет приложение
   - Задеплоит на staging
   - Запустит E2E тесты на staging

3. **Проверка deployment**
```bash
curl https://staging.fooddelivery.com/health
```

### Ручной deployment на staging

```bash
# 1. Сборка
npm run build

# 2. Подключение к staging серверу
ssh user@staging.fooddelivery.com

# 3. Обновление кода
cd /var/www/staging
git pull origin develop
npm install --production
npm run build

# 4. Перезапуск
pm2 restart fooddelivery-staging

# 5. Проверка логов
pm2 logs fooddelivery-staging
```

---

## Production Deployment

### Предварительные проверки

1. **Checklist перед deployment:**
   - [ ] Все тесты проходят
   - [ ] Staging работает без ошибок
   - [ ] Миграции БД подготовлены
   - [ ] Backup создан
   - [ ] Уведомления команде отправлены
   - [ ] Sentry Release создан

2. **Создание backup**
```bash
# База данных
pg_dump -h prod-db.com -U admin fooddelivery_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Загрузка в S3
aws s3 cp backup_*.sql s3://fooddelivery-backups/
```

### Deployment через Docker

```bash
# 1. Клонирование на production сервере
ssh user@prod.fooddelivery.com
cd /opt/fooddelivery

# 2. Pull последних изменений
git pull origin main

# 3. Сборка Docker образа
docker-compose build

# 4. Запуск новой версии (Blue-Green)
docker-compose up -d --no-deps --build app

# 5. Health check
curl http://localhost:3000/health

# 6. Переключение трафика
sudo systemctl reload nginx

# 7. Остановка старой версии
docker-compose down old-app
```

### Deployment через CI/CD (Рекомендуется)

1. **Создание Release в GitHub**
```bash
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

2. **GitHub Actions автоматически:**
   - Создаст Docker образ
   - Запушит в Registry
   - Задеплоит на production
   - Создаст Sentry release
   - Отправит уведомления

3. **Мониторинг deployment**
   - Grafana: https://grafana.fooddelivery.com
   - Sentry: https://sentry.io/fooddelivery
   - Logs: CloudWatch / ELK

---

## Мониторинг и логи

### Grafana Dashboards

**URL:** https://grafana.fooddelivery.com

**Основные дашборды:**
1. **System Health** - CPU, Memory, Disk
2. **Application Metrics** - Response time, Error rate
3. **Business Metrics** - Orders, Revenue, Users
4. **API Performance** - Endpoint latencies

### Sentry

**URL:** https://sentry.io/fooddelivery

**Алерты:**
- Критические ошибки → PagerDuty
- Высокая нагрузка → Slack #devops
- Медленные запросы → Email

### Логи

```bash
# Docker logs
docker logs -f fooddelivery-frontend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
pm2 logs fooddelivery-prod
```

### Health Checks

```bash
# Frontend health
curl https://fooddelivery.com/health

# Backend health
curl https://api.fooddelivery.com/health

# Database health
psql -h db.fooddelivery.com -U admin -c "SELECT 1"
```

---

## Rollback

### Быстрый rollback (Docker)

```bash
# 1. Подключение к production
ssh user@prod.fooddelivery.com

# 2. Откат к предыдущей версии
docker-compose down
docker tag fooddelivery-frontend:current fooddelivery-frontend:backup
docker tag fooddelivery-frontend:previous fooddelivery-frontend:current
docker-compose up -d

# 3. Проверка
curl http://localhost:3000/health
```

### Rollback через Git

```bash
# 1. Откат коммита
git revert HEAD
git push origin main

# 2. CI/CD автоматически задеплоит предыдущую версию
```

### Rollback базы данных

```bash
# 1. Восстановление из backup
psql -h prod-db.com -U admin fooddelivery_prod < backup_20240101_120000.sql

# 2. Проверка целостности
psql -h prod-db.com -U admin -c "SELECT COUNT(*) FROM users"
```

---

## Troubleshooting

### Приложение не запускается

```bash
# 1. Проверка логов
docker logs fooddelivery-frontend

# 2. Проверка переменных окружения
docker exec fooddelivery-frontend env | grep REACT_APP

# 3. Перезапуск
docker-compose restart app
```

### Высокая нагрузка

```bash
# 1. Проверка метрик
curl http://localhost:9090/metrics

# 2. Масштабирование
docker-compose up -d --scale app=3

# 3. Включение кеширования
redis-cli FLUSHALL
```

### Ошибки 500

```bash
# 1. Проверка Sentry
open https://sentry.io/fooddelivery

# 2. Проверка логов
tail -n 100 /var/log/nginx/error.log

# 3. Проверка backend
curl https://api.fooddelivery.com/health
```

### База данных недоступна

```bash
# 1. Проверка подключения
psql -h db.fooddelivery.com -U admin

# 2. Проверка репликации
psql -c "SELECT * FROM pg_stat_replication"

# 3. Перезапуск
systemctl restart postgresql
```

---

## Контакты

**DevOps Team:**
- Email: devops@fooddelivery.com
- Slack: #devops
- PagerDuty: On-call rotation

**Emergency Contacts:**
- CTO: +7-900-123-45-67
- DevOps Lead: +7-900-123-45-68

---

## Полезные ссылки

- **GitHub**: https://github.com/your-org/fooddelivery-frontend
- **Documentation**: https://docs.fooddelivery.com
- **Status Page**: https://status.fooddelivery.com
- **Grafana**: https://grafana.fooddelivery.com
- **Sentry**: https://sentry.io/fooddelivery

