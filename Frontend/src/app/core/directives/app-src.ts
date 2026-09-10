import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { ArchivosStore } from '../store/archivos.store';

@Directive({
  selector: 'img[appSrc]',
  standalone: true,
})
export class AppSrc {
  private readonly archivos = inject(ArchivosStore);
  private readonly el = inject(ElementRef<HTMLImageElement>);

  readonly appSrc = input('', { alias: 'appSrc' });

  constructor() {
    effect(() => {
      const raw = this.appSrc();
      if (!raw) {
        this.el.nativeElement.removeAttribute('src');
        return;
      }
      void this.archivos.resolver(raw).then((url) => {
        this.el.nativeElement.src = url || raw;
      });
    });
  }
}
