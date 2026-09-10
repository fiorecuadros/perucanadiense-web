# Plan — Backend Node + MariaDB y CMS autogestionado

Documento de trabajo del backend de `Perucanandiense/Backend/`. Complementa a
`cms-local-y-backend-node.md` (que describe **qué espera** el Angular). Este describe
**qué se construye**, con qué tablas y en qué orden.

Fecha: 2 de septiembre de 2026 · Rama de trabajo prevista: `backend-v2`.

> **Estado: bloques A, B y C terminados y verificados** (58 comprobaciones automáticas
> en verde: `node scripts/verificar-api.js` y `node scripts/verificar-panel.js` dentro de
> `Backend/`). Queda el bloque D: correo, dominio y despliegue en cPanel.

---

## 1. Punto de partida (verificado, no supuesto)

| Pieza | Estado real hoy |
| --- | --- |
| `Frontend/` | Angular 21 completo. Portal público + `/admin` con 9 módulos de contenido operativos contra `localStorage` / IndexedDB. |
| Contrato HTTP | **Ya está tipado** en `core/api/endpoints.ts`, `portal.api.ts`, `api.types.ts`. No hay que inventarlo. |
| `environment.useRemoteApi` | `false` en dev y en prod. Un solo interruptor. |
| `Backend/` | `node_modules` heredado de otro proyecto, un `.env` con credenciales MariaDB y `public/images` vacío. **Cero código de aplicación.** |
| Rama `backend` (git) | Copia literal del backend de Virgen del Carmen (98 archivos). **No se usa como base**: es el código que queremos no repetir. |
| MariaDB local | No instalado en esta máquina. Producción es cPanel (MariaDB). |
| Node | v26.7.0 local. cPanel suele ofrecer 18/20/22 → el código debe correr en Node 18+. |

### Qué se hereda de Virgen del Carmen y qué no

Se hereda la **idea** (Express + MySQL + JWT + multer + nodemailer, desplegado en cPanel) y
los aciertos concretos: validación de bytes mágicos en subidas, limitador de intentos de
login, plantillas de correo de mesa de partes y libro de reclamaciones.

No se hereda:

1. **Rutas verbales** (`/news/create`, `/news/delete/:id/:del`). El contrato del Angular ya es
   REST por recurso. Se respeta ese contrato tal cual está escrito.
2. **Doble fuente del esquema** (modelos Sequelize + `schema.sql` describiendo las mismas
   tablas con columnas distintas). Fuente única: migraciones `.sql` versionadas.
3. **Controladores con SQL, reglas de negocio y respuestas HTTP mezcladas**. Se parte en
   `controlador → servicio → repositorio`.
4. **`helpers/*.query.js` que solo devuelven `{where, order}`**: indirección sin valor.
5. **`try/catch` con `res.status(500)` copiado en cada método**. Un solo manejador de errores.
6. **Validación ausente**: hoy se guarda lo que llegue. Aquí, esquema por endpoint (zod) y 422.
7. Archivos subidos versionados en git (`Backend/public/pdf/documents/...` está commiteado en
   la rama `backend`). El almacén va fuera de git y con respaldo propio.

---

## 2. Decisiones

| Decisión | Elección | Por qué |
| --- | --- | --- |
| Lenguaje | JavaScript CommonJS | Es lo que cPanel + Passenger arrancan sin fricción. TypeScript exigiría build o Node 22+ en el hosting. |
| Framework | Express 4 | Ya instalado, estable en cPanel. Express 5 no aporta nada aquí. |
| Acceso a datos | `mysql2/promise` + SQL explícito | Una sola definición del esquema, consultas legibles, cero magia. |
| Esquema | Migraciones `.sql` numeradas + tabla `migraciones` | Reproducible en local y en cPanel con un comando. |
| Validación | `zod` por endpoint | El cuerpo que entra es exactamente el que el Angular manda. |
| Fechas | `dateStrings: true` + sesión en UTC | Evita el clásico desfase de zona horaria de los ORM. Se formatea a ISO en el mapeador. |
| Archivos | Disco (`Backend/almacen/`) + metadatos en tabla `archivos` | cPanel no tiene S3. Migrable después sin tocar el contrato. |
| Auth | JWT Bearer, 8 h, `password_actualizada_en` invalida tokens viejos | El front ya manda `Authorization: Bearer`. |
| Correo | nodemailer **opcional** | Si el SMTP no responde, el trámite se guarda igual y se registra el fallo. Un trámite no se pierde porque el correo esté caído. |

### Estructura

```
Backend/
├── server.js                  arranque: valida entorno, prueba DB, escucha
├── src/
│   ├── app.js                 la app Express sin listen (testeable)
│   ├── rutas.js               monta /api con todos los módulos
│   ├── config/{env,db}.js
│   ├── lib/                   errores, códigos, slug, fechas, json, mailer
│   ├── middlewares/           auth, validar, subida, limitador, errores
│   └── modulos/<nombre>/
│         <nombre>.rutas.js        qué URL, qué middleware
│         <nombre>.controlador.js  HTTP entra / HTTP sale
│         <nombre>.servicio.js     reglas (una destacada, re-slug, restaurar…)
│         <nombre>.repo.js         SQL
│         <nombre>.esquemas.js     zod
├── db/
│   ├── migrar.js  sembrar.js  crear-admin.js
│   ├── migraciones/001_esquema_inicial.sql
│   └── semillas/exportar-desde-frontend.mjs  → datos/*.json
└── almacen/                   archivos subidos (fuera de git)
```

Cuatro archivos por módulo, cada uno con un trabajo. Un endpoint nuevo se lee de arriba abajo
sin saltar entre carpetas.

### Las semillas se generan, no se copian a mano

El contenido oficial (misión, tarifario, hitos, docentes, tesis, noticias) vive en
`Frontend/src/app/core/constants/*.ts`. Copiarlo a mano al SQL garantiza que en tres meses
las dos copias digan cosas distintas.

`db/semillas/exportar-desde-frontend.mjs` **importa esos `.ts`** (Node 26 los ejecuta
directo) y escribe `db/semillas/datos/*.json`. `db/sembrar.js` los inserta con
`ON DUPLICATE KEY UPDATE`. Volver a ejecutarlo es seguro.

---

## 3. Modelo de datos (MariaDB 10.4+ / MySQL 8)

18 tablas. `utf8mb4_unicode_ci`, InnoDB. Nombres y columnas en español, como el resto del proyecto.

### Identidad y auditoría

| Tabla | Para qué | Claves |
| --- | --- | --- |
| `usuarios` | Cuentas del panel | `id` CHAR(36), `username` UNIQUE, `rol` ENUM('admin','editor'), `password_hash`, `password_actualizada_en`, `activo` |
| `auditoria` | Quién cambió qué y cuándo | `usuario_id`, `accion`, `entidad`, `entidad_id`, `datos` JSON, `ip` |
| `migraciones` | Control del esquema | `nombre` UNIQUE, `aplicada_en` |

`auditoria` no es adorno: el Portal de Transparencia es una obligación legal (Ley 30512) y
hay que poder decir quién publicó o retiró un documento.

### Contenido del portal

| Tabla | Para qué |
| --- | --- |
| `contenido_modulos` | `modulo` PK (los 9) + `data` JSON. Es el `GET/PUT /contenido/:modulo`. |
| `contenido_versiones` | Historial: cada PUT guarda la versión anterior. Permite deshacer. |
| `semillas` | `clave` PK + `data` JSON. El copy original. **Es lo que hace real el botón "Restaurar original"**: hoy restaura solo en el navegador y al recargar desde el API vuelve lo editado. |
| `documentos` | PDFs / enlaces / imágenes por `modulo` + `seccion`. `estado` ENUM('publicado','borrador'), `orden`, `archivo_id`. |
| `archivos` | Metadatos de cada subida: `mime`, `bytes`, `sha256`, `ruta_relativa`, `subido_por`. |
| `noticias` | `id` slug, `paragraphs` JSON, `featured`, `category` ENUM. |
| `personal` | Directorio. `id` INT (el contrato del front dice `number`). |
| `repositorio` | Tesis. `autores` JSON, `archivo_id` para el PDF cuando exista. |
| `institucion` | Fila única con la ficha institucional en JSON (sedes, teléfonos, redes). Es lo que editará `/admin/contactos`. |
| `programas` | Oferta FID y técnica. `shifts` y `field_of_work` en JSON. |

`documentos.url` es VARCHAR(1000): los enlaces de SharePoint del tarifario y el PTI pasan de
200 caracteres.

### Trámites (todos con `codigo` UNIQUE, `estado`, `ip`, `user_agent`)

| Tabla | Origen | Código |
| --- | --- | --- |
| `tramites_mesa_partes` | `/mesa-de-partes` | `MDP-` |
| `tramites_reclamaciones` | Libro de reclamaciones | `REC-` |
| `tramites_acceso_informacion` | Ley 27806 | `ACC-` |
| `citas_psicopedagogicas` | Bienestar | `CITA-` |
| `apoyo_social` | Servicio social | `SS-` |

`ip` y `user_agent` se guardan por dos razones concretas: el limitador de altas y poder
rastrear un envío masivo automatizado. No se publican nunca.

El DDL completo está en `Backend/db/migraciones/001_esquema_inicial.sql`.

---

## 4. Contrato HTTP → módulo → tabla

Base `/api`. Público: GET sin token y POST de trámites sin token. Admin: Bearer.

| Método y ruta | Auth | Módulo | Tabla |
| --- | --- | --- | --- |
| `POST /auth/login` · `GET /auth/me` · `POST /auth/logout` | –/sí | auth | `usuarios` |
| `POST /archivos` · `GET /archivos/:id` · `DELETE /archivos/:id` | sí/–/sí | archivos | `archivos` |
| `GET /contenido/:modulo` | – | contenido | `contenido_modulos` |
| `PUT /admin/contenido/:modulo` | sí | contenido | + `contenido_versiones` |
| `POST /admin/contenido/:modulo/restaurar` | sí | contenido | ← `semillas` |
| `GET /documentos?modulo&seccion&estado=publicado` | – | documentos | `documentos` |
| `GET/POST /admin/documentos` · `PUT/DELETE /admin/documentos/:id` | sí | documentos | `documentos` |
| `POST /admin/documentos/restaurar/:modulo` | sí | documentos | ← `semillas` |
| `GET /noticias` · `GET /noticias/:id` | – | noticias | `noticias` |
| `POST/PUT/DELETE /admin/noticias[/:id]` | sí | noticias | `noticias` |
| `GET /personal` · `POST/PUT/DELETE /admin/personal[/:id]` | –/sí | personal | `personal` |
| `GET /repositorio[/:id]` · `POST/PUT/DELETE /admin/repositorio` · `POST /admin/repositorio/:id/archivo` | –/sí | repositorio | `repositorio` |
| `GET /institucion` · `PUT /admin/institucion` | –/sí | institucion | `institucion` |
| `GET /programas` | – | programas | `programas` |
| `POST /tramites/{mesa-de-partes,reclamaciones,acceso-informacion,psicopedagogico,servicio-social}` | – | tramites | las 5 tablas |
| `GET /tramites/mesa-de-partes/:codigo` | – | tramites | `tramites_mesa_partes` |
| `GET/PUT /admin/{mesa-de-partes,reclamaciones}[/:id]` · `GET /admin/{acceso-informacion,citas-psicopedagogicas,servicio-social}` | sí | tramites | idem |
| `GET/POST /admin/usuarios` · `GET/PUT/DELETE /admin/usuarios/:id` | sí (admin) | usuarios | `usuarios` |

Dos rutas extra que el contrato de hoy no tiene y hacen falta (`/restaurar`): sin ellas el
botón "Restaurar original" del panel miente en cuanto exista el API.

---

## 5. Huecos reales entre el Angular y el API (encontrados al revisar el código)

Esto es lo que hay que arreglar además de "escribir el backend". Cada punto está verificado
en el archivo que se indica.

1. **`archivoPublicoUrl()` apunta fuera de `/api`.** `endpoints.ts:87` construye
   `baseUrl + /archivos/:id` → `http://localhost:3000/archivos/uuid`, sin el prefijo.
   *Solución:* el backend monta `GET /archivos/:id` **también en la raíz**, además de bajo
   `/api`. Sin tocar el front. (Solo se usa como respaldo si la subida no devuelve `url`.)
2. **Mesa de partes no sube el archivo.** `mesa-de-partes.ts:119` manda solo `fileName`. El
   ciudadano adjunta un PDF, ve "enviado", y al instituto **no le llega nada**. El backend
   acepta `multipart/form-data` en `POST /tramites/mesa-de-partes` desde el día uno; el
   cambio del front (enviar `FormData`) entra en el bloque C.
3. **Dos guards con el mismo nombre.** `core/guards/auth.guard.ts` (deja pasar siempre) y
   `core/auth/auth.guard.ts` (valida). Con `useRemoteApi: true` el primero ya exige token, así
   que el segundo queda muerto: se borra en el bloque B.
4. **`AuthService` descarta el usuario.** `auth.service.ts:20` guarda solo el token; el panel
   no puede mostrar nombre ni rol ni ocultar lo que un `editor` no debe tocar. Bloque C.
5. **"Restaurar original" es local.** `ContenidoStore.resetAll()` y
   `DocumentosStore.restaurarModulo()` reescriben `localStorage` y borran documentos por el
   API, pero **reinsertan la semilla solo en el navegador**: al recargar, el servidor devuelve
   el estado vacío. Se resuelve con las dos rutas `/restaurar` y la tabla `semillas`.
6. **Choque de slugs en noticias.** `news.service.ts` genera el `id` en el navegador. El
   backend re-slugifica si ya existe y devuelve el objeto final (el front ya usa la respuesta).
7. **`id` de personal lo calcula el navegador** (`max + 1`): con dos editores a la vez, choca.
   El backend ignora el `id` entrante en el POST y devuelve el suyo.
8. **`GET /tramites/mesa-de-partes/:codigo` es público.** Con `MDP-` + 9 caracteres es
   enumerable. Se limita por IP y se devuelve solo estado y asunto, nunca DNI ni teléfono.
9. **`documentos.hidratar(false)`** pega a `/admin/documentos` sin token si alguien llama al
   sync de admin fuera de sesión: el backend responde 401 y el store conserva lo local. Es el
   comportamiento correcto; queda anotado para que no se "arregle" por error.
10. **`useRemoteApi` es un booleano compilado**: cambiarlo exige rebuild. Se documenta en el
    bloque D para que producción no despliegue con `false`.
11. **Sin noticias en el seed público**: `NEWS_ITEMS` existe y se siembra; si el instituto no
    quiere esas noticias de arranque, se vacía la tabla — no se inventan otras.

---

## 6. Fases

### Bloque A — API + base de datos + semillas · **hecho**

1. `package.json`, `.env.example`, `.gitignore`, `almacen/`.
2. `config/env.js` (falla al arrancar si falta `JWT_SECRET` o credenciales de DB) y
   `config/db.js` (pool `mysql2`, sesión UTC, `dateStrings`).
3. Migración `001_esquema_inicial.sql` con las 18 tablas + `db/migrar.js`.
4. Exportador de semillas desde las constantes + `db/sembrar.js` + `db/crear-admin.js`.
5. Middlewares: `auth`, `validar` (zod), `subida` (multer en memoria + bytes mágicos + límites
   5 MB imagen / 15 MB PDF), `limitador`, `errores`.
6. Los 11 módulos del contrato.
7. `GET /api/salud` para el health check.

**Verificación:** migrar, sembrar, `curl` a login → token → PUT de contenido → GET público
devuelve lo editado; subir un PDF y recuperarlo por `GET /api/archivos/:id`.

### Bloque B — Encender el frontend · **hecho**

1. `useRemoteApi: true` en `environment.ts`.
2. Borrar el guard duplicado.
3. `import type` en `news.constant.ts` (lo necesita el exportador de semillas).
4. Prueba de verdad: editar Nosotros en `/admin`, abrir `/nosotros` en **otro navegador** y
   ver el cambio. Eso es lo que hoy no pasa.
5. Subir foto de docente y crear una noticia; comprobar en el listado público.

### Bloque C — Los paneles vacíos del admin · **hecho**

`dashboard`, `contactos` (→ `/institucion`), `documentos` (vista global), `investigaciones`
(repositorio), `mesa-de-partes`, `reclamaciones`, `usuarios`. Se añadió uno más:
**`/admin/solicitudes`**, con las tres bandejas que tenían formulario público y ningún sitio
donde leerlas (acceso a la información, citas psicopedagógicas y servicio social). Sin esa
pantalla, un estudiante pedía una cita, recibía un código y nadie del instituto lo veía nunca.

Las cinco bandejas comparten `admin/shared/bandeja-tramites/`: cada panel declara columnas,
campos de detalle y estados, y pasa un cargador y un guardador.

Resueltos aquí, además, los huecos 2, 4 y 5 de la sección 5.

### Bloque D — Correo, seguridad y despliegue · **pendiente**

Plantillas de correo (mesa de partes y reclamaciones), CORS del dominio real, HTTPS,
`.htaccess` / Passenger en cPanel, `api.pcanadiense.edu.pe`, respaldo de `almacen/` y de la
base, `environment.prod.ts` con `useRemoteApi: true`.

El envío ya está cableado y desactivado (`MAIL_HABILITADO=false`). En esta máquina hay un
mailpit en el puerto 1025 (del proyecto Virgen del Carmen) que sirve para probarlo sin
mandar correo real.

Pendiente conocido: Express 4 arrastra tres avisos moderados de `npm audit` a través de
`body-parser`/`qs`. Se mantiene la versión 4 porque es la que cPanel tiene rodada; el parche
exige Express 5. La exposición real es nula (el límite de `json()` es un valor fijo nuestro),
pero conviene decidirlo antes de publicar.

---

## 7. Reglas que no se rompen

1. **No se inventan datos.** Si un rubro del PTI está vacío (becas, inversiones, periodo de
   licenciamiento), la tabla se queda vacía y la página sigue diciendo que no hay documento.
   El backend existe justamente para que el día que llegue el PDF alguien lo suba.
2. **El contrato manda.** Si el Angular espera `{ codigo }`, se devuelve `{ codigo }`. Los
   cambios de forma se hacen en los dos lados a la vez o no se hacen.
3. **Nada de secretos en git**: `.env` fuera, `.env.example` dentro.
4. **El almacén de archivos no se versiona.**
5. Comentarios, nombres y mensajes de error en español.
