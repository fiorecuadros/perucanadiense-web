import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalApi } from '../../core/api/portal.api';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accesibility.html',
  styleUrls: ['./accesibility.scss']
})
export class AccessibilityComponent {
  private readonly api = inject(PortalApi);

  enviandoReporte = false;
  isOpen = false;
  activeTab: 'report' | 'tools' = 'tools';

  // Formulario de reporte
  reportForm = {
    name: '',
    email: '',
    phone: '',
    assistanceType: '',
    description: ''
  };

  // Herramientas de personalización (estilo AudioEye)
  accessibilityTools = {
    focus: false,
    largeCursor: false,
    highlightLinks: false,
    highContrast: false,
    colorShift: false, // Desactivado temporalmente - afecta layout
    stopAnimation: false,
    textSize: 'normal',
    spacing: 'normal',
    dyslexicFont: false,
    readingGuide: false,
    windowMask: false,
    hideImages: false,
    highlightHeadings: false,
    invertColors: false // Desactivado temporalmente - afecta layout
  };

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  closePanel() {
    this.isOpen = false;
  }

  toggleTool(tool: string) {
    (this.accessibilityTools as any)[tool] = !(this.accessibilityTools as any)[tool];
    this.applyTools();
  }

  toggleTextSize() {
    if (this.accessibilityTools.textSize === 'normal') {
      this.accessibilityTools.textSize = 'large';
    } else if (this.accessibilityTools.textSize === 'large') {
      this.accessibilityTools.textSize = 'extra-large';
    } else {
      this.accessibilityTools.textSize = 'normal';
    }
    this.applyTools();
  }

  toggleSpacing() {
    this.accessibilityTools.spacing = this.accessibilityTools.spacing === 'normal' ? 'increased' : 'normal';
    this.applyTools();
  }

  applyTools() {
    const body = document.body;

    const clases = [
      'ae-focus',
      'ae-large-cursor',
      'ae-highlight-links',
      'ae-high-contrast',
      'ae-color-shift',
      'ae-stop-animation',
      'ae-text-large',
      'ae-spacing-increased',
      'ae-dyslexic-font',
      'ae-reading-guide',
      'ae-window-mask',
      'ae-hide-images',
      'ae-highlight-headings',
      'ae-invert-colors'
    ];

    // Limpiar solamente clases controladas por accesibilidad
    body.classList.remove(...clases);

    // Eliminar estilos dinámicos antiguos de versiones anteriores
    document.getElementById('ae-focus-styles')?.remove();
    document.getElementById('ae-reading-guide')?.remove();
    document.getElementById('ae-window-mask')?.remove();

    // Aplicar las herramientas mediante clases CSS
    body.classList.toggle('ae-focus', this.accessibilityTools.focus);
    body.classList.toggle('ae-large-cursor', this.accessibilityTools.largeCursor);
    body.classList.toggle('ae-highlight-links', this.accessibilityTools.highlightLinks);
    body.classList.toggle('ae-high-contrast', this.accessibilityTools.highContrast);
    body.classList.toggle('ae-color-shift', this.accessibilityTools.colorShift);
    body.classList.toggle('ae-stop-animation', this.accessibilityTools.stopAnimation);
    body.classList.toggle(
      'ae-text-large',
      this.accessibilityTools.textSize === 'large' ||
      this.accessibilityTools.textSize === 'extra-large'
    );
    body.classList.toggle(
      'ae-spacing-increased',
      this.accessibilityTools.spacing === 'increased'
    );
    body.classList.toggle('ae-dyslexic-font', this.accessibilityTools.dyslexicFont);
    body.classList.toggle('ae-reading-guide', this.accessibilityTools.readingGuide);
    body.classList.toggle('ae-window-mask', this.accessibilityTools.windowMask);
    body.classList.toggle('ae-hide-images', this.accessibilityTools.hideImages);
    body.classList.toggle(
      'ae-highlight-headings',
      this.accessibilityTools.highlightHeadings
    );
    body.classList.toggle('ae-invert-colors', this.accessibilityTools.invertColors);

    // Tamaño extra grande sin recorrer todos los elementos
    if (this.accessibilityTools.textSize === 'extra-large') {
      body.style.setProperty('--ae-font-scale', '1.6');
    } else if (this.accessibilityTools.textSize === 'large') {
      body.style.setProperty('--ae-font-scale', '1.3');
    } else {
      body.style.removeProperty('--ae-font-scale');
    }

    localStorage.setItem(
      'accessibilityTools',
      JSON.stringify(this.accessibilityTools)
    );
  }
  resetTools() {
    this.accessibilityTools = {
      focus: false,
      largeCursor: false,
      highlightLinks: false,
      highContrast: false,
      colorShift: false,
      stopAnimation: false,
      textSize: 'normal',
      spacing: 'normal',
      dyslexicFont: false,
      readingGuide: false,
      windowMask: false,
      hideImages: false,
      highlightHeadings: false,
      invertColors: false
    };

    const body = document.body;
    const html = document.documentElement;

    const classes = [
      'ae-focus',
      'ae-large-cursor',
      'ae-highlight-links',
      'ae-high-contrast',
      'ae-color-shift',
      'ae-stop-animation',
      'ae-text-large',
      'ae-spacing-increased',
      'ae-dyslexic-font',
      'ae-reading-guide',
      'ae-window-mask',
      'ae-hide-images',
      'ae-highlight-headings',
      'ae-invert-colors'
    ];

    body.classList.remove(...classes);
    html.classList.remove(...classes);

    [
      'background-color',
      'color',
      'cursor',
      'font-size',
      'font-family',
      'letter-spacing',
      'line-height',
      'filter'
    ].forEach(prop => {
      body.style.removeProperty(prop);
      html.style.removeProperty(prop);
    });

    document.getElementById('ae-reading-guide')?.remove();
    document.getElementById('ae-window-mask')?.remove();
    document.getElementById('ae-focus-styles')?.remove();

    localStorage.removeItem('accessibilityTools');

    window.location.reload();
  }
  async submitReport() {
    if (this.enviandoReporte) return;

    const tipo = this.reportForm.assistanceType;

    if (
      tipo !== 'accessibility' &&
      tipo !== 'general' &&
      tipo !== 'bug'
    ) {
      alert('Seleccione el tipo de asistencia.');
      return;
    }

    this.enviandoReporte = true;

    try {
      const resultado = await this.api.enviarReporteAccesibilidad({
        name: this.reportForm.name.trim(),
        email: this.reportForm.email.trim(),
        phone: this.reportForm.phone.trim() || undefined,
        assistanceType: tipo,
        description: this.reportForm.description.trim()
      });

      alert(
        'Reporte enviado correctamente.\n\n' +
        'Código de seguimiento: ' + resultado.codigo
      );

      this.reportForm = {
        name: '',
        email: '',
        phone: '',
        assistanceType: '',
        description: ''
      };

      this.closePanel();
    } catch (error) {
      console.error('Error al enviar reporte de accesibilidad:', error);

      alert(
        'No se pudo enviar el reporte. ' +
        'Verifique los datos e inténtelo nuevamente.'
      );
    } finally {
      this.enviandoReporte = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'R') {
      event.preventDefault();
      this.resetTools();
    }
    if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.closePanel();
    }
  }

  ngOnInit() {
    const savedTools = localStorage.getItem('accessibilityTools');
    if (savedTools) {
      try {
        this.accessibilityTools = JSON.parse(savedTools);
        // Resetear textSize a normal si está en large o extra-large
        if (this.accessibilityTools.textSize === 'large' || this.accessibilityTools.textSize === 'extra-large') {
          this.accessibilityTools.textSize = 'normal';
        }
        // Resetear spacing a normal si está en increased
        if (this.accessibilityTools.spacing === 'increased') {
          this.accessibilityTools.spacing = 'normal';
        }
        this.applyTools();
      } catch (e) {
        console.error('Error loading accessibility tools:', e);
      }
    }
  }
}



