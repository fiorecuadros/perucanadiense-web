import type { ContentByModulo } from '../store/contenido.store';
import type { DocumentoInstitucional, ModuloId } from '../models/documento.model';
import type {
  IntakePayload,
  IntakeRecord,
  IntakeStatus,
  IntakeSubmitResult,
} from '../models/intake.model';
import type { NewsItem } from '../models/news.model';
import type { TesisItem } from '../constants/repositorio.constant';

export interface AuthLoginBody {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user?: {
    id: string;
    nombre: string;
    rol: 'admin' | 'editor';
  };
}

export interface CambioPassword {
  actual: string;
  nueva: string;
}

/** El cambio invalida el token en curso: hay que volver a iniciar sesión. */
export interface CambioPasswordResultado {
  ok: boolean;
  sesionCerrada: boolean;
}

export interface ArchivoSubido {
  id: string;
  url: string;
  nombre: string;
  mime: string;
  bytes: number;
}

export interface DocumentoQuery {
  modulo?: ModuloId;
  seccion?: string;
  publicados?: boolean;
}

export type ContenidoModulo = ContentByModulo[ModuloId];

export interface TramiteRespuesta {
  codigo: string;
}

export interface ReclamoBody {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoReclamo: string;
  detalleReclamo: string;
  pedido: string;
}

export interface AccesoInfoBody {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  informacionSolicitada: string;
  motivo: string;
}

export interface CitaPsicoBody {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  programa: string;
  semestre: string;
  motivo: string;
  fechaPreferida: string;
}

export interface ApoyoSocialBody {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  programa: string;
  semestre: string;
  tipoApoyo: string;
  descripcionSituacion: string;
}

/** Bandejas de trámites del panel (mesa de partes, reclamaciones, etc.). */
export interface TramiteAdmin {
  id: string;
  trackingCode: string;
  codigo: string;
  submittedAt: string;
  actualizadoEn: string;
  status: string;
  estado: string;
  respuesta: string | null;
  payload: Record<string, string | number>;
  /** Solo al guardar: si el correo al solicitante llegó a salir. */
  notificado?: boolean;
}

export interface TramiteCambioEstado {
  estado: string;
  respuesta?: string;
  /** Enviar la respuesta al correo del solicitante. Lo decide quien atiende. */
  notificar?: boolean;
}

/** Cuentas del panel. */
export interface UsuarioAdmin {
  id: string;
  nombre: string;
  username: string;
  email: string | null;
  rol: 'admin' | 'editor';
  activo: boolean;
  ultimoAcceso: string | null;
  creadoEn: string;
}

export interface UsuarioBody {
  nombre: string;
  username: string;
  email?: string | null;
  rol: 'admin' | 'editor';
  activo: boolean;
  password?: string;
}

/** Resumen del tablero: qué hay publicado y qué quedó sin atender. */
export interface PanelResumen {
  documentos: { publicados: number; borradores: number };
  noticias: number;
  personal: number;
  repositorio: number;
  tramitesPendientes: Record<string, number>;
  actividad: {
    accion: string;
    entidad: string;
    entidadId: string | null;
    usuario: string;
    fecha: string;
  }[];
}

/** Ficha institucional (identidad, sedes, contacto, redes). Forma libre: la define
 *  `institution.constant.ts` y la edita /admin/contactos. */
export type InstitucionFicha = Record<string, unknown>;

export interface ContenidoVersion {
  id: number;
  autor: string;
  fecha: string;
  data?: Record<string, unknown>;
}

export interface MesaAdminRecord extends IntakeRecord {
  id: string;
}

export type {
  ContentByModulo,
  DocumentoInstitucional,
  IntakePayload,
  IntakeSubmitResult,
  IntakeStatus,
  ModuloId,
  NewsItem,
  TesisItem,
};
