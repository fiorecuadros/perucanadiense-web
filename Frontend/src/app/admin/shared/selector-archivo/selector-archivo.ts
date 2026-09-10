import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ArchivosStore } from '../../../core/store/archivos.store';
import { ToastService } from '../toast/toast';

const IMAGENES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const PDF = ['application/pdf'];
const MAX_IMG = 5 * 1024 * 1024;
const MAX_PDF = 15 * 1024 * 1024;

export type SelectorModo = 'imagen' | 'pdf' | 'ambos';

@Component({
  selector: 'app-selector-archivo',
  standalone: true,
  template: `
    @if (variante() === 'boton') {
      <button type="button" class="selector-boton" [disabled]="subiendo()" (click)="input.click()">
        <i
          class="fa"
          [class.fa-arrows-rotate]="!subiendo()"
          [class.fa-spinner]="subiendo()"
          [class.fa-spin]="subiendo()"
          aria-hidden="true"
        ></i>
        {{ subiendo() ? 'Subiendo…' : textoBoton() }}
      </button>
      <input #input type="file" hidden [accept]="accept()" (change)="onFile($event)" />
    } @else {
      <div
        class="dropzone"
        [class.over]="over()"
        role="button"
        tabindex="0"
        [attr.aria-label]="etiqueta()"
        (click)="input.click()"
        (keydown.enter)="input.click()"
        (dragover)="onOver($event)"
        (dragleave)="over.set(false)"
        (drop)="onDrop($event)"
      >
        <i class="fa fa-cloud-arrow-up" aria-hidden="true"></i>
        <p>{{ etiqueta() }}</p>
        <p class="form-hint">{{ pista() }}</p>
        <input #input type="file" hidden [accept]="accept()" (change)="onFile($event)" />
      </div>
      @if (subiendo()) {
        <p class="form-hint">Guardando archivo…</p>
      }
      @if (nombre()) {
        <p class="form-hint">{{ nombre() }}</p>
      }
    }
  `,
  styles: `
    .selector-boton {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 34px;
      padding: 6px 13px;
      border: 1px solid var(--adm-line);
      border-radius: 8px;
      background: var(--adm-surface);
      color: var(--adm-ink);
      font: inherit;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition:
        background 0.15s ease,
        border-color 0.15s ease;
    }

    .selector-boton:hover:not(:disabled) {
      background: var(--adm-bg);
      border-color: color-mix(in srgb, var(--adm-ink) 22%, var(--adm-line));
    }

    .selector-boton:disabled {
      opacity: 0.6;
      cursor: progress;
    }

    .selector-boton:focus-visible {
      outline: 2px solid var(--adm-brand);
      outline-offset: 2px;
    }

    .selector-boton i {
      font-size: 0.72rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorArchivo {
  private readonly archivos = inject(ArchivosStore);
  private readonly toast = inject(ToastService);

  readonly modo = input<SelectorModo>('ambos');
  readonly variante = input<'zona' | 'boton'>('zona');
  readonly textoBoton = input('Cambiar imagen');
  readonly referencia = input('');
  readonly referenciaChange = output<string>();

  readonly over = signal(false);
  readonly subiendo = signal(false);
  readonly nombre = signal('');

  etiqueta(): string {
    const modo = this.modo();
    if (modo === 'imagen') return 'Arrastre una imagen o haga clic para elegirla';
    if (modo === 'pdf') return 'Arrastre un PDF o haga clic para elegirlo';
    return 'Arrastre un archivo o haga clic para elegirlo';
  }

  pista(): string {
    const modo = this.modo();
    if (modo === 'imagen') return 'JPEG, PNG, GIF o WebP · máximo 5 MB';
    if (modo === 'pdf') return 'PDF · máximo 15 MB';
    return 'Imagen (5 MB) o PDF (15 MB)';
  }

  accept(): string {
    const modo = this.modo();
    if (modo === 'imagen') return 'image/jpeg,image/png,image/gif,image/webp';
    if (modo === 'pdf') return 'application/pdf';
    return 'image/jpeg,image/png,image/gif,image/webp,application/pdf';
  }

  onOver(event: DragEvent): void {
    event.preventDefault();
    this.over.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.over.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) void this.subir(file);
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) void this.subir(input.files[0]);
    input.value = '';
  }

  private async subir(file: File): Promise<void> {
    const esPdf = PDF.includes(file.type);
    const esImg = IMAGENES.includes(file.type);
    const modo = this.modo();

    if (modo === 'imagen' && !esImg) {
      this.toast.error('Solo se permiten imágenes JPEG, PNG, GIF o WebP.');
      return;
    }
    if (modo === 'pdf' && !esPdf) {
      this.toast.error('Solo se permiten archivos PDF.');
      return;
    }
    if (modo === 'ambos' && !esImg && !esPdf) {
      this.toast.error('El archivo debe ser una imagen o un PDF.');
      return;
    }
    if (esImg && file.size > MAX_IMG) {
      this.toast.error('La imagen no puede superar 5 MB.');
      return;
    }
    if (esPdf && file.size > MAX_PDF) {
      this.toast.error('El PDF no puede superar 15 MB.');
      return;
    }

    this.subiendo.set(true);
    this.nombre.set(file.name);
    try {
      const ref = await this.archivos.guardar(file);
      this.referenciaChange.emit(ref);
    } catch {
      this.toast.error('No se pudo guardar el archivo en este navegador.');
    } finally {
      this.subiendo.set(false);
    }
  }
}
