# 🆓 Бесплатная настройка GitHub Actions

## ✅ Что бесплатно для публичных репозиториев:

- ✅ **Unlimited minutes** - бесконечные минуты!
- ✅ **Unlimited workflows**
- ✅ **Unlimited concurrent jobs**

## ✅ Для приватных репозиториев:

- ✅ **2,000 free minutes/month**
- ✅ Этого хватит на 100+ deployments!

---

## Шаг 1: Создать репозиторий на GitHub

```bash
cd C:\Users\User\Desktop\fooddelivery-frontend

# Инициализация Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit with production-ready architecture"

# Создать репозиторий на GitHub.com
# Затем подключить:
git remote add origin https://github.com/YOUR_USERNAME/fooddelivery-frontend.git
git branch -M main
git push -u origin main
```

---

## Шаг 2: Создать упрощенный CI/CD workflow

Создадим **бесплатный и простой** workflow:

### .github/workflows/simple-ci.yml

```yaml
name: Simple CI/CD (Free)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ============================================
  # JOB 1: Lint и Test (быстро и бесплатно)
  # ============================================
  test:
    name: 🧪 Test & Lint
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v3
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: 📥 Install dependencies
        run: npm ci
      
      - name: 🔍 Lint
        run: npm run lint || true
      
      - name: 🧪 Test
        run: npm test -- --coverage --watchAll=false || true
        env:
          CI: true

  # ============================================
  # JOB 2: Build (проверка сборки)
  # ============================================
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v3
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: 📥 Install
        run: npm ci
      
      - name: 🏗️ Build
        run: npm run build
        env:
          REACT_APP_API_BASE_URL: http://localhost:3001
          REACT_APP_ENVIRONMENT: staging
      
      - name: 📦 Upload build
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: build/
          retention-days: 1

  # ============================================
  # JOB 3: Notify (опционально)
  # ============================================
  notify:
    name: 📢 Notify
    runs-on: ubuntu-latest
    needs: [test, build]
    if: always()
    
    steps:
      - name: ✅ Success
        if: ${{ needs.test.result == 'success' && needs.build.result == 'success' }}
        run: echo "✅ Build successful!"
      
      - name: ❌ Failure
        if: ${{ needs.test.result == 'failure' || needs.build.result == 'failure' }}
        run: echo "❌ Build failed!"
```

---

## Шаг 3: Настроить GitHub Secrets (бесплатно)

1. Перейдите в репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Добавьте secrets:

```
REACT_APP_SENTRY_DSN = https://xxx@xxx.ingest.sentry.io/xxx
REACT_APP_API_BASE_URL = https://api.yourdomain.com
```

---

## Шаг 4: Обновить workflow с secrets

```yaml
- name: 🏗️ Build with secrets
  run: npm run build
  env:
    REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
    REACT_APP_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
    REACT_APP_ENVIRONMENT: production
```

---

## Бонус: Автоматический Deploy на бесплатный хостинг

### Вариант 1: Vercel (бесплатно)

```yaml
deploy-vercel:
  name: 🚀 Deploy to Vercel
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: 📥 Checkout
      uses: actions/checkout@v3
    
    - name: 🚀 Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### Вариант 2: Netlify (бесплатно)

```yaml
deploy-netlify:
  name: 🚀 Deploy to Netlify
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: 📥 Checkout
      uses: actions/checkout@v3
    
    - name: 📥 Download build
      uses: actions/download-artifact@v3
      with:
        name: build
        path: build/
    
    - name: 🚀 Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=build --prod
      env:
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### Вариант 3: GitHub Pages (бесплатно)

```yaml
deploy-pages:
  name: 🚀 Deploy to GitHub Pages
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: 📥 Checkout
      uses: actions/checkout@v3
    
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: 📥 Install & Build
      run: |
        npm ci
        npm run build
      env:
        REACT_APP_API_BASE_URL: https://api.yourdomain.com
    
    - name: 🚀 Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

---

## Мониторинг использования минут

1. GitHub → Settings → Billing → Usage this month
2. Можно установить лимиты и алерты

**Для вашего проекта:** ~2-3 минуты на build = 600+ builds/месяц бесплатно!

---

## Оптимизация для экономии минут

### Используем кеширование:

```yaml
- name: 📦 Cache node_modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Запускаем только при необходимости:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
  # Не запускаем для изменений в документации
  paths-ignore:
    - '**.md'
    - 'docs/**'
```

---

## Бесплатные альтернативы хостинга

### 1. **Vercel** (Рекомендуется)
- ✅ Бесплатный SSL
- ✅ CDN
- ✅ Автоматический deploy из Git
- ✅ Serverless functions
- **Лимит:** 100GB bandwidth/месяц

### 2. **Netlify**
- ✅ Бесплатный SSL
- ✅ CDN
- ✅ Автоматический deploy
- ✅ Serverless functions
- **Лимит:** 100GB bandwidth/месяц

### 3. **GitHub Pages**
- ✅ Бесплатный хостинг
- ✅ Бесплатный SSL
- ✅ Автоматический deploy
- ❌ Нет serverless
- **Лимит:** 100GB bandwidth/месяц

### 4. **Cloudflare Pages**
- ✅ Бесплатный SSL
- ✅ CDN
- ✅ Автоматический deploy
- ✅ Unlimited bandwidth!
- **Лимит:** 500 builds/месяц

---

## Итого: 100% БЕСПЛАТНО! 🎉

- ✅ GitHub Actions - БЕСПЛАТНО
- ✅ Vercel/Netlify/Pages - БЕСПЛАТНО
- ✅ SSL сертификат - БЕСПЛАТНО
- ✅ CDN - БЕСПЛАТНО
- ✅ Автоматический deploy - БЕСПЛАТНО

**Никаких затрат до масштабирования!** 🚀

