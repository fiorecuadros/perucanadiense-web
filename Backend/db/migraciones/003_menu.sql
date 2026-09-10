-- ============================================================================
-- Menú de navegación autogestionable
--
-- Hasta ahora los enlaces del header y del pie estaban escritos en el HTML del
-- Angular: añadir una página al menú exigía tocar código y volver a desplegar.
-- El resto del portal ya era autogestionable, así que el menú era la única
-- pieza que rompía esa promesa.
--
-- Una sola tabla con una columna `zona` en vez de una tabla por sitio: añadir
-- una zona nueva (un segundo pie, una barra superior) pasa a ser un dato y no
-- una migración.
--
--   principal          los enlaces del menú de cabecera
--   acciones           los botones destacados de la cabecera (Admisión, Transparencia)
--   pie-institucional  primera columna del pie
--   pie-servicios      segunda columna del pie
-- ============================================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id             VARCHAR(64)  NOT NULL,   -- slug estable: principal-nosotros
  zona           VARCHAR(32)  NOT NULL,
  etiqueta       VARCHAR(80)  NOT NULL,
  -- Ruta interna (/nosotros) o URL completa (https://…). Si empieza por http
  -- el portal la abre en una pestaña nueva; no hace falta marcarlo aparte.
  destino        VARCHAR(500) NOT NULL,
  -- Estilo del enlace cuando la zona lo admite. `acciones` usa 'admision' y
  -- 'transparencia' para conservar el color de cada botón.
  variante       VARCHAR(32)  NULL,
  orden          INT          NOT NULL DEFAULT 0,
  -- Ocultar en vez de borrar: quitar "Becas" fuera de campaña y reponerlo
  -- después no debería obligar a escribirlo de nuevo.
  visible        TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menu_zona (zona, visible, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
