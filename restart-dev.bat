@echo off
chcp 65001 >nul
echo.
echo ================================
echo   🔄 Перезапуск Dev Сервера
echo ================================
echo.

echo [1/3] Остановка Node процессов...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Процессы остановлены
) else (
    echo ℹ️  Нет запущенных процессов
)
echo.

echo [2/3] Ожидание 2 секунды...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Запуск сервера...
echo.
echo ⏳ Пожалуйста, подождите 30-60 секунд...
echo 🌐 Сайт откроется автоматически
echo.
echo Для остановки нажмите Ctrl+C
echo.
echo ================================
echo.

npm start
