const { z } = require('zod');

/**
 * Las zonas son cerradas a propósito: cada una la pinta un sitio distinto del
 * portal (cabecera, botones, dos columnas del pie). Aceptar una zona nueva por
 * la API crearía enlaces que no se muestran en ninguna parte.
 */
const ZONAS = ['principal', 'acciones', 'pie-institucional', 'pie-servicios'];

const cuerpo = z.object({
  id: z.string().trim().max(64).optional(), // el servidor lo deriva al crear
  zona: z.enum(ZONAS, { errorMap: () => ({ message: 'Zona del menú desconocida.' }) }),
  etiqueta: z.string().trim().min(1, 'El texto del enlace es obligatorio.').max(80),
  destino: z
    .string()
    .trim()
    .min(1, 'Indique la página o el enlace.')
    .max(500)
    // Una ruta interna tiene que empezar por "/" o el router de Angular no la
    // resuelve y el enlace lleva a ninguna parte.
    .refine((v) => v.startsWith('/') || /^https?:\/\//i.test(v), {
      message: 'Use una ruta del portal (/nosotros) o una URL completa (https://…).',
    }),
  variante: z.string().trim().max(32).optional().nullable(),
  orden: z.coerce.number().int().min(0).max(9999).optional(),
  visible: z.coerce.boolean().optional(),
});

/** Reordenar es un movimiento, no N ediciones: se manda la lista entera. */
const orden = z.object({
  items: z
    .array(z.object({ id: z.string().trim().min(1).max(64), orden: z.coerce.number().int().min(0).max(9999) }))
    .min(1, 'No hay nada que reordenar.')
    .max(200),
});

module.exports = { cuerpo, orden, ZONAS };
