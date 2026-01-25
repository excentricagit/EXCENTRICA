@echo off
chcp 65001 >nul
title EXCENTRICA - Configurar Cloudflare

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           EXCENTRICA - Configurar Cloudflare                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado.
    echo Descárgalo de: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js encontrado.

:: Verificar/Instalar wrangler
echo.
echo [INFO] Verificando Wrangler CLI...
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Instalando Wrangler globalmente...
    npm install -g wrangler
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al instalar Wrangler
        pause
        exit /b 1
    )
)
echo [OK] Wrangler disponible.

:: Login a Cloudflare
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 1: LOGIN A CLOUDFLARE                                  ║
echo ║  Se abrirá el navegador para autenticarte.                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
wrangler login
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error en el login de Cloudflare
    pause
    exit /b 1
)
echo [OK] Login exitoso.

:: Crear base de datos D1
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 2: CREAR BASE DE DATOS D1                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Creando base de datos 'excentrica-db'...
wrangler d1 create excentrica-db
echo.
echo [IMPORTANTE] Copia el 'database_id' que aparece arriba.
echo.
set /p DB_ID="Pega aquí el database_id: "

:: Actualizar wrangler.toml con el ID correcto
echo.
echo Actualizando configuración...
cd worker
powershell -Command "(Get-Content wrangler.toml) -replace 'YOUR_D1_DATABASE_ID', '%DB_ID%' | Set-Content wrangler.toml"
cd ..
echo [OK] Configuración actualizada.

:: Ejecutar schema SQL
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 3: CREAR TABLAS EN LA BASE DE DATOS                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
cd worker
wrangler d1 execute excentrica-db --remote --file=schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al crear tablas
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Tablas creadas exitosamente.

:: Crear bucket R2
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 4: CREAR BUCKET R2 PARA ARCHIVOS                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
wrangler r2 bucket create excentrica-media
echo [OK] Bucket R2 creado.

:: Instalar dependencias del worker
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 5: INSTALAR DEPENDENCIAS DEL WORKER                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
cd worker
npm install
cd ..
echo [OK] Dependencias instaladas.

:: Desplegar Worker
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 6: DESPLEGAR API (WORKER)                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
cd worker
wrangler deploy
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al desplegar Worker
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Worker desplegado.

:: Desplegar Pages
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  PASO 7: DESPLEGAR FRONTEND (PAGES)                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
wrangler pages deploy public --project-name=excentrica
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al desplegar Pages
    pause
    exit /b 1
)
echo [OK] Frontend desplegado.

:: Resumen final
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║               ¡CONFIGURACIÓN COMPLETADA!                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Tu aplicación está ahora en línea:
echo.
echo   Frontend: https://excentrica.pages.dev
echo   API:      (revisa la URL que apareció al desplegar el Worker)
echo   Admin:    https://excentrica.pages.dev/admin/
echo.
echo Credenciales de admin:
echo   Email:    admin@excentrica.com.ar
echo   Password: Admin123!
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  IMPORTANTE: Actualiza la URL de la API en public/js/config.js
echo ║  con la URL real de tu Worker.
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
