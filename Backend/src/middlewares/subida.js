const multer = require('multer');
const env = require('../config/env');
const { solicitudInvalida, demasiadoGrande, tipoNoSoportado } = require('../lib/errores');

/**
 * El archivo viaja en memoria y solo se escribe a disco si pasa la validación.
 * Así no queda basura en `almacen/` cuando alguien sube algo que no toca.
 */
const IMAGENES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const PDF = ['application/pdf'];
const PERMITIDOS = [...IMAGENES, ...PDF];

/** Firmas reales del archivo: la extensión y el Content-Type se pueden falsear. */
const FIRMAS = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (+ 'WEBP' en el byte 8)
};

const EXTENSIONES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

const limiteDe = (mime) => (PDF.includes(mime) ? env.archivos.maxPdfBytes : env.archivos.maxImagenBytes);

function firmaValida(buffer, mime) {
  const firmas = FIRMAS[mime];
  if (!firmas) return false;
  const coincide = firmas.some((firma) => firma.every((byte, i) => buffer[i] === byte));
  if (!coincide) return false;
  if (mime === 'image/webp') return buffer.slice(8, 12).toString('ascii') === 'WEBP';
  return true;
}

const recibir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Math.max(env.archivos.maxPdfBytes, env.archivos.maxImagenBytes), files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!PERMITIDOS.includes(file.mimetype)) {
      cb(tipoNoSoportado('Solo se admiten imágenes (JPEG, PNG, GIF, WebP) o PDF.'));
      return;
    }
    cb(null, true);
  },
});

/** `campo` es el nombre que usa el frontend: siempre `file`. */
const recibirArchivo = (campo = 'file') => recibir.single(campo);

/** Valida lo recibido. `obligatorio: false` permite formularios con adjunto opcional. */
function validarArchivo({ obligatorio = true } = {}) {
  return (req, _res, next) => {
    if (!req.file) {
      if (obligatorio) return next(solicitudInvalida('No se recibió ningún archivo en el campo "file".'));
      return next();
    }
    const { mimetype, size, buffer } = req.file;
    if (size > limiteDe(mimetype)) {
      const mb = Math.round(limiteDe(mimetype) / (1024 * 1024));
      return next(demasiadoGrande(`El archivo supera el máximo de ${mb} MB para este tipo.`));
    }
    if (!firmaValida(buffer, mimetype)) {
      return next(tipoNoSoportado('El contenido del archivo no corresponde a su tipo declarado.'));
    }
    req.file.extension = EXTENSIONES[mimetype] || '';
    return next();
  };
}

module.exports = { recibirArchivo, validarArchivo, IMAGENES, PDF, PERMITIDOS };
