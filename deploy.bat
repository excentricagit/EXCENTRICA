@echo off
echo ========================================
echo    EXCENTRICA - Deploy a Cloudflare
echo ========================================
echo.

echo [1/2] Desplegando Worker API...
cd worker
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo ERROR: Fallo el deploy del Worker
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Desplegando Frontend (Pages)...
call npx wrangler pages deploy public --project-name=excentrica
if %errorlevel% neq 0 (
    echo ERROR: Fallo el deploy de Pages
    pause
    exit /b 1
)

echo.
echo ========================================
echo    DEPLOY COMPLETADO EXITOSAMENTE!
echo ========================================
echo.
echo Worker API: https://excentrica-api.contactoexcentrica.workers.dev
echo Frontend:   https://excentrica-6v4.pages.dev
echo.
pause
