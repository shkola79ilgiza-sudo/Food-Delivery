@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════╗
echo ║     🚀 ЗАПУСК САЙТА                   ║
echo ╚════════════════════════════════════════╝
echo.
echo [1] Останавливаю старые процессы...
taskkill /F /IM node.exe 2>nul
echo.
echo [2] Запускаю сервер...
echo.
start /min cmd /c "npx serve -s build -l 3000 & pause"
echo ⏳ Ожидание 10 секунд...
timeout /t 10 /nobreak >nul
echo.
echo [3] Открываю браузер...
start http://localhost:3000/
echo.
echo ✅ ГОТОВО!
echo.
echo 🌐 Адрес: http://localhost:3000/
echo.
echo 💡 НЕ ЗАКРЫВАЙТЕ минимизированное окно с сервером!
echo.
pause
