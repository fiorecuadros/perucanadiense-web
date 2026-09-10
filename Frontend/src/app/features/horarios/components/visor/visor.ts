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
import { HORARIOS_DOCS, type HorariosDoc } from '../../../../core/constants/horarios.constant';
import { ContenidoStore } from '../../../../core/store/contenido.store';
import { DocumentosStore } from '../../../../core/store/documentos.store';
import { ListaDocs } from '../../../../core/store/lista-docs';
import { AlertComponent, ButtonDirective } from '../../../../shared/ui';

@Component({
  selector: 'app-horarios-visor',
  standalone: true,
  imports: [RouterLink, AlertComponent, ButtonDirective, ListaDocs],
  templateUrl: './visor.html',
  styleUrls: ['../../../../shared/styles/viewer-shell.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Visor {
  private readonly institution = inject(InstitutionService);
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);

  readonly docs = HORARIOS_DOCS;
  readonly copy = this.contenido.horarios.value;
  readonly info = this.institution.info;
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly docsActivos = computed(() => this.documentos.deSeccion('horarios', this.activeId()));

  readonly activeId = signal(HORARIOS_DOCS[0].id);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly activeDoc = computed(
    () => this.docs.find((doc) => doc.id === this.activeId()) ?? this.docs[0],
  );

  readonly mailtoHref = computed(() => {
    const subject = encodeURIComponent(`Consulta de horarios — ${this.info().shortName}`);
    return `mailto:${this.info().contact.emailGeneral}?subject=${subject}`;
  });

  selectDoc(id: (typeof HORARIOS_DOCS)[number]['id'], event?: Event): void {
    this.activeId.set(id);
    const target = event?.currentTarget;
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
    queueMicrotask(() => this.panel()?.nativeElement.scrollTo({ top: 0 }));
  }

  openAfiche(doc: HorariosDoc): void {
    const publicado = this.docsActivos().find((d) => d.tipo === 'imagen') ?? this.docsActivos()[0];
    const href = publicado?.url ?? doc.src;
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }
}
