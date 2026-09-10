import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RepositorioService } from '../../core/services/repositorio.service';
import type { TesisItem } from '../../core/constants/repositorio.constant';
import { DialogComponent } from '../../shared/ui';
import { EditorQuill } from '../shared/editor-quill/editor-quill';
import { ToastService } from '../shared/toast/toast';
import { excerpt } from '../../core/utils/html';

interface TesisForm {
  titulo: string;
  autores: string;
  programa: string;
  anio: string;
  nivel: string;
  resumen: string;
}

const VACIO: TesisForm = {
  titulo: '',
  autores: '',
  programa: '',
  anio: String(new Date().getFullYear()),
  nivel: '',
  resumen: '',
};

@Component({
  selector: 'app-admin-investigaciones',
  standalone: true,
  imports: [DialogComponent, EditorQuill],
  templateUrl: './investigaciones.component.html',
  styleUrl: './investigaciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInvestigacionesComponent {
  private readonly repositorio = inject(RepositorioService);
  private readonly toast = inject(ToastService);

  readonly items = this.repositorio.all;
  readonly formAbierto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly form = signal<TesisForm>({ ...VACIO });
  readonly confirmar = signal<TesisItem | null>(null);
  readonly subiendo = signal<string | null>(null);
  readonly filtroPrograma = signal('todos');

  readonly programas = this.repositorio.programas;

  readonly visibles = computed(() => {
    const programa = this.filtroPrograma();
    const lista = this.items();
    return programa === 'todos' ? lista : lista.filter((t) => t.programa === programa);
  });

  readonly conPdf = computed(() => this.items().filter((t) => t.pdfUrl).length);

  bajada(texto: string): string {
    return excerpt(texto, 140);
  }

  constructor() {
    void this.repositorio.hidratar();
  }

  abrirNueva(): void {
    this.editandoId.set(null);
    this.form.set({ ...VACIO });
    this.formAbierto.set(true);
  }

  abrirEditar(tesis: TesisItem): void {
    this.editandoId.set(tesis.id);
    this.form.set({
      titulo: tesis.titulo,
      autores: tesis.autores.join('\n'),
      programa: tesis.programa,
      anio: tesis.anio,
      nivel: tesis.nivel,
      resumen: tesis.resumen,
    });
    this.formAbierto.set(true);
  }

  patch<K extends keyof TesisForm>(clave: K, valor: TesisForm[K]): void {
    this.form.update((actual) => ({ ...actual, [clave]: valor }));
  }

  async guardar(): Promise<void> {
    const datos = this.form();
    const autores = datos.autores
      .split(/\n+/)
      .map((a) => a.trim())
      .filter(Boolean);

    if (!datos.titulo.trim() || autores.length === 0 || !datos.programa.trim()) {
      this.toast.error('Título, autores y programa son obligatorios.');
      return;
    }
    if (!/^\d{4}$/.test(datos.anio)) {
      this.toast.error('El año debe tener cuatro dígitos.');
      return;
    }

    const cuerpo = {
      titulo: datos.titulo.trim(),
      autores,
      programa: datos.programa.trim(),
      anio: datos.anio,
      tipo: 'Tesis' as const,
      nivel: datos.nivel.trim(),
      resumen: datos.resumen.trim(),
    };

    try {
      const id = this.editandoId();
      if (id) {
        await this.repositorio.actualizar({ id, ...cuerpo });
        this.toast.success('Investigación actualizada.');
      } else {
        await this.repositorio.crear(cuerpo);
        this.toast.success('Investigación publicada en /repositorio.');
      }
      this.formAbierto.set(false);
    } catch {
      this.toast.error('No se pudo guardar la investigación.');
    }
  }

  /**
   * El portal avisa hoy que el PDF de una tesis "no está archivado". Subirlo aquí
   * es lo que hace desaparecer ese aviso.
   */
  async subirPdf(tesis: TesisItem, evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.toast.error('El archivo debe ser un PDF.');
      input.value = '';
      return;
    }
    this.subiendo.set(tesis.id);
    try {
      await this.repositorio.subirArchivo(tesis.id, file);
      this.toast.success('PDF adjuntado a la investigación.');
    } catch {
      this.toast.error('No se pudo subir el PDF.');
    } finally {
      this.subiendo.set(null);
      input.value = '';
    }
  }

  async eliminar(): Promise<void> {
    const tesis = this.confirmar();
    if (!tesis) return;
    try {
      await this.repositorio.eliminar(tesis.id);
      this.confirmar.set(null);
      this.toast.success('Se quitó del repositorio público.');
    } catch {
      this.toast.error('No se pudo eliminar la investigación.');
    }
  }
}
