# CMS local y contrato para backend Node

Documento de contexto para quien tome el frontend y lo fusione con un API Node. El código fuente de verdad del contrato está en:

- `src/app/core/api/endpoints.ts` — rutas
- `src/app/core/api/portal.api.ts` — llamadas HTTP
- `src/app/core/api/api.types.ts` — cuerpos y respuestas
- `src/environments/environment.ts` — interruptor `useRemoteApi`

`Backend/` está vacío y gitignoreado. Este archivo no inventa un servidor: describe lo que el Angular **ya espera**.

---

## 1. Cómo está hoy (sí: mockup operativo)

El portal público y el panel `/admin` son una app Angular 21 **completa en UI**. No es un prototipo de Figma: el usuario admin ya edita y el público ya lee esos cambios **en el mismo navegador**.

Eso no es un backend. Es un **CMS local**:

| Capa | Dónde vive ahora | Qué pasa cuando exista Node |
| --- | --- | --- |
| Textos de páginas | `localStorage` (`pc-content-*`) | `GET/PUT /contenido/:modulo` |
| PDFs / metadatos de documentos | `localStorage` (`pc-documentos`) | CRUD `/admin/documentos` |
| Blobs (fotos, PDFs subidos) | IndexedDB (`idb:<uuid>`) | `POST /archivos` + URL pública |
| Noticias | `localStorage` (`pc-noticias`) | CRUD `/admin/noticias` |
| Personal / docentes | `localStorage` (`pc-personal`) | CRUD `/admin/personal` |
| Mesa de partes (público) | `localStorage` (`iespp-intake-records`) | `POST /tramites/mesa-de-partes` |
| Login | token falso `local-dev` | `POST /auth/login` + JWT |

El interruptor es uno:

```ts
// src/environments/environment.ts  (y environment.prod.ts)
useRemoteApi: false   // CMS local
useRemoteApi: true    // HttpClient contra apiUrl
```

- Dev: `apiUrl = http://localhost:3000/api`
- Prod (previsto): `apiUrl = https://api.pcanadiense.edu.pe/api`

Con `false` (estado actual):

- El guard deja entrar a `/admin` sin contraseña real.
- Los stores escriben en el navegador y **no** llaman HTTP.
- Los trámites públicos (reclamo, acceso, psico, social) generan un código local.
- Las constantes en `src/app/core/constants/` son la **semilla**. Si el admin no tocó nada, el público ve ese copy oficial.

Con `true`:

- `PortalSync` hidrata al entrar al layout público y al admin.
- Login, interceptor Bearer y 401 → `/admin/login`.
- Subir archivo manda `FormData` con el campo `file`.

No hay que reescribir las pantallas para “conectar backend”. Hay que implementar el API que ya está tipado y poner `useRemoteApi: true`.

---

## 2. Qué hicimos en el frontend (mapa)

### Público (sitio institucional)

Páginas de servicios, bienestar, transparencia, repositorio, reglamentos, etc. reescritas a Angular standalone, signals, `OnPush`, iconos Font Awesome y copy oficial (sin PDFs, fechas ni RENATI inventados).

Horario público institucional: lun–vie 8:00 a.m.–1:00 p.m. Clases 3:00–7:00 p.m.

### Admin autogestionado (ya cableado al público)

| Ruta admin | Qué edita | Página pública |
| --- | --- | --- |
| `/admin/contenido` | Índice de 9 módulos + restaurar todo | — |
| `/admin/inicio` | Portada, servicios, logos | `/inicio` |
| `/admin/nosotros` | Misión, visión, valores, organigrama, historia | `/nosotros` |
| `/admin/admision` | Copy y docs de admisión | `/admision` |
| `/admin/becas` … `/admin/licenciamiento` | Copy + PDFs/enlaces por pestaña | misma ruta sin `/admin` |
| `/admin/personal` | Fichas y fotos de autoridades / administrativos / docentes | directorio en `/nosotros` |
| `/admin/noticias` | Alta, edición, baja, foto, destacada | `/noticias` y `/noticias/:id` |
| `/admin/comunicados` | Atajo: se publican como noticia tipo Comunicado | `/noticias` |

`/admin/trayectoria` redirige a `/admin/nosotros`.

Los visores públicos resuelven imágenes `idb:` con la directiva `img[appSrc]`.

### Admin todavía placeholder (UI vacía)

Estas rutas existen en el menú pero **no tienen CRUD**. Las rutas HTTP están reservadas en `endpoints.ts`; `PortalApi` aún no las llama.

- `/admin/dashboard`
- `/admin/contactos`
- `/admin/investigaciones` (repositorio: el público sí puede hidratar GET)
- `/admin/documentos` (el CRUD real de PDFs está **dentro de cada módulo** de contenido, no en esta pantalla)
- `/admin/mesa-de-partes`
- `/admin/reclamaciones`
- `/admin/usuarios`

### Piezas de infraestructura

- `ContenidoStore`, `DocumentosStore`, `ArchivosStore`, `FacultyStore`, `NewsService`
- Editor por esquema (`ModuloEditor` + `EditorContenido`)
- `SelectorArchivo`, toasts, aviso al salir con cambios
- `PortalApi` + `authInterceptor`

---

## 3. Qué falta (para pasar de mockup a producción)

1. **Escribir el backend Node** (Express, Fastify o Nest) que cumpla las rutas de la sección 4. Carpeta `Backend/` hoy no tiene código de aplicación.
2. **Poner `useRemoteApi: true`** en `environment.ts` (dev) y `environment.prod.ts` (cuando el API esté en el dominio).
3. **CORS** en Node: origen `http://127.0.0.1:4200` (dev) y el dominio del portal (prod). El Angular llama directo a `apiUrl`; no hay `proxy.conf`.
4. **Auth real**: JWT (o equivalente) en `Authorization: Bearer`. El login del admin ya manda `{ username, password }`.
5. **Almacenamiento de archivos**: disco, S3 o similar. `GET /archivos/:id` debe devolver el binario (o una URL absoluta en el JSON de subida).
6. **Base de datos** (MySQL ya se mencionó en el entorno local previo): tablas para contenido JSON, documentos, noticias, personal, trámites, usuarios.
7. **Migrar semillas**: los `*_COPY` y `DOCUMENTOS_SEED` son el contenido inicial a cargar en SQL/JSON, no a reescribir a mano en el servidor.
8. Completar paneles admin placeholder si el instituto va a gestionar trámites, usuarios y repositorio desde `/admin`.
9. Proxy o HTTPS y el DNS `api.pcanadiense.edu.pe`.
10. No publicar datos inventados: el copy oficial (misión 2029, D.S. 04-95-ED, tarifario SharePoint, etc.) ya está en las constantes.

Limitación del modo local: lo que un admin sube queda **en ese navegador**. Otro PC o un visitante no lo ve hasta que exista el API.

---

## 4. Contrato HTTP

Base: `{apiUrl}` = `http://localhost:3000/api`.

Convención:

- JSON `Content-Type: application/json` salvo subida de archivos.
- Público: GET (y POST de trámites) **sin** token.
- Admin: header `Authorization: Bearer <token>`.
- IDs de contenido: string (uuid o slug). Personal usa `id: number` porque el seed histórico es numérico; el API puede devolver number o el front lo acepta igual.

### 4.1 Auth

| Método | Ruta | Auth | Body / respuesta |
| --- | --- | --- | --- |
| POST | `/auth/login` | no | `{ "username", "password" }` → `{ "token", "user?": { "id", "nombre", "rol": "admin"\|"editor" } }` |
| GET | `/auth/me` | sí | misma forma de sesión |
| POST | `/auth/logout` | sí | 204 (el front hoy solo borra `sessionStorage`) |

### 4.2 Archivos

| Método | Ruta | Auth | Notas |
| --- | --- | --- | --- |
| POST | `/archivos` | sí | `multipart/form-data`, campo **`file`**. Respuesta: `{ "id", "url", "nombre", "mime", "bytes" }` |
| GET | `/archivos/:id` | no (público si el archivo está publicado) | binario, o redirigir a URL firmada |
| DELETE | `/archivos/:id` | sí | 204 |

`url` puede ser absoluta (`https://api…/api/archivos/:id`) o relativa `/api/archivos/:id`. El front **no** debe recibir `idb:` cuando `useRemoteApi` es true.

Límites que ya valida el admin: imagen 5 MB (jpeg/png/gif/webp); PDF 15 MB.

### 4.3 Contenido de páginas (JSON por módulo)

`modulo`: `inicio` \| `nosotros` \| `admision` \| `becas` \| `costos` \| `estadisticas` \| `horarios` \| `inversiones` \| `licenciamiento`

| Método | Ruta | Auth |
| --- | --- | --- |
| GET | `/contenido/:modulo` | no |
| PUT | `/admin/contenido/:modulo` | sí |

El body del PUT es el objeto completo del módulo (el front manda el draft entero). Ejemplo `nosotros`:

```json
{
  "heroTitle": "Nosotros",
  "heroLead": "…",
  "mission": "…",
  "vision": "…",
  "values": [{ "name": "Libertad", "definition": "…" }],
  "organigrama": { "src": "/api/archivos/uuid", "alt": "Organigrama institucional" },
  "historiaImage": { "src": "images/pcanadiense/historia.jpg", "alt": "…" },
  "historyLead": "…",
  "milestones": [{ "year": "1995", "title": "Creación oficial", "text": "…" }]
}
```

Tipos TypeScript: `ContentByModulo` en `contenido.store.ts`. Inicio usa `heroImages[]`, `licensingImage`, `services[]`, `logos[]`.

### 4.4 Documentos (PDFs / enlaces / imágenes de cada módulo)

```ts
{
  id: string;
  modulo: ModuloId;
  seccion: string;       // pestaña del editor, p.ej. "hero"
  titulo: string;
  descripcion?: string;
  tipo: "pdf" | "enlace" | "imagen";
  url: string;           // /api/archivos/:id, idb:… (solo local), o URL SharePoint
  anio?: string;
  orden: number;
  estado: "publicado" | "borrador";
  actualizadoEn: string; // ISO
}
```

| Método | Ruta | Auth | Query |
| --- | --- | --- | --- |
| GET | `/documentos` | no | `modulo`, `seccion`, `estado=publicado` (el front manda `estado=publicado` si pide solo públicos) |
| GET | `/admin/documentos` | sí | `modulo`, `seccion` (incluye borradores) |
| POST | `/admin/documentos` | sí | alta sin `id` ni `actualizadoEn` |
| PUT | `/admin/documentos/:id` | sí | documento completo |
| DELETE | `/admin/documentos/:id` | sí | |

Los enlaces oficiales de tarifario / PTI pueden seguir siendo `tipo: "enlace"` a SharePoint. No inventar PDFs.

### 4.5 Noticias

```ts
{
  id: string;                    // slug
  title: string;
  category: "noticia" | "comunicado" | "evento";
  categoryLabel: string;
  excerpt: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  createdAt: string;             // YYYY-MM-DD
  featured?: boolean             // como máximo una destacada
}
```

| Método | Ruta | Auth |
| --- | --- | --- |
| GET | `/noticias` | no |
| GET | `/noticias/:id` | no |
| POST | `/admin/noticias` | sí |
| PUT | `/admin/noticias/:id` | sí |
| DELETE | `/admin/noticias/:id` | sí |

### 4.6 Personal / docentes

```ts
{
  id: number;
  type: "Autoridad" | "Administrativo" | "Docente";
  names: string;
  lastNames: string;
  position: string;
  area?: string;
  grade: string;
  email: string;
  image?: string;
  cvUrl?: string;
  order: number;
}
```

| Método | Ruta | Auth |
| --- | --- | --- |
| GET | `/personal` | no |
| POST | `/admin/personal` | sí |
| PUT | `/admin/personal/:id` | sí |
| DELETE | `/admin/personal/:id` | sí |

### 4.7 Repositorio (tesis)

Público ya hidrata. Admin de investigaciones **no** está cableado.

```ts
{
  id: string;
  titulo: string;
  autores: string[];
  programa: string;
  anio: string;
  tipo: "Tesis";
  nivel: string;
  resumen: string;
}
```

| Método | Ruta | Auth | Estado en el front |
| --- | --- | --- | --- |
| GET | `/repositorio` | no | sí (`RepositorioService.hidratar`) |
| GET | `/repositorio/:id` | no | método en `PortalApi`, poco usado |
| POST/PUT/DELETE | `/admin/repositorio` … | sí | **reservado**, panel vacío |
| POST | `/admin/repositorio/:id/archivo` | sí | **reservado** |

### 4.8 Trámites públicos (POST sin token)

Respuesta mínima que el front usa en reclamo / acceso / psico / social: `{ "codigo": "REC-…" }`.

Mesa de partes espera `IntakeSubmitResult`:

```ts
{
  trackingCode: string;
  emailAdmin: string;
  emailIntake: string;
  futUrl: string;
}
```

Seguimiento: `GET /tramites/mesa-de-partes/:codigo` → `IntakeRecord`.

| POST | Body (campos) |
| --- | --- |
| `/tramites/mesa-de-partes` | `nombres, dni, telefono, correo, condicion, tipoDoc, folios, asunto, mensaje, fileName?, linkDocumento?` |
| `/tramites/reclamaciones` | `tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono, direccion, tipoReclamo, detalleReclamo, pedido` |
| `/tramites/acceso-informacion` | `nombres, apellidos, dni, email, telefono, direccion, informacionSolicitada, motivo` |
| `/tramites/psicopedagogico` | `nombres, apellidos, dni, email, telefono, programa, semestre, motivo, fechaPreferida` |
| `/tramites/servicio-social` | `nombres, apellidos, dni, email, telefono, programa, semestre, tipoApoyo, descripcionSituacion` |

### 4.9 Rutas reservadas (declaradas, el Angular aún no las consume)

```
GET/PUT  /institucion
GET      /programas
GET      /admin/mesa-de-partes
GET/PUT  /admin/mesa-de-partes/:id
GET      /admin/reclamaciones
GET/PUT  /admin/reclamaciones/:id
GET      /admin/acceso-informacion
GET      /admin/citas-psicopedagogicas
GET      /admin/servicio-social
GET/POST /admin/usuarios
GET/PUT/DELETE /admin/usuarios/:id
```

Se pueden implementar en Node desde el día uno; el panel admin de esas pantallas se hará después.

---

## 5. Cómo fusionar con Node (orden práctico)

### Paso A — Esqueleto

En otra carpeta (p. ej. `Backend/` fuera del gitignore, o un repo aparte):

- Node 20+
- Express / Fastify / Nest
- CORS + `json()` + `multer` (o equivalente) en `/archivos`
- MySQL o Postgres
- JWT (`jsonwebtoken`) con secret en `.env`

Prefijo de router: `/api`. Ejemplo Express:

```js
app.use(cors({ origin: ['http://127.0.0.1:4200', 'http://localhost:4200'] }));
app.use(express.json({ limit: '2mb' }));
app.use('/api', router);
```

### Paso B — Orden de implementación (el front ya escribe en este orden)

1. `POST /auth/login` + `GET /auth/me` + middleware Bearer  
2. `POST/GET/DELETE /archivos`  
3. `GET/PUT /contenido/:modulo` (JSON en columna `json` o tabla EAV)  
4. CRUD documentos  
5. CRUD noticias  
6. CRUD personal  
7. POST trámites + GET seguimiento mesa  
8. GET repositorio  

### Paso C — Encender el front

1. Backend en `:3000` con health check `GET /api/contenido/nosotros`.
2. En `environment.ts`: `useRemoteApi: true`.
3. `ng serve` en `:4200`.
4. Login admin → editar Nosotros → recargar `/nosotros` en ventana privada (otro perfil) y confirmar que **sí** se ve (ya no es localStorage).
5. Subir una foto de docente y una noticia; comprobar `GET /api/archivos/:id` y el listado público.

### Paso D — Semillas

Cargar en SQL el JSON de:

- `ABOUT_COPY`, `INICIO_COPY`, `ADMISSION_COPY`, etc.
- `DOCUMENTOS_SEED`
- `NEWS_ITEMS`
- `FACULTY_MEMBERS`
- `REPOSITORIO_ITEMS`

Así el primer `GET` no devuelve `{}` y no se pierde el contenido oficial.

### Paso E — Producción

- `environment.prod.ts`: `useRemoteApi: true` y `apiUrl` del dominio real.
- HTTPS, backups de archivos, rate limit en POST de trámites, validación de MIME en subidas.

---

## 6. Flujo de datos (mismo componente, dos backends)

```
Admin (Angular) ──publicar()──► Store (signal)
                                    │
                    useRemoteApi false │  true
                                    ▼     ▼
                             localStorage   PortalApi ──HTTP──► Node /api
                             IndexedDB              │
Público (Angular) ◄──────────── same Store ◄────────┘  (PortalSync.hydrate*)
```

Archivos de referencia rápida:

| Qué | Archivo |
| --- | --- |
| Flag | `src/environments/environment.ts` |
| Rutas | `src/app/core/api/endpoints.ts` |
| Cliente | `src/app/core/api/portal.api.ts` |
| Hidratar | `src/app/core/api/portal-sync.ts` |
| Bearer | `src/app/core/auth/auth.interceptor.ts` |
| Guard | `src/app/core/guards/auth.guard.ts` |

---

## 7. Criterio de datos oficiales

No rellenar huecos con PDFs, horas, tarifas, códigos RENATI o fechas falsas. Si un rubro de transparencia está vacío en la web oficial, el portal debe seguir diciendo que está vacío hasta que el admin suba el documento real.
