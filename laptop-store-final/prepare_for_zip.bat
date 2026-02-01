@echo off
echo Deleting node_modules... please wait.
rmdir /s /q "backend\node_modules"
rmdir /s /q "frontend\node_modules"
echo.
echo ===================================================
echo DONE! Project is now light-weight.
echo You can now ZIP the 'laptop-store-final' folder.
echo.
echo To restore the project later, run: install_dependencies.bat
echo ===================================================
pause
