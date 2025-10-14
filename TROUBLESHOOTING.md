# 🔧 Устранение проблем (Troubleshooting)

## ❌ Проблема: "Cannot find module '@babel/core'"

### Причина:
Поврежденные или неполные зависимости в `node_modules`

### Решение:
```cmd
# 1. Остановите все процессы Node
taskkill /F /IM node.exe

# 2. Удалите node_modules и package-lock.json
rmdir /s /q node_modules
del package-lock.json

# 3. Очистите кэш npm
npm cache clean --force

# 4. Переустановите зависимости
npm install

# 5. Запустите сервер
npm start
```

---

## ❌ Проблема: "Module not found: webpack-dev-server"

### Причина:
Те же - поврежденные зависимости

### Решение:
То же самое, что выше ⬆️

---

## ❌ Проблема: Порт 3000 уже занят

### Решение 1: Освободить порт
```cmd
# Найти процесс на порту 3000
netstat -ano | findstr ":3000"

# Найдите PID (последняя колонка), затем:
taskkill /F /PID <номер_PID>

# Например:
taskkill /F /PID 12345
```

### Решение 2: Использовать другой порт
В корне проекта создайте файл `.env`:
```
PORT=3001
```

Затем откройте: http://localhost:3001/Food-Delivery

---

## ❌ Проблема: Сайт не открывается после `npm start`

### Проверка 1: Дождитесь компиляции
После `npm start` подождите 30-60 секунд. Вы должны увидеть:
```
Compiled successfully!
You can now view fooddelivery-frontend in the browser.
  Local:            http://localhost:3000/Food-Delivery
```

### Проверка 2: Откройте вручную
Если браузер не открылся автоматически:
1. Откройте Chrome/Firefox/Edge
2. Введите: **http://localhost:3000/Food-Delivery**

### Проверка 3: Проверьте порт
```cmd
netstat -ano | findstr ":3000" | findstr "LISTENING"
```

Если нет вывода - сервер не запущен.

---

## ❌ Проблема: Ошибки при компиляции

### Типичные ошибки:

#### 1. Синтаксические ошибки в коде
Проверьте последние измененные файлы на наличие:
- Незакрытых скобок `{ }`
- Незакрытых кавычек `" "`
- Пропущенных запятых

#### 2. Отсутствующие импорты
```jsx
// ❌ Плохо
const Home = () => { ... }

// ✅ Хорошо
import React from 'react';
const Home = () => { ... }
```

#### 3. Несуществующие модули
Если ошибка типа `Module not found: Can't resolve 'some-package'`:
```cmd
npm install some-package
```

---

## ❌ Проблема: "Out of memory" или очень долгая компиляция

### Решение: Увеличить память для Node.js

В `package.json` измените `scripts.start`:
```json
{
  "scripts": {
    "start": "set NODE_OPTIONS=--max_old_space_size=4096 && react-scripts start"
  }
}
```

---

## ❌ Проблема: Тесты не проходят

### Решение:
```cmd
# Очистить кэш Jest
npm test -- --clearCache

# Запустить тесты снова
npm test -- --watchAll=false
```

---

## ❌ Проблема: Сайт работает локально, но не на телефоне

### Проверка 1: Та же Wi-Fi сеть
Убедитесь, что компьютер и телефон в одной сети.

### Проверка 2: Узнайте свой IP
```cmd
ipconfig
```
Найдите `IPv4 Address` (например, 192.168.1.100)

### Проверка 3: Firewall
Разрешите порт 3000 в Windows Firewall:
1. Панель управления → Брандмауэр Windows
2. Дополнительные параметры
3. Правила для входящих подключений → Создать правило
4. Порт → TCP → 3000
5. Разрешить подключение

### Проверка 4: Откройте на телефоне
```
http://<ваш_IP>:3000/Food-Delivery
```

---

## 🚀 Быстрые команды для перезапуска

### Windows (создайте файл `restart-dev.bat`):
```bat
@echo off
echo Stopping Node processes...
taskkill /F /IM node.exe 2>nul
echo.
echo Starting dev server...
npm start
```

### Использование:
Просто двойной клик на `restart-dev.bat`

---

## 📊 Проверка работоспособности

### Шаг 1: Проверить Node.js
```cmd
node --version
npm --version
```
Должны быть: Node 14+ и npm 6+

### Шаг 2: Проверить зависимости
```cmd
npm list react react-dom react-router-dom
```
Все должны быть установлены без ошибок.

### Шаг 3: Проверить порт
```cmd
netstat -ano | findstr ":3000"
```

### Шаг 4: Проверить сервер
Откройте: http://localhost:3000/Food-Delivery

---

## 🆘 Крайние меры (Nuclear Option)

Если ничего не помогает:

```cmd
# 1. Полная очистка
taskkill /F /IM node.exe
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force

# 2. Проверить Node
node --version
npm --version

# 3. Переустановить все
npm install

# 4. Запустить
npm start
```

Если и это не помогает:
```cmd
# Переустановить Node.js
# Скачайте с https://nodejs.org/
# Установите LTS версию (рекомендуется)
# После установки повторите шаги 1-4
```

---

## ✅ Проверка что все работает

### Контрольный список:
- [ ] `npm start` выполняется без ошибок
- [ ] Видите "Compiled successfully!"
- [ ] http://localhost:3000/Food-Delivery открывается
- [ ] Можно зарегистрироваться/войти
- [ ] Меню загружается
- [ ] Можно добавить в корзину
- [ ] `npm test` проходит успешно

---

## 📞 Дополнительная помощь

### Логи ошибок
Когда видите ошибку, сохраните полный лог:
```cmd
npm start > error-log.txt 2>&1
```

Затем откройте `error-log.txt` и найдите строки с ERROR.

### Версии пакетов
Проверьте файл `package.json` - версии должны быть:
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.8.2",
  "react-scripts": "5.0.1"
}
```

---

## 🎯 Частые вопросы (FAQ)

**Q: Нужно ли запускать `npm start` каждый раз после перезагрузки?**  
A: Да, development сервер не запускается автоматически.

**Q: Можно ли закрыть терминал после `npm start`?**  
A: Нет, если закроете - сервер остановится.

**Q: Как остановить сервер?**  
A: Нажмите `Ctrl+C` в терминале или `taskkill /F /IM node.exe`

**Q: Почему такой длинный URL с `/Food-Delivery`?**  
A: Это указано в `package.json` в поле `homepage`. Для локальной разработки можно удалить эту строку.

**Q: Медленно компилируется, норм ально?**  
A: Первая компиляция 30-60 сек - нормально. Следующие будут быстрее (Hot reload).

---

*Если проблема не решена - опишите ошибку подробно с полным текстом в терминале*
