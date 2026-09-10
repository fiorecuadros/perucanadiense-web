const { z } = require('zod');

/** Los módulos autogestionados del portal (ModuloId en el frontend). */
const MODULOS = [
  'inicio',
  'nosotros',
  'admision',
  'becas',
  'costos',
  'estadisticas',
  'horarios',
  'inversiones',
  'licenciamiento',
  'servicios',
  'transparencia',
  'reglamentos',
  'procedimientos',
  'psicopedagogico',
  'servicio-social',
  'soporte-medico',
  'reclamaciones',
  'privacidad',
  'repositorio-copy',
];

const parametroModulo = z.object({
  modulo: z.enum(MODULOS, { errorMap: () => ({ message: 'Módulo desconocido.' }) }),
});

const parametroVersion = parametroModulo.extend({
  id: z.coerce.number().int().positive(),
});

/**
 * El cuerpo es el objeto completo del módulo: su forma la define el editor por
 * esquema del Angular y cambia con él. Aquí se exige que sea un objeto plano
 * (ni arreglo ni nulo) y se deja pasar el resto: validar campo por campo aquí
 * obligaría a tocar el backend cada vez que se añade un texto al panel.
 */
const cuerpoContenido = z
  .record(z.unknown())
  .refine((valor) => valor !== null && !Array.isArray(valor), {
    message: 'El contenido debe ser un objeto.',
  });

module.exports = { MODULOS, parametroModulo, parametroVersion, cuerpoContenido };
