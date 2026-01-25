@echo off
chcp 65001 >nul
title EXCENTRICA - Deploy a GitHub

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           EXCENTRICA - Deploy Inicial a GitHub               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Verificar si git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git no está instalado.
    echo Descárgalo de: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [INFO] Git encontrado.
echo.

:: Verificar si ya existe un repositorio
if exist ".git" (
    echo [INFO] Ya existe un repositorio Git en esta carpeta.
    echo.
    set /p REINIT="¿Deseas reinicializar? (S/N): "
    if /i "%REINIT%"=="S" (
        rmdir /s /q .git 2>nul
    ) else (
        echo.
        echo [INFO] Puedes usar Actualizar.bat para subir cambios.
        pause
        exit /b 0
    )
)

:: Inicializar Git
echo.
echo [PASO 1/5] Inicializando repositorio Git...
git init
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al inicializar Git
    pause
    exit /b 1
)

:: Configurar rama principal
git branch -M main

:: Agregar archivos
echo.
echo [PASO 2/5] Agregando archivos al repositorio...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al agregar archivos
    pause
    exit /b 1
)

:: Commit inicial
echo.
echo [PASO 3/5] Creando commit inicial...
git commit -m "Initial commit - EXCENTRICA v1.2.0"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al crear commit
    pause
    exit /b 1
)

:: Configurar remote
echo.
echo [PASO 4/5] Configurando repositorio remoto...
echo.
echo Tu repositorio es: https://github.com/excentricagit/EXCENTRICA.git
echo.

git remote add origin https://github.com/excentricagit/EXCENTRICA.git 2>nul
if %ERRORLEVEL% NEQ 0 (
    git remote set-url origin https://github.com/excentricagit/EXCENTRICA.git
)

:: Push
echo.
echo [PASO 5/5] Subiendo a GitHub...
echo.
echo NOTA: Si es la primera vez, se abrirá una ventana para autenticarte.
echo.
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Error al subir a GitHub.
    echo.
    echo Posibles soluciones:
    echo 1. Verifica que el repositorio exista en GitHub
    echo 2. Asegúrate de estar autenticado en GitHub
    echo 3. Si el repo está vacío, intenta: git push -u origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ¡DEPLOY EXITOSO!                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Tu código está ahora en GitHub:
echo https://github.com/excentricagit/EXCENTRICA
echo.
echo Próximo paso: Ejecuta deploy-cloudflare.bat para configurar el hosting.
echo.
pause
