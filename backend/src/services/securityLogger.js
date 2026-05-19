/**
 * SecurityLogger — Registro estructurado de eventos de seguridad
 * Implementado con fs nativo de Node.js (sin dependencias externas).
 * Rotación diaria: cada archivo se llama security-YYYY-MM-DD.log
 */

const fs = require('fs');
const path = require('path');

// ─── Configuración ────────────────────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, '../../logs');
const MAX_FILE_SIZE_MB = 10; // Rota si el archivo supera 10 MB

// Asegurar que la carpeta de logs exista
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayFilename() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `security-${date}.log`);
}

function shouldRotate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size > MAX_FILE_SIZE_MB * 1024 * 1024;
  } catch {
    return false; // El archivo no existe aún
  }
}

function writeLog(level, event, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    details: details || {},
    pid: process.pid,
  };

  const line = JSON.stringify(logEntry) + '\n';
  const filePath = getTodayFilename();

  // Si el archivo supera el límite, añadir sufijo de rotación manual
  if (shouldRotate(filePath)) {
    const rotated = filePath.replace('.log', `-${Date.now()}.log`);
    try { fs.renameSync(filePath, rotated); } catch { /* continuar */ }
  }

  try {
    fs.appendFileSync(filePath, line, 'utf8');
  } catch (err) {
    // Si falla la escritura en disco, al menos logueamos en consola
    console.error('[SecurityLogger] No se pudo escribir en disco:', err.message);
  }

  // También imprimir en consola con color según nivel
  const colors = { INFO: '\x1b[36m', WARN: '\x1b[33m', ERROR: '\x1b[31m' };
  const reset = '\x1b[0m';
  const color = colors[level] || '';
  console.log(`${color}[SECURITY ${level}]${reset} ${event}`, JSON.stringify(details || {}));
}

// ─── API pública ───────────────────────────────────────────────────────────────
const securityLogger = {
  /**
   * Eventos normales: login_success, user_registered, session_extended
   */
  info(event, details) {
    writeLog('INFO', event, details);
  },

  /**
   * Alertas: login_failed, registration_failed, invalid_token
   */
  warn(event, details) {
    writeLog('WARN', event, details);
  },

  /**
   * Errores críticos: server_error, suspicious_activity, unauthorized_access
   */
  error(event, details) {
    writeLog('ERROR', event, details);
  },

  /**
   * Obtener los últimos N logs del día actual (útil para un endpoint de admin)
   */
  getRecentLogs(limit = 100) {
    const filePath = getTodayFilename();
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines
        .slice(-limit)
        .map(line => { try { return JSON.parse(line); } catch { return null; } })
        .filter(Boolean)
        .reverse(); // más recientes primero
    } catch {
      return [];
    }
  },
};

module.exports = securityLogger;
