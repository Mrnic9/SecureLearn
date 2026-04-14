# 🗄️ Modelo de Base de Datos - SecureLearn

## Tabla: users

Almacena información de usuarios del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| uuid | VARCHAR(36) | UNIQUE NOT NULL | UUID para referencias externas |
| email | VARCHAR(255) | UNIQUE NOT NULL | Email del usuario |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt |
| first_name | VARCHAR(100) | NOT NULL | Nombre del usuario |
| last_name | VARCHAR(100) | NOT NULL | Apellido del usuario |
| role | VARCHAR(20) | DEFAULT 'student' | Rol: admin, instructor, student |
| is_active | BOOLEAN | DEFAULT true | Estado del usuario |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Fecha de última actualización |

**Índices:**
- `idx_users_email`: Búsqueda rápida por email
- `idx_users_role`: Filtrado por rol

**Ejemplo:**
```sql
INSERT INTO users (uuid, email, password_hash, first_name, last_name, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'john@example.com', '$2a$10$...', 'John', 'Doe', 'student');
```

---

## Tabla: audit_logs

Registro de auditoría de acciones en el sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FK → users | Usuario que realizó la acción |
| action | VARCHAR(100) | NOT NULL | Tipo de acción (LOGIN_SUCCESS, USER_REGISTERED, etc.) |
| resource | VARCHAR(100) | NOT NULL | Recurso afectado (auth, user, course) |
| details | TEXT | | JSON con detalles adicionales |
| ip_address | VARCHAR(45) | | Dirección IP de la solicitud |
| created_at | TIMESTAMP | DEFAULT NOW() | Timestamp de la acción |

**Índices:**
- `idx_audit_user`: Búsqueda por usuario
- `idx_audit_created`: Ordenamiento por fecha

**Acciones registradas:**
- `LOGIN_SUCCESS` - Login exitoso
- `LOGIN_FAILED` - Intento de login fallido
- `USER_REGISTERED` - Nuevo usuario registrado
- `COURSE_ENROLLED` - Usuario inscrito en curso
- `QUIZ_COMPLETED` - Quiz completado

---

## Tabla: courses

Catálogo de cursos de capacitación.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| uuid | VARCHAR(36) | UNIQUE NOT NULL | UUID para referencias |
| title | VARCHAR(255) | NOT NULL | Título del curso |
| description | TEXT | | Descripción detallada |
| category | VARCHAR(100) | NOT NULL | Categoría (Fundamentos, etc.) |
| level | VARCHAR(20) | DEFAULT 'beginner' | Nivel: beginner, intermediate, advanced |
| duration_minutes | INTEGER | | Duración estimada en minutos |
| instructor_id | INTEGER | FK → users | Instructor responsable |
| is_published | BOOLEAN | DEFAULT false | Si el curso está publicado |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Fecha de última actualización |

**Índices:**
- `idx_courses_category`: Búsqueda por categoría

**Categorías disponibles:**
- Fundamentos
- Seguridad de Usuario
- Desarrollo Seguro
- Criptografía
- Cumplimiento Normativo

---

## Tabla: course_modules

Módulos que componen cada curso.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| uuid | VARCHAR(36) | UNIQUE NOT NULL | UUID para referencias |
| course_id | INTEGER | FK → courses | Curso al que pertenece |
| title | VARCHAR(255) | NOT NULL | Título del módulo |
| content | TEXT | | Contenido en HTML/Markdown |
| order_num | INTEGER | NOT NULL | Orden dentro del curso |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

---

## Tabla: enrollments

Inscripciones de usuarios a cursos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FK → users NOT NULL | Usuario inscrito |
| course_id | INTEGER | FK → courses NOT NULL | Curso |
| progress_percentage | DECIMAL(5,2) | DEFAULT 0 | Porcentaje completado (0-100) |
| completed_at | TIMESTAMP | | Fecha de completación |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de inscripción |
| UNIQUE(user_id, course_id) | | | Un usuario por curso |

**Índices:**
- `idx_enrollments_user`: Búsqueda por usuario

---

## Tabla: quizzes

Evaluaciones/quizzes de los cursos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| uuid | VARCHAR(36) | UNIQUE NOT NULL | UUID para referencias |
| course_id | INTEGER | FK → courses NOT NULL | Curso al que pertenece |
| title | VARCHAR(255) | NOT NULL | Título del quiz |
| passing_score | DECIMAL(5,2) | DEFAULT 70 | Puntuación mínima para pasar |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

---

## Tabla: quiz_questions

Preguntas del quiz.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| uuid | VARCHAR(36) | UNIQUE NOT NULL | UUID para referencias |
| quiz_id | INTEGER | FK → quizzes NOT NULL | Quiz al que pertenece |
| question_text | TEXT | NOT NULL | Texto de la pregunta |
| question_type | VARCHAR(20) | DEFAULT 'multiple_choice' | Tipo: multiple_choice, true_false |
| order_num | INTEGER | NOT NULL | Orden en el quiz |

---

## Tabla: quiz_answers

Opciones de respuesta para las preguntas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| uuid | VARCHAR(36) | UNIQUE NOT NULL | UUID para referencias |
| question_id | INTEGER | FK → quiz_questions NOT NULL | Pregunta |
| answer_text | TEXT | NOT NULL | Texto de la respuesta |
| is_correct | BOOLEAN | DEFAULT false | Si es la respuesta correcta |
| order_num | INTEGER | NOT NULL | Orden en las opciones |

---

## Tabla: quiz_results

Resultados de los quizzes completados por usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FK → users NOT NULL | Usuario |
| quiz_id | INTEGER | FK → quizzes NOT NULL | Quiz completado |
| score | DECIMAL(5,2) | | Puntuación obtenida |
| passed | BOOLEAN | | Si pasó (score >= passing_score) |
| completed_at | TIMESTAMP | DEFAULT NOW() | Fecha de completación |

---

## Consultas Frecuentes

### 1. Obtener cursos de un usuario
```sql
SELECT c.* FROM courses c
JOIN enrollments e ON c.id = e.course_id
WHERE e.user_id = $1
ORDER BY e.created_at DESC;
```

### 2. Obtener progreso de usuario en curso
```sql
SELECT progress_percentage, completed_at FROM enrollments
WHERE user_id = $1 AND course_id = $2;
```

### 3. Obtener audit logs de usuario
```sql
SELECT * FROM audit_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

### 4. Resultados de quizzes
```sql
SELECT q.title, qr.score, qr.passed, qr.completed_at
FROM quiz_results qr
JOIN quizzes q ON qr.quiz_id = q.id
WHERE qr.user_id = $1
ORDER BY qr.completed_at DESC;
```

---

## Constraints de Integridad

1. **Foreign Keys**: Eliminar usuario elimina sus enrollments y audit logs (ON DELETE CASCADE)
2. **Unique Constraints**: Un usuario no puede inscribirse dos veces al mismo curso
3. **Check Constraints**: progress_percentage entre 0-100, role en valores válidos
4. **Not Null**: Campos críticos como email, password_hash, title, etc.

## Backup y Recuperación

```bash
# Backup completo
pg_dump -U postgres -d securelearn > backup.sql

# Restaurar
psql -U postgres -d securelearn < backup.sql

# Backup solo datos (sin esquema)
pg_dump -U postgres -d securelearn --data-only > data_backup.sql
```

---

**Última actualización**: Abril 2026
**Versión**: 1.0.0-MVP
