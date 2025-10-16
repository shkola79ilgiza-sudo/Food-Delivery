@echo off
setlocal
set PATH=C:\Program Files\Git\bin;%PATH%
cd build
git init
git add -A
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/shkola79ilgiza-sudo/Food-Delivery.git
git push -f origin gh-pages
cd ..
echo.
echo Deployment complete! 
echo Go to: https://github.com/shkola79ilgiza-sudo/Food-Delivery/settings/pages
echo Select branch: gh-pages
echo Your site will be at: https://shkola79ilgiza-sudo.github.io/Food-Delivery
pause
