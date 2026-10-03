import { AppSrc } from '../../../../core/directives/app-src';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../../../core/services/institution.service';
import { ESTADISTICAS_DOCS } from '../../../../core/constants/estadisticas.constant';
import { ContenidoStore } from '../../../../core/store/contenido.store';
import { DocumentosStore } from '../../../../core/store/documentos.store';
import { ListaDocs } from '../../../../core/store/lista-docs';
import { AlertComponent, BadgeComponent, ButtonDirective } from '../../../../shared/ui';

@Component({
  selector: 'app-estadisticas-visor',
  standalone: true,
  imports: [AppSrc, RouterLink, AlertComponent, BadgeComponent, ButtonDirective, ListaDocs],
  templateUrl: './visor.html',
  styleUrls: ['../../../../shared/styles/viewer-shell.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Visor {
  private readonly institution = inject(InstitutionService);
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);

  readonly docs = ESTADISTICAS_DOCS;
  readonly copy = this.contenido.estadisticas.value;
  readonly info = this.institution.info;
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly fidPrograms = this.institution.fidPrograms;
  readonly docsPti = computed(() => this.documentos.deSeccion('estadisticas', 'pti'));
  readonly docsResultados = computed(() => this.documentos.deSeccion('estadisticas', 'resultados'));

  readonly activeId = signal(ESTADISTICAS_DOCS[0].id);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly activeDoc = computed(
    () => this.docs.find((doc) => doc.id === this.activeId()) ?? this.docs[0],
  );

  readonly vacancyTotal = computed(() =>
    this.fidPrograms().reduce((sum, program) => sum + program.vacancies, 0),
  );

  readonly periodMetrics = computed(() => {
    const metrics = this.info().metrics2025;
    return [
      { id: 'teachers', label: 'Docentes profesionales', value: String(metrics.teachersCount) },
      { id: 'students', label: 'Estudiantes regulares', value: String(metrics.studentsCount) },
      { id: 'enrolled', label: 'Alumnos matriculados', value: String(metrics.enrolledCount) },
      {
        id: 'admitted',
        label: 'Ingresantes por convocatoria',
        value: String(metrics.admittedCount),
      },
      { id: 'years', label: 'Años de trayectoria', value: `+${this.info().yearsOfExperience}` },
      { id: 'campus', label: 'Campus (m²)', value: String(metrics.campusAreaM2) },
    ];
  });

  readonly mailtoHref = computed(() => {
    const subject = encodeURIComponent(`Consulta de estadísticas — ${this.info().shortName}`);
    return `mailto:${this.info().contact.emailGeneral}?subject=${subject}`;
  });

  selectDoc(id: (typeof ESTADISTICAS_DOCS)[number]['id'], event?: Event): void {
    this.activeId.set(id);
    const target = event?.currentTarget;
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
    queueMicrotask(() => this.panel()?.nativeElement.scrollTo({ top: 0 }));
  }
}
