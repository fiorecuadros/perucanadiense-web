const { z } = require('zod');

const texto = (max, mensaje) => z.string().trim().min(1, mensaje).max(max);
const opcional = (max) => z.string().trim().max(max).optional().nullable();
const correo = z.string().trim().email('Correo electrónico inválido.').max(191);
const documento = z
  .string()
  .trim()
  .min(8, 'El número de documento debe tener al menos 8 dígitos.')
  .max(20);

const mesaDePartes = z.object({
  nombres: texto(200, 'Ingrese sus nombres y apellidos.'),
  dni: documento,
  telefono: opcional(20),
  correo,
  condicion: z.enum(['Estudiante', 'Docente', 'Administrativo', 'Egresado', 'Postulante', 'Externo']),
  tipoDoc: z.enum([
    'Solicitud',
    'FUT',
    'Recurso de reconsideración',
    'Apelación',
    'Constancia',
    'Certificado',
    'Otro',
  ]),
  folios: z.coerce.number().int().min(1, 'Indique al menos un folio.').max(500),
  asunto: texto(255, 'Indique el asunto.'),
  mensaje: texto(5000, 'Describa su solicitud.'),
  fileName: opcional(255),
  linkDocumento: opcional(1000),
});

const reclamacion = z.object({
  tipoDocumento: texto(40, 'Indique el tipo de documento.'),
  numeroDocumento: documento,
  nombres: texto(150, 'Ingrese sus nombres.'),
  apellidos: texto(150, 'Ingrese sus apellidos.'),
  email: correo,
  telefono: opcional(20),
  direccion: opcional(255),
  tipoBien: z.enum(['Producto', 'Servicio'], {
    errorMap: () => ({ message: 'Indique si reclama un producto o un servicio.' }),
  }),
  descripcionBien: texto(255, 'Describa el bien o servicio contratado.'),
  tipoReclamo: texto(80, 'Indique el tipo de reclamo.'),
  detalleReclamo: texto(5000, 'Describa el reclamo.'),
  pedido: texto(5000, 'Indique su pedido.'),
});

const accesoInformacion = z.object({
  nombres: texto(150, 'Ingrese sus nombres.'),
  apellidos: texto(150, 'Ingrese sus apellidos.'),
  dni: documento,
  email: correo,
  telefono: opcional(20),
  direccion: opcional(255),
  informacionSolicitada: texto(5000, 'Detalle la información solicitada.'),
  motivo: opcional(5000),
});

const citaPsicopedagogica = z.object({
  nombres: texto(150, 'Ingrese sus nombres.'),
  apellidos: texto(150, 'Ingrese sus apellidos.'),
  dni: documento,
  email: correo,
  telefono: opcional(20),
  programa: opcional(150),
  semestre: opcional(40),
  motivo: texto(5000, 'Indique el motivo de la cita.'),
  fechaPreferida: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD.')
    .optional()
    .nullable(),
});

const apoyoSocial = z.object({
  nombres: texto(150, 'Ingrese sus nombres.'),
  apellidos: texto(150, 'Ingrese sus apellidos.'),
  dni: documento,
  email: correo,
  telefono: opcional(20),
  programa: opcional(150),
  semestre: opcional(40),
  tipoApoyo: texto(120, 'Indique el tipo de apoyo.'),
  descripcionSituacion: texto(5000, 'Describa su situación.'),
});

/** Cambios de estado desde el panel. */
const actualizacionAdmin = z.object({
  estado: z.string().trim().min(1).max(40),
  respuesta: z.string().trim().max(5000).optional().nullable(),
  observacion: z.string().trim().max(5000).optional().nullable(),
  notas: z.string().trim().max(5000).optional().nullable(),
  // Avisar al solicitante es una decisión de quien atiende, no un efecto
  // secundario de guardar: una observación interna no debe salir por correo.
  notificar: z.coerce.boolean().optional(),
});

module.exports = {
  mesaDePartes,
  reclamacion,
  accesoInformacion,
  citaPsicopedagogica,
  apoyoSocial,
  actualizacionAdmin,
};
