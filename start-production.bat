@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🚀 ЗАПУСК PRODUCTION СБОРКИ             ║
echo ╚════════════════════════════════════════════╝
echo.
echo ⏳ Запускаю сервер...
echo.
echo 🌐 Сайт будет доступен по адресу:
echo    http://localhost:3000/
echo.
echo 💡 Для остановки нажмите Ctrl+C
echo.
echo ═══════════════════════════════════════════════
echo.

npx serve -s build -l 3000

pause
