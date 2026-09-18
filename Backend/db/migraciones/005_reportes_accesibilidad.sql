CREATE TABLE IF NOT EXISTS reportes_accesibilidad (
  id CHAR(36) NOT NULL,
  codigo VARCHAR(32) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  telefono VARCHAR(20) NULL,
  tipo_asistencia ENUM('accessibility','general','bug') NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('pendiente','en_proceso','resuelto') NOT NULL DEFAULT 'pendiente',
  respuesta TEXT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_accesibilidad_codigo (codigo),
  KEY idx_accesibilidad_estado (estado, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;