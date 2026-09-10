import { environment } from '../../../environments/environment';

/**
 * Contrato HTTP del portal. Todas las rutas son relativas a `environment.apiUrl`
 * (dev: http://localhost:3000/api · prod: https://api.pcanadiense.edu.pe/api).
 *
 * Público: GET sin token. Altas de trámites: POST sin token.
 * Admin: Authorization Bearer. Subida de archivos: multipart field `file`.
 */
export const API = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
    password: '/auth/password',
  },
  archivos: {
    crear: '/archivos',
    uno: (id: string) => `/archivos/${id}`,
  },
  contenido: {
    publico: (modulo: string) => `/contenido/${modulo}`,
    admin: (modulo: string) => `/admin/contenido/${modulo}`,
    restaurar: (modulo: string) => `/admin/contenido/${modulo}/restaurar`,
    versiones: (modulo: string) => `/admin/contenido/${modulo}/versiones`,
    version: (modulo: string, id: number | string) => `/admin/contenido/${modulo}/versiones/${id}`,
    restaurarVersion: (modulo: string, id: number | string) =>
      `/admin/contenido/${modulo}/versiones/${id}/restaurar`,
  },
  documentos: {
    publico: '/documentos',
    admin: '/admin/documentos',
    uno: (id: string) => `/admin/documentos/${id}`,
    restaurar: (modulo: string) => `/admin/documentos/restaurar/${modulo}`,
  },
  noticias: {
    listado: '/noticias',
    una: (id: string) => `/noticias/${id}`,
    admin: '/admin/noticias',
    adminUna: (id: string) => `/admin/noticias/${id}`,
  },
  repositorio: {
    listado: '/repositorio',
    una: (id: string) => `/repositorio/${id}`,
    admin: '/admin/repositorio',
    adminUna: (id: string) => `/admin/repositorio/${id}`,
    archivo: (id: string) => `/admin/repositorio/${id}/archivo`,
  },
  menu: {
    publico: '/menu',
    admin: '/admin/menu',
    uno: (id: string) => `/admin/menu/${id}`,
    orden: '/admin/menu/orden',
    restaurar: '/admin/menu/restaurar',
  },
  catalogo: {
    institucion: '/institucion',
    programas: '/programas',
    personal: '/personal',
  },
  panel: {
    resumen: '/admin/panel/resumen',
  },
  adminCatalogo: {
    personal: '/admin/personal',
    personalUno: (id: string | number) => `/admin/personal/${id}`,
    institucion: '/admin/institucion',
    programas: '/admin/programas',
    programaUno: (id: string) => `/admin/programas/${id}`,
  },
  tramites: {
    mesa: '/tramites/mesa-de-partes',
    mesaCodigo: (codigo: string) => `/tramites/mesa-de-partes/${codigo}`,
    reclamo: '/tramites/reclamaciones',
    acceso: '/tramites/acceso-informacion',
    psico: '/tramites/psicopedagogico',
    social: '/tramites/servicio-social',
  },
  adminTramites: {
    mesa: '/admin/mesa-de-partes',
    mesaUna: (id: string) => `/admin/mesa-de-partes/${id}`,
    reclamos: '/admin/reclamaciones',
    reclamoUna: (id: string) => `/admin/reclamaciones/${id}`,
    acceso: '/admin/acceso-informacion',
    accesoUna: (id: string) => `/admin/acceso-informacion/${id}`,
    citas: '/admin/citas-psicopedagogicas',
    citaUna: (id: string) => `/admin/citas-psicopedagogicas/${id}`,
    apoyo: '/admin/servicio-social',
    apoyoUna: (id: string) => `/admin/servicio-social/${id}`,
    usuarios: '/admin/usuarios',
    usuario: (id: string) => `/admin/usuarios/${id}`,
  },
} as const;

export function apiPath(path: string): string {
  return `${environment.apiUrl}${path}`;
}

export function archivoPublicoUrl(id: string): string {
  return `${environment.baseUrl}${API.archivos.uno(id)}`;
}
