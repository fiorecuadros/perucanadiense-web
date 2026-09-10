const { z } = require('zod');
const { MODULOS } = require('../contenido/contenido.esquemas');

const consulta = z.object({
  modulo: z.enum(MODULOS).optional(),
  seccion: z.string().trim().max(64).optional(),
  estado: z.enum(['publicado', 'borrador']).optional(),
});

const cuerpo = z.object({
  id: z.string().trim().max(64).optional(),
  modulo: z.enum(MODULOS, { errorMap: () => ({ message: 'Módulo desconocido.' }) }),
  seccion: z.string().trim().min(1, 'Indique la sección.').max(64),
  titulo: z.string().trim().min(1, 'El título es obligatorio.').max(255),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  tipo: z.enum(['pdf', 'enlace', 'imagen']),
  url: z.string().trim().min(1, 'Indique la URL o suba el archivo.').max(1000),
  archivoId: z.string().trim().max(36).optional().nullable(),
  anio: z.string().trim().max(9).optional().nullable(),
  orden: z.coerce.number().int().min(0).max(9999).default(0),
  estado: z.enum(['publicado', 'borrador']).default('borrador'),
  // El front manda `actualizadoEn`; lo pone el servidor, así que se ignora.
  actualizadoEn: z.string().optional(),
});

module.exports = { consulta, cuerpo };
