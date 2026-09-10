/**
 * Pool de MariaDB/MySQL.
 *
 * Dos decisiones que evitan el problema clásico de fechas:
 *   - la sesión trabaja en UTC (`+00:00`), así CURRENT_TIMESTAMP es UTC siempre;
 *   - `dateStrings: true` devuelve las fechas como texto tal cual están en la
 *     base, sin que el driver las reinterprete con la zona del proceso. La
 *     conversión a ISO se hace explícita en `lib/fechas.js`.
 */
const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
  dateStrings: true,
  supportBigNumbers: true,
  namedPlaceholders: false,
});

pool.on('connection', (conexion) => {
  conexion.query("SET time_zone = '+00:00'");
});

/** Consulta simple: devuelve solo las filas. */
async function consultar(sql, parametros = []) {
  const [filas] = await pool.execute(sql, parametros);
  return filas;
}

/** Primera fila o null. */
async function consultarUna(sql, parametros = []) {
  const filas = await consultar(sql, parametros);
  return filas.length ? filas[0] : null;
}

/** INSERT/UPDATE/DELETE: devuelve el ResultSetHeader. */
async function ejecutar(sql, parametros = []) {
  const [resultado] = await pool.execute(sql, parametros);
  return resultado;
}

/** Ejecuta `trabajo(conexion)` dentro de una transacción. */
async function enTransaccion(trabajo) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

async function probarConexion() {
  const conexion = await pool.getConnection();
  try {
    await conexion.query('SELECT 1');
  } finally {
    conexion.release();
  }
}

module.exports = { pool, consultar, consultarUna, ejecutar, enTransaccion, probarConexion };
