const { consultar, consultarUna, ejecutar } = require('../../config/db');

/**
 * Los nombres de tabla y columna vienen del catálogo `tramites.tipos.js`, nunca
 * de la petición: por eso pueden interpolarse sin abrir una inyección. Los
 * valores siempre van como parámetros.
 */

function insertar(tipo, valores) {
  const columnas = Object.keys(valores);
  const marcadores = columnas.map(() => '?').join(', ');
  return ejecutar(
    `INSERT INTO ${tipo.tabla} (${columnas.join(', ')}) VALUES (${marcadores})`,
    Object.values(valores),
  );
}

const porCodigo = (tipo, codigo) =>
  consultarUna(`SELECT * FROM ${tipo.tabla} WHERE codigo = ? LIMIT 1`, [codigo]);

const porId = (tipo, id) => consultarUna(`SELECT * FROM ${tipo.tabla} WHERE id = ? LIMIT 1`, [id]);

function listar(tipo, { estado, buscar, limite = 100 } = {}) {
  const condiciones = [];
  const valores = [];
  if (estado) {
    condiciones.push('estado = ?');
    valores.push(estado);
  }
  if (buscar) {
    condiciones.push('(codigo LIKE ? OR nombres LIKE ?)');
    valores.push(`%${buscar}%`, `%${buscar}%`);
  }
  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const tope = Math.min(Math.max(parseInt(limite, 10) || 100, 1), 500);
  return consultar(`SELECT * FROM ${tipo.tabla} ${donde} ORDER BY creado_en DESC LIMIT ${tope}`, valores);
}

function actualizarEstado(tipo, id, { estado, respuesta }) {
  const campos = ['estado = ?'];
  const valores = [estado];
  if (respuesta !== undefined && respuesta !== null) {
    campos.push(`${tipo.campoRespuesta} = ?`);
    valores.push(respuesta);
  }
  if (tipo.tabla === 'tramites_reclamaciones' && respuesta) {
    campos.push('respondido_en = UTC_TIMESTAMP()');
  }
  valores.push(id);
  return ejecutar(`UPDATE ${tipo.tabla} SET ${campos.join(', ')} WHERE id = ?`, valores);
}

/** Conteos para el panel: cuántos hay sin atender en cada bandeja. */
const pendientes = (tipo) =>
  consultarUna(
    `SELECT COUNT(*) AS total FROM ${tipo.tabla} WHERE estado IN ('pendiente','recibido','en_proceso','en_tramite','en_evaluacion')`,
  );

module.exports = { insertar, porCodigo, porId, listar, actualizarEstado, pendientes };
