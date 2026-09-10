-- ============================================================================
-- Adjuntos de trámite reservados
--
-- La columna `archivos.publico` existía desde el esquema inicial pero se
-- escribía siempre en 1 y no se leía nunca: `GET /api/archivos/:id` servía
-- cualquier binario sin sesión. El adjunto que un ciudadano sube por mesa de
-- partes lleva su DNI y el asunto de su trámite, así que no puede quedar
-- descargable por cualquiera que tenga la URL.
--
-- Desde ahora el alta de un trámite guarda su adjunto con publico = 0 y la
-- descarga exige sesión para esos. Esta migración corrige los que ya estaban
-- almacenados antes del cambio.
-- ============================================================================

UPDATE archivos
   SET publico = 0
 WHERE id IN (SELECT archivo_id FROM tramites_mesa_partes WHERE archivo_id IS NOT NULL);

-- El índice por hash ahora se consulta junto con la visibilidad: la
-- deduplicación no debe cruzar la frontera entre un documento del portal y el
-- adjunto reservado de un trámite.
CREATE INDEX idx_archivos_sha_publico ON archivos (sha256, publico);
