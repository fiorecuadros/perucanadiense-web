const { z } = require('zod');

const cuerpo = z.object({
  id: z.string().trim().max(160).optional(),
  titulo: z.string().trim().min(1, 'El título es obligatorio.').max(1000),
  autores: z.array(z.string().trim().min(1)).min(1, 'Indique al menos un autor.'),
  programa: z.string().trim().min(1, 'Indique el programa.').max(150),
  anio: z.string().trim().regex(/^\d{4}$/, 'El año debe tener 4 dígitos.'),
  tipo: z.string().trim().max(40).default('Tesis'),
  nivel: z.string().trim().max(150).optional().nullable(),
  resumen: z.string().trim().max(5000).optional().nullable(),
});

module.exports = { cuerpo };
