# 🔒 SecureLearn - Portal de Capacitación en Seguridad

Plataforma educativa integral para sensibilización sobre seguridad de la información y buenas prácticas de ciberseguridad.

## 📋 Características MVP

- ✅ **Autenticación segura** con JWT y bcrypt
- ✅ **Gestión de usuarios y roles** (Admin, Instructor, Estudiante)
- ✅ **Módulo de cursos** con contenido de seguridad
- ✅ **Evaluaciones y quizzes** interactivos
- ✅ **Sistema de certificados** digitales
- ✅ **Dashboard** personalizado por rol
- ✅ **Auditoría** de acciones de usuarios
- ✅ **OWASP Top 10** mitigaciones implementadas

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| **Backend** | Node.js + Express |
| **Frontend** | React 18 |
| **Base de Datos** | PostgreSQL 14+ |
| **Autenticación** | JWT (JSON Web Tokens) |
| **Encriptación** | bcrypt, crypto |
| **Testing** | Jest, Supertest |
| **CI/CD** | GitHub Actions |

## 📂 Estructura del Proyecto

```
SecureLearn/
├── backend/                 # API REST Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de BD
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Autenticación y validación
│   │   ├── services/        # Servicios reutilizables
│   │   └── config/          # Configuración
│   ├── tests/               # Tests unitarios e integración
│   └── package.json
├── frontend/                # Cliente React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── context/         # Context API para estado
│   │   ├── services/        # Llamadas a API
│   │   └── styles/          # Estilos globales
│   └── package.json
├── docs/                    # Documentación técnica
│   ├── ARCHITECTURE.md      # Diagrama de arquitectura
│   ├── DATABASE.md          # Modelo de datos
│   ├── API.md               # Documentación de API
│   ├── SECURITY.md          # Implementación de seguridad
│   └── USER_GUIDE.md        # Manual de usuario
└── README.md                # Este archivo
```

## 🚀 Quick Start

### Requisitos Previos
- Node.js 16+
- PostgreSQL 14+
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   cd SecureLearn
   ```

2. **Configurar Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Configurar Frontend** (en otra terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Base de Datos**
   ```bash
   # Se inicializa automáticamente al iniciar el backend
   npm run db:setup
   ```

### Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api/docs

## 📊 Usuarios de Demostración

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@securelearn.local | Admin123! | Admin |
| instructor@securelearn.local | Instructor123! | Instructor |
| student@securelearn.local | Student123! | Estudiante |

## 🔐 Seguridad Implementada

- **Autenticación JWT** con tokens seguros
- **Contraseñas encriptadas** con bcrypt (10 rounds)
- **Validación de entradas** contra inyecciones
- **CORS** restringido
- **Rate limiting** en endpoints sensibles
- **Auditoría** de acciones críticas
- **Headers de seguridad** (HELMET)
- **HTTPS ready** para producción

## ✅ Testing

```bash
# Backend
cd backend
npm test                    # Ejecutar tests
npm run test:coverage       # Con cobertura

# Frontend
cd frontend
npm test                    # Ejecutar tests
```

## 📚 Documentación

Ver carpeta `/docs` para:
- Documentación técnica completa
- Especificación de requerimientos
- Diagramas UML y arquitectura
- API documentation
- Manual de usuario

## 🔄 Roadmap

### Fase 1 (Actual)
- [x] Autenticación y autorización
- [x] Gestión de usuarios
- [x] Estructura base de cursos

### Fase 2 (Próximas semanas)
- [ ] Módulo completo de cursos
- [ ] Sistema de evaluaciones
- [ ] Certificados digitales
- [ ] Tests de seguridad avanzados

### Fase 3 (Futuro)
- [ ] Analytics y reporting
- [ ] Integraciones LDAP/Active Directory
- [ ] Mobile app
- [ ] Machine learning para recomendaciones

## 📝 Licencia

Proyecto académico - Uso interno

## 🤝 Contribuir

Para cambios, crear un branch feature y enviar pull request.

---

**Última actualización**: Abril 2026
**Estado**: MVP en desarrollo
