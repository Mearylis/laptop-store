@echo off
echo ==========================================
echo FIXING ALL FRONTEND DEPENDENCIES
echo ==========================================

cd frontend

echo 1. Installing Core Dependencies (Bootstrap, Icons, ChartJS)...
call npm install react-bootstrap bootstrap react-icons react-chartjs-2 chart.js sass --legacy-peer-deps

echo 2. Installing AJV for Webpack compatibility...
call npm install ajv@8 --save-dev

echo.
echo ==========================================
echo DEPENDENCIES FIXED!
echo You can now run "npm start"
echo ==========================================
pause
