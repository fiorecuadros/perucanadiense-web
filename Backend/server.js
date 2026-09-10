/**
 * Arranque. Passenger (cPanel Application Manager) engancha el primer
 * `http.Server#listen()` del tick inicial: si se espera a la base, Apache
 * responde 500 y el proceso acaba escuchando en TCP 3000 de verdad.
 *
 * En local el puerto sí importa (`PORT` / 3000). Bajo Passenger el argumento
 * de `listen()` se ignora y hay que pasar `'passenger'` si desactivamos el
 * auto-install.
 */
const env = require('./src/config/env');
const app = require('./src/app');
const { probarConexion, pool } = require('./src/config/db');

const bajoPassenger =
  typeof PhusionPassenger !== 'undefined' ||
  process.env.PASSENGER_APP_ENV !== undefined ||
  process.env.PASSENGER_USE_FEEDBACK_FD !== undefined;

if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const destino =
  typeof PhusionPassenger !== 'undefined' ? 'passenger' : env.puerto;

const servidor = app.listen(destino, () => {
  if (bajoPassenger) {
    console.log(`API enganchada a Passenger (entorno: ${env.entorno})`);
  } else {
    console.log(`API escuchando en http://localhost:${env.puerto}/api (entorno: ${env.entorno})`);
  }
});

probarConexion()
  .then(() => {
    console.log(`Base de datos conectada (${env.db.database}@${env.db.host}:${env.db.port})`);
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos:', error.message);
    console.error('Revise las variables DB_* del .env y que MariaDB esté en ejecución.');
    if (bajoPassenger) {
      console.error('Passenger: el proceso sigue vivo; las peticiones fallarán hasta que MariaDB responda.');
      return;
    }
    servidor.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 2000).unref();
  });

/**
 * Cierre ordenado. `close()` por sí solo espera a que terminen las conexiones
 * keep-alive, así que el proceso puede quedarse vivo indefinidamente: se
 * cierran también las conexiones abiertas y se pone un tope de 5 s.
 */
const apagar = (senal) => () => {
  console.log(`\n${senal} recibido: cerrando.`);
  const forzar = setTimeout(() => {
    console.warn('Cierre forzado tras 5 s.');
    process.exit(1);
  }, 5000);
  forzar.unref();

  servidor.close(async () => {
    clearTimeout(forzar);
    await pool.end().catch(() => {});
    process.exit(0);
  });
  servidor.closeIdleConnections?.();
  servidor.closeAllConnections?.();
};

process.on('SIGINT', apagar('SIGINT'));
process.on('SIGTERM', apagar('SIGTERM'));
