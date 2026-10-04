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
import { LICENCIAMIENTO_DOCS } from '../../../../core/constants/licenciamiento.constant';
import { ContenidoStore } from '../../../../core/store/contenido.store';
import { DocumentosStore } from '../../../../core/store/documentos.store';
import { ListaDocs } from '../../../../core/store/lista-docs';
import { AlertComponent, BadgeComponent, ButtonDirective } from '../../../../shared/ui';

@Component({
  selector: 'app-licenciamiento-visor',
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

  readonly docs = LICENCIAMIENTO_DOCS;
  readonly copy = this.contenido.licenciamiento.value;
  readonly info = this.institution.info;
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly fidPrograms = this.institution.fidPrograms;
  readonly docsNorma = computed(() => this.documentos.deSeccion('licenciamiento', 'norma'));

  readonly activeId = signal(LICENCIAMIENTO_DOCS[0].id);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly activeDoc = computed(
    () => this.docs.find((doc) => doc.id === this.activeId()) ?? this.docs[0],
  );

  readonly identityItems = computed(() => {
    const info = this.info();
    const copy = this.copy();
    return [
      { id: 'category', label: 'Categoría legal', value: info.legalCategory },
      { id: 'type', label: 'Naturaleza', value: info.type },
      { id: 'creation', label: 'Creación', value: `${info.legalDecree} · ${info.foundationDate}` },
      { id: 'recognition', label: 'Reconocimiento DREL', value: copy.recognitionNorm },
      { id: 'norm', label: 'Disposiciones de licenciamiento', value: info.licensingNorm },
      { id: 'rector', label: 'Rector', value: info.governingBody },
      { id: 'drel', label: 'Oficina regional', value: info.regionalOffice },
      { id: 'ruc', label: 'RUC', value: info.ruc },
      { id: 'modular', label: 'Código modular', value: info.modularCode },
    ];
  });

  readonly mailtoHref = computed(() => {
    const subject = encodeURIComponent(`Consulta de licenciamiento — ${this.info().shortName}`);
    return `mailto:${this.info().contact.emailGeneral}?subject=${subject}`;
  });

  selectDoc(id: (typeof LICENCIAMIENTO_DOCS)[number]['id'], event?: Event): void {
    this.activeId.set(id);
    const target = event?.currentTarget;
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
    queueMicrotask(() => this.panel()?.nativeElement.scrollTo({ top: 0 }));
  }
}
