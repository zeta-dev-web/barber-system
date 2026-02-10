@echo off
echo ========================================
echo   SETUP BARBERIA - PostgreSQL + Prisma
echo ========================================
echo.

cd backend

echo [1/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo [2/5] Generando cliente de Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error generando cliente de Prisma
    pause
    exit /b 1
)

echo.
echo [3/5] Creando migracion inicial...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo Error creando migracion
    pause
    exit /b 1
)

echo.
echo [4/5] Cargando datos iniciales...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo Error cargando datos
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SETUP COMPLETADO!
echo ========================================
echo.
echo Credenciales admin:
echo   Usuario: admin
echo   Password: admin123
echo.
echo Para iniciar el servidor:
echo   cd backend
echo   npm run dev
echo.
pause
