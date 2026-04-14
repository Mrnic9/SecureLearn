#!/bin/bash

# Script de inicio para SecureLearn
# Requiere: Node.js 16+, PostgreSQL 14+

echo ""
echo "========================================"
echo "     SecureLearn - Setup Inicial"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado"
    echo "Descargalo en: https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js detectado:"
node --version

# Instalar backend
echo ""
echo "[1/3] Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Fallo instalando backend"
    exit 1
fi
cd ..

# Instalar frontend
echo ""
echo "[2/3] Instalando dependencias del frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Fallo instalando frontend"
    exit 1
fi
cd ..

echo ""
echo "[3/3] Configuración completada!"
echo ""

echo "========================================"
echo "       PRÓXIMOS PASOS"
echo "========================================"
echo ""
echo "[A] Asegúrate que PostgreSQL está corriendo:"
echo "    - Host: localhost"
echo "    - Puerto: 5432"
echo "    - Usuario: postgres"
echo "    - Contraseña: securelearn123"
echo ""
echo "[B] Ejecuta en TERMINAL 1 (backend):"
echo "    cd backend"
echo "    npm run db:setup"
echo "    npm run db:seed"
echo "    npm run dev"
echo ""
echo "[C] Ejecuta en TERMINAL 2 (frontend):"
echo "    cd frontend"
echo "    npm start"
echo ""
echo "[D] Abre en navegador:"
echo "    http://localhost:3000"
echo ""
echo "[E] Credenciales de prueba:"
echo "    Admin: admin@securelearn.local / Admin123!"
echo "    Instructor: instructor@securelearn.local / Instructor123!"
echo "    Student: student@securelearn.local / Student123!"
echo ""
echo "========================================"
echo ""
