const { z } = require('zod');

const base = {
  nombre: z.string().trim().min(2, 'El nombre es obligatorio.').max(150),
  username: z
    .string()
    .trim()
    .min(3, 'El usuario debe tener al menos 3 caracteres.')
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números, punto, guion y guion bajo.'),
  email: z.string().trim().email('Correo inválido.').max(191).optional().nullable(),
  rol: z.enum(['admin', 'editor']).default('editor'),
  activo: z.boolean().default(true),
};

const crear = z.object({
  ...base,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(200),
});

const actualizar = z.object({
  ...base,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(200).optional(),
});

module.exports = { crear, actualizar };
