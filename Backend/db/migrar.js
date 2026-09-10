/**
 * Ejecuta las migraciones .sql que aún no se han aplicado, en orden por nombre.
 * Idempotente: volver a lanzarlo no repite nada.
 */
const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

const CARPETA = path.join(__dirname, 'migraciones');

async function conectar() {
  // Primero sin base, para poder crearla si no existe.
  const servidor = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  try {
    await servidor.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\`
         DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } catch (error) {
    // El usuario de cPanel no suele poder crear bases: se crea desde el panel.
    console.warn(`No se pudo crear la base (${error.code}). Se asume que ya existe.`);
  }

  await servidor.changeUser({ database: env.db.database });
  return servidor;
}

async function principal() {
  const conexion = await conectar();

  await conexion.query(`
    CREATE TABLE IF NOT EXISTS migraciones (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      nombre     VARCHAR(191) NOT NULL UNIQUE,
      aplicada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [aplicadas] = await conexion.query('SELECT nombre FROM migraciones');
  const yaAplicadas = new Set(aplicadas.map((fila) => fila.nombre));

  const archivos = (await fs.readdir(CARPETA)).filter((n) => n.endsWith('.sql')).sort();
  let ejecutadas = 0;

  for (const archivo of archivos) {
    if (yaAplicadas.has(archivo)) continue;
    const sql = await fs.readFile(path.join(CARPETA, archivo), 'utf8');
    process.stdout.write(`Aplicando ${archivo} … `);
    try {
      await conexion.query(sql);
      await conexion.query('INSERT INTO migraciones (nombre) VALUES (?)', [archivo]);
      ejecutadas += 1;
      console.log('listo');
    } catch (error) {
      console.log('FALLÓ');
      console.error(error.sqlMessage || error.message);
      await conexion.end();
      process.exit(1);
    }
  }

  console.log(
    ejecutadas ? `${ejecutadas} migración(es) aplicada(s).` : 'La base ya estaba al día.',
  );
  await conexion.end();
}

principal();
