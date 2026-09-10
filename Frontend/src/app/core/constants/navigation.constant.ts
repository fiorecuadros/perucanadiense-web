/**
 * Menú oficial del portal.
 *
 * Cumple dos papeles y por eso vive aquí y no en el HTML:
 *   1. Es la semilla que carga la base (`npm run exportar-semillas`), y lo que
 *      repone el botón "Restaurar original" del panel.
 *   2. Es el respaldo del portal: si el API no responde, el menú se pinta con
 *      esto en vez de dejar la cabecera vacía.
 *
 * A partir del despliegue, quien manda es lo que haya en `/admin/menu`.
 */

export type MenuZona = 'principal' | 'acciones' | 'pie-institucional' | 'pie-servicios';

export interface MenuItem {
  id: string;
  zona: MenuZona;
  /** Texto del enlace. En la cabecera se muestra en mayúsculas por CSS. */
  etiqueta: string;
  /** Ruta interna (`/nosotros`) o URL completa (`https://…`). */
  destino: string;
  /** Solo en la zona `acciones`: conserva el color de cada botón. */
  variante?: string;
  orden: number;
  visible: boolean;
}

/** Nombre legible de cada zona. Lo usan el panel y la validación del backend. */
export const MENU_ZONAS: { id: MenuZona; label: string; descripcion: string }[] = [
  {
    id: 'principal',
    label: 'Menú de cabecera',
    descripcion: 'Los enlaces de la barra superior del portal.',
  },
  {
    id: 'acciones',
    label: 'Botones destacados',
    descripcion: 'Los botones de color a la derecha de la cabecera.',
  },
  {
    id: 'pie-institucional',
    label: 'Pie — Institucional',
    descripcion: 'Primera columna de enlaces del pie de página.',
  },
  {
    id: 'pie-servicios',
    label: 'Pie — Servicios y legal',
    descripcion: 'Segunda columna de enlaces del pie de página.',
  },
];

const item = (
  zona: MenuZona,
  slug: string,
  etiqueta: string,
  destino: string,
  orden: number,
  variante?: string,
): MenuItem => ({
  id: `${zona}-${slug}`,
  zona,
  etiqueta,
  destino,
  ...(variante ? { variante } : {}),
  orden,
  visible: true,
});

export const NAVIGATION: MenuItem[] = [
  item('principal', 'inicio', 'Inicio', '/inicio', 1),
  item('principal', 'nosotros', 'Nosotros', '/nosotros', 2),
  item('principal', 'programas', 'Programas', '/programas', 3),
  item('principal', 'noticias', 'Noticias', '/noticias', 4),
  item('principal', 'servicios', 'Servicios', '/servicios', 5),

  item('acciones', 'admision', 'Admisión', '/admision', 1, 'admision'),
  item('acciones', 'transparencia', 'Transparencia', '/transparencia', 2, 'transparencia'),

  item('pie-institucional', 'nosotros', 'Nosotros', '/nosotros', 1),
  item('pie-institucional', 'programas', 'Carreras', '/programas', 2),
  item('pie-institucional', 'admision', 'Admisión', '/admision', 3),
  item('pie-institucional', 'becas', 'Becas y créditos', '/becas', 4),
  item('pie-institucional', 'costos', 'Costos', '/costos', 5),
  item('pie-institucional', 'estadisticas', 'Estadísticas', '/estadisticas', 6),
  item('pie-institucional', 'horarios', 'Horarios', '/horarios', 7),
  item('pie-institucional', 'inversiones', 'Inversiones', '/inversiones', 8),
  item('pie-institucional', 'licenciamiento', 'Licenciamiento', '/licenciamiento', 9),
  item('pie-institucional', 'transparencia', 'Transparencia', '/transparencia', 10),

  item('pie-servicios', 'mesa-de-partes', 'Mesa de Partes Virtual', '/mesa-de-partes', 1),
  item('pie-servicios', 'procedimientos', 'Procedimientos', '/procedimientos', 2),
  item('pie-servicios', 'reclamaciones', 'Libro de Reclamaciones', '/reclamaciones', 3),
  item('pie-servicios', 'privacidad', 'Política de Privacidad', '/privacidad', 4),
];

/** Enlaces de una zona, ya ordenados y sin los ocultos. */
export const menuDeZona = (items: MenuItem[], zona: MenuZona): MenuItem[] =>
  items.filter((i) => i.zona === zona && i.visible).sort((a, b) => a.orden - b.orden);

/** Un destino externo se abre fuera del portal; no hace falta marcarlo a mano. */
export const esDestinoExterno = (destino: string): boolean => /^https?:\/\//i.test(destino);
