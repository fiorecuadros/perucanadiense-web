const { z } = require('zod');

const cuerpo = z.object({
  id: z.coerce.number().int().optional(), // el servidor asigna el suyo al crear
  type: z.enum(['Autoridad', 'Administrativo', 'Docente']),
  names: z.string().trim().min(1, 'Los nombres son obligatorios.').max(150),
  lastNames: z.string().trim().min(1, 'Los apellidos son obligatorios.').max(150),
  position: z.string().trim().min(1, 'El cargo es obligatorio.').max(200),
  area: z.string().trim().max(150).optional().nullable(),
  grade: z.string().trim().max(150).optional().nullable(),
  email: z.string().trim().max(191).optional().nullable(),
  image: z.string().trim().max(1000).optional().nullable(),
  cvUrl: z.string().trim().max(1000).optional().nullable(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
});

module.exports = { cuerpo };
