# API del portal — IESPP Peruano Canadiense

Backend del portal público y del panel `/admin`. Node + Express 4 + MariaDB, sin ORM:
las tablas se definen en migraciones `.sql` y las consultas son SQL explícito.

El contrato HTTP lo fija el frontend Angular (`Frontend/src/app/core/api/`). El plan
completo, con el modelo de datos y las fases, está en
`../Frontend/docs/plan-backend-cms.md`.

## Puesta en marcha

```bash
cp .env.example .env          # y complete DB_*, JWT_SECRET y ADMIN_CLAVE
npm install
npm run migrar                # crea las 18 tablas
npm run exportar-semillas     # lee las constantes del Angular → db/semillas/datos/*.json
npm run sembrar               # carga el contenido oficial
npm run crear-admin           # primera cuenta (usa ADMIN_USUARIO / ADMIN_CLAVE)
npm run dev                   # http://localhost:3000/api
```

`npm run preparar` encadena migrar + exportar + sembrar.

Borre `ADMIN_CLAVE` del `.env` cuando la cuenta esté creada.

## Comprobar que funciona

```bash
npm run dev                          # en una terminal
node scripts/verificar-api.js        # contrato público y de contenido (28 comprobaciones)
node scripts/verificar-panel.js      # endpoints de los paneles del admin (30)
node scripts/verificar-contenido.js  # contenido por módulo, historial y programas (126)
npm run verificar-avisos             # el aviso por correo al solicitante (30)
npm run verificar-archivos           # dónde se guardan los binarios y quién los abre (21)
npm run verificar-menu               # el menú autogestionable del portal (25)
npm run auditar-fugas                # ningún dato personal en respuestas públicas (10)
```

Los verificadores HTTP aceptan `API_URL` para apuntar a producción:

```bash
API_URL=https://api.pcanadiense.edu.pe/api node scripts/verificar-api.js usuario clave
```

`auditar-fugas` no: lee la base directamente, así que se ejecuta en el servidor.

Los scripts limpian lo que crean, salvo los trámites: un expediente no se borra.

`verificar-avisos` necesita `MAIL_HABILITADO=true` y un SMTP de pruebas con API de
lectura. En desarrollo se usa Mailpit:

```bash
podman run -d --name mailpit-vdc -p 1025:1025 -p 8025:8025 axllent/mailpit
```

## Poner la base a punto para estrenar

```bash
npm run preparar-produccion        # muestra qué haría, sin tocar nada
npm run preparar-produccion -- --si
```

Borra el rastro de las pruebas —los cinco buzones de trámites, la tabla
`archivos` con sus binarios, el historial de `contenido_versiones` y la
`auditoria`— y conserva el contenido del portal: `contenido_modulos` (misión,
visión, historia), semillas, documentos, noticias, personal, programas,
repositorio, institución y las cuentas.

Los PDFs e imágenes del portal no están aquí: son estáticos del frontend
(`Frontend/public/docs`, `Frontend/public/images`) o enlaces a SharePoint, y
viajan con el build a `public_html`.

## Dónde se guardan los archivos

Los binarios NO viven en la base ni en `public/`: van al disco, en
`ALMACEN_DIR/AAAA/MM/<uuid>.<ext>`, y en la base queda solo el metadato (tabla
`archivos`). La única puerta es `GET /api/archivos/:id` — Apache no llega a esa
carpeta, así que quitar el control de acceso del API no deja una vía alternativa.

Por eso `ALMACEN_DIR` **nunca** debe apuntar dentro de `public_html`. En cPanel,
además, conviene sacarlo del Application root para que un redespliegue no lo pise:

```
ALMACEN_DIR=/home/usuario/almacen_pcanadiense
```

Para mudar un almacén que ya tiene archivos, sin perder ni corromper nada:

```bash
npm run mover-almacen -- /home/usuario/almacen_pcanadiense
# comprueba base contra disco, copia, verifica cada sha256 y deja 700/600
# luego: cambie ALMACEN_DIR en el .env, reinicie y verifique
node scripts/verificar-archivos.js
npm run mover-almacen -- /home/usuario/almacen_pcanadiense --borrar-origen
```

Se niega a copiar dentro de `public_html`, `public` o `www`, al mismo sitio, o
dentro del propio origen. Conserva el origen salvo que se lo pida.

Los permisos quedan en **700 en carpetas y 600 en archivos**: en un hosting
compartido, un adjunto a 644 lo puede leer cualquier otra cuenta del servidor.

### Público vs. reservado

La columna `archivos.publico` decide quién puede descargar:

| | `publico = 1` | `publico = 0` |
|---|---|---|
| Qué es | Documentos del portal: PTI, reglamentos, tesis, imágenes | Adjunto que un ciudadano sube en un trámite |
| Quién lo abre | Cualquiera, sin sesión | Solo con sesión del panel |
| Caché | `public, max-age=3600` | `private, no-store` |
| Auditoría | no | sí, cada descarga |

En disco, todo el almacén queda en **700 (carpetas) y 600 (archivos)**, también
las carpetas `AAAA/MM` que crea la app: `mkdir`/`writeFile` aplican la umask del
proceso (en cPanel suele dejar 755/644), así que se fijan con `chmod` después.
Cerrar solo la raíz no basta: una restauración o una recreación de esa carpeta
dejaría los adjuntos legibles por cualquier cuenta del servidor.

Un archivo copiado a mano dentro del almacén (por el File Manager de cPanel, por
ejemplo) **no es accesible**: el API sirve por id de la tabla `archivos`, no por
ruta. Los PDFs se suben desde el panel, que es lo que crea ese registro.

El adjunto de mesa de partes lleva el DNI y el asunto del solicitante, así que
`crearMesa` lo guarda con `publico: false`. Un anónimo que tenga la URL recibe
401, no el archivo.

La deduplicación por `sha256` **no cruza esa frontera**: reutilizar la fila
reservada de un trámite para un documento del portal lo dejaría inaccesible, y
al revés filtraría el adjunto. Por eso `porHash` filtra también por `publico`.

En el panel el adjunto no se abre con un `<a href>` (no llevaría el token): se
baja por HttpClient y se abre el blob.

## Menú de navegación

Los enlaces de la cabecera y del pie se editan en `/admin/menu`. Antes estaban
escritos en el HTML del Angular: añadir una página al menú exigía tocar código y
volver a desplegar, y era la única pieza del portal que no era autogestionable.

Una sola tabla `menu_items` con una columna `zona`, en vez de una tabla por
sitio. Añadir una zona nueva (una barra superior, un segundo pie) es un dato y
no una migración:

| Zona | Dónde sale |
|---|---|
| `principal` | enlaces de la cabecera |
| `acciones` | botones de color de la cabecera (`variante` conserva su estilo) |
| `pie-institucional` | primera columna del pie |
| `pie-servicios` | segunda columna del pie |

- **El destino manda el comportamiento.** `/nosotros` navega dentro del portal;
  `https://…` abre una pestaña nueva. No hay que marcarlo aparte, y así no puede
  contradecir a la URL. La validación exige una de las dos formas: una ruta sin
  barra inicial no la resuelve el router de Angular y el enlace no llevaría a
  ninguna parte.
- **Ocultar no es borrar.** Quitar "Becas" fuera de campaña y reponerlo después
  no debería obligar a escribirlo de nuevo.
- **Reordenar se manda entero** (`PUT /admin/menu/orden`), no enlace por enlace:
  un fallo a mitad dejaría el menú desordenado.
- **"Restaurar original"** repone el menú de fábrica desde la tabla `semillas`.
  Es la salida cuando alguien borra un enlace y no recuerda a dónde apuntaba.

El portal nunca se queda sin navegación: `MenuStore` arranca con la constante
`navigation.constant.ts` y solo sustituye las zonas que el API devuelva con
contenido. Si el servidor no responde, el menú sigue siendo el oficial. Esa
garantía está cubierta por pruebas en `Frontend/src/app/core/store/menu.store.spec.ts`.

## Cuentas del panel

Dos roles. Un **editor** gestiona todo el contenido del portal y las bandejas de
trámites; crear, editar o eliminar cuentas está reservado al **admin**.

Cada quien cambia su propia contraseña en `/admin/mi-cuenta` → `PUT /auth/password`.
Existe aparte de `/admin/usuarios` justamente porque ese módulo es solo para
administradores: sin esta ruta, un editor no podría rotar nunca la clave que le
dieron y dependería de que alguien se la cambiara.

Se exige la contraseña actual (con el token robado no basta) y el cambio pone
`password_actualizada_en`, que invalida los tokens emitidos antes: cambiarla
cierra las sesiones abiertas, incluida la propia. El panel lo sabe y manda a
iniciar sesión de nuevo en vez de dejar al usuario recibiendo 401.

**No hay recuperación por correo.** Si el administrador olvida su contraseña, se
repone desde el servidor: ponga `ADMIN_USUARIO` y una `ADMIN_CLAVE` nueva en el
`.env` y ejecute `npm run crear-admin` — si la cuenta existe, actualiza su clave.
Borre `ADMIN_CLAVE` del `.env` después.

## Datos personales

`npm run auditar-fugas` saca de la base los datos personales realmente
almacenados (DNI, correos, teléfonos, direcciones y el texto de los cinco
trámites) y comprueba que ninguno aparece en ninguna respuesta pública. No busca
patrones inventados: busca los datos concretos de quienes usaron el portal.

Decisiones que conviene conocer:

- **El seguimiento público expone a propósito** nombre, condición, tipo de
  documento y asunto: es como el ciudadano confirma que el código es el suyo.
  No expone DNI, correo, teléfono, el mensaje ni el adjunto. El código es
  `32^9` con azar criptográfico y la consulta está limitada a 30 por cuarto de
  hora, así que no se puede enumerar.
- **La auditoría guarda metadatos, no cuerpos**: título, estado, id. Nunca el
  payload de un trámite.
- **Los errores de MariaDB no se vuelcan enteros al log.** `error.sql` trae la
  consulta con sus valores ya sustituidos: volcarla escribía el DNI y el texto
  del trámite en `~/logs`, que se rota y entra en las copias de seguridad.
  `manejarErrores` la recorta y conserva solo código y mensaje del motor.
- **La validación no devuelve el valor recibido**, solo `{campo, mensaje}`.

## Avisar al solicitante

Responder un trámite desde el panel guarda el estado y el texto en el expediente.
El correo al ciudadano **no** es automático: sale solo si quien atiende marca
`notificar` (la casilla del detalle en el panel). Una observación interna de mesa
de partes no tiene por qué salir del instituto, y una respuesta del Libro de
Reclamaciones sí tiene que llegar.

El envío nunca tumba el guardado: el estado ya está en la base cuando se intenta
enviar. La respuesta del `PUT` incluye `notificado` para que el panel diga la
verdad en el aviso en vez de prometer un correo que no salió, y la auditoría
registra si se avisó — un reclamo tiene plazo legal y hay que poder demostrarlo.

## Cómo está organizado

```
server.js                arranque: valida entorno, prueba la base, escucha
src/app.js               la app Express sin listen
src/rutas.js             monta /api
src/config/              env (falla temprano si falta algo) y pool de MariaDB
src/lib/                 errores, códigos de seguimiento, slug, fechas, JSON, correo, auditoría
src/middlewares/         auth, validar (zod), subida (multer + bytes mágicos), limitador, errores
src/modulos/<nombre>/    rutas → controlador → servicio → repo → esquemas
db/                      migraciones .sql, semillas y scripts de mantenimiento
scripts/                 verificadores y la mudanza del almacén
(ALMACEN_DIR)            archivos subidos: fuera del proyecto y de git; respáldelo aparte
```

Cuatro archivos por módulo, cada uno con un trabajo: la ruta dice qué URL y qué
middleware, el controlador traduce HTTP, el servicio tiene las reglas y el repo el SQL.

## Decisiones que conviene conocer

- **Sin ORM.** El esquema vive solo en `db/migraciones/`. No hay modelos que redefinan
  las mismas tablas con otras columnas.
- **Fechas en UTC.** La sesión de MySQL va en `+00:00` y el driver devuelve texto
  (`dateStrings`): la conversión a ISO es explícita, en `src/lib/fechas.js`.
- **Las semillas se generan.** `db/semillas/exportar-desde-frontend.mjs` lee los
  `.ts` de `Frontend/src/app/core/constants/` (Node ejecuta TypeScript sin compilar).
  El copy oficial no se copia a mano al SQL.
- **Sembrar no pisa lo editado.** La tabla `semillas` sí se actualiza siempre; las
  tablas vivas solo reciben lo que falta. `node db/sembrar.js --forzar` para reescribir.
- **El correo no bloquea.** Si el SMTP está caído, el trámite se guarda igual y el
  fallo queda en el log. Un expediente no se pierde por un problema de correo.
- **Auditoría.** Toda escritura del panel queda en la tabla `auditoria`. El Portal de
  Transparencia es una obligación legal: hay que poder decir quién publicó cada cosa.
- **Los rubros vacíos siguen vacíos.** El API no inventa PDFs, tarifas ni fechas.

## Cuentas y permisos

- `admin`: todo, incluida la gestión de cuentas.
- `editor`: contenido, documentos, noticias, personal, repositorio y trámites.

Cambiar la contraseña de alguien cierra sus sesiones abiertas (el token lleva `iat` y se
compara con `password_actualizada_en`).
