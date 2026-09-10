const { z } = require('zod');

const consulta = z.object({
  mensaje: z
    .string({ required_error: 'Escriba su consulta.' })
    .trim()
    .min(1, 'Escriba su consulta.')
    .max(400, 'La consulta es demasiado larga. Resúmala en una frase.'),
});

module.exports = { consulta };
