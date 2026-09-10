-- ============================================================================
-- IESPP Privado "Peruano Canadiense" — esquema inicial del portal
-- MariaDB 10.4+ / MySQL 8.0+ · InnoDB · utf8mb4_unicode_ci
--
-- Convención: nombres en español, snake_case. Todas las marcas de tiempo se
-- guardan en UTC (la conexión fija la sesión en +00:00) y se formatean a ISO
-- en el mapeador de cada módulo.
-- ============================================================================

-- ---------------------------------------------------------------- usuarios --
CREATE TABLE IF NOT EXISTS usuarios (
  id                     CHAR(36)     NOT NULL,
  nombre                 VARCHAR(150) NOT NULL,
  username               VARCHAR(80)  NOT NULL,
  email                  VARCHAR(191) NULL,
  password_hash          VARCHAR(255) NOT NULL,
  rol                    ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  activo                 TINYINT(1)   NOT NULL DEFAULT 1,
  -- Un token emitido antes de esta fecha deja de valer: cambiar la clave
  -- cierra las sesiones abiertas sin necesidad de lista negra.
  password_actualizada_en DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso          DATETIME     NULL,
  creado_en              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_username (username),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------- auditoría --
CREATE TABLE IF NOT EXISTS auditoria (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  CHAR(36)     NULL,
  accion      VARCHAR(40)  NOT NULL,   -- crear | actualizar | eliminar | publicar | restaurar | login
  entidad     VARCHAR(40)  NOT NULL,   -- contenido | documentos | noticias | personal | ...
  entidad_id  VARCHAR(191) NULL,
  datos       JSON         NULL,
  ip          VARCHAR(45)  NULL,
  creado_en   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_entidad (entidad, creado_en),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- semillas --
-- Copia inmutable del contenido oficial de origen (las constantes del Angular).
-- Es lo que devuelve "Restaurar original" del panel.
CREATE TABLE IF NOT EXISTS semillas (
  clave          VARCHAR(80) NOT NULL,   -- contenido:nosotros | documentos | noticias | ...
  data           JSON        NOT NULL,
  actualizado_en DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------- contenido por módulo --
CREATE TABLE IF NOT EXISTS contenido_modulos (
  modulo          VARCHAR(32) NOT NULL,  -- inicio|nosotros|admision|becas|costos|estadisticas|horarios|inversiones|licenciamiento
  data            JSON        NOT NULL,
  actualizado_por CHAR(36)    NULL,
  actualizado_en  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (modulo),
  CONSTRAINT fk_contenido_usuario FOREIGN KEY (actualizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contenido_versiones (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  modulo     VARCHAR(32) NOT NULL,
  data       JSON        NOT NULL,      -- el contenido ANTERIOR al guardado
  usuario_id CHAR(36)    NULL,
  creado_en  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_versiones_modulo (modulo, creado_en),
  CONSTRAINT fk_versiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- archivos --
CREATE TABLE IF NOT EXISTS archivos (
  id               CHAR(36)     NOT NULL,
  nombre_original  VARCHAR(255) NOT NULL,
  ruta_relativa    VARCHAR(255) NOT NULL,  -- 2026/09/<uuid>.pdf dentro de ALMACEN_DIR
  mime             VARCHAR(120) NOT NULL,
  bytes            BIGINT UNSIGNED NOT NULL,
  sha256           CHAR(64)     NULL,
  subido_por       CHAR(36)     NULL,
  publico          TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_archivos_sha (sha256),
  CONSTRAINT fk_archivos_usuario FOREIGN KEY (subido_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------- documentos --
-- PDFs, enlaces e imágenes de cada módulo del portal (rubros del PTI incluidos).
CREATE TABLE IF NOT EXISTS documentos (
  id             VARCHAR(64)  NOT NULL,  -- uuid o slug de semilla (seed-costos-tarifario)
  modulo         VARCHAR(32)  NOT NULL,
  seccion        VARCHAR(64)  NOT NULL,  -- pestaña del editor: hero, tarifario, norma...
  titulo         VARCHAR(255) NOT NULL,
  descripcion    TEXT         NULL,
  tipo           ENUM('pdf','enlace','imagen') NOT NULL,
  url            VARCHAR(1000) NOT NULL, -- los enlaces de SharePoint superan los 200 caracteres
  archivo_id     CHAR(36)     NULL,
  anio           VARCHAR(9)   NULL,
  orden          INT          NOT NULL DEFAULT 0,
  estado         ENUM('publicado','borrador') NOT NULL DEFAULT 'borrador',
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_documentos_ubicacion (modulo, seccion, estado, orden),
  CONSTRAINT fk_documentos_archivo FOREIGN KEY (archivo_id) REFERENCES archivos (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- noticias --
CREATE TABLE IF NOT EXISTS noticias (
  id             VARCHAR(160) NOT NULL,  -- slug
  titulo         VARCHAR(255) NOT NULL,
  categoria      ENUM('noticia','comunicado','evento') NOT NULL DEFAULT 'noticia',
  categoria_label VARCHAR(60) NOT NULL,
  extracto       TEXT         NULL,
  parrafos       JSON         NOT NULL,  -- string[]
  imagen         VARCHAR(1000) NULL,
  imagen_alt     VARCHAR(255) NULL,
  fecha          DATE         NOT NULL,  -- createdAt del contrato (YYYY-MM-DD)
  destacada      TINYINT(1)   NOT NULL DEFAULT 0,
  publicada      TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_noticias_orden (publicada, fecha, creado_en),
  KEY idx_noticias_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- personal --
CREATE TABLE IF NOT EXISTS personal (
  id             INT          NOT NULL AUTO_INCREMENT,  -- el contrato del front pide number
  tipo           ENUM('Autoridad','Administrativo','Docente') NOT NULL,
  nombres        VARCHAR(150) NOT NULL,
  apellidos      VARCHAR(150) NOT NULL,
  cargo          VARCHAR(200) NOT NULL,
  area           VARCHAR(150) NULL,
  grado          VARCHAR(150) NULL,
  email          VARCHAR(191) NULL,
  imagen         VARCHAR(1000) NULL,
  cv_url         VARCHAR(1000) NULL,
  orden          INT          NOT NULL DEFAULT 0,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_personal_orden (activo, tipo, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------- repositorio --
CREATE TABLE IF NOT EXISTS repositorio (
  id             VARCHAR(160) NOT NULL,  -- slug
  titulo         TEXT         NOT NULL,
  autores        JSON         NOT NULL,  -- string[]
  programa       VARCHAR(150) NOT NULL,
  anio           VARCHAR(9)   NOT NULL,
  tipo           VARCHAR(40)  NOT NULL DEFAULT 'Tesis',
  nivel          VARCHAR(150) NULL,
  resumen        TEXT         NULL,
  archivo_id     CHAR(36)     NULL,
  publicado      TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_repositorio_filtros (publicado, programa, anio),
  CONSTRAINT fk_repositorio_archivo FOREIGN KEY (archivo_id) REFERENCES archivos (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------- institución --
-- Fila única: ficha legal, sedes, contacto, redes y horarios. La edita /admin/contactos.
CREATE TABLE IF NOT EXISTS institucion (
  id              TINYINT   NOT NULL DEFAULT 1,
  data            JSON      NOT NULL,
  actualizado_por CHAR(36)  NULL,
  actualizado_en  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT ck_institucion_fila_unica CHECK (id = 1),
  CONSTRAINT fk_institucion_usuario FOREIGN KEY (actualizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------- programas --
CREATE TABLE IF NOT EXISTS programas (
  id                 VARCHAR(80)  NOT NULL,  -- slug: educacion-inicial
  titulo             VARCHAR(200) NOT NULL,
  nivel              ENUM('FID','Técnica','Formación Continua') NOT NULL,
  categoria          VARCHAR(150) NULL,
  duracion           VARCHAR(120) NULL,
  duracion_semestres INT          NULL,
  titulo_otorgado    VARCHAR(255) NULL,
  normativa          VARCHAR(150) NULL,
  vacantes           INT          NOT NULL DEFAULT 0,
  rango_edad         VARCHAR(150) NULL,
  turnos             JSON         NULL,      -- string[]
  descripcion        TEXT         NULL,
  perfil             TEXT         NULL,
  campo_laboral      JSON         NULL,      -- string[]
  imagen             VARCHAR(1000) NULL,
  destacado          TINYINT(1)   NOT NULL DEFAULT 0,
  orden              INT          NOT NULL DEFAULT 0,
  activo             TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_programas_orden (activo, nivel, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================ TRÁMITES =====================================

-- Mesa de partes virtual
CREATE TABLE IF NOT EXISTS tramites_mesa_partes (
  id             CHAR(36)     NOT NULL,
  codigo         VARCHAR(32)  NOT NULL,
  nombres        VARCHAR(200) NOT NULL,
  dni            VARCHAR(20)  NOT NULL,
  telefono       VARCHAR(20)  NULL,
  correo         VARCHAR(191) NOT NULL,
  condicion      ENUM('Estudiante','Docente','Administrativo','Egresado','Postulante','Externo') NOT NULL,
  tipo_doc       ENUM('Solicitud','FUT','Recurso de reconsideración','Apelación','Constancia','Certificado','Otro') NOT NULL,
  folios         INT          NOT NULL DEFAULT 1,
  asunto         VARCHAR(255) NOT NULL,
  mensaje        TEXT         NOT NULL,
  archivo_id     CHAR(36)     NULL,   -- adjunto real cuando el front envíe multipart
  nombre_archivo VARCHAR(255) NULL,   -- lo único que manda el front hoy
  link_documento VARCHAR(1000) NULL,
  estado         ENUM('pendiente','recibido','en_tramite','finalizado','rechazado') NOT NULL DEFAULT 'recibido',
  observacion    TEXT         NULL,
  ip             VARCHAR(45)  NULL,
  user_agent     VARCHAR(255) NULL,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mesa_codigo (codigo),
  KEY idx_mesa_estado (estado, creado_en),
  CONSTRAINT fk_mesa_archivo FOREIGN KEY (archivo_id) REFERENCES archivos (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Libro de reclamaciones
CREATE TABLE IF NOT EXISTS tramites_reclamaciones (
  id               CHAR(36)     NOT NULL,
  codigo           VARCHAR(32)  NOT NULL,
  tipo_documento   VARCHAR(40)  NOT NULL,
  numero_documento VARCHAR(20)  NOT NULL,
  nombres          VARCHAR(150) NOT NULL,
  apellidos        VARCHAR(150) NOT NULL,
  email            VARCHAR(191) NOT NULL,
  telefono         VARCHAR(20)  NULL,
  direccion        VARCHAR(255) NULL,
  tipo_bien        ENUM('Producto','Servicio') NOT NULL DEFAULT 'Servicio',
  descripcion_bien VARCHAR(255) NOT NULL DEFAULT '',
  tipo_reclamo     VARCHAR(80)  NOT NULL,
  detalle_reclamo  TEXT         NOT NULL,
  pedido           TEXT         NOT NULL,
  estado           ENUM('pendiente','en_proceso','resuelto') NOT NULL DEFAULT 'pendiente',
  respuesta        TEXT         NULL,
  respondido_en    DATETIME     NULL,
  ip               VARCHAR(45)  NULL,
  user_agent       VARCHAR(255) NULL,
  creado_en        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reclamo_codigo (codigo),
  KEY idx_reclamo_estado (estado, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Acceso a la información pública (Ley 27806)
CREATE TABLE IF NOT EXISTS tramites_acceso_informacion (
  id                     CHAR(36)     NOT NULL,
  codigo                 VARCHAR(32)  NOT NULL,
  nombres                VARCHAR(150) NOT NULL,
  apellidos              VARCHAR(150) NOT NULL,
  dni                    VARCHAR(20)  NOT NULL,
  email                  VARCHAR(191) NOT NULL,
  telefono               VARCHAR(20)  NULL,
  direccion              VARCHAR(255) NULL,
  informacion_solicitada TEXT         NOT NULL,
  motivo                 TEXT         NULL,
  estado                 ENUM('pendiente','en_proceso','atendida','denegada') NOT NULL DEFAULT 'pendiente',
  respuesta              TEXT         NULL,
  ip                     VARCHAR(45)  NULL,
  user_agent             VARCHAR(255) NULL,
  creado_en              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_acceso_codigo (codigo),
  KEY idx_acceso_estado (estado, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Citas del servicio psicopedagógico
CREATE TABLE IF NOT EXISTS citas_psicopedagogicas (
  id              CHAR(36)     NOT NULL,
  codigo          VARCHAR(32)  NOT NULL,
  nombres         VARCHAR(150) NOT NULL,
  apellidos       VARCHAR(150) NOT NULL,
  dni             VARCHAR(20)  NOT NULL,
  email           VARCHAR(191) NOT NULL,
  telefono        VARCHAR(20)  NULL,
  programa        VARCHAR(150) NULL,
  semestre        VARCHAR(40)  NULL,
  motivo          TEXT         NOT NULL,
  fecha_preferida DATE         NULL,
  estado          ENUM('pendiente','confirmada','atendida','cancelada') NOT NULL DEFAULT 'pendiente',
  notas           TEXT         NULL,
  ip              VARCHAR(45)  NULL,
  user_agent      VARCHAR(255) NULL,
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cita_codigo (codigo),
  KEY idx_cita_estado (estado, fecha_preferida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Solicitudes al servicio social
CREATE TABLE IF NOT EXISTS apoyo_social (
  id                    CHAR(36)     NOT NULL,
  codigo                VARCHAR(32)  NOT NULL,
  nombres               VARCHAR(150) NOT NULL,
  apellidos             VARCHAR(150) NOT NULL,
  dni                   VARCHAR(20)  NOT NULL,
  email                 VARCHAR(191) NOT NULL,
  telefono              VARCHAR(20)  NULL,
  programa              VARCHAR(150) NULL,
  semestre              VARCHAR(40)  NULL,
  tipo_apoyo            VARCHAR(120) NOT NULL,
  descripcion_situacion TEXT         NOT NULL,
  estado                ENUM('pendiente','en_evaluacion','atendida','cerrada') NOT NULL DEFAULT 'pendiente',
  notas                 TEXT         NULL,
  ip                    VARCHAR(45)  NULL,
  user_agent            VARCHAR(255) NULL,
  creado_en             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_apoyo_codigo (codigo),
  KEY idx_apoyo_estado (estado, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
