@echo off
cd /d %~dp0
echo Starting Laravel Queue Worker...
echo Current directory: %CD%
php artisan queue:work --timeout=300 --tries=3 --memory=256 --sleep=3
if errorlevel 1 (
    echo Error starting queue worker
    pause
    exit /b 1
)
pause 