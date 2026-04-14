# 🚀 Guía de Inicio Rápido - SecureLearn

## Requisitos Previos

- **Node.js 16+**: [Descargar](https://nodejs.org/)
- **PostgreSQL 14+**: [Descargar](https://www.postgresql.org/download/)
- **Git** (opcional)

---

## Instalación en 5 minutos

### Paso 1: Crear Base de Datos PostgreSQL

**En Windows (cmd o PowerShell):**
```bash
createdb -U postgres securelearn
```

**En Linux/Mac:**
```bash
createdb -U postgres securelearn
```

### Paso 2: Clonar/Descargar el Proyecto

```bash
cd C:\Users\asus\Desktop\Nicolas
# El proyecto ya está en: C:\Users\asus\Desktop\Nicolas\SecureLearn
cd SecureLearn
```

### Paso 3: Ejecutar Script de Setup

**Windows:**
```bash
START.bat
```

**Linux/Mac:**
```bash
chmod +x START.sh
./START.sh
```

---

## Ejecución del Proyecto

### Terminal 1: Backend (Puerto 5000)

```bash
cd backend
npm run db:setup    # Inicializar tablas
npm run db:seed     # Cargar datos de prueba
npm run dev         # Iniciar servidor
```

Verás:
```
✅ Conectado a PostgreSQL
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en puerto 5000
📊 Documentación API: http://localhost:5000/api/docs
❤️  Health check: http://localhost:5000/health
```

### Terminal 2: Frontend (Puerto 3000)

```bash
cd frontend
npm start
```

Se abrirá automáticamente: **http://localhost:3000**

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@securelearn.local | Admin123! |
| Instructor | instructor@securelearn.local | Instructor123! |
| Estudiante | student@securelearn.local | Student123! |

---

## Funcionalidades Disponibles (MVP)

### 🔐 Autenticación
- ✅ Registro de nuevos usuarios
- ✅ Login con JWT
- ✅ Logout seguro
- ✅ Protección de rutas

### 👥 Gestión de Usuarios
- ✅ Perfil de usuario
- ✅ Edición de datos
- ✅ Listado de usuarios (admin)

### 📚 Cursos
- ✅ Listar cursos disponibles
- ✅ Ver detalles del curso
- ✅ Inscribirse a cursos
- ✅ Crear cursos (instructor)
- ✅ Progreso de curso

### 🔒 Seguridad
- ✅ Autenticación JWT
- ✅ Encriptación de contraseñas
- ✅ Rate limiting
- ✅ CORS seguro
- ✅ Headers de seguridad
- ✅ Auditoría de acciones

---

## Endpoints Disponibles

### Autenticación
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify
```

### Usuarios
```
GET /api/users/me
GET /api/users
PUT /api/users/me
```

### Cursos
```
GET /api/courses
GET /api/courses/:id
POST /api/courses
POST /api/courses/:id/enroll
GET /api/courses/:id/progress
```

---

## Testear la API

### Con cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@securelearn.local","password":"Student123!"}'

# Obtener perfil (usar token del login)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <tu_token>"
```

### Con Postman/Insomnia

1. Importar `backend` como API
2. Usar variables de entorno para el token
3. Probar endpoints

---

## Troubleshooting

### ❌ "Cannot connect to PostgreSQL"

**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
# Windows: Services > PostgreSQL
# Linux: sudo systemctl status postgresql

# Verificar credenciales en backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=securelearn123
```

### ❌ "npm ERR! Cannot find module"

**Solución:**
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Port 3000/5000 already in use"

**Solución:**
```bash
# Cambiar puerto en el archivo correspondiente
# Backend: backend/.env -> PORT=5001
# Frontend: REACT_APP_API_URL=http://localhost:5001
```

### ❌ "Cannot create database"

**Solución:**
```bash
# Conectarse a PostgreSQL
psql -U postgres

# En la consola SQL:
CREATE DATABASE securelearn;
\q
```

---

## Próximos Pasos

### Semana 1-2
- [ ] Implementar módulo completo de cursos
- [ ] Agregar sistema de evaluaciones
- [ ] Certificados digitales
- [ ] Más pruebas de seguridad

### Semana 3
- [ ] Testing avanzado
- [ ] Documentación completa
- [ ] Performance tuning
- [ ] Deployment a producción

### Semana 4
- [ ] Demo en vivo
- [ ] Presentación ejecutiva
- [ ] Defensa técnica

---

## Documentación Completa

- 📋 **ARCHITECTURE.md** - Arquitectura del sistema
- 🗄️ **DATABASE.md** - Modelo de datos
- 🔐 **SECURITY.md** - Implementación de seguridad
- 📖 **API.md** - Documentación de endpoints

---

## Ayuda Rápida

```bash
# Ver documentación API
curl http://localhost:5000/api/docs | json_pp

# Verificar health check
curl http://localhost:5000/health

# Ver logs en tiempo real
tail -f backend/logs/*.log
```

---

## Stack Completo

| Componente | Versión |
|-----------|---------|
| Node.js | 16+ |
| React | 18.2.0 |
| Express | 4.18.2 |
| PostgreSQL | 14+ |
| JWT | 9.1.2 |
| Bcrypt | 2.4.3 |

---

**¿Listo?** ✨ Ejecuta `START.bat` (Windows) o `./START.sh` (Linux/Mac) y ¡comienza!

Última actualización: Abril 2026
