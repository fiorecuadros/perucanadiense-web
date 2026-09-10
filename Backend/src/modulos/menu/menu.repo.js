const { consultar, consultarUna, ejecutar } = require('../../config/db');

const CAMPOS = 'id, zona, etiqueta, destino, variante, orden, visible';

/** Lo que ve el portal: solo lo visible. */
const listarPublico = () =>
  consultar(`SELECT ${CAMPOS} FROM menu_items WHERE visible = 1 ORDER BY zona, orden, etiqueta`);

/** Lo que ve el panel: también lo oculto, para poder reponerlo. */
const listarTodo = () =>
  consultar(`SELECT ${CAMPOS} FROM menu_items ORDER BY zona, orden, etiqueta`);

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM menu_items WHERE id = ? LIMIT 1`, [id]);

const crear = (m) =>
  ejecutar(
    `INSERT INTO menu_items (id, zona, etiqueta, destino, variante, orden, visible)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [m.id, m.zona, m.etiqueta, m.destino, m.variante, m.orden, m.visible],
  );

const actualizar = (id, m) =>
  ejecutar(
    `UPDATE menu_items
        SET zona = ?, etiqueta = ?, destino = ?, variante = ?, orden = ?, visible = ?
      WHERE id = ?`,
    [m.zona, m.etiqueta, m.destino, m.variante, m.orden, m.visible, id],
  );

const cambiarOrden = (id, orden) => ejecutar('UPDATE menu_items SET orden = ? WHERE id = ?', [orden, id]);

const eliminar = (id) => ejecutar('DELETE FROM menu_items WHERE id = ?', [id]);

const vaciar = () => ejecutar('DELETE FROM menu_items');

const siguienteOrden = async (zona) => {
  const fila = await consultarUna(
    'SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM menu_items WHERE zona = ?',
    [zona],
  );
  return Number(fila.siguiente);
};

/** La copia oficial que repone "Restaurar original". */
const semilla = () => consultarUna("SELECT data FROM semillas WHERE clave = 'menu' LIMIT 1");

module.exports = {
  listarPublico,
  listarTodo,
  porId,
  crear,
  actualizar,
  cambiarOrden,
  eliminar,
  vaciar,
  siguienteOrden,
  semilla,
};
