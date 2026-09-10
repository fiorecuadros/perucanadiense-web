import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../../core/api/portal.api';
import { InstitutionService } from '../../core/services/institution.service';
import {
  ACADEMIC_PROGRAMS,
  PROGRAM_LEVELS,
  type Program,
} from '../../core/constants/programs.constant';
import { DialogComponent } from '../../shared/ui';
import { CampoLista } from '../shared/campo-lista/campo-lista';
import { SelectorArchivo } from '../shared/selector-archivo/selector-archivo';
import { EditorQuill } from '../shared/editor-quill/editor-quill';
import { SeccionBloque } from '../shared/seccion-bloque/seccion-bloque';
import { ToastService } from '../shared/toast/toast';

type Nivel = Program['level'];

interface ProgramaForm {
  title: string;
  level: Nivel;
  category: string;
  duration: string;
  durationSemesters: number | '';
  degreeAwarded: string;
  normative: string;
  vacancies: number;
  ageRange: string;
  shifts: string[];
  description: string;
  profile: string;
  fieldOfWork: string[];
  image: string;
  featured: boolean;
}

const VACIO: ProgramaForm = {
  title: '',
  level: 'FID',
  category: '',
  duration: '',
  durationSemesters: '',
  degreeAwarded: '',
  normative: '',
  vacancies: 0,
  ageRange: '',
  shifts: [],
  description: '',
  profile: '',
  fieldOfWork: [],
  image: '',
  featured: false,
};

@Component({
  selector: 'app-admin-programas',
  standalone: true,
  imports: [DialogComponent, CampoLista, SelectorArchivo, EditorQuill, SeccionBloque],
  templateUrl: './programas.html',
  styles: `
    .form-secciones {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProgramas {
  private readonly api = inject(PortalApi);
  private readonly institucion = inject(InstitutionService);
  private readonly toast = inject(ToastService);

  readonly remoto = environment.useRemoteApi;
  readonly niveles = PROGRAM_LEVELS;
  readonly items = signal<Program[]>([...ACADEMIC_PROGRAMS]);
  readonly filtro = signal<'todos' | Nivel>('todos');
  readonly formAbierto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly form = signal<ProgramaForm>({ ...VACIO });
  readonly confirmar = signal<Program | null>(null);
  readonly cargando = signal(false);

  readonly visibles = computed(() => {
    const nivel = this.filtro();
    const lista = this.items();
    return nivel === 'todos' ? lista : lista.filter((p) => p.level === nivel);
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    if (!this.remoto) {
      this.items.set([...this.institucion.programs()]);
      return;
    }
    this.cargando.set(true);
    try {
      const lista = await this.api.programas();
      this.items.set(lista);
      this.institucion.aplicarProgramas(lista);
    } catch {
      this.toast.error('No se pudo cargar la oferta.');
    } finally {
      this.cargando.set(false);
    }
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.set({ ...VACIO, shifts: [], fieldOfWork: [] });
    this.formAbierto.set(true);
  }

  abrirEditar(item: Program): void {
    this.editandoId.set(item.id);
    this.form.set({
      title: item.title,
      level: item.level,
      category: item.category,
      duration: item.duration,
      durationSemesters: item.durationSemesters ?? '',
      degreeAwarded: item.degreeAwarded,
      normative: item.normative,
      vacancies: item.vacancies,
      ageRange: item.ageRange ?? '',
      shifts: [...item.shifts],
      description: item.description,
      profile: item.profile,
      fieldOfWork: [...item.fieldOfWork],
      image: item.image,
      featured: item.featured,
    });
    this.formAbierto.set(true);
  }

  patch<K extends keyof ProgramaForm>(clave: K, valor: ProgramaForm[K]): void {
    this.form.update((actual) => ({ ...actual, [clave]: valor }));
  }

  toNumero(event: Event): number {
    const n = Number((event.target as HTMLInputElement).value);
    return Number.isFinite(n) ? n : 0;
  }

  async guardar(): Promise<void> {
    const datos = this.form();
    if (!datos.title.trim()) {
      this.toast.error('Escriba el título del programa.');
      return;
    }
    if (datos.level !== 'Formación Continua' && !datos.normative.trim()) {
      this.toast.error('En FID y carreras técnicas hace falta la normativa RVM que autoriza la carrera.');
      return;
    }
    const cuerpo: Omit<Program, 'id'> = {
      title: datos.title.trim(),
      level: datos.level,
      category: datos.category.trim(),
      duration: datos.duration.trim(),
      durationSemesters:
        datos.durationSemesters === '' ? undefined : Number(datos.durationSemesters),
      degreeAwarded: datos.degreeAwarded.trim(),
      normative: datos.normative.trim(),
      vacancies: datos.vacancies,
      ageRange: datos.ageRange.trim() || undefined,
      shifts: datos.shifts.map((s) => s.trim()).filter(Boolean),
      description: datos.description.trim(),
      profile: datos.profile.trim(),
      fieldOfWork: datos.fieldOfWork.map((s) => s.trim()).filter(Boolean),
      image: datos.image.trim(),
      featured: datos.featured,
    };
    try {
      const id = this.editandoId();
      if (id) {
        await this.api.actualizarPrograma({ id, ...cuerpo });
        this.toast.success('Programa actualizado. Ya se ve en /programas.');
      } else {
        await this.api.crearPrograma(cuerpo);
        this.toast.success('Programa publicado en /programas.');
      }
      this.formAbierto.set(false);
      await this.cargar();
    } catch {
      this.toast.error('No se pudo guardar el programa.');
    }
  }

  async eliminar(): Promise<void> {
    const item = this.confirmar();
    if (!item) return;
    try {
      await this.api.eliminarPrograma(item.id);
      this.confirmar.set(null);
      this.toast.success('Se quitó de la oferta pública.');
      await this.cargar();
    } catch {
      this.toast.error('No se pudo eliminar el programa.');
    }
  }
}
