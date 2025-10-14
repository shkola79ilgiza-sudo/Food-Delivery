# 📋 GitHub Actions Workflows

## Файлы в папке `.github/workflows/`:

### 1. `simple-ci.yml` ⭐ АКТИВНЫЙ
**Для разработки - без предупреждений**

✅ **Что делает:**
- Тестирует код
- Проверяет линтинг
- Собирает приложение
- Сохраняет артефакты

✅ **Преимущества:**
- Никаких предупреждений в IDE
- Не требует настройки secrets
- Работает сразу после push в Git

❌ **Ограничения:**
- Не деплоит автоматически
- Нет уведомлений в Slack
- Нет интеграции с Sentry

---

### 2. `ci-cd-full.yml` 📁 ДЛЯ PRODUCTION
**Полный production workflow (отключен)**

✅ **Что делает:**
- Все из simple-ci
- Автоматический deploy
- Уведомления в Slack
- Интеграция с Sentry
- Security scanning

⚠️ **Требует настройки:**
- GitHub Secrets (21 переменная)
- Staging/Production серверы
- Slack webhook
- Sentry токены

---

## 🎯 РЕКОМЕНДАЦИИ

### Во время разработки:
- ✅ Используйте `simple-ci.yml`
- ✅ Никаких предупреждений
- ✅ Быстрые проверки кода

### Перед production:
- ✅ Переключитесь на `ci-cd-full.yml`
- ✅ Настройте GitHub Secrets
- ✅ Получите автоматический deploy

---

## 🔄 Как переключиться:

### Активировать простой workflow:
```bash
# Переименовать файлы
mv .github/workflows/ci-cd-full.yml .github/workflows/ci-cd-full-disabled.yml
mv .github/workflows/simple-ci.yml .github/workflows/ci-cd.yml
```

### Активировать полный workflow:
```bash
# Переименовать файлы
mv .github/workflows/ci-cd.yml .github/workflows/simple-ci.yml
mv .github/workflows/ci-cd-full-disabled.yml .github/workflows/ci-cd.yml
```

---

## 📝 ЗАМЕТКИ

**Сейчас активен:** `simple-ci.yml` (без предупреждений)

**Когда понадобится полный workflow:**
1. Зарегистрируетесь на Sentry
2. Настроите хостинг (Vercel/Railway)
3. Создадите GitHub Secrets
4. Переключитесь на `ci-cd-full.yml`

**А пока:** спокойно разрабатывайте без предупреждений! 🎉
