@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\Git\bin;%PATH%
echo Deploying to GitHub Pages...
git --version
npx gh-pages -d build --dotfiles
echo Done!
pause
