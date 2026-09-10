/**
 * Intenciones del asistente del portal. No recita cifras ni plazos inventados:
 * rellena con la ficha y los programas vivos, y para lo que cambia (cronograma,
 * requisitos de una convocatoria) manda a la página oficial.
 *
 * `patrones` ya van normalizados (minúsculas, sin tildes). El motor puntúa la
 * coincidencia más larga; un patrón de 1–3 letras solo pega como palabra entera.
 */
const enlace = (etiqueta, ruta) => ({ etiqueta, ruta });

const INTENCIONES = [
  {
    id: 'saludo',
    patrones: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buenas', 'saludos', 'hey'],
    responder: (ctx) => ({
      texto: `Hola. Soy la orientación del ${ctx.nombreCorto}. Puedo indicarle programas, admisión, costos y trámites. ¿Qué necesita?`,
      enlaces: [],
      sugerencias: ['Programas', 'Admisión', 'Costos', 'Contacto'],
    }),
  },
  {
    id: 'despedida',
    patrones: ['gracias', 'muchas gracias', 'chau', 'adios', 'hasta luego', 'bye'],
    responder: () => ({
      texto: 'Con gusto. Si necesita una respuesta de una persona, el WhatsApp de informes está en el botón verde.',
      enlaces: [],
      sugerencias: ['Programas', 'Admisión', 'Contacto'],
    }),
  },
  {
    id: 'ayuda',
    patrones: ['ayuda', 'que puedes hacer', 'que puedes', 'en que ayudas', 'opciones de consulta'],
    responder: () => ({
      texto: 'Puedo orientar sobre la oferta académica, admisión, costos, becas, servicios, mesa de partes, el libro de reclamaciones y los datos de contacto. No reemplazo a Secretaría: para un caso particular use WhatsApp o mesa de partes.',
      enlaces: [enlace('Programas', '/programas'), enlace('Admisión', '/admision')],
      sugerencias: ['Programas', 'Admisión', 'Costos', 'Mesa de partes'],
    }),
  },
  {
    id: 'licenciamiento',
    patrones: [
      'sunedu',
      'licenciamiento',
      'licencia',
      'acreditacion',
      'minedu',
      'difoid',
      'reconocido',
    ],
    responder: (ctx) => ({
      texto: `El ${ctx.nombreCorto} es un instituto de educación superior pedagógica privado. El rectorado es el MINEDU (DIFOID / DIGEDD), no SUNEDU. La norma de licenciamiento y la documentación publicada están en la página de licenciamiento.`,
      enlaces: [enlace('Licenciamiento', '/licenciamiento')],
      sugerencias: ['Programas', 'Admisión', 'Nosotros'],
    }),
  },
  {
    id: 'nosotros',
    patrones: [
      'quienes son',
      'quien son',
      'que es el instituto',
      'sobre ustedes',
      'historia',
      'nosotros',
      'institucional',
      'mision',
      'vision',
      'valores',
      'organigrama',
      'autoridades',
      'directivos',
      'director',
    ],
    responder: (ctx) => ({
      texto: `La identidad, la historia, la misión, la visión y las autoridades del ${ctx.nombreCorto} están en Nosotros. No las recito aquí para no desfasarlas del texto que se edita en el panel.`,
      enlaces: [enlace('Nosotros', '/nosotros')],
      sugerencias: ['Programas', 'Personal docente', 'Licenciamiento'],
    }),
  },
  {
    id: 'personal',
    patrones: ['docentes', 'profesores', 'personal', 'plana docente', 'maestros', 'staff'],
    responder: () => ({
      texto: 'La plana de autoridades, docentes y administrativos publicada está en Nosotros.',
      enlaces: [enlace('Nosotros', '/nosotros')],
      sugerencias: ['Programas', 'Admisión'],
    }),
  },
  {
    id: 'duracion',
    patrones: ['cuanto dura', 'duracion', 'semestres', 'ciclos academicos', 'anios de estudio'],
    responder: (ctx) => ({
      texto: duracionOferta(ctx),
      enlaces: [enlace('Ver programas', '/programas')],
      sugerencias: ['Programas', 'Admisión', 'Título que otorgan'],
    }),
  },
  {
    id: 'inicio',
    patrones: ['pagina de inicio', 'volver al inicio'],
    responder: () => ({
      texto: 'La portada del instituto está en Inicio.',
      enlaces: [enlace('Inicio', '/inicio')],
      sugerencias: ['Programas', 'Admisión', 'Noticias'],
    }),
  },
  {
    id: 'titulo',
    patrones: ['titulo que otorgan', 'titulo profesional', 'a nombre de la nacion', 'bachiller', 'grado academico'],
    responder: (ctx) => ({
      texto: `Los programas de formación inicial docente otorgan título de profesor a nombre de la Nación, bajo rectorado del MINEDU. Las carreras técnicas tienen certificación modular. El detalle de cada programa está en la oferta.`,
      enlaces: [enlace('Programas', '/programas')],
      sugerencias: ['Programas', 'Admisión', 'Licenciamiento'],
    }),
  },
  {
    id: 'programas',
    patrones: [
      'programas',
      'carreras',
      'especialidades',
      'que estudian',
      'que ofrecen',
      'oferta academica',
      'formacion inicial',
      'fid',
    ],
    responder: (ctx) => ({
      texto: listarOferta(ctx),
      enlaces: [enlace('Ver programas', '/programas')],
      sugerencias: ['Admisión', 'Costos', '¿Cuánto dura?'],
    }),
  },
  {
    id: 'admision',
    patrones: [
      'admision',
      'ingreso',
      'postular',
      'inscripcion',
      'inscribir',
      'como entrar',
      'proceso de admision',
      'postulacion',
      'requisitos de admision',
    ],
    responder: () => ({
      texto: 'El proceso, el cronograma y los requisitos de la convocatoria vigente están en Admisión. No los listo aquí porque cambian por proceso: lo publicado en esa página es lo que vale.',
      enlaces: [enlace('Admisión', '/admision')],
      sugerencias: ['Costos', 'Programas', 'Contacto'],
    }),
  },
  {
    id: 'examen',
    patrones: ['cuando es el examen', 'fecha examen', 'cronograma admision', 'fecha postulacion', 'cuando postulo'],
    responder: () => ({
      texto: 'Las fechas las fija cada convocatoria. Revise el cronograma en Admisión o escriba a informes por WhatsApp.',
      enlaces: [enlace('Admisión', '/admision')],
      sugerencias: ['Contacto', 'Requisitos', 'Costos'],
    }),
  },
  {
    id: 'costos',
    patrones: ['costo', 'costos', 'pension', 'mensualidad', 'matricula', 'cuanto cuesta', 'precio', 'arancel', 'tarifario'],
    responder: (ctx) => ({
      texto: textoCostos(ctx),
      enlaces: [enlace('Costos y tarifario', '/costos')],
      sugerencias: ['Becas', 'Admisión', 'Cuentas bancarias'],
    }),
  },
  {
    id: 'cuentas',
    patrones: [
      'cuenta bancaria',
      'cuentas bancarias',
      'numero de cuenta',
      'donde pago',
      'donde deposito',
      'cci',
      'banco de la nacion',
    ],
    responder: (ctx) => ({
      texto: textoCuentas(ctx),
      enlaces: [enlace('Costos y cuentas', '/costos')],
      sugerencias: ['Costos', 'Admisión', 'Contacto'],
    }),
  },
  {
    id: 'becas',
    patrones: ['beca', 'becas', 'credito educativo', 'financiamiento', 'pronabec', 'apoyo economico'],
    responder: () => ({
      texto: 'La información de becas y créditos que el instituto tiene publicada está en Becas. Si un rubro del portal de transparencia está vacío, esa página lo dice: no hay cupos ni montos inventados.',
      enlaces: [enlace('Becas y créditos', '/becas')],
      sugerencias: ['Costos', 'Admisión', 'Contacto'],
    }),
  },
  {
    id: 'servicios',
    patrones: ['servicios', 'eva', 'entorno virtual', 'microsoft 365', 'office 365', 'teams'],
    responder: () => ({
      texto: 'El portal reúne el EVA (Microsoft 365), el servicio psicopedagógico, el soporte médico, el servicio social, mesa de partes y el libro de reclamaciones.',
      enlaces: [enlace('Servicios y EVA', '/servicios')],
      sugerencias: ['Mesa de partes', 'Psicopedagógico', 'Libro de reclamaciones'],
    }),
  },
  {
    id: 'psicopedagogico',
    patrones: ['psicopedagogico', 'psicologia', 'orientacion', 'tutoria', 'apoyo psicologico', 'cita psicopedagogica'],
    responder: () => ({
      texto: 'El servicio psicopedagógico atiende orientación académica y de bienestar. Puede leer la página o solicitar una cita desde el formulario.',
      enlaces: [enlace('Servicio psicopedagógico', '/psicopedagogico')],
      sugerencias: ['Servicio social', 'Soporte médico'],
    }),
  },
  {
    id: 'medico',
    patrones: ['soporte medico', 'atencion medica', 'enfermeria', 'tópico', 'topico'],
    responder: () => ({
      texto: 'El soporte médico institucional está descrito en su página. No sustituye una emergencia: en ese caso llame a los servicios de salud de la ciudad.',
      enlaces: [enlace('Soporte médico', '/soporte-medico')],
      sugerencias: ['Servicios', 'Contacto'],
    }),
  },
  {
    id: 'social',
    patrones: ['servicio social', 'bienestar estudiantil', 'trabajo social', 'apoyo social'],
    responder: () => ({
      texto: 'El servicio social gestiona apoyo y bienestar estudiantil. La solicitud se registra desde esa página.',
      enlaces: [enlace('Servicio social', '/servicio-social')],
      sugerencias: ['Becas', 'Psicopedagógico'],
    }),
  },
  {
    id: 'mesa',
    patrones: [
      'mesa de partes',
      'tramite',
      'tramites',
      'solicitud',
      'constancia',
      'enviar documento',
      'fut',
    ],
    responder: () => ({
      texto: 'Por mesa de partes virtual puede presentar un documento y recibe un código de seguimiento. Otros formularios del portal: acceso a la información, cita psicopedagógica y servicio social.',
      enlaces: [enlace('Mesa de partes', '/mesa-de-partes')],
      sugerencias: ['Libro de reclamaciones', 'Seguimiento de un trámite', 'Contacto'],
    }),
  },
  {
    id: 'reclamaciones',
    patrones: ['reclamacion', 'reclamaciones', 'libro de reclamaciones', 'queja', 'indecopi', 'reclamo'],
    responder: () => ({
      texto: 'El libro de reclamaciones es el canal de atención al consumidor (Ley 29571). Es gratuito. Al registrar recibe un código para consultar el estado.',
      enlaces: [enlace('Libro de reclamaciones', '/reclamaciones')],
      sugerencias: ['Mesa de partes', 'Privacidad'],
    }),
  },
  {
    id: 'noticias',
    patrones: ['noticias', 'novedades', 'actividades', 'eventos', 'comunicados', 'anuncios'],
    responder: () => ({
      texto: 'Noticias, comunicados y actividades publicadas están en esa sección. Si no hay una nota reciente, no se fabrica.',
      enlaces: [enlace('Noticias', '/noticias')],
      sugerencias: ['Programas', 'Contacto'],
    }),
  },
  {
    id: 'repositorio',
    patrones: ['repositorio', 'investigacion', 'tesis', 'trabajos de grado', 'publicaciones academicas'],
    responder: () => ({
      texto: 'El repositorio reúne las investigaciones y trabajos que el instituto ha publicado.',
      enlaces: [enlace('Repositorio', '/repositorio')],
      sugerencias: ['Programas', 'Nosotros'],
    }),
  },
  {
    id: 'transparencia',
    patrones: ['transparencia', 'informacion publica', 'pti', 'presupuesto'],
    responder: () => ({
      texto: 'El portal de transparencia publica lo que la institución tiene archivado. Los rubros vacíos del PTI se muestran como vacíos, no se rellenan.',
      enlaces: [enlace('Transparencia', '/transparencia')],
      sugerencias: ['Inversiones', 'Estadísticas'],
    }),
  },
  {
    id: 'reglamentos',
    patrones: ['reglamento', 'reglamentos', 'normativa interna', 'estatuto'],
    responder: () => ({
      texto: 'Los reglamentos institucionales publicados están en esa página.',
      enlaces: [enlace('Reglamentos', '/reglamentos')],
      sugerencias: ['Procedimientos', 'Transparencia'],
    }),
  },
  {
    id: 'procedimientos',
    patrones: ['procedimientos', 'procedimiento administrativo'],
    responder: () => ({
      texto: 'Los procedimientos institucionales publicados están en esa página.',
      enlaces: [enlace('Procedimientos', '/procedimientos')],
      sugerencias: ['Mesa de partes', 'Reglamentos'],
    }),
  },
  {
    id: 'horarios',
    patrones: ['horarios', 'horario de atencion', 'horario de clases', 'cuando atienden'],
    responder: (ctx) => ({
      texto: [
        ctx.horarioAtencion ? `Atención: ${ctx.horarioAtencion}.` : null,
        ctx.horarioClases ? `Clases presenciales: ${ctx.horarioClases}.` : null,
        'Los afiches y franjas por periodo están en Horarios. No hay una grilla semanal inventada.',
      ]
        .filter(Boolean)
        .join(' '),
      enlaces: [enlace('Horarios', '/horarios')],
      sugerencias: ['Contacto', 'Admisión'],
    }),
  },
  {
    id: 'estadisticas',
    patrones: ['estadisticas', 'indicadores', 'vacantes', 'matriculados'],
    responder: () => ({
      texto: 'Las cifras institucionales que el instituto ha publicado (vacantes, resultados, métricas del periodo) están en Estadísticas.',
      enlaces: [enlace('Estadísticas', '/estadisticas')],
      sugerencias: ['Admisión', 'Programas'],
    }),
  },
  {
    id: 'inversiones',
    patrones: ['inversiones', 'obras', 'campus', 'infraestructura'],
    responder: () => ({
      texto: 'Lo publicado sobre campus e inversiones está en esa página. Si el rubro 9 del PTI está vacío, no aparece un informe inventado.',
      enlaces: [enlace('Inversiones', '/inversiones')],
      sugerencias: ['Nosotros', 'Transparencia'],
    }),
  },
  {
    id: 'contacto',
    patrones: [
      'contacto',
      'telefono',
      'celular',
      'whatsapp',
      'email',
      'correo',
      'direccion',
      'ubicacion',
      'donde estan',
      'sedes',
      'facebook',
    ],
    responder: (ctx) => ({
      texto: textoContacto(ctx),
      enlaces: [
        enlace('Mesa de partes', '/mesa-de-partes'),
        ...(ctx.whatsappUrl ? [enlace('WhatsApp informes', ctx.whatsappUrl)] : []),
      ],
      sugerencias: ['Admisión', 'Horario de atención', 'Programas'],
    }),
  },
];

function listarOferta(ctx) {
  if (!ctx.programas.length) {
    return 'La oferta vigente se consulta en Programas.';
  }
  const fid = ctx.programas.filter((p) => p.level === 'FID').map((p) => p.title);
  const tec = ctx.programas.filter((p) => p.level === 'Técnica').map((p) => p.title);
  const partes = ['Oferta publicada:'];
  if (fid.length) partes.push(`Formación inicial docente: ${fid.join(', ')}.`);
  if (tec.length) partes.push(`Carreras técnicas: ${tec.join(', ')}.`);
  partes.push('El detalle, vacantes y normativa de cada uno está en la página de programas.');
  return partes.join(' ');
}

function duracionOferta(ctx) {
  const fid = ctx.programas.filter((p) => p.level === 'FID');
  const tec = ctx.programas.filter((p) => p.level === 'Técnica');
  const partes = [];
  if (fid.length) {
    const muestra = [...new Set(fid.map((p) => p.duration).filter(Boolean))];
    partes.push(
      muestra.length
        ? `Los programas de formación inicial docente duran ${muestra.join('; ')}.`
        : 'La duración de la formación inicial docente está indicada en cada programa.',
    );
  }
  if (tec.length) {
    const muestra = [...new Set(tec.map((p) => p.duration).filter(Boolean))];
    partes.push(
      muestra.length
        ? `Las carreras técnicas: ${muestra.join('; ')}.`
        : 'Las carreras técnicas tienen duración modular; véala en cada ficha.',
    );
  }
  if (!partes.length) return 'La duración está en la ficha de cada programa.';
  return partes.join(' ');
}

function textoCuentas(ctx) {
  const cuentas = ctx.cuentas || [];
  if (!cuentas.length) {
    return 'Las cuentas para pagos están en Costos. No recito números si no están en la ficha institucional.';
  }
  const lineas = cuentas.map((cuenta) => {
    const cci = cuenta.cci ? ` CCI ${cuenta.cci}` : '';
    return `${cuenta.bank}: ${cuenta.accountType} ${cuenta.accountNumber}${cci}.`;
  });
  return `Cuentas publicadas en la ficha: ${lineas.join(' ')} Confirme el tarifario en Costos antes de depositar.`;
}

function textoCostos(ctx) {
  const t = ctx.tarifas;
  if (t && (t.admision || t.matricula || t.pension)) {
    const bits = [];
    if (t.admision) bits.push(`derecho de admisión S/ ${t.admision}`);
    if (t.matricula) bits.push(`matrícula S/ ${t.matricula}`);
    if (t.pension) bits.push(`pensión S/ ${t.pension}`);
    return `Según la ficha institucional vigente: ${bits.join(', ')}. El tarifario, las cuentas y el PDF del PTI están en Costos.`;
  }
  return 'El tarifario oficial, las cuentas bancarias y el documento del PTI están en Costos. No recito montos si no están en la ficha.';
}

function textoContacto(ctx) {
  const lineas = [];
  if (ctx.telefono) lineas.push(`Central: ${ctx.telefono}.`);
  if (ctx.whatsapp) lineas.push(`WhatsApp: ${ctx.whatsapp}.`);
  if (ctx.correo) lineas.push(`Correo: ${ctx.correo}.`);
  if (ctx.horarioAtencion) lineas.push(`Atención: ${ctx.horarioAtencion}.`);
  if (ctx.sedes.length) lineas.push(`Sedes: ${ctx.sedes.join(' · ')}.`);
  lineas.push('El botón verde abre WhatsApp de informes. Mesa de partes es para documentos formales.');
  return lineas.join(' ');
}

function respuestaPrograma(programa) {
  const bits = [`${programa.title} (${programa.level}).`];
  if (programa.duration) bits.push(`Duración: ${programa.duration}.`);
  if (programa.degreeAwarded) bits.push(`Otorga: ${programa.degreeAwarded}.`);
  if (programa.vacancies) bits.push(`Vacantes publicadas: ${programa.vacancies}.`);
  bits.push('La ficha completa está en Programas.');
  return {
    texto: bits.join(' '),
    enlaces: [enlace('Ver programas', '/programas'), enlace('Admisión', '/admision')],
    sugerencias: ['Admisión', 'Costos', 'Otros programas'],
  };
}

function respuestaVacia(ctx) {
  return {
    texto: `No alcancé a ubicar esa consulta. Puede escribir “programas”, “admisión” o “costos”, o contactar a informes${ctx.whatsapp ? ` (${ctx.whatsapp})` : ''}.`,
    enlaces: [
      enlace('Programas', '/programas'),
      enlace('Admisión', '/admision'),
      enlace('Costos', '/costos'),
    ],
    sugerencias: ['Programas', 'Admisión', 'Costos', 'Contacto'],
  };
}

module.exports = { INTENCIONES, respuestaPrograma, respuestaVacia };
