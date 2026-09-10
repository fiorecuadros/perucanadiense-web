import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { InstitutionService } from '../../../../core/services/institution.service';
import { FacultyMember } from '../../../../core/constants/faculty.constant';
import { AppSrc } from '../../../../core/directives/app-src';
import { BadgeComponent } from '../../../../shared/ui';

type FacultyFilter = 'Todos' | FacultyMember['type'];

@Component({
  selector: 'app-nosotros-directorio',
  standalone: true,
  imports: [BadgeComponent, AppSrc],
  templateUrl: './directorio.html',
  styleUrl: './directorio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Directorio {
  private readonly institution = inject(InstitutionService);

  readonly faculty = this.institution.faculty;
  readonly typeFilter = signal<FacultyFilter>('Todos');
  readonly areaFilter = signal<string>('Todas');
  readonly brokenPhotos = signal<ReadonlySet<number>>(new Set());

  readonly types: readonly FacultyFilter[] = ['Todos', 'Autoridad', 'Administrativo', 'Docente'];

  readonly areas = computed(() => {
    const unique = new Set(
      this.faculty()
        .map((member) => member.area)
        .filter((area): area is string => Boolean(area)),
    );
    return ['Todas', ...unique];
  });

  readonly visible = computed(() => {
    const type = this.typeFilter();
    const area = this.areaFilter();
    return this.faculty().filter((member) => {
      const typeOk = type === 'Todos' || member.type === type;
      const areaOk = area === 'Todas' || member.area === area;
      return typeOk && areaOk;
    });
  });

  initials(member: FacultyMember): string {
    return `${member.names.charAt(0)}${member.lastNames.charAt(0)}`.toUpperCase();
  }

  markBroken(id: number): void {
    const next = new Set(this.brokenPhotos());
    next.add(id);
    this.brokenPhotos.set(next);
  }

  hasPhoto(member: FacultyMember): boolean {
    return Boolean(member.image) && !this.brokenPhotos().has(member.id);
  }
}
