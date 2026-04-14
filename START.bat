@echo off
REM Script de inicio para SecureLearn
REM Requiere: Node.js 16+, PostgreSQL 14+

echo.
echo ========================================
echo     SecureLearn - Setup Inicial
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado o no está en PATH
    echo Descargalo en: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detectado:
node --version

REM Instalar dependencias del backend
echo.
echo [1/5] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo instalando dependencias backend
    pause
    exit /b 1
)
cd ..

REM Instalar dependencias del frontend
echo.
echo [2/5] Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo instalando dependencias frontend
    pause
    exit /b 1
)
cd ..

echo.
echo [3/5] Configuración completada!
echo.

echo ========================================
echo       PRÓXIMOS PASOS
echo ========================================
echo.
echo [A] Asegúrate que PostgreSQL está corriendo
echo    - Host: localhost
echo    - Puerto: 5432
echo    - Usuario: postgres
echo    - Contraseña: securelearn123
echo    - Base de datos: securelearn
echo.
echo    Si necesitas crear la BD:
echo    createdb -U postgres securelearn
echo.
echo [B] Ejecuta en TERMINAL 1 (backend):
echo    cd backend
echo    npm run db:setup
echo    npm run db:seed
echo    npm run dev
echo.
echo [C] Ejecuta en TERMINAL 2 (frontend):
echo    cd frontend
echo    npm start
echo.
echo [D] Abre en navegador:
echo    http://localhost:3000
echo.
echo [E] Credenciales de prueba:
echo    Admin: admin@securelearn.local / Admin123!
echo    Instructor: instructor@securelearn.local / Instructor123!
echo    Student: student@securelearn.local / Student123!
echo.
echo ========================================
echo.

pause
