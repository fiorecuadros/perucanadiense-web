import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { ArchivosStore } from '../../../core/store/archivos.store';

GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

@Component({
  selector: 'app-visor-pdf',
  standalone: true,
  imports: [PdfViewerModule],
  template: `
    @if (srcResuelto()) {
      @if (modo() === 'mini') {
        <div class="pdf-mini">
          <pdf-viewer
            [src]="srcResuelto()"
            [render-text]="true"
            [original-size]="false"
            [show-all]="false"
            [page]="1"
            [autoresize]="true"
            style="display:block;width:100%;height:280px"
          />
        </div>
        <button type="button" class="btn-ghost" style="margin-top:8px" (click)="completo.set(true)">
          Ver en pantalla completa
        </button>
      }
      @if (modo() === 'completo' || completo()) {
        <div class="pdf-full" role="dialog" aria-modal="true" aria-label="Visor PDF">
          <div class="pdf-full-bar">
            <button type="button" class="btn-cancel" (click)="completo.set(false)">Cerrar</button>
          </div>
          <div class="pdf-full-frame">
            <pdf-viewer
              [src]="srcResuelto()"
              [render-text]="true"
              [original-size]="false"
              [show-all]="true"
              [autoresize]="true"
              style="display:block;width:100%;height:100%"
            />
          </div>
        </div>
      }
    }
  `,
  styles: `
    .pdf-mini {
      height: 280px;
      border: 1px solid #e2e1ec;
      border-radius: 8px;
      overflow: hidden;
      background: #ecebf4;
    }
    .pdf-full {
      position: fixed;
      inset: 0;
      z-index: 70;
      background: rgba(43, 41, 61, 0.72);
      display: flex;
      flex-direction: column;
      padding: 16px;
    }
    .pdf-full-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
    }
    .pdf-full-frame {
      flex: 1;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisorPdf {
  private readonly archivos = inject(ArchivosStore);

  readonly src = input('');
  readonly modo = input<'mini' | 'completo'>('mini');
  readonly srcResuelto = signal('');
  readonly completo = signal(false);

  constructor() {
    effect(() => {
      const src = this.src();
      void this.archivos.resolver(src).then((url) => this.srcResuelto.set(url));
    });
  }
}
