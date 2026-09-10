/**
 * Carga y valida el entorno una sola vez. Si falta algo crítico el proceso no
 * arranca: es preferible a descubrirlo con un 500 en producción.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const RAIZ = path.join(__dirname, '..', '..');

function requerido(clave) {
  const valor = process.env[clave];
  if (!valor || !valor.trim()) {
    console.error(`Falta la variable de entorno ${clave}. Revise el .env (hay un .env.example de referencia).`);
    process.exit(1);
  }
  return valor.trim();
}

function opcional(clave, porDefecto) {
  const valor = process.env[clave];
  return valor === undefined || valor === '' ? porDefecto : valor;
}

function booleano(clave, porDefecto = false) {
  const valor = opcional(clave, String(porDefecto));
  return valor === 'true' || valor === '1';
}

function entero(clave, porDefecto) {
  const valor = Number(opcional(clave, porDefecto));
  return Number.isFinite(valor) ? valor : porDefecto;
}

function normalizarOrigen(valor) {
  return String(valor || '').trim().replace(/\/+$/, '');
}

function listaOrigenes() {
  const desdeEnv = opcional('CORS_ORIGINS', '')
    .split(',')
    .map(normalizarOrigen)
    .filter(Boolean);
  if (desdeEnv.length) return desdeEnv;
  if (opcional('NODE_ENV', 'development') === 'production') {
    return [
      'https://pcanadiense.edu.pe',
      'https://www.pcanadiense.edu.pe',
      'http://pcanadiense.edu.pe',
      'http://www.pcanadiense.edu.pe',
    ];
  }
  return ['http://localhost:4200', 'http://127.0.0.1:4200'];
}

const env = {
  raiz: RAIZ,
  entorno: opcional('NODE_ENV', 'development'),
  produccion: opcional('NODE_ENV', 'development') === 'production',
  puerto: entero('PORT', 3000),
  origenesCors: listaOrigenes(),

  db: {
    host: opcional('DB_HOST', '127.0.0.1'),
    port: entero('DB_PORT', 3306),
    user: requerido('DB_USER'),
    password: opcional('DB_PASSWORD', ''),
    database: requerido('DB_NAME'),
  },

  jwt: {
    secreto: requerido('JWT_SECRET'),
    expira: opcional('JWT_EXPIRA', '8h'),
  },

  archivos: {
    directorio: path.isAbsolute(opcional('ALMACEN_DIR', 'almacen'))
      ? opcional('ALMACEN_DIR', 'almacen')
      : path.join(RAIZ, opcional('ALMACEN_DIR', 'almacen')),
    maxImagenBytes: entero('MAX_MB_IMAGEN', 5) * 1024 * 1024,
    maxPdfBytes: entero('MAX_MB_PDF', 15) * 1024 * 1024,
  },

  correo: {
    habilitado: booleano('MAIL_HABILITADO', false),
    host: opcional('MAIL_HOST', 'localhost'),
    puerto: entero('MAIL_PORT', 1025),
    seguro: booleano('MAIL_SEGURO', false),
    usuario: opcional('MAIL_USER', ''),
    clave: opcional('MAIL_PASSWORD', ''),
    remitente: opcional('MAIL_REMITENTE', 'mesadepartes@pcanadiense.edu.pe'),
    receptor: opcional('MAIL_RECEPTOR', 'informes@pcanadiense.edu.pe'),
  },

  admin: {
    usuario: opcional('ADMIN_USUARIO', 'admin'),
    nombre: opcional('ADMIN_NOMBRE', 'Administrador del portal'),
    clave: opcional('ADMIN_CLAVE', ''),
  },
};

module.exports = env;
