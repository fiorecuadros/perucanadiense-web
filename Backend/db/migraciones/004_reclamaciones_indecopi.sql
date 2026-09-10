-- ============================================================================
-- Libro de reclamaciones: hoja INDECOPI y expediente cerrado
--
-- La hoja del Código de Protección al Consumidor (Ley 29571) pide, además del
-- reclamo o la queja, el tipo de bien (producto / servicio) y su descripción.
-- Esas columnas no salen de las semillas de contenido: son datos del trámite,
-- no copy del portal. Las filas ya registradas quedan como Servicio y sin
-- descripción; las nuevas las exige el alta.
--
-- Mesa de partes gana el estado `rechazado`: un documento cerrado (finalizado
-- o rechazado) no se reabre. Al rechazar, el panel exige el motivo por escrito.
-- ============================================================================

ALTER TABLE tramites_reclamaciones
  ADD COLUMN IF NOT EXISTS tipo_bien ENUM('Producto','Servicio') NOT NULL DEFAULT 'Servicio' AFTER direccion,
  ADD COLUMN IF NOT EXISTS descripcion_bien VARCHAR(255) NOT NULL DEFAULT '' AFTER tipo_bien;

ALTER TABLE tramites_mesa_partes
  MODIFY COLUMN estado ENUM('pendiente','recibido','en_tramite','finalizado','rechazado')
    NOT NULL DEFAULT 'recibido';
