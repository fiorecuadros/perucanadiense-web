const { consultarUna } = require('../../config/db');
const { leerJson } = require('../../lib/json');
const programas = require('../programas/programas.servicio');
const { INTENCIONES, respuestaPrograma, respuestaVacia } = require('./asistente.conocimiento');

const TTL_MS = 60 * 1000;
let cache = { en: 0, ctx: null };

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pega(mensaje, patron) {
  if (!patron) return false;
  if (patron.length <= 3) return mensaje.split(' ').includes(patron);
  return mensaje.includes(patron);
}

function puntuar(mensaje, patrones) {
  let puntos = 0;
  let masLargo = 0;
  for (const crudo of patrones) {
    const patron = normalizar(crudo);
    if (!pega(mensaje, patron)) continue;
    puntos += patron.split(' ').length * patron.length;
    if (patron.length > masLargo) masLargo = patron.length;
  }
  return { puntos, masLargo };
}

async function fichaInstitucion() {
  const semilla = await consultarUna("SELECT data FROM semillas WHERE clave = 'institucion' LIMIT 1");
  const oficial = semilla ? leerJson(semilla.data, {}) : {};
  const fila = await consultarUna('SELECT data FROM institucion WHERE id = 1 LIMIT 1');
  const viva = fila ? leerJson(fila.data, {}) : {};
  return { ...oficial, ...viva };
}

function sedesDe(ficha) {
  const sedes = Array.isArray(ficha.locations) ? ficha.locations : [];
  return sedes
    .map((sede) => [sede.name, sede.address, sede.city].filter(Boolean).join(', '))
    .filter(Boolean);
}

function tarifasDe(ficha) {
  const fees = ficha.fees && typeof ficha.fees === 'object' ? ficha.fees : null;
  if (!fees) return null;
  return {
    admision: fees.admissionExam || null,
    matricula: fees.enrollment || null,
    pension: fees.monthlyTuition || null,
  };
}

function cuentasDe(ficha) {
  const lista = Array.isArray(ficha.bankAccounts) ? ficha.bankAccounts : [];
  return lista
    .map((cuenta) => ({
      bank: cuenta.bank || '',
      accountType: cuenta.accountType || '',
      accountNumber: cuenta.accountNumber || '',
      cci: cuenta.cci || '',
    }))
    .filter((cuenta) => cuenta.bank && cuenta.accountNumber);
}

function enlaceWhatsapp(ficha) {
  const contacto = ficha.contact || {};
  const digitos = String(contacto.whatsapp || '').replace(/\D/g, '');
  if (!digitos) return '';
  const texto = contacto.whatsappMessage
    ? `?text=${encodeURIComponent(contacto.whatsappMessage)}`
    : '';
  return `https://wa.me/+51${digitos}${texto}`;
}

async function contexto() {
  const ahora = Date.now();
  if (cache.ctx && ahora - cache.en < TTL_MS) return cache.ctx;

  const ficha = await fichaInstitucion();
  const lista = await programas.listar();
  const contacto = ficha.contact || {};
  const horario = ficha.schedule || {};

  const ctx = {
    nombreCorto: ficha.shortName || ficha.acronym || 'IESPP Peruano Canadiense',
    telefono: contacto.phoneFormatted || contacto.landline || '',
    whatsapp: contacto.whatsappFormatted || '',
    correo: contacto.emailGeneral || '',
    horarioAtencion: horario.attention || '',
    horarioClases: horario.classesPresential || '',
    sedes: sedesDe(ficha),
    programas: lista.map((p) => ({
      id: p.id,
      title: p.title,
      level: p.level,
      duration: p.duration,
      degreeAwarded: p.degreeAwarded,
      vacancies: p.vacancies,
    })),
    tarifas: tarifasDe(ficha),
    cuentas: cuentasDe(ficha),
    whatsappUrl: enlaceWhatsapp(ficha),
  };
  cache = { en: ahora, ctx };
  return ctx;
}

const PALABRAS_COMUNES = new Set([
  'educacion',
  'secundaria',
  'carrera',
  'tecnica',
  'aplicada',
  'formacion',
  'docente',
  'fisica',
]);

function clavesDe(programa) {
  const titulo = normalizar(programa.title);
  const id = normalizar(String(programa.id || '').replace(/-/g, ' '));
  const palabras = `${titulo} ${id}`
    .split(' ')
    .filter((palabra) => palabra.length >= 6 && !PALABRAS_COMUNES.has(palabra));
  return [...new Set([titulo, id, ...palabras])].filter((clave) => clave.length >= 5);
}

function programasMencionados(mensaje, lista) {
  const hallados = [];
  for (const programa of lista) {
    let largo = 0;
    for (const clave of clavesDe(programa)) {
      if (!mensaje.includes(clave)) continue;
      if (clave.length > largo) largo = clave.length;
    }
    if (largo) hallados.push({ programa, largo });
  }
  hallados.sort((a, b) => b.largo - a.largo);
  return hallados.map((item) => item.programa);
}

function respuestaVarios(programas) {
  if (programas.length === 1) return respuestaPrograma(programas[0]);
  return {
    texto: `Encontré estas fichas: ${programas.map((p) => p.title).join('; ')}. El detalle está en Programas.`,
    enlaces: [
      { etiqueta: 'Ver programas', ruta: '/programas' },
      { etiqueta: 'Admisión', ruta: '/admision' },
    ],
    sugerencias: programas.slice(0, 3).map((p) => p.title),
  };
}

const FICHA_PROGRAMA = new Set(['programas', 'duracion', 'titulo']);

async function consultar(mensaje) {
  const ctx = await contexto();
  const texto = normalizar(mensaje);

  let ganadora = null;
  let mejor = { puntos: 0, masLargo: 0 };
  for (const intencion of INTENCIONES) {
    const marca = puntuar(texto, intencion.patrones);
    if (marca.puntos > mejor.puntos || (marca.puntos === mejor.puntos && marca.masLargo > mejor.masLargo)) {
      mejor = marca;
      ganadora = intencion;
    }
  }

  const mencionados = programasMencionados(texto, ctx.programas);
  const sinIntencion = !ganadora || mejor.puntos === 0;
  if (mencionados.length && (sinIntencion || FICHA_PROGRAMA.has(ganadora.id))) {
    return respuestaVarios(mencionados);
  }

  if (sinIntencion) return respuestaVacia(ctx);
  return ganadora.responder(ctx);
}

module.exports = { consultar };
