@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🔧 ПОЛНОЕ ИСПРАВЛЕНИЕ И ПЕРЕЗАПУСК     ║
echo ╚════════════════════════════════════════════╝
echo.
echo ⚠️  ВНИМАНИЕ: Это удалит node_modules и переустановит все!
echo.
echo Нажмите любую клавишу для продолжения или закройте окно для отмены...
pause >nul
echo.

echo ═══════════════════════════════════════════════
echo  ШАГ 1/6: Остановка процессов Node.js
echo ═══════════════════════════════════════════════
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Процессы остановлены
) else (
    echo ℹ️  Нет запущенных процессов
)
timeout /t 2 /nobreak >nul
echo.

echo ═══════════════════════════════════════════════
echo  ШАГ 2/6: Удаление node_modules
echo ═══════════════════════════════════════════════
if exist node_modules (
    echo ⏳ Удаление node_modules... (может занять минуту)
    rmdir /s /q node_modules
    echo ✅ node_modules удален
) else (
    echo ℹ️  node_modules не найден
)
echo.

echo ═══════════════════════════════════════════════
echo  ШАГ 3/6: Удаление package-lock.json
echo ═══════════════════════════════════════════════
if exist package-lock.json (
    del package-lock.json
    echo ✅ package-lock.json удален
) else (
    echo ℹ️  package-lock.json не найден
)
echo.

echo ═══════════════════════════════════════════════
echo  ШАГ 4/6: Очистка кэша npm
echo ═══════════════════════════════════════════════
npm cache clean --force
echo ✅ Кэш очищен
echo.

echo ═══════════════════════════════════════════════
echo  ШАГ 5/6: Установка зависимостей
echo ═══════════════════════════════════════════════
echo ⏳ Установка... (займет 1-2 минуты)
echo.
npm install
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Зависимости установлены успешно!
) else (
    echo ❌ ОШИБКА при установке зависимостей!
    echo.
    echo Проверьте:
    echo 1. Установлен ли Node.js (node --version)
    echo 2. Есть ли интернет подключение
    echo 3. Не блокирует ли антивирус/firewall
    echo.
    pause
    exit /b 1
)
echo.

echo ═══════════════════════════════════════════════
echo  ШАГ 6/6: Запуск development сервера
echo ═══════════════════════════════════════════════
echo.
echo ✅ ВСЕ ГОТОВО! Запускаю сервер...
echo.
echo ⏳ Подождите 30-60 секунд для компиляции
echo 🌐 Сайт откроется автоматически
echo.
echo Адрес: http://localhost:3000/Food-Delivery
echo.
echo Для остановки нажмите Ctrl+C
echo.
echo ═══════════════════════════════════════════════
echo.

npm start
