# 🧪 Guía de Pruebas de Seguridad - SecureLearn

## Inicio Rápido

### URLs de la Aplicación
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/api

### Credenciales de Prueba
```
Admin:
  Email: admin@securelearn.local
  Password: Admin123!

Instructor:
  Email: instructor@securelearn.local
  Password: Instructor123!

Estudiante:
  Email: student@securelearn.local
  Password: Student123!
```

---

## Test 1: Validación de Email

### Caso 1A: Email Inválido
1. Ir a página de Login
2. Escribir: `invalidemail`
3. **Esperado**: Mensaje de error "Email inválido"
4. Campo debe estar rojo
5. Botón debe estar deshabilitado

### Caso 1B: Email Válido
1. Escribir: `test@example.com`
2. **Esperado**: Error desaparece
3. Campo vuelve a normal
4. Botón se habilita

---

## Test 2: Rate Limiting de Login

### Caso 2A: Bloqueo de Cuenta
1. Ir a Login
2. Escribir email válido: `student@securelearn.local`
3. Escribir contraseña incorrecta: `WrongPassword123!`
4. Click en "Iniciar Sesión"
5. **Esperado**: "Error en login" + "Intentos restantes: 4/5"
6. Repetir 4 veces más
7. **Esperado (5to intento)**: 
   - Mensaje: "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos"
   - Botón deshabilitado con ⏳
   - Campos deshabilitados

### Caso 2B: Desbloqueo Automático
1. Esperar 15 minutos
2. O editar tiempo en SecurityService (para test rápido)
3. Actualizar página
4. **Esperado**: Cuenta se desbloquea
5. Poder intentar login nuevamente

### Caso 2C: Login Exitoso Limpia Intentos
1. Intentar login 2 veces con contraseña incorrecta
2. Contador muestra: "3/5"
3. Escribir contraseña correcta: `Student123!`
4. Click en "Iniciar Sesión"
5. **Esperado**: Login exitoso, redirige a dashboard
6. Volver a logout y login
7. **Esperado**: Contador debe estar en 5/5 (limpiado)

---

## Test 3: Validación de Contraseña en Registro

### Caso 3A: Contraseña Débil
1. Ir a Registro
2. Llenar nombre y email
3. Escribir contraseña: `weak`
4. **Esperado**:
   - Barra de fortaleza: 33% roja
   - Etiqueta: "❌ Débil"
   - 4-5 requisitos en rojo
   - Botón deshabilitado

### Caso 3B: Contraseña Regular
1. Escribir: `WeakPass12`
2. **Esperado**:
   - Barra: 66% amarilla
   - Etiqueta: "⚠️ Regular"
   - 3 requisitos verdes, 2 rojos
   - Botón deshabilitado

### Caso 3C: Contraseña Fuerte
1. Escribir: `StrongPass123!`
2. **Esperado**:
   - Barra: 100% verde
   - Etiqueta: "✓ Fuerte"
   - 4 requisitos verdes, 1 rojo
   - Botón deshabilitado

### Caso 3D: Contraseña Muy Fuerte
1. Escribir: `VeryStrong123!@#`
2. **Esperado**:
   - Barra: 100% verde
   - Etiqueta: "✅ Muy Fuerte"
   - Todos 5 requisitos verdes
   - Botón HABILITADO

### Caso 3E: Requisitos Dinámicos
1. Escribir: `password`
2. Agregar mayúscula: `Password`
3. Agregar número: `Password1`
4. Agregar especial: `Password1!`
5. **Esperado**: Cada cambio actualiza checklist en tiempo real

---

## Test 4: Gestión de Sesiones

### Caso 4A: Login Exitoso Inicia Sesión
1. Ir a Login
2. Ingresar credenciales correctas
3. Click "Iniciar Sesión"
4. **Esperado**:
   - Redirige a /dashboard
   - Token en sessionStorage
   - Token en localStorage
   - User info en context

### Caso 4B: Advertencia de Sesión (25 minutos)
1. Login como estudiante
2. Esperar 25 minutos (o cambiar tiempo en SecurityService)
3. **Esperado**:
   - Modal aparece con transición suave
   - Titulo: "⏰ Sesión por Expirar"
   - Muestra nombre del usuario
   - Botones: "Continuar Sesión" y "Cerrar Sesión"

### Caso 4C: Extender Sesión
1. Modal visible
2. Click en "✓ Continuar Sesión"
3. **Esperado**:
   - Modal desaparece
   - Timers se reinician
   - Otros 30 minutos disponibles
   - Session_extended en logs

### Caso 4D: Cerrar desde Modal
1. Modal visible
2. Click en "✕ Cerrar Sesión"
3. **Esperado**:
   - Logout inmediato
   - Redirige a /login
   - Sesión limpiada
   - session_logout_from_warning en logs

### Caso 4E: Logout Automático
1. Login
2. Esperar 30 minutos sin actividad
3. **Esperado**:
   - Sesión expira
   - Logout automático
   - Redirige a /login
   - session_expired en logs

### Caso 4F: Activity Resets Timers
1. Login
2. Esperar 15 minutos
3. Mover ratón o presionar tecla
4. **Esperado**:
   - Timers se reinician
   - Otros 30 minutos desde ese momento
   - Ningún modal aparece

---

## Test 5: CSRF Protection

### Caso 5A: Token Generado
1. Abrir DevTools → Console
2. Escribir: `sessionStorage.getItem('csrf_token')`
3. **Esperado**: Se muestra token UUID

### Caso 5B: Token en Headers
1. Ir a Network tab
2. Hacer cualquier request POST (enrollarse en curso)
3. Ver request headers
4. **Esperado**: Header `X-CSRF-Token` incluido

### Caso 5C: Token en API Calls
1. Abrir Console
2. Escribir: `sessionStorage.getItem('csrf_token')`
3. Copiar token
4. Hacer fetch manualmente:
```javascript
fetch('http://localhost:5000/api/courses/1/enroll', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'X-CSRF-Token': sessionStorage.getItem('csrf_token'),
    'Content-Type': 'application/json'
  }
})
```
5. **Esperado**: Request exitoso o error de CSRF si backend lo valida

---

## Test 6: Security Logging

### Caso 6A: Ver Logs en Console
1. Abrir DevTools → Console
2. Limpiar console
3. Login
4. **Esperado**: Mensaje `[SECURITY LOG]` con evento `user_login`
5. Logout
6. **Esperado**: Mensaje con evento `user_logout`

### Caso 6B: Eventos Registrados
Hacer estas acciones y ver logs:
- Login exitoso → `user_login`
- Login fallido → `login_failed`
- Cuenta bloqueada → `account_locked_display`
- Intento bloqueado → `login_attempt_while_locked`
- Registro → `user_registration_success`
- Modal de sesión → `session_warning_shown`
- Extender sesión → `session_extended`
- Logout → `user_logout`

### Caso 6C: Información en Logs
1. Hacer login
2. Ver log en console
3. **Esperado**: Log incluye:
   - timestamp (ISO 8601)
   - event (nombre)
   - details (datos específicos)
   - userAgent (info navegador)
   - ip (client-side)

---

## Test 7: Detección de Actividad Sospechosa

### Caso 7A: >3 Intentos en 5 Minutos
1. Ir a Login
2. Hacer 3+ intentos fallidos en menos de 5 minutos
3. Ver console
4. **Esperado**: Evento `suspicious_activity_detected`

---

## Test 8: XSS Prevention

### Caso 8A: Input Sanitization
1. Ir a Login
2. Escribir en email: `<script>alert('XSS')</script>@test.com`
3. **Esperado**:
   - No ejecuta script
   - Muestra como texto normal
   - Email es inválido

### Caso 8B: Registro XSS
1. Ir a Registro
2. Nombre: `<img src=x onerror="alert('XSS')">`
3. Submit
4. **Esperado**: No ejecuta, guarda como texto

---

## Test 9: Error Handling

### Caso 9A: Email Duplicado
1. Ir a Registro
2. Usar email existente
3. Click Crear Cuenta
4. **Esperado**: Error "Email ya registrado"

### Caso 9B: Contraseña No Cumple Requisitos
1. Ir a Registro
2. Rellenar todo
3. Contraseña: `weak123`
4. Click Crear Cuenta
5. **Esperado**: Error "No cumple requisitos"

### Caso 9C: Red Error
1. Desconectar internet
2. Intentar login
3. **Esperado**: Error de red visible

---

## Test 10: Mobile Responsiveness

### Caso 10A: Login Mobile
1. Abrir DevTools → Mobile view (375px)
2. Ir a Login
3. **Esperado**:
   - Elementos responsive
   - Botones clickeables
   - Mensaje visible
   - No hay overflow

### Caso 10B: Modal Mobile
1. En mobile view
2. Esperar a modal de sesión
3. **Esperado**:
   - Modal centrado
   - Botones full-width o stacked
   - Texto legible

---

## Checklist de Pruebas Completas

### Autenticación
- [ ] Email inválido muestra error
- [ ] Email válido acepta
- [ ] 5 intentos fallidos bloquean
- [ ] Tiempo de bloqueo se cuenta regresivamente
- [ ] Cuenta se desbloquea después de 15 min
- [ ] Login exitoso limpia intentos

### Contraseña
- [ ] Débil < 3 requisitos
- [ ] Regular = 3 requisitos
- [ ] Fuerte = 4 requisitos
- [ ] Muy Fuerte = 5 requisitos
- [ ] Checklist se actualiza en tiempo real
- [ ] Botón se habilita solo con todos requisitos

### Sesión
- [ ] Login inicia sesión
- [ ] Token se almacena correctamente
- [ ] Modal aparece a los 25 minutos
- [ ] Continuar extiende sesión
- [ ] Logout desde modal funciona
- [ ] Actividad reinicia timers
- [ ] Logout automático después de 30 min

### Seguridad
- [ ] CSRF token se genera
- [ ] CSRF token se incluye en headers
- [ ] XSS attempts no se ejecutan
- [ ] Logs registran eventos
- [ ] Actividad sospechosa se detecta

### UI
- [ ] Campos con error son rojos
- [ ] Campos válidos son verdes
- [ ] Alertas son visibles
- [ ] Modal es responsive
- [ ] Mensajes están en español
- [ ] Iconos están presentes

---

## Debugging

### Ver Logs de Seguridad
```javascript
// Console
localStorage.getItem('token')
sessionStorage.getItem('auth_token')
sessionStorage.getItem('csrf_token')
```

### Simular Session Timeout
```javascript
// En Console (para testing rápido)
// Cambiar warningTime a 5 segundos, sessionTimeout a 10
```

### Limpiar Estado
```javascript
// Console
sessionStorage.clear()
localStorage.clear()
location.reload()
```

### Ver Network Requests
1. DevTools → Network
2. Filter: XHR
3. Hacer actions
4. Ver headers y payload

---

## Reportar Problemas

Si encuentras algo que no funciona:

1. **Anota el pasos exactos** para reproducir
2. **Captura pantalla** del error
3. **Abre console** y copia el error
4. **Verifica logs** en SecurityService
5. **Reporta con fecha y hora**

---

## Performance

### Métricas Esperadas
- Login: < 2s
- Register: < 2s
- Dashboard: < 1s
- Network requests: < 500ms

### Monitoreo
1. DevTools → Performance
2. Grabar sesión de login
3. Ver tiempos
4. Verificar no hay memory leaks

---

**Last Updated**: Abril 2024
**Status**: ✅ Listo para Testing
