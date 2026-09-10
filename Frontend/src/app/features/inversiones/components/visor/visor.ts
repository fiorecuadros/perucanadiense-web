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
import { INVERSIONES_DOCS } from '../../../../core/constants/inversiones.constant';
import { ContenidoStore } from '../../../../core/store/contenido.store';
import { DocumentosStore } from '../../../../core/store/documentos.store';
import { ListaDocs } from '../../../../core/store/lista-docs';
import { AlertComponent, BadgeComponent, ButtonDirective } from '../../../../shared/ui';

@Component({
  selector: 'app-inversiones-visor',
  standalone: true,
  imports: [RouterLink, AlertComponent, BadgeComponent, ButtonDirective, ListaDocs],
  templateUrl: './visor.html',
  styleUrls: ['../../../../shared/styles/viewer-shell.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Visor {
  private readonly institution = inject(InstitutionService);
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);

  readonly docs = INVERSIONES_DOCS;
  readonly copy = this.contenido.inversiones.value;
  readonly info = this.institution.info;
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly docsInforme = computed(() => this.documentos.deSeccion('inversiones', 'informe'));

  readonly activeId = signal(INVERSIONES_DOCS[0].id);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly activeDoc = computed(
    () => this.docs.find((doc) => doc.id === this.activeId()) ?? this.docs[0],
  );

  readonly mailtoHref = computed(() => {
    const subject = encodeURIComponent(`Consulta de inversiones — ${this.info().shortName}`);
    return `mailto:${this.info().contact.emailGeneral}?subject=${subject}`;
  });

  selectDoc(id: (typeof INVERSIONES_DOCS)[number]['id'], event?: Event): void {
    this.activeId.set(id);
    const target = event?.currentTarget;
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
    queueMicrotask(() => this.panel()?.nativeElement.scrollTo({ top: 0 }));
  }
}
