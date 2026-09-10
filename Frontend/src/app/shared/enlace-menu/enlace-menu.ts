import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { esDestinoExterno, type MenuItem } from '../../core/constants/navigation.constant';

/**
 * Un enlace del menú autogestionable.
 *
 * El host ES el `<a>` (selector de atributo), no un contenedor alrededor. Así
 * el enlace sigue siendo el hijo flex de `.nav-actions` y `.menu li`, y el CSS
 * de la cabecera y del pie (`.menu li a`, `.btn-admision`, `.footer-block a`)
 * lo alcanza: vive en la plantilla del padre, no detrás de un host extra.
 *
 * Un destino interno navega con el router (sin recargar); uno externo abre
 * otra pestaña. Como el destino lo escribe una persona en el panel, esa
 * decisión se toma en tiempo de ejecución.
 */
@Component({
  selector: 'a[app-enlace-menu]',
  standalone: true,
  template: `{{ item().etiqueta }}`,
  host: {
    '[attr.href]': 'item().destino',
    '[attr.target]': 'externo() ? "_blank" : null',
    '[attr.rel]': 'externo() ? "noopener noreferrer" : null',
    '[class]': 'clases()',
    '(click)': 'alPulsar($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnlaceMenu {
  private readonly router = inject(Router);

  readonly item = input.required<MenuItem>();
  /** Clase fija del enlace (los botones destacados la usan). */
  readonly clase = input('');
  /** Clase que se añade cuando la ruta está activa. */
  readonly claseActiva = input('');

  /** Para cerrar el menú móvil al pulsar. */
  readonly navegar = output<void>();

  readonly externo = computed(() => esDestinoExterno(this.item().destino));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly activo = computed(() => {
    this.url();
    if (this.externo() || !this.claseActiva()) return false;
    return this.router.isActive(this.item().destino, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  });

  readonly clases = computed(() =>
    [this.clase(), this.activo() ? this.claseActiva() : ''].filter(Boolean).join(' '),
  );

  alPulsar(event: MouseEvent): void {
    this.navegar.emit();
    if (this.externo()) return;
    // Ctrl/Cmd/Shift dejan el href nativo (nueva pestaña). El clic normal
    // lo interceptamos para no recargar el portal.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void this.router.navigateByUrl(this.item().destino);
  }
}
