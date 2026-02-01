@echo off
echo Starting Laptop Store Project...

:: Start Backend
start "Laptop Store Backend" cmd /k "cd backend && npm run dev"

:: Start Frontend
start "Laptop Store Frontend" cmd /k "cd frontend && npm start"

echo Servers are starting...
echo Backend will be at: http://localhost:5000
echo Frontend will be at: http://localhost:3000
echo.
echo api-docs: http://localhost:5000/api-docs
