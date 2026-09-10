import { computed, signal, type Signal, type WritableSignal } from '@angular/core';

export interface PersistedStore<T> {
  readonly value: Signal<T>;
  readonly modificado: Signal<boolean>;
  set(next: T): void;
  reset(): void;
}

function leer(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function escribir(key: string, raw: string): void {
  try {
    localStorage.setItem(key, raw);
  } catch {
    // Modo privado o cuota llena: el estado vive en memoria.
  }
}

function borrar(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function persisted<T>(
  key: string,
  seed: T,
  preparar?: (raw: unknown) => T,
): PersistedStore<T> {
  const semilla = JSON.stringify(seed);

  const cargar = (): T => {
    const raw = leer(key);
    if (!raw) return structuredClone(seed);
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed === null || typeof parsed !== 'object') return structuredClone(seed);
      if (preparar) return preparar(parsed);
      if (Array.isArray(seed)) return parsed as T;
      return { ...structuredClone(seed), ...(parsed as object) } as T;
    } catch {
      return structuredClone(seed);
    }
  };

  const value: WritableSignal<T> = signal(cargar());
  const modificado = computed(() => JSON.stringify(value()) !== semilla);

  return {
    value: value.asReadonly(),
    modificado,
    set(next: T): void {
      const cloned = structuredClone(preparar ? preparar(next) : next);
      value.set(cloned);
      escribir(key, JSON.stringify(cloned));
    },
    reset(): void {
      value.set(structuredClone(seed));
      borrar(key);
    },
  };
}

export function persistidoModificado(key: string, seed: unknown): boolean {
  const raw = leer(key);
  if (!raw) return false;
  try {
    return raw !== JSON.stringify(seed);
  } catch {
    return false;
  }
}
