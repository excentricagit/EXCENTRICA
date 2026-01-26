@echo off
chcp 65001 >nul
title Configuración de Google Drive - EXCENTRICA
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     CONFIGURACIÓN DE GOOGLE DRIVE PARA EXCENTRICA         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:MENU
echo.
echo [1] 📋 Ver instrucciones para Google Console
echo [2] 🔧 Instalar dependencias necesarias
echo [3] 🔑 Configurar credenciales (credentials.json)
echo [4] ✅ Autorizar acceso a Google Drive
echo [5] 🧪 Probar conexión con Drive
echo [6] 🚀 Actualizar Worker con Drive
echo [7] ❌ Salir
echo.

set /p option="Selecciona una opción: "

if "%option%"=="1" goto INSTRUCTIONS
if "%option%"=="2" goto INSTALL_DEPS
if "%option%"=="3" goto SETUP_CREDENTIALS
if "%option%"=="4" goto AUTHORIZE
if "%option%"=="5" goto TEST_CONNECTION
if "%option%"=="6" goto UPDATE_WORKER
if "%option%"=="7" goto END

echo.
echo ❌ Opción inválida
goto MENU

:INSTRUCTIONS
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         INSTRUCCIONES PARA GOOGLE CLOUD CONSOLE          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 📝 PASO 1: Crear proyecto en Google Cloud Console
echo    ----------------------------------------
echo    1. Ve a: https://console.cloud.google.com/
echo    2. Haz clic en "Crear proyecto"
echo    3. Nombre: "EXCENTRICA"
echo    4. Haz clic en "Crear"
echo.
echo 📝 PASO 2: Habilitar Google Drive API
echo    ----------------------------------------
echo    1. Ve a: https://console.cloud.google.com/apis/library
echo    2. Busca "Google Drive API"
echo    3. Haz clic en "HABILITAR"
echo.
echo 📝 PASO 3: Crear credenciales OAuth 2.0
echo    ----------------------------------------
echo    1. Ve a: https://console.cloud.google.com/apis/credentials
echo    2. Haz clic en "CREAR CREDENCIALES" ^> "ID de cliente de OAuth"
echo    3. Si te pide configurar pantalla de consentimiento:
echo       - Tipo: Externo
echo       - Nombre de la app: EXCENTRICA
echo       - Correo de asistencia: tu email
echo       - Ámbitos: ../auth/drive.file
echo    4. Tipo de aplicación: "Aplicación de escritorio"
echo    5. Nombre: "EXCENTRICA Desktop"
echo    6. Haz clic en "CREAR"
echo    7. DESCARGA el JSON (botón de descarga)
echo.
echo 📝 PASO 4: Guardar credenciales
echo    ----------------------------------------
echo    1. Renombra el archivo descargado a: credentials.json
echo    2. Guárdalo en: %~dp0
echo    3. O usa la opción [3] del menú para copiar el contenido
echo.
echo 📝 PASO 5: Configurar carpeta de Drive
echo    ----------------------------------------
echo    Tu carpeta: https://drive.google.com/drive/folders/1oFP8POy4DIemxHBOWrsAE6yprDopuLZJ
echo    ID de carpeta: 1oFP8POy4DIemxHBOWrsAE6yprDopuLZJ
echo    (Ya está configurado)
echo.
echo.
pause
goto MENU

:INSTALL_DEPS
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              INSTALANDO DEPENDENCIAS                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📦 Instalando googleapis...
call npm install googleapis

echo 📦 Instalando form-data...
call npm install form-data

echo 📦 Instalando dotenv...
call npm install dotenv

echo.
echo ✅ Dependencias instaladas correctamente
echo.
pause
goto MENU

:SETUP_CREDENTIALS
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║            CONFIGURAR CREDENTIALS.JSON                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

if exist "credentials.json" (
    echo ⚠️  Ya existe un archivo credentials.json
    echo.
    set /p overwrite="¿Deseas sobrescribirlo? (S/N): "
    if /i not "%overwrite%"=="S" goto MENU
)

echo.
echo Pega el contenido completo del archivo JSON descargado de Google Console
echo (Presiona Ctrl+V y luego Enter, luego escribe FIN y presiona Enter)
echo.

set "json_file=credentials.json"
if exist "%json_file%" del "%json_file%"

echo. > temp_input.txt
notepad temp_input.txt

if exist temp_input.txt (
    move /y temp_input.txt credentials.json >nul
    echo.
    echo ✅ Archivo credentials.json creado
) else (
    echo ❌ Error al crear el archivo
)

echo.
pause
goto MENU

:AUTHORIZE
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║           AUTORIZAR ACCESO A GOOGLE DRIVE                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

if not exist "credentials.json" (
    echo ❌ No se encontró credentials.json
    echo    Primero debes configurar las credenciales [opción 3]
    pause
    goto MENU
)

echo 🔑 Iniciando proceso de autorización...
echo    Se abrirá una ventana del navegador para autorizar
echo.

node scripts\authorize-drive.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Autorización completada exitosamente
) else (
    echo.
    echo ❌ Error en la autorización
)

echo.
pause
goto MENU

:TEST_CONNECTION
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║            PROBAR CONEXIÓN CON GOOGLE DRIVE               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

if not exist "token.json" (
    echo ❌ No estás autorizado. Primero autoriza [opción 4]
    pause
    goto MENU
)

echo 🧪 Probando conexión con Drive...
echo.

node scripts\test-drive.js

echo.
pause
goto MENU

:UPDATE_WORKER
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         ACTUALIZAR WORKER PARA USAR GOOGLE DRIVE          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo ⚠️  Esta opción actualizará el Worker de Cloudflare
echo    para usar Google Drive en lugar de R2
echo.
set /p confirm="¿Continuar? (S/N): "

if /i not "%confirm%"=="S" goto MENU

echo.
echo 📝 Generando configuración...
node scripts\generate-drive-config.js

echo.
echo 🚀 Desplegando Worker actualizado...
cd worker
call npx wrangler deploy
cd ..

echo.
echo ✅ Worker actualizado y desplegado
echo.
pause
goto MENU

:END
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   CONFIGURACIÓN FINALIZADA                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 👋 Gracias por usar el configurador de EXCENTRICA
echo.
pause
exit
