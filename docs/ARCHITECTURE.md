# 🏗️ Arquitectura del Sistema - SecureLearn

## Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   HomePage   │  │   LoginPage   │  │ DashboardPage│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓ (HTTP REST API)
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Routes (Auth, Users, Courses)               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Middleware (JWT, CORS, Rate Limiting, Validation)  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Controllers & Services (Business Logic)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ (PostgreSQL Driver)
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Users     │  │   Courses    │  │  Enrollments │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│  │  Audit Logs  │  │   Quizzes    │  │   Results    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Frontend (React)
- **Ubicación**: `/frontend`
- **Tecnologías**: React 18, React Router, Zustand, Axios
- **Características**:
  - SPA (Single Page Application)
  - Gestión de estado con Zustand
  - Rutas protegidas (Private Routes)
  - Diseño responsive
  - Interfaz accesible

### 2. Backend (Node.js + Express)
- **Ubicación**: `/backend`
- **Tecnologías**: Node.js, Express.js, PostgreSQL
- **Características**:
  - RESTful API
  - Autenticación JWT
  - Middleware de seguridad
  - Rate limiting
  - Validación de entrada
  - Logging de auditoría

### 3. Base de Datos (PostgreSQL)
- **Ubicación**: PostgreSQL Server (local en desarrollo)
- **Tablas Principales**:
  - `users`: Almacena información de usuarios
  - `audit_logs`: Registro de acciones
  - `courses`: Catálogo de cursos
  - `enrollments`: Inscripciones de usuarios
  - `quizzes`: Evaluaciones
  - `quiz_results`: Resultados de evaluaciones

## Flujo de Autenticación

```
1. Usuario envía credenciales (email + password)
   ↓
2. Backend valida credenciales contra BD
   ↓
3. Si son válidas:
   - Genera JWT token (firmado con secret)
   - Retorna token al cliente
   ↓
4. Cliente almacena token en localStorage
   ↓
5. Próximas requests incluyen: Authorization: Bearer <token>
   ↓
6. Middleware verifica y decodifica token
   ↓
7. Acceso garantizado a rutas protegidas
```

## Seguridad Implementada

### Autenticación
- ✅ JWT (JSON Web Tokens) con expiración
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Rate limiting en endpoint de login (5 intentos/15 min)

### Control de Acceso
- ✅ Roles basados (Admin, Instructor, Student)
- ✅ Middleware `requireRole` para rutas protegidas
- ✅ Validación de permisos por acción

### Protección de Datos
- ✅ CORS restringido a origen conocido
- ✅ Helmet para headers de seguridad
- ✅ Validación de entrada con Joi
- ✅ SQL injection prevention (Parameterized queries)
- ✅ Auditoría de acciones críticas

### Headers de Seguridad
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`

## Stack Tecnológico

| Layer | Componente | Versión |
|-------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| | React Router | 6.17.0 |
| | Zustand | 4.4.1 |
| **Backend** | Node.js | 16+ |
| | Express | 4.18.2 |
| | PostgreSQL | 14+ |
| | JWT | 9.1.2 |
| | Bcrypt | 2.4.3 |
| **Testing** | Jest | 29.7.0 |
| | Supertest | 6.3.3 |
| **DevOps** | GitHub Actions | - |

## Modelo de Datos (ER)

```
users
├── id (PK)
├── uuid (UNIQUE)
├── email (UNIQUE)
├── password_hash
├── first_name
├── last_name
├── role (admin|instructor|student)
├── is_active
├── created_at
└── updated_at
    ↓
    ├── 1 → N: audit_logs
    ├── 1 → N: courses (instructor)
    ├── 1 → N: enrollments
    └── 1 → N: quiz_results

courses
├── id (PK)
├── uuid (UNIQUE)
├── title
├── description
├── category
├── level
├── duration_minutes
├── instructor_id (FK → users)
├── is_published
├── created_at
└── updated_at
    ↓
    ├── 1 → N: course_modules
    ├── 1 → N: enrollments
    └── 1 → N: quizzes

enrollments
├── id (PK)
├── user_id (FK → users)
├── course_id (FK → courses)
├── progress_percentage
├── completed_at
└── created_at

quizzes
├── id (PK)
├── course_id (FK → courses)
├── title
├── passing_score
└── quiz_questions (1 → N)
    ├── question_text
    ├── question_type
    └── quiz_answers (1 → N)
```

## Endpoints API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Usuarios
- `GET /api/users/me` - Obtener perfil actual
- `GET /api/users` - Listar usuarios (admin)
- `PUT /api/users/me` - Actualizar perfil

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obtener detalles
- `POST /api/courses` - Crear curso (instructor)
- `POST /api/courses/:id/enroll` - Inscribirse
- `GET /api/courses/:id/progress` - Obtener progreso

## Deployment

### Desarrollo
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

### Producción
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify
- BD: Managed PostgreSQL (AWS RDS, Heroku, Railway)
- CI/CD: GitHub Actions

## Escalabilidad Futura

1. **Caché** (Redis) para sessiones y datos frecuentes
2. **Websockets** para notificaciones en tiempo real
3. **Microservicios** separados por dominio
4. **Elasticsearch** para búsqueda avanzada
5. **CDN** para assets estáticos
6. **Message Queue** (RabbitMQ) para tareas async

---

**Última actualización**: Abril 2026
**Versión**: 1.0.0-MVP
