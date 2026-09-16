import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accesibility.html',
  styleUrls: ['./accesibility.scss']
})
export class AccessibilityComponent {
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
    const html = document.documentElement;

    console.log('=== APPLY TOOLS ===');
    console.log('Estado:', this.accessibilityTools);

    // Eliminar todas las clases
    body.classList.remove('ae-focus', 'ae-large-cursor', 'ae-highlight-links', 'ae-high-contrast',
                        'ae-color-shift', 'ae-stop-animation', 'ae-text-large', 'ae-spacing-increased',
                        'ae-dyslexic-font', 'ae-reading-guide', 'ae-window-mask', 'ae-hide-images',
                        'ae-highlight-headings', 'ae-invert-colors');
    html.classList.remove('ae-focus', 'ae-large-cursor', 'ae-highlight-links', 'ae-high-contrast',
                       'ae-color-shift', 'ae-stop-animation', 'ae-text-large', 'ae-spacing-increased',
                       'ae-dyslexic-font', 'ae-reading-guide', 'ae-window-mask', 'ae-hide-images',
                       'ae-highlight-headings', 'ae-invert-colors');

    // Limpiar estilos inline de body y html
    body.style.cssText = '';
    html.style.cssText = '';

    // Limpiar estilos inline de todos los elementos
    document.querySelectorAll('*').forEach(el => {
      const element = el as HTMLElement;
      element.style.removeProperty('cursor');
      element.style.removeProperty('background-color');
      element.style.removeProperty('color');
      element.style.removeProperty('font-size');
      element.style.removeProperty('font-family');
      element.style.removeProperty('letter-spacing');
      element.style.removeProperty('line-height');
      element.style.removeProperty('word-spacing');
      element.style.removeProperty('filter');
      element.style.removeProperty('animation');
      element.style.removeProperty('transition');
      element.style.removeProperty('border');
      element.style.removeProperty('border-radius');
      element.style.removeProperty('padding');
      element.style.removeProperty('display');
      element.style.removeProperty('visibility');
    });

    // EXCEPCIÓN: Restaurar transiciones en botones flotantes
    const floatingButtons = document.querySelectorAll('.accessibility-toggle, .chatbot-toggle, .whatsapp-bubble');
    floatingButtons.forEach(btn => {
      (btn as HTMLElement).style.setProperty('transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
    });

    // Aplicar herramientas activas con estilos inline directos
    if (this.accessibilityTools.highContrast) {
      body.classList.add('ae-high-contrast');
      html.classList.add('ae-high-contrast');
      body.style.setProperty('background-color', '#000000', 'important');
      body.style.setProperty('color', '#ffffff', 'important');
      html.style.setProperty('background-color', '#000000', 'important');
      html.style.setProperty('color', '#ffffff', 'important');
      console.log('✓ Alto contraste activado');
    }

    if (this.accessibilityTools.largeCursor) {
      body.classList.add('ae-large-cursor');
      html.classList.add('ae-large-cursor');
      const cursorSvg = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23ff6600\" stroke-width=\"3\"><path d=\"M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z\"/></svg>') 0 24, auto";
      body.style.setProperty('cursor', cursorSvg, 'important');
      html.style.setProperty('cursor', cursorSvg, 'important');
      document.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).style.setProperty('cursor', cursorSvg, 'important');
      });
      console.log('✓ Cursor grande activado');
    }

    if (this.accessibilityTools.highlightLinks) {
      body.classList.add('ae-highlight-links');
      html.classList.add('ae-highlight-links');
      document.querySelectorAll('a, button').forEach(el => {
        (el as HTMLElement).style.setProperty('background-color', 'rgba(255, 102, 0, 0.3)', 'important');
        (el as HTMLElement).style.setProperty('border', '3px solid #ff6600', 'important');
        (el as HTMLElement).style.setProperty('border-radius', '6px', 'important');
        (el as HTMLElement).style.setProperty('padding', '4px 8px', 'important');
      });
      console.log('✓ Destacar enlaces activado');
    }

    if (this.accessibilityTools.textSize === 'large') {
      body.classList.add('ae-text-large');
      html.classList.add('ae-text-large');
      body.style.setProperty('font-size', '1.5rem', 'important');
      html.style.setProperty('font-size', '1.5rem', 'important');
      console.log('✓ Texto grande activado');
    }

    if (this.accessibilityTools.focus) {
      body.classList.add('ae-focus');
      html.classList.add('ae-focus');
      console.log('✓ Enfoque activado');
    }

    if (this.accessibilityTools.colorShift) {
      body.classList.add('ae-color-shift');
      html.classList.add('ae-color-shift');
      body.style.setProperty('filter', 'hue-rotate(180deg)', 'important');
      html.style.setProperty('filter', 'hue-rotate(180deg)', 'important');
      // EXCEPCIÓN: No aplicar filtro a botones flotantes
      const floatingButtons = document.querySelectorAll('.accessibility-toggle, .chatbot-toggle, .whatsapp-bubble');
      floatingButtons.forEach(btn => {
        (btn as HTMLElement).style.setProperty('filter', 'none', 'important');
      });
      console.log('✓ Cambio de color activado (excluyendo botones flotantes)');
    }

    if (this.accessibilityTools.stopAnimation) {
      body.classList.add('ae-stop-animation');
      html.classList.add('ae-stop-animation');
      document.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).style.setProperty('animation', 'none', 'important');
        (el as HTMLElement).style.setProperty('transition', 'none', 'important');
      });
      console.log('✓ Detener animación activado');
    }

    if (this.accessibilityTools.spacing === 'increased') {
      body.classList.add('ae-spacing-increased');
      html.classList.add('ae-spacing-increased');
      body.style.setProperty('letter-spacing', '0.2em', 'important');
      body.style.setProperty('line-height', '2.0', 'important');
      html.style.setProperty('letter-spacing', '0.2em', 'important');
      html.style.setProperty('line-height', '2.0', 'important');
      console.log('✓ Espaciado aumentado activado');
    }

    if (this.accessibilityTools.dyslexicFont) {
      body.classList.add('ae-dyslexic-font');
      html.classList.add('ae-dyslexic-font');
      body.style.setProperty('font-family', 'Comic Sans MS, Chalkboard SE, Arial, sans-serif', 'important');
      html.style.setProperty('font-family', 'Comic Sans MS, Chalkboard SE, Arial, sans-serif', 'important');
      console.log('✓ Fuente disléxica activada');
    }

    if (this.accessibilityTools.readingGuide) {
      body.classList.add('ae-reading-guide');
      html.classList.add('ae-reading-guide');
      console.log('✓ Guía de lectura activada');
    }

    if (this.accessibilityTools.windowMask) {
      body.classList.add('ae-window-mask');
      html.classList.add('ae-window-mask');
      console.log('✓ Máscara de ventana activada');
    }

    if (this.accessibilityTools.hideImages) {
      body.classList.add('ae-hide-images');
      html.classList.add('ae-hide-images');
      document.querySelectorAll('img, svg, picture').forEach(el => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
        (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
      });
      console.log('✓ Ocultar imágenes activado');
    }

    if (this.accessibilityTools.highlightHeadings) {
      body.classList.add('ae-highlight-headings');
      html.classList.add('ae-highlight-headings');
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
        (el as HTMLElement).style.setProperty('background-color', 'rgba(255, 102, 0, 0.3)', 'important');
        (el as HTMLElement).style.setProperty('border', '3px solid #ff6600', 'important');
        (el as HTMLElement).style.setProperty('border-radius', '8px', 'important');
        (el as HTMLElement).style.setProperty('padding', '8px 12px', 'important');
      });
      console.log('✓ Destacar encabezados activado');
    }

    if (this.accessibilityTools.invertColors) {
      body.classList.add('ae-invert-colors');
      html.classList.add('ae-invert-colors');
      body.style.setProperty('filter', 'invert(1)', 'important');
      html.style.setProperty('filter', 'invert(1)', 'important');
      // EXCEPCIÓN: No aplicar filtro a botones flotantes
      const floatingElements = document.querySelectorAll('.accessibility-toggle, .chatbot-toggle, .whatsapp-bubble');
      floatingElements.forEach(el => {
        (el as HTMLElement).style.setProperty('filter', 'none', 'important');
        (el as HTMLElement).style.setProperty('transform', 'translateY(0)', 'important');
      });
      console.log('✓ Inversión de colores activada (excluyendo botones flotantes)');
    }

    console.log('=== END APPLY TOOLS ===');

    // Guardar en localStorage
    localStorage.setItem('accessibilityTools', JSON.stringify(this.accessibilityTools));
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

    // Limpiar estilos inline completamente
    const body = document.body;
    const html = document.documentElement;

    body.classList.remove('ae-focus', 'ae-large-cursor', 'ae-highlight-links', 'ae-high-contrast',
                        'ae-color-shift', 'ae-stop-animation', 'ae-text-large', 'ae-spacing-increased',
                        'ae-dyslexic-font', 'ae-reading-guide', 'ae-window-mask', 'ae-hide-images',
                        'ae-highlight-headings', 'ae-invert-colors');
    html.classList.remove('ae-focus', 'ae-large-cursor', 'ae-highlight-links', 'ae-high-contrast',
                       'ae-color-shift', 'ae-stop-animation', 'ae-text-large', 'ae-spacing-increased',
                       'ae-dyslexic-font', 'ae-reading-guide', 'ae-window-mask', 'ae-hide-images',
                       'ae-highlight-headings', 'ae-invert-colors');

    // Limpiar estilos inline de body y html
    body.style.cssText = '';
    html.style.cssText = '';

    // Limpiar estilos inline de todos los elementos
    document.querySelectorAll('*').forEach(el => {
      const element = el as HTMLElement;
      // Solo limpiar estilos inline específicos de accesibilidad
      element.style.removeProperty('cursor');
      element.style.removeProperty('background-color');
      element.style.removeProperty('color');
      element.style.removeProperty('font-size');
      element.style.removeProperty('font-family');
      element.style.removeProperty('letter-spacing');
      element.style.removeProperty('line-height');
      element.style.removeProperty('word-spacing');
      element.style.removeProperty('filter');
      element.style.removeProperty('animation');
      element.style.removeProperty('transition');
      element.style.removeProperty('border');
      element.style.removeProperty('border-radius');
      element.style.removeProperty('padding');
      element.style.removeProperty('display');
      element.style.removeProperty('visibility');
    });

    this.applyTools();
  }

  submitReport() {
    alert('Gracias por tu reporte. Nos pondremos en contacto contigo pronto.');
    this.reportForm = {
      name: '',
      email: '',
      phone: '',
      assistanceType: '',
      description: ''
    };
    this.closePanel();
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
    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      this.activeTab = 'report';
      if (!this.isOpen) {
        this.togglePanel();
      }
    }
  }

  ngOnInit() {
    const savedTools = localStorage.getItem('accessibilityTools');
    if (savedTools) {
      try {
        this.accessibilityTools = JSON.parse(savedTools);
        this.applyTools();
      } catch (e) {
        console.error('Error loading accessibility tools:', e);
      }
    }
  }
}
