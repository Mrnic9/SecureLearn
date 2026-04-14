# 🔐 Documentación de Seguridad - SecureLearn

## Implementación de OWASP Top 10 (2021)

### 1. Broken Access Control
**Vulnerabilidad**: Acceso no autorizado a recursos

**Mitigaciones Implementadas**:
- ✅ JWT basado en roles (admin, instructor, student)
- ✅ Middleware `requireRole()` valida permisos
- ✅ Validación en cada endpoint protegido
- ✅ Auditoría de accesos denegados

**Código**:
```javascript
// Proteger ruta a solo admin
router.get('/users', authMiddleware, requireRole('admin'), ...);
```

---

### 2. Cryptographic Failures
**Vulnerabilidad**: Fallo en encriptación y gestión de secretos

**Mitigaciones Implementadas**:
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT firmado con secret de 32+ caracteres
- ✅ HTTPS habilitado en producción (ready)
- ✅ Environment variables para secrets (nunca en código)
- ✅ Tokens con expiración (7 días)

**Código**:
```javascript
const passwordHash = await bcrypt.hash(password, 10);
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
```

---

### 3. Injection
**Vulnerabilidad**: Inyección SQL, NoSQL, comandos

**Mitigaciones Implementadas**:
- ✅ Parameterized queries en todas las consultas SQL
- ✅ Validación con Joi de toda entrada
- ✅ Sanitización de datos
- ✅ Prepared statements

**Código**:
```javascript
// ✅ SEGURO - Parameterized query
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email] // Parámetro separado
);

// ❌ INSEGURO - Evitado
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

---

### 4. Insecure Design
**Vulnerabilidad**: Diseño sin consideraciones de seguridad

**Mitigaciones Implementadas**:
- ✅ Autenticación desde el inicio
- ✅ Autorización basada en roles
- ✅ Rate limiting en endpoints sensibles
- ✅ Validación de entrada obligatoria
- ✅ CORS restrictivo

**Rate Limiting**:
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos en 15 minutos
  message: 'Demasiados intentos'
});
```

---

### 5. Security Misconfiguration
**Vulnerabilidad**: Configuración insegura del servidor

**Mitigaciones Implementadas**:
- ✅ Helmet.js para headers de seguridad
- ✅ CORS restringido a orígenes conocidos
- ✅ Environment variables para configuración
- ✅ Error handling sin revelar detalles internos
- ✅ Logging seguro (sin datos sensibles)

**Headers de Seguridad**:
```javascript
app.use(helmet()); // Añade múltiples headers
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security
// - Content-Security-Policy
```

---

### 6. Vulnerable and Outdated Components
**Vulnerabilidad**: Librerías desactualizadas con vulnerabilidades

**Mitigaciones Implementadas**:
- ✅ Dependencies auditadas regularmente
- ✅ Versions actualizadas (npm audit fix)
- ✅ Testing de compatibilidad
- ✅ Actualización programada

**Verificar vulnerabilidades**:
```bash
npm audit
npm audit fix
```

---

### 7. Authentication Failures
**Vulnerabilidad**: Autenticación débil o fallida

**Mitigaciones Implementadas**:
- ✅ JWT con expiración
- ✅ Contraseñas fortes (mínimo 8 caracteres)
- ✅ Hashing con bcrypt (no MD5, SHA1)
- ✅ Rate limiting en login (5 intentos/15 min)
- ✅ Sesiones seguras con httpOnly cookies (ready)

**Validación de contraseña**:
```javascript
if (password.length < 8) {
  throw new Error('Contraseña mínimo 8 caracteres');
}
```

---

### 8. Software and Data Integrity Failures
**Vulnerabilidad**: Fallos en integridad de software

**Mitigaciones Implementadas**:
- ✅ Validación en cliente y servidor
- ✅ Tipos de datos validados
- ✅ Rango de valores verificados
- ✅ Checksum en datos críticos

**Validación con Joi**:
```javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});
```

---

### 9. Logging and Monitoring Failures
**Vulnerabilidad**: Falta de logging y alertas

**Mitigaciones Implementadas**:
- ✅ Auditoría de acciones críticas
- ✅ Logging de intentos fallidos
- ✅ Registro de cambios de permisos
- ✅ Timestamps en todos los eventos
- ✅ Sin exposición de datos sensibles en logs

**Auditoría**:
```javascript
await pool.query(
  `INSERT INTO audit_logs (user_id, action, resource, details)
   VALUES ($1, $2, $3, $4)`,
  [userId, 'LOGIN_SUCCESS', 'auth', details]
);
```

---

### 10. Server-Side Request Forgery (SSRF)
**Vulnerabilidad**: Forjar solicitudes desde el servidor

**Mitigaciones Implementadas**:
- ✅ Validación de URLs
- ✅ Whitelist de dominios permitidos
- ✅ CORS restrictivo
- ✅ No seguir redirects sin validación

---

## Gestión de Secretos

### Variables de Entorno (`.env`)
```bash
# Nunca en repositorio
JWT_SECRET=your_super_secret_key_32_chars_minimum!
DATABASE_PASSWORD=securelearn123
```

### En Producción
- ✅ AWS Secrets Manager / Vault
- ✅ Rotación de secretos
- ✅ Auditoría de acceso
- ✅ Encriptación en reposo

---

## Autenticación y Autorización

### Flujo de Autenticación JWT

```
1. Cliente POST /api/auth/login { email, password }
2. Servidor:
   - Busca usuario por email
   - Valida password con bcrypt.compare()
   - Genera JWT: sign(user_data, SECRET, { expiresIn: '7d' })
   - Retorna { token, user }
3. Cliente almacena token en localStorage
4. Próximas requests: Authorization: Bearer <token>
5. Servidor verifica jwt.verify(token, SECRET)
```

### Matriz de Permisos

| Endpoint | Admin | Instructor | Student |
|----------|-------|-----------|---------|
| GET /users | ✅ | ❌ | ❌ |
| POST /courses | ✅ | ✅ | ❌ |
| GET /courses | ✅ | ✅ | ✅ |
| POST /enroll | ✅ | ✅ | ✅ |

---

## Testing de Seguridad

### 1. OWASP ZAP (Automated)
```bash
# Escanear aplicación
zaproxy ... -r report.html
```

### 2. Pruebas Manuales
- ❌ Intentar acceder a `/admin` sin token
- ❌ Intentar manipular JWT modificando payload
- ❌ SQL Injection: `' OR '1'='1`
- ❌ XSS: `<script>alert('test')</script>`

### 3. Tests Unitarios de Seguridad
```javascript
test('should hash password', async () => {
  const hashed = await bcrypt.hash('password', 10);
  expect(hashed).not.toEqual('password');
  expect(await bcrypt.compare('password', hashed)).toBe(true);
});
```

---

## Responsabilidades de Seguridad

### Desarrolladores
- Validar entrada siempre
- Usar parameterized queries
- No comitear secrets
- Mantener dependencias actualizadas

### DevOps
- Mantener HTTPS en producción
- Rotación de secrets
- Backups encriptados
- Monitoreo y alertas

### Administradores
- Auditoría de usuarios
- Gestión de permisos
- Actualización de parches
- Respuesta a incidentes

---

## Checklist de Seguridad Pre-Producción

- [ ] Cambiar JWT_SECRET por un valor fuerte
- [ ] Habilitar HTTPS/TLS
- [ ] Configurar CORS correctamente
- [ ] Setup de backups automáticos
- [ ] Configurar monitoreo y alertas
- [ ] Actualizar todas las dependencias
- [ ] Ejecutar npm audit
- [ ] Testing OWASP ZAP
- [ ] Penetration testing
- [ ] Documentación de incidentes
- [ ] Plan de respuesta a incidentes
- [ ] Copias de seguridad probadas

---

## Incidentes de Seguridad

### Procedimiento de Respuesta

1. **Detectar**: Monitoreo detecta anomalía
2. **Contener**: Desactivar acceso comprometido
3. **Investigar**: Revisar logs y auditoría
4. **Remediar**: Aplicar fix
5. **Documentar**: Crear incident report
6. **Comunicar**: Notificar a usuarios afectados

### Escalación
- **Critical**: Inmediato
- **High**: Dentro de 24 horas
- **Medium**: Dentro de una semana
- **Low**: Planificado

---

## Referencias

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Última actualización**: Abril 2026
**Versión**: 1.0.0-MVP
**Estado**: ✅ Implementadas mitigaciones OWASP Top 10
