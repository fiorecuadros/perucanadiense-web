/**
 * Los cinco trámites comparten estructura (código, estado, datos del solicitante)
 * y se diferencian en la tabla y en un puñado de columnas. Describirlos aquí
 * evita escribir cinco veces el mismo repositorio y el mismo controlador.
 *
 * `campoCorreo` es la clave del payload donde vive el correo del solicitante:
 * es a esa dirección a la que se notifica la respuesta desde el panel.
 *
 * `cerrados`: un expediente en esos estados no vuelve atrás. Se puede seguir
 * anotando o avisando al ciudadano, no reabrirlo.
 * `exigenMotivo`: al pasar a ese estado hay que dejar por escrito el motivo
 * (un rechazo) o la respuesta (cerrar un reclamo).
 * `seguimiento`: claves del payload que el portal público puede mostrar con
 * el código. DNI, correo, teléfono y el texto del trámite no entran.
 */
const TIPOS = {
  mesa: {
    tabla: 'tramites_mesa_partes',
    prefijo: 'MDP',
    etiqueta: 'Mesa de partes',
    campoCorreo: 'correo',
    entidad: 'mesa-de-partes',
    // clave del payload → columna
    columnas: {
      nombres: 'nombres',
      dni: 'dni',
      telefono: 'telefono',
      correo: 'correo',
      condicion: 'condicion',
      tipoDoc: 'tipo_doc',
      folios: 'folios',
      asunto: 'asunto',
      mensaje: 'mensaje',
      fileName: 'nombre_archivo',
      linkDocumento: 'link_documento',
    },
    estados: ['pendiente', 'recibido', 'en_tramite', 'finalizado', 'rechazado'],
    cerrados: ['finalizado', 'rechazado'],
    exigenMotivo: ['rechazado'],
    campoRespuesta: 'observacion',
    seguimiento: { claves: ['nombres', 'condicion', 'tipoDoc', 'folios', 'asunto'] },
  },
  reclamaciones: {
    tabla: 'tramites_reclamaciones',
    prefijo: 'REC',
    etiqueta: 'Libro de reclamaciones',
    campoCorreo: 'email',
    entidad: 'reclamaciones',
    columnas: {
      tipoDocumento: 'tipo_documento',
      numeroDocumento: 'numero_documento',
      nombres: 'nombres',
      apellidos: 'apellidos',
      email: 'email',
      telefono: 'telefono',
      direccion: 'direccion',
      // Hoja INDECOPI (Ley 29571): tipo de bien y su descripción, aparte
      // del reclamo/queja. No salen de las semillas de contenido.
      tipoBien: 'tipo_bien',
      descripcionBien: 'descripcion_bien',
      tipoReclamo: 'tipo_reclamo',
      detalleReclamo: 'detalle_reclamo',
      pedido: 'pedido',
    },
    estados: ['pendiente', 'en_proceso', 'resuelto'],
    cerrados: ['resuelto'],
    exigenMotivo: ['resuelto'],
    campoRespuesta: 'respuesta',
    seguimiento: {
      claves: ['nombres', 'tipoReclamo', 'tipoBien'],
      incluirRespuesta: true,
    },
  },
  acceso: {
    tabla: 'tramites_acceso_informacion',
    prefijo: 'ACC',
    etiqueta: 'Acceso a la información',
    campoCorreo: 'email',
    entidad: 'acceso-informacion',
    columnas: {
      nombres: 'nombres',
      apellidos: 'apellidos',
      dni: 'dni',
      email: 'email',
      telefono: 'telefono',
      direccion: 'direccion',
      informacionSolicitada: 'informacion_solicitada',
      motivo: 'motivo',
    },
    estados: ['pendiente', 'en_proceso', 'atendida', 'denegada'],
    cerrados: ['atendida', 'denegada'],
    exigenMotivo: ['denegada'],
    campoRespuesta: 'respuesta',
  },
  psico: {
    tabla: 'citas_psicopedagogicas',
    prefijo: 'CITA',
    etiqueta: 'Cita psicopedagógica',
    campoCorreo: 'email',
    entidad: 'citas-psicopedagogicas',
    columnas: {
      nombres: 'nombres',
      apellidos: 'apellidos',
      dni: 'dni',
      email: 'email',
      telefono: 'telefono',
      programa: 'programa',
      semestre: 'semestre',
      motivo: 'motivo',
      fechaPreferida: 'fecha_preferida',
    },
    estados: ['pendiente', 'confirmada', 'atendida', 'cancelada'],
    cerrados: ['atendida', 'cancelada'],
    exigenMotivo: ['cancelada'],
    campoRespuesta: 'notas',
  },
  social: {
    tabla: 'apoyo_social',
    prefijo: 'SS',
    etiqueta: 'Servicio social',
    campoCorreo: 'email',
    entidad: 'servicio-social',
    columnas: {
      nombres: 'nombres',
      apellidos: 'apellidos',
      dni: 'dni',
      email: 'email',
      telefono: 'telefono',
      programa: 'programa',
      semestre: 'semestre',
      tipoApoyo: 'tipo_apoyo',
      descripcionSituacion: 'descripcion_situacion',
    },
    estados: ['pendiente', 'en_evaluacion', 'atendida', 'cerrada'],
    cerrados: ['atendida', 'cerrada'],
    exigenMotivo: [],
    campoRespuesta: 'notas',
  },
};

module.exports = { TIPOS };
