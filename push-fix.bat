@echo off
chcp 65001 >nul
title EXCENTRICA - Push Fix

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          EXCENTRICA - Subir Cambios (FIX)                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Token de acceso personal
set TOKEN=
set REPO=excentricagit/EXCENTRICA

echo [PASO 1/4] Verificando cambios...
git status --short
echo.

set /p CONTINUAR="¿Continuar con el push? (S/N): "
if /i not "%CONTINUAR%"=="S" (
    echo Operación cancelada.
    pause
    exit /b 0
)

echo.
echo [PASO 2/4] Agregando cambios...
git add .

echo.
echo [PASO 3/4] Creando commit...
set /p MENSAJE="Mensaje del commit: "
if "%MENSAJE%"=="" set MENSAJE=Actualización

git commit -m "%MENSAJE%"
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] No hay cambios nuevos para commitear.
)

echo.
echo [PASO 4/4] Subiendo a GitHub (usando token)...
git -c credential.helper= push https://%TOKEN%@github.com/%REPO%.git main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                 ¡SUBIDA EXITOSA!                             ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo Cambios disponibles en: https://github.com/%REPO%
) else (
    echo.
    echo [ERROR] No se pudo subir a GitHub.
    echo.
    echo Posibles causas:
    echo - El token ha expirado o no tiene permisos
    echo - No tienes acceso al repositorio %REPO%
    echo.
    echo Solución: Genera un nuevo token en:
    echo https://github.com/settings/tokens
)

echo.
pause
