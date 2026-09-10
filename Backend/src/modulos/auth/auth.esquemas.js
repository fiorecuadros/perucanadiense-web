const { z } = require('zod');

const login = z.object({
  username: z.string().trim().min(1, 'Ingrese el usuario.').max(191),
  password: z.string().min(1, 'Ingrese la contraseña.').max(200),
});

/** Cambio de la propia contraseña, desde el panel. */
const cambiarClave = z
  .object({
    actual: z.string().min(1, 'Ingrese su contraseña actual.').max(200),
    nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.').max(200),
  })
  .refine((datos) => datos.actual !== datos.nueva, {
    path: ['nueva'],
    message: 'La nueva contraseña debe ser distinta de la actual.',
  });

module.exports = { login, cambiarClave };
