export type CampoTipo = 'texto' | 'area' | 'numero' | 'url' | 'lista' | 'filas';

export interface OpcionColumna {
  value: string;
  label: string;
}

export interface ColumnaFila {
  key: string;
  label: string;
  tipo: 'texto' | 'numero' | 'url' | 'opciones';
  opciones?: OpcionColumna[];
  /** Fuerza (o descarta) la vista previa de imagen. Si se omite, se infiere del `key`. */
  imagen?: boolean;
}

/** Columnas cuyo valor suele ser una imagen: se les muestra miniatura. */
const CLAVES_IMAGEN = /^(src|image|imagen|img|logo|foto|photo|cover|portada|thumbnail|miniatura)$/i;

export function esColumnaImagen(col: ColumnaFila): boolean {
  return col.imagen ?? (col.tipo === 'url' && CLAVES_IMAGEN.test(col.key));
}

export interface CampoSchema {
  key: string;
  label: string;
  tipo: CampoTipo;
  seccion: string;
  hint?: string;
  acepta?: 'imagen' | 'pdf';
  columnas?: ColumnaFila[];
  /** Agrupa campos de una misma sección bajo un subtítulo en `EditorEsquema`. */
  grupo?: string;
}

export const FILAS_PUNTAJE: ColumnaFila[] = [
  { key: 'label', label: 'Criterio', tipo: 'texto' },
  { key: 'score', label: 'Puntaje', tipo: 'numero' },
];
