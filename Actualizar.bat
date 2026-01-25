@echo off
chcp 65001 >nul
title EXCENTRICA - Actualizar

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║             EXCENTRICA - Subir Actualizaciones               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Verificar que existe repositorio Git
if not exist ".git" (
    echo [ERROR] No hay repositorio Git inicializado.
    echo Primero ejecuta: deploy-github.bat
    pause
    exit /b 1
)

:: Mostrar cambios
echo [INFO] Archivos modificados:
echo.
git status --short
echo.

:: Preguntar mensaje de commit
set /p MENSAJE="Mensaje del commit (o ENTER para 'Actualización'): "
if "%MENSAJE%"=="" set MENSAJE=Actualización

:: Agregar cambios
echo.
echo [PASO 1/3] Agregando cambios...
git add .

:: Commit
echo.
echo [PASO 2/3] Creando commit...
git commit -m "%MENSAJE%"
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] No hay cambios para commitear.
)

:: Push
echo.
echo [PASO 3/3] Subiendo a GitHub...
git push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al subir a GitHub
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                 ¡ACTUALIZACIÓN EXITOSA!                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Preguntar si desea redesplegar
echo.
set /p DEPLOY="¿Deseas redesplegar a Cloudflare? (S/N): "
if /i "%DEPLOY%"=="S" (
    echo.
    echo Desplegando Worker...
    cd worker
    wrangler deploy
    cd ..

    echo.
    echo Desplegando Pages...
    wrangler pages deploy public --project-name=excentrica

    echo.
    echo [OK] Redesplegado exitosamente.
)

echo.
echo Cambios subidos a: https://github.com/xHardPlay/Shobg-Excentrica
echo.
pause
