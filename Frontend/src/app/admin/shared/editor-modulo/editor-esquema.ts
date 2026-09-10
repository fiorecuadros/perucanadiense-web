import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CampoSchema } from '../editor-contenido/schema';
import { CampoImagen } from '../campo-imagen/campo-imagen';
import { CampoRico } from '../campo-rico/campo-rico';
import { CampoTexto } from '../campo-texto/campo-texto';
import { SeccionBloque } from '../seccion-bloque/seccion-bloque';
import type { EditorEsquemaHost, GrupoImagen } from './editor-modulo-base';

interface CampoTextoRender {
  clase: 'texto' | 'rico' | 'url';
  key: string;
  label: string;
  hint?: string;
}

interface GrupoRender {
  nombre: string;
  textos: CampoTextoRender[];
  imagenes: GrupoImagen[];
}

/**
 * Dibuja los campos de una sección de un `CampoSchema[]` con los widgets
 * amigables: texto plano, texto con formato y campo de imagen (con vista previa,
 * sin exponer la ruta). Los pares `x.src` + `x.alt` se agrupan en un solo
 * `app-campo-imagen`. Con `campo.grupo` los campos se reparten en varios
 * bloques con subtítulo. Toda la lectura/escritura pasa por `host`.
 */
@Component({
  selector: 'app-editor-esquema',
  standalone: true,
  imports: [CampoImagen, CampoRico, CampoTexto, SeccionBloque],
  template: `
    @for (grupo of grupos(); track grupo.nombre) {
      <app-seccion-bloque [titulo]="grupo.nombre || titulo()">
        @if (grupo.textos.length) {
          <div class="tarjeta">
            @for (campo of grupo.textos; track campo.key) {
              @switch (campo.clase) {
                @case ('rico') {
                  <app-campo-rico
                    [label]="campo.label"
                    [hint]="campo.hint ?? ''"
                    [valor]="host().leerCampo(campo.key)"
                    (valorChange)="host().escribirCampo(campo.key, $event)"
                  />
                }
                @case ('url') {
                  <app-campo-texto
                    tipo="url"
                    [label]="campo.label"
                    [hint]="campo.hint ?? 'Se usa como respaldo si no se sube un documento aquí.'"
                    placeholder="Pegue aquí el enlace"
                    [valor]="host().leerCampo(campo.key)"
                    (valorChange)="host().escribirCampo(campo.key, $event)"
                  />
                }
                @default {
                  <app-campo-texto
                    [label]="campo.label"
                    [hint]="campo.hint ?? ''"
                    [valor]="host().leerCampo(campo.key)"
                    (valorChange)="host().escribirCampo(campo.key, $event)"
                  />
                }
              }
            }
          </div>
        }
      </app-seccion-bloque>

      @for (img of grupo.imagenes; track img.srcKey) {
        <app-seccion-bloque
          [titulo]="img.label"
          sub="Imagen que se muestra en esta sección de la web."
        >
          <app-campo-imagen
            [referencia]="host().leerCampo(img.srcKey)"
            [alt]="host().leerCampo(img.altKey)"
            etiquetaAlt="Descripción de la imagen (accesibilidad)"
            (referenciaChange)="host().escribirCampo(img.srcKey, $event)"
            (altChange)="host().escribirCampo(img.altKey, $event)"
            (pedirQuitar)="host().quitarImagen(img)"
          />
        </app-seccion-bloque>
      }
    } @empty {
      <app-seccion-bloque [titulo]="titulo()">
        <p class="nota">Esta pestaña no tiene textos que editar. Use los documentos de abajo.</p>
      </app-seccion-bloque>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .tarjeta {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 18px;
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      background: var(--adm-surface);
    }

    .nota {
      margin: 0;
      padding: 16px 18px;
      border: 1px dashed var(--adm-line);
      border-radius: 12px;
      background: var(--adm-bg);
      color: var(--adm-ink-soft);
      font-size: 0.85rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorEsquema {
  readonly host = input.required<EditorEsquemaHost>();
  readonly titulo = input.required<string>();
  /** Campos del esquema ya filtrados a la sección activa. */
  readonly schema = input.required<CampoSchema[]>();

  readonly grupos = computed(() => this.preparar(this.schema()));

  private preparar(schema: CampoSchema[]): GrupoRender[] {
    const grupos: GrupoRender[] = [];
    const porNombre = new Map<string, GrupoRender>();
    const consumidas = new Set<string>();

    const grupoDe = (nombre: string): GrupoRender => {
      let g = porNombre.get(nombre);
      if (!g) {
        g = { nombre, textos: [], imagenes: [] };
        porNombre.set(nombre, g);
        grupos.push(g);
      }
      return g;
    };

    for (const campo of schema) {
      if (consumidas.has(campo.key)) continue;
      const grupo = grupoDe(campo.grupo ?? '');

      if (campo.tipo === 'url' && campo.acepta === 'imagen' && campo.key.endsWith('.src')) {
        const base = campo.key.slice(0, -'.src'.length);
        const altKey = `${base}.alt`;
        if (schema.some((c) => c.key === altKey)) consumidas.add(altKey);
        grupo.imagenes.push({ srcKey: campo.key, altKey, label: campo.label });
        continue;
      }

      const clase = campo.tipo === 'area' ? 'rico' : campo.tipo === 'url' ? 'url' : 'texto';
      grupo.textos.push({ clase, key: campo.key, label: campo.label, hint: campo.hint });
    }

    return grupos;
  }
}
