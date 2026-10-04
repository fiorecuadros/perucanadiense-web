import { AppSrc } from '../../core/directives/app-src';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { AlertComponent, ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-procedimientos',
  standalone: true,
  imports: [AppSrc, RouterLink, PageHero, AlertComponent, ButtonDirective],
  templateUrl: './procedimientos.html',
  styleUrls: ['../../shared/styles/viewer-shell.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Procedimientos {
  private readonly institution = inject(InstitutionService);

  readonly info = this.institution.info;
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly copy = inject(ContenidoStore).procedimientos.value;
  readonly costos = inject(ContenidoStore).costos.value;
  readonly docs = computed(() => this.copy().tramites);
  readonly activeId = signal(this.copy().tramites[0]?.id ?? 'tupa');

  readonly activeDoc = computed(
    () => this.docs().find((doc) => doc.id === this.activeId()) ?? this.docs()[0],
  );

  formatFee(amount: number): string {
    return `S/ ${amount}`;
  }
}
