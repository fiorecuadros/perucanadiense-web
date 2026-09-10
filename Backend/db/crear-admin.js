/**
 * Crea (o actualiza) la cuenta de administrador inicial a partir del .env.
 * No hay contraseña por defecto a propósito: una clave conocida en el código es
 * una puerta abierta el día del despliegue.
 *
 *   ADMIN_USUARIO=admin ADMIN_CLAVE='...' npm run crear-admin
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');
const { consultarUna, ejecutar, pool } = require('../src/config/db');

async function principal() {
  const usuario = env.admin.usuario;
  const clave = env.admin.clave;

  if (!clave || clave.length < 8) {
    console.error('Defina ADMIN_CLAVE en el .env con al menos 8 caracteres y vuelva a ejecutar.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(clave, 10);
  const existente = await consultarUna('SELECT id FROM usuarios WHERE username = ? LIMIT 1', [usuario]);

  if (existente) {
    await ejecutar(
      `UPDATE usuarios
          SET password_hash = ?, password_actualizada_en = UTC_TIMESTAMP(), rol = 'admin', activo = 1
        WHERE id = ?`,
      [hash, existente.id],
    );
    console.log(`Contraseña actualizada para "${usuario}". Las sesiones abiertas quedaron cerradas.`);
  } else {
    await ejecutar(
      `INSERT INTO usuarios (id, nombre, username, password_hash, rol, activo)
       VALUES (?, ?, ?, ?, 'admin', 1)`,
      [crypto.randomUUID(), env.admin.nombre, usuario, hash],
    );
    console.log(`Administrador "${usuario}" creado.`);
  }

  console.log('Borre ADMIN_CLAVE del .env cuando termine.');
  await pool.end();
}

principal();
