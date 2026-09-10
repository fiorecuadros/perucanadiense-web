import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Función utilitaria estándar de shadcn / Spartan UI para combinar clases de Tailwind CSS
 * de forma dinámica resolviendo colisiones.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
