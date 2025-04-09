@echo off
cd /d %~dp0
php artisan queue:work --tries=3 --timeout=30 