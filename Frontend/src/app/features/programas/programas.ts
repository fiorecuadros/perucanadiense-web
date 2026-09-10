import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import {
  PROGRAM_LEVEL_LABEL,
  programsByLevel,
  type Program,
  type ProgramLevel,
} from '../../core/constants/programs.constant';
import { AppSrc } from '../../core/directives/app-src';
import { htmlVacio } from '../../core/utils/html';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-programas',
  standalone: true,
  imports: [RouterLink, PageHero, ButtonDirective, AppSrc],
  templateUrl: './programas.html',
  styleUrl: './programas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Programas {
  private readonly institution = inject(InstitutionService);

  readonly info = this.institution.info;
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly etiquetaNivel = PROGRAM_LEVEL_LABEL;

  readonly level = signal<ProgramLevel>('FID');
  readonly selectedId = signal('');

  /** Solo niveles con al menos un programa: continua aparece sola cuando exista oferta. */
  readonly nivelesVisibles = this.institution.nivelesConOferta;

  readonly nivelActivo = computed<ProgramLevel>(() => {
    const vis = this.nivelesVisibles();
    const actual = this.level();
    return vis.includes(actual) ? actual : (vis[0] ?? 'FID');
  });

  readonly visiblePrograms = computed(() =>
    programsByLevel(this.institution.programs(), this.nivelActivo()),
  );

  readonly ficha = computed<Program[]>(() => {
    const list = this.visiblePrograms();
    const actual = list.find((item) => item.id === this.selectedId()) ?? list[0];
    return actual ? [actual] : [];
  });

  cuenta(nivel: ProgramLevel): number {
    return programsByLevel(this.institution.programs(), nivel).length;
  }

  selectLevel(nivel: ProgramLevel): void {
    this.level.set(nivel);
    this.selectedId.set(programsByLevel(this.institution.programs(), nivel)[0]?.id ?? '');
  }

  hayTexto(valor: string | undefined): boolean {
    return !htmlVacio(valor ?? '');
  }
}
