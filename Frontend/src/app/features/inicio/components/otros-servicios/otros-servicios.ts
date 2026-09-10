import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../../../core/directives/reveal';
import { ContenidoStore } from '../../../../core/store/contenido.store';

@Component({
  selector: 'app-inicio-otros-servicios',
  standalone: true,
  imports: [RouterLink, Reveal],
  templateUrl: './otros-servicios.html',
  styleUrl: './otros-servicios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtrosServicios {
  private readonly contenido = inject(ContenidoStore);
  readonly services = computed(() => this.contenido.inicio.value().services);
}
