/**
 * Listas curadas para los editores a medida: íconos frecuentes (Font Awesome
 * sólido, sin el prefijo `fa-solid`) y páginas del portal. Se muestran con
 * nombre en español para que el editor no tenga que conocer los códigos.
 */

export interface OpcionPortal {
  value: string;
  label: string;
}

export const ICONOS_PORTAL: OpcionPortal[] = [
  { value: 'fa-user-graduate', label: 'Estudiante / graduado' },
  { value: 'fa-graduation-cap', label: 'Birrete' },
  { value: 'fa-chalkboard-user', label: 'Docente / pizarra' },
  { value: 'fa-handshake', label: 'Apoyo / acuerdo' },
  { value: 'fa-hands-helping', label: 'Ayuda / manos' },
  { value: 'fa-kit-medical', label: 'Salud / botiquín' },
  { value: 'fa-heart', label: 'Corazón / bienestar' },
  { value: 'fa-brain', label: 'Psicología / mente' },
  { value: 'fa-book-open', label: 'Libro abierto' },
  { value: 'fa-book', label: 'Libro' },
  { value: 'fa-flask', label: 'Investigación / laboratorio' },
  { value: 'fa-inbox', label: 'Bandeja de entrada' },
  { value: 'fa-envelope', label: 'Sobre / correo' },
  { value: 'fa-file-lines', label: 'Documento' },
  { value: 'fa-file-shield', label: 'Documento protegido / reglamento' },
  { value: 'fa-scroll', label: 'Pergamino / TUPA' },
  { value: 'fa-clipboard-list', label: 'Lista / trámite' },
  { value: 'fa-scale-balanced', label: 'Balanza / legal' },
  { value: 'fa-landmark', label: 'Institución / transparencia' },
  { value: 'fa-building', label: 'Edificio / infraestructura' },
  { value: 'fa-shield-halved', label: 'Escudo / protección' },
  { value: 'fa-stamp', label: 'Sello / licenciamiento' },
  { value: 'fa-award', label: 'Premio / reconocimiento' },
  { value: 'fa-coins', label: 'Monedas / pagos' },
  { value: 'fa-chart-column', label: 'Gráfico / estadísticas' },
  { value: 'fa-users', label: 'Personas / comunidad' },
  { value: 'fa-laptop', label: 'Computadora' },
  { value: 'fa-circle-info', label: 'Información' },
];

export const RUTAS_PORTAL: OpcionPortal[] = [
  { value: '/psicopedagogico', label: 'Servicio psicopedagógico' },
  { value: '/servicio-social', label: 'Servicio social' },
  { value: '/soporte-medico', label: 'Soporte médico' },
  { value: '/repositorio', label: 'Repositorio institucional' },
  { value: '/mesa-de-partes', label: 'Mesa de partes' },
  { value: '/procedimientos', label: 'Procedimientos y TUPA' },
  { value: '/reclamaciones', label: 'Libro de reclamaciones' },
  { value: '/transparencia', label: 'Transparencia' },
  { value: '/reglamentos', label: 'Reglamentos' },
  { value: '/programas', label: 'Programas de estudio' },
  { value: '/admision', label: 'Admisión' },
  { value: '/becas', label: 'Becas y créditos' },
  { value: '/costos', label: 'Costos' },
  { value: '/horarios', label: 'Horarios' },
  { value: '/estadisticas', label: 'Estadísticas' },
  { value: '/inversiones', label: 'Inversiones' },
  { value: '/licenciamiento', label: 'Licenciamiento' },
  { value: '/nosotros', label: 'Nosotros' },
];

/** Devuelve la lista con el valor actual antepuesto si no figura en ella. */
export function conValorActual(lista: OpcionPortal[], actual: string): OpcionPortal[] {
  const v = (actual ?? '').trim();
  if (!v || lista.some((op) => op.value === v)) return lista;
  return [{ value: v, label: `${v} (actual)` }, ...lista];
}
