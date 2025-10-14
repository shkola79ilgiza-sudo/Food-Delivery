@echo off
echo ========================================
echo   СБОРКА И ЗАПУСК САЙТА
echo ========================================
echo.
echo [1/3] Остановка старых процессов...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo [2/3] Сборка проекта (это займет 30-60 секунд)...
call npm run build
echo.
echo [3/3] Запуск сервера...
timeout /t 2 /nobreak >nul
start http://localhost:3000/
npx serve -s build -l 3000

