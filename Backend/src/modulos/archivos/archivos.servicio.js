const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const env = require('../../config/env');
const repo = require('./archivos.repo');
const { noEncontrado, conflicto } = require('../../lib/errores');

/**
 * Permisos del almacén. `mkdir`/`writeFile` los aplican filtrados por la umask
 * del proceso (en cPanel suele dejar 755/644), así que se fijan con `chmod`
 * después: sin esto solo la carpeta raíz queda cerrada y cualquier restauración
 * o recreación de esa raíz dejaría los adjuntos legibles por todo el servidor.
 */
const PERMISO_CARPETA = 0o700;
const PERMISO_ARCHIVO = 0o600;

/** URL relativa que el frontend guarda dentro del JSON de contenido. */
const urlPublica = (id) => `/api/archivos/${id}`;

function aRespuesta(fila) {
  return {
    id: fila.id,
    url: urlPublica(fila.id),
    nombre: fila.nombre_original,
    mime: fila.mime,
    bytes: Number(fila.bytes),
  };
}

/**
 * Cierra el archivo y las carpetas AAAA/MM que se acaban de crear. No sube más
 * allá de la raíz del almacén: esa la fija quien despliega.
 */
async function endurecerPermisos(destino) {
  await fs.chmod(destino, PERMISO_ARCHIVO);
  let carpeta = path.dirname(destino);
  const raiz = path.resolve(env.archivos.directorio);
  while (carpeta.startsWith(raiz) && carpeta !== raiz) {
    await fs.chmod(carpeta, PERMISO_CARPETA).catch(() => {});
    carpeta = path.dirname(carpeta);
  }
}

/**
 * Guarda el binario en `almacen/AAAA/MM/` y su metadato en la base.
 *
 * `publico: false` marca el archivo como reservado: es lo que se usa para los
 * adjuntos de un trámite, que llevan datos personales del ciudadano y solo
 * puede abrir el personal del instituto desde el panel.
 *
 * Si ya existe un archivo con el mismo sha256 se reutiliza: subir dos veces el
 * mismo PDF del PTI no duplica 4 MB en disco. La deduplicación NO cruza la
 * frontera de visibilidad: reutilizar la fila reservada de un trámite para un
 * documento del portal lo dejaría inaccesible, y al revés filtraría el adjunto.
 */
async function guardar(file, usuarioId, { publico = true } = {}) {
  const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const existente = await repo.porHash(sha256, publico);
  if (existente) {
    const destinoExistente = path.join(
      env.archivos.directorio,
      existente.ruta_relativa
    );

    try {
      await fs.access(destinoExistente);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;

      // Restaurar el archivo faltante conservando su ID y las referencias.
      await fs.mkdir(path.dirname(destinoExistente), {
        recursive: true,
        mode: PERMISO_CARPETA,
      });

      try {
        await fs.writeFile(destinoExistente, file.buffer, {
          mode: PERMISO_ARCHIVO,
          flag: 'wx',
        });
      } catch (errorEscritura) {
        if (errorEscritura.code !== 'EEXIST') throw errorEscritura;
      }

      await endurecerPermisos(destinoExistente);
    }

    return aRespuesta(existente);
  }

  const id = crypto.randomUUID();
  const ahora = new Date();
  const carpetaRelativa = path.join(String(ahora.getUTCFullYear()), String(ahora.getUTCMonth() + 1).padStart(2, '0'));
  const rutaRelativa = path.join(carpetaRelativa, `${id}${file.extension || ''}`);
  const destino = path.join(env.archivos.directorio, rutaRelativa);

  await fs.mkdir(path.dirname(destino), { recursive: true, mode: PERMISO_CARPETA });
  await fs.writeFile(destino, file.buffer, { mode: PERMISO_ARCHIVO });
  await endurecerPermisos(destino);

  const registro = {
    id,
    nombre_original: file.originalname.slice(0, 255),
    ruta_relativa: rutaRelativa,
    mime: file.mimetype,
    bytes: file.size,
    sha256,
    subido_por: usuarioId || null,
    publico: publico ? 1 : 0,
  };

  try {
    await repo.crear(registro);
  } catch (error) {
    await fs.unlink(destino).catch(() => {});
    throw error;
  }

  return aRespuesta({ ...registro, creado_en: null });
}

/** Datos para servir el binario. */
async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Archivo no encontrado.');
  return {
    ruta: path.join(env.archivos.directorio, fila.ruta_relativa),
    mime: fila.mime,
    nombre: fila.nombre_original,
    bytes: Number(fila.bytes),
    publico: !!fila.publico,
  };
}

async function eliminar(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Archivo no encontrado.');

  {
    const usos = await repo.referencias(id);
    if (usos > 0) {
      throw conflicto('El archivo está en uso por contenido, documentos o versiones anteriores y no puede eliminarse.');
    }
  }

  await repo.eliminar(id);
  await fs.unlink(path.join(env.archivos.directorio, fila.ruta_relativa)).catch(() => {});
}

module.exports = { guardar, obtener, eliminar, urlPublica, aRespuesta };
