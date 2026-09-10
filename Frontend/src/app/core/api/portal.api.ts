import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ContentByModulo } from '../store/contenido.store';
import type { DocumentoInstitucional, ModuloId } from '../models/documento.model';
import type { IntakePayload, IntakeRecord, IntakeSubmitResult } from '../models/intake.model';
import type { NewsItem } from '../models/news.model';
import type { FacultyMember } from '../constants/faculty.constant';
import type { Program } from '../constants/programs.constant';
import type { TesisItem } from '../constants/repositorio.constant';
import type { MenuItem, MenuZona } from '../constants/navigation.constant';
import { API, apiPath } from './endpoints';
import type {
  AccesoInfoBody,
  ApoyoSocialBody,
  ArchivoSubido,
  AuthLoginBody,
  AuthSession,
  CambioPassword,
  CambioPasswordResultado,
  CitaPsicoBody,
  ContenidoVersion,
  DocumentoQuery,
  InstitucionFicha,
  PanelResumen,
  ReclamoBody,
  TramiteAdmin,
  TramiteCambioEstado,
  TramiteRespuesta,
  UsuarioAdmin,
  UsuarioBody,
} from './api.types';

@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly http = inject(HttpClient);

  readonly remoto = environment.useRemoteApi;

  login(body: AuthLoginBody): Promise<AuthSession> {
    return firstValueFrom(this.http.post<AuthSession>(apiPath(API.auth.login), body));
  }

  sesion(): Promise<AuthSession> {
    return firstValueFrom(this.http.get<AuthSession>(apiPath(API.auth.me)));
  }

  logout(): Promise<void> {
    return firstValueFrom(
      this.http.post(apiPath(API.auth.logout), {}, { responseType: 'text' }),
    ).then(() => undefined);
  }

  /** Cambiar la propia contraseña. Cualquier rol; exige la actual. */
  cambiarPassword(body: CambioPassword): Promise<CambioPasswordResultado> {
    return firstValueFrom(
      this.http.put<CambioPasswordResultado>(apiPath(API.auth.password), body),
    );
  }

  // ------------------------------------------------------------------- menú
  menu(): Promise<Partial<Record<MenuZona, MenuItem[]>>> {
    return firstValueFrom(
      this.http.get<Partial<Record<MenuZona, MenuItem[]>>>(apiPath(API.menu.publico)),
    );
  }

  menuAdmin(): Promise<MenuItem[]> {
    return firstValueFrom(this.http.get<MenuItem[]>(apiPath(API.menu.admin)));
  }

  crearMenuItem(body: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    return firstValueFrom(this.http.post<MenuItem>(apiPath(API.menu.admin), body));
  }

  actualizarMenuItem(id: string, body: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    return firstValueFrom(this.http.put<MenuItem>(apiPath(API.menu.uno(id)), body));
  }

  borrarMenuItem(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.menu.uno(id))));
  }

  /** Reordenar es un movimiento: se manda la lista entera, no N ediciones. */
  ordenarMenu(items: { id: string; orden: number }[]): Promise<MenuItem[]> {
    return firstValueFrom(this.http.put<MenuItem[]>(apiPath(API.menu.orden), { items }));
  }

  restaurarMenu(): Promise<MenuItem[]> {
    return firstValueFrom(this.http.post<MenuItem[]>(apiPath(API.menu.restaurar), {}));
  }

  subirArchivo(file: File): Promise<ArchivoSubido> {
    const data = new FormData();
    data.append('file', file, file.name);
    return firstValueFrom(this.http.post<ArchivoSubido>(apiPath(API.archivos.crear), data));
  }

  borrarArchivo(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.archivos.uno(id))));
  }

  /**
   * Descarga el binario como blob. Un adjunto de trámite es reservado y el API
   * lo niega sin sesión: un `<a href>` normal no pasa por el interceptor y no
   * lleva el token, así que hay que pedirlo por HttpClient.
   */
  descargarArchivo(url: string): Promise<Blob> {
    const ruta = url.startsWith('/api/') ? url.slice(4) : url;
    return firstValueFrom(this.http.get(apiPath(ruta), { responseType: 'blob' }));
  }

  contenido<K extends ModuloId>(modulo: K): Promise<ContentByModulo[K]> {
    return firstValueFrom(
      this.http.get<ContentByModulo[K]>(apiPath(API.contenido.publico(modulo))),
    );
  }

  guardarContenido<K extends ModuloId>(
    modulo: K,
    body: ContentByModulo[K],
  ): Promise<ContentByModulo[K]> {
    return firstValueFrom(
      this.http.put<ContentByModulo[K]>(apiPath(API.contenido.admin(modulo)), body),
    );
  }

  /** Devuelve el módulo al copy oficial sembrado en el servidor. */
  restaurarContenido<K extends ModuloId>(modulo: K): Promise<ContentByModulo[K]> {
    return firstValueFrom(
      this.http.post<ContentByModulo[K]>(apiPath(API.contenido.restaurar(modulo)), {}),
    );
  }

  versionesContenido(modulo: ModuloId): Promise<ContenidoVersion[]> {
    return firstValueFrom(
      this.http.get<ContenidoVersion[]>(apiPath(API.contenido.versiones(modulo))),
    );
  }

  versionContenido(modulo: ModuloId, id: number): Promise<ContenidoVersion> {
    return firstValueFrom(
      this.http.get<ContenidoVersion>(apiPath(API.contenido.version(modulo, id))),
    );
  }

  restaurarVersionContenido<K extends ModuloId>(
    modulo: K,
    id: number,
  ): Promise<ContentByModulo[K]> {
    return firstValueFrom(
      this.http.post<ContentByModulo[K]>(apiPath(API.contenido.restaurarVersion(modulo, id)), {}),
    );
  }

  documentos(query: DocumentoQuery = {}): Promise<DocumentoInstitucional[]> {
    let params = new HttpParams();
    if (query.modulo) params = params.set('modulo', query.modulo);
    if (query.seccion) params = params.set('seccion', query.seccion);
    if (query.publicados) params = params.set('estado', 'publicado');
    const path = query.publicados ? API.documentos.publico : API.documentos.admin;
    return firstValueFrom(this.http.get<DocumentoInstitucional[]>(apiPath(path), { params }));
  }

  crearDocumento(
    body: Omit<DocumentoInstitucional, 'id' | 'actualizadoEn'>,
  ): Promise<DocumentoInstitucional> {
    return firstValueFrom(
      this.http.post<DocumentoInstitucional>(apiPath(API.documentos.admin), body),
    );
  }

  actualizarDocumento(body: DocumentoInstitucional): Promise<DocumentoInstitucional> {
    return firstValueFrom(
      this.http.put<DocumentoInstitucional>(apiPath(API.documentos.uno(body.id)), body),
    );
  }

  eliminarDocumento(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.documentos.uno(id))));
  }

  /** Repone los documentos oficiales de un módulo (rubros del PTI incluidos). */
  restaurarDocumentos(modulo: ModuloId): Promise<DocumentoInstitucional[]> {
    return firstValueFrom(
      this.http.post<DocumentoInstitucional[]>(apiPath(API.documentos.restaurar(modulo)), {}),
    );
  }

  noticias(): Promise<NewsItem[]> {
    return firstValueFrom(this.http.get<NewsItem[]>(apiPath(API.noticias.listado)));
  }

  noticiasAdmin(): Promise<NewsItem[]> {
    return firstValueFrom(this.http.get<NewsItem[]>(apiPath(API.noticias.admin)));
  }

  noticia(id: string): Promise<NewsItem> {
    return firstValueFrom(this.http.get<NewsItem>(apiPath(API.noticias.una(id))));
  }

  crearNoticia(body: NewsItem): Promise<NewsItem> {
    return firstValueFrom(this.http.post<NewsItem>(apiPath(API.noticias.admin), body));
  }

  actualizarNoticia(body: NewsItem): Promise<NewsItem> {
    return firstValueFrom(this.http.put<NewsItem>(apiPath(API.noticias.adminUna(body.id)), body));
  }

  eliminarNoticia(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.noticias.adminUna(id))));
  }

  personal(): Promise<FacultyMember[]> {
    return firstValueFrom(this.http.get<FacultyMember[]>(apiPath(API.catalogo.personal)));
  }

  crearPersonal(body: FacultyMember): Promise<FacultyMember> {
    return firstValueFrom(this.http.post<FacultyMember>(apiPath(API.adminCatalogo.personal), body));
  }

  actualizarPersonal(body: FacultyMember): Promise<FacultyMember> {
    return firstValueFrom(
      this.http.put<FacultyMember>(apiPath(API.adminCatalogo.personalUno(body.id)), body),
    );
  }

  eliminarPersonal(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.adminCatalogo.personalUno(id))));
  }

  repositorio(): Promise<TesisItem[]> {
    return firstValueFrom(this.http.get<TesisItem[]>(apiPath(API.repositorio.listado)));
  }

  tesis(id: string): Promise<TesisItem> {
    return firstValueFrom(this.http.get<TesisItem>(apiPath(API.repositorio.una(id))));
  }

  /**
   * Mesa de partes. Con adjunto va como `multipart/form-data`: hasta ahora solo
   * viajaba el nombre del archivo y el documento del ciudadano nunca llegaba al
   * instituto.
   */
  mesaPartes(payload: IntakePayload, file?: File | null): Promise<IntakeSubmitResult> {
    if (!file) {
      return firstValueFrom(
        this.http.post<IntakeSubmitResult>(apiPath(API.tramites.mesa), payload),
      );
    }
    const data = new FormData();
    for (const [clave, valor] of Object.entries(payload)) {
      if (valor !== undefined && valor !== null) data.append(clave, String(valor));
    }
    data.append('file', file, file.name);
    return firstValueFrom(this.http.post<IntakeSubmitResult>(apiPath(API.tramites.mesa), data));
  }

  rastrearMesa(codigo: string): Promise<IntakeRecord> {
    return firstValueFrom(this.http.get<IntakeRecord>(apiPath(API.tramites.mesaCodigo(codigo))));
  }

  reclamo(body: ReclamoBody): Promise<TramiteRespuesta> {
    return firstValueFrom(this.http.post<TramiteRespuesta>(apiPath(API.tramites.reclamo), body));
  }

  async registrarReclamo(body: ReclamoBody): Promise<TramiteRespuesta> {
    if (!this.remoto) return { codigo: `REC-${Date.now().toString(36).toUpperCase()}` };
    return this.reclamo(body);
  }

  accesoInformacion(body: AccesoInfoBody): Promise<TramiteRespuesta> {
    return firstValueFrom(this.http.post<TramiteRespuesta>(apiPath(API.tramites.acceso), body));
  }

  async registrarAcceso(body: AccesoInfoBody): Promise<TramiteRespuesta> {
    if (!this.remoto) return { codigo: `ACC-${Date.now().toString(36).toUpperCase()}` };
    return this.accesoInformacion(body);
  }

  citaPsicopedagogica(body: CitaPsicoBody): Promise<TramiteRespuesta> {
    return firstValueFrom(this.http.post<TramiteRespuesta>(apiPath(API.tramites.psico), body));
  }

  async registrarCita(body: CitaPsicoBody): Promise<TramiteRespuesta> {
    if (!this.remoto) return { codigo: `CITA-${Date.now().toString(36).toUpperCase()}` };
    return this.citaPsicopedagogica(body);
  }

  apoyoSocial(body: ApoyoSocialBody): Promise<TramiteRespuesta> {
    return firstValueFrom(this.http.post<TramiteRespuesta>(apiPath(API.tramites.social), body));
  }

  async registrarApoyo(body: ApoyoSocialBody): Promise<TramiteRespuesta> {
    if (!this.remoto) return { codigo: `SS-${Date.now().toString(36).toUpperCase()}` };
    return this.apoyoSocial(body);
  }

  // ------------------------------------------------------------- repositorio
  crearTesis(body: Omit<TesisItem, 'id'> & { id?: string }): Promise<TesisItem> {
    return firstValueFrom(this.http.post<TesisItem>(apiPath(API.repositorio.admin), body));
  }

  actualizarTesis(body: TesisItem): Promise<TesisItem> {
    return firstValueFrom(
      this.http.put<TesisItem>(apiPath(API.repositorio.adminUna(body.id)), body),
    );
  }

  eliminarTesis(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.repositorio.adminUna(id))));
  }

  /** Sube el PDF de la tesis y lo enlaza en una sola llamada. */
  subirArchivoTesis(id: string, file: File): Promise<TesisItem> {
    const data = new FormData();
    data.append('file', file, file.name);
    return firstValueFrom(this.http.post<TesisItem>(apiPath(API.repositorio.archivo(id)), data));
  }

  // -------------------------------------------------------------- institución
  programas(): Promise<Program[]> {
    return firstValueFrom(this.http.get<Program[]>(apiPath(API.catalogo.programas)));
  }

  crearPrograma(body: Omit<Program, 'id'> & { id?: string }): Promise<Program> {
    return firstValueFrom(this.http.post<Program>(apiPath(API.adminCatalogo.programas), body));
  }

  actualizarPrograma(body: Program): Promise<Program> {
    return firstValueFrom(
      this.http.put<Program>(apiPath(API.adminCatalogo.programaUno(body.id)), body),
    );
  }

  eliminarPrograma(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.adminCatalogo.programaUno(id))));
  }

  institucion(): Promise<InstitucionFicha> {
    return firstValueFrom(this.http.get<InstitucionFicha>(apiPath(API.catalogo.institucion)));
  }

  guardarInstitucion(body: InstitucionFicha): Promise<InstitucionFicha> {
    return firstValueFrom(
      this.http.put<InstitucionFicha>(apiPath(API.adminCatalogo.institucion), body),
    );
  }

  // ---------------------------------------------------------- trámites (panel)
  bandejaMesa(): Promise<TramiteAdmin[]> {
    return firstValueFrom(this.http.get<TramiteAdmin[]>(apiPath(API.adminTramites.mesa)));
  }

  cambiarEstadoMesa(id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> {
    return firstValueFrom(
      this.http.put<TramiteAdmin>(apiPath(API.adminTramites.mesaUna(id)), cambio),
    );
  }

  bandejaReclamos(): Promise<TramiteAdmin[]> {
    return firstValueFrom(this.http.get<TramiteAdmin[]>(apiPath(API.adminTramites.reclamos)));
  }

  cambiarEstadoReclamo(id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> {
    return firstValueFrom(
      this.http.put<TramiteAdmin>(apiPath(API.adminTramites.reclamoUna(id)), cambio),
    );
  }

  bandejaAcceso(): Promise<TramiteAdmin[]> {
    return firstValueFrom(this.http.get<TramiteAdmin[]>(apiPath(API.adminTramites.acceso)));
  }

  bandejaCitas(): Promise<TramiteAdmin[]> {
    return firstValueFrom(this.http.get<TramiteAdmin[]>(apiPath(API.adminTramites.citas)));
  }

  bandejaApoyo(): Promise<TramiteAdmin[]> {
    return firstValueFrom(this.http.get<TramiteAdmin[]>(apiPath(API.adminTramites.apoyo)));
  }

  cambiarEstadoAcceso(id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> {
    return firstValueFrom(
      this.http.put<TramiteAdmin>(apiPath(API.adminTramites.accesoUna(id)), cambio),
    );
  }

  cambiarEstadoCita(id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> {
    return firstValueFrom(
      this.http.put<TramiteAdmin>(apiPath(API.adminTramites.citaUna(id)), cambio),
    );
  }

  cambiarEstadoApoyo(id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> {
    return firstValueFrom(
      this.http.put<TramiteAdmin>(apiPath(API.adminTramites.apoyoUna(id)), cambio),
    );
  }

  // ----------------------------------------------------------------- usuarios
  usuarios(): Promise<UsuarioAdmin[]> {
    return firstValueFrom(this.http.get<UsuarioAdmin[]>(apiPath(API.adminTramites.usuarios)));
  }

  crearUsuario(body: UsuarioBody): Promise<UsuarioAdmin> {
    return firstValueFrom(this.http.post<UsuarioAdmin>(apiPath(API.adminTramites.usuarios), body));
  }

  actualizarUsuario(id: string, body: UsuarioBody): Promise<UsuarioAdmin> {
    return firstValueFrom(
      this.http.put<UsuarioAdmin>(apiPath(API.adminTramites.usuario(id)), body),
    );
  }

  eliminarUsuario(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiPath(API.adminTramites.usuario(id))));
  }

  // ------------------------------------------------------------------- panel
  resumenPanel(): Promise<PanelResumen> {
    return firstValueFrom(this.http.get<PanelResumen>(apiPath(API.panel.resumen)));
  }
}
