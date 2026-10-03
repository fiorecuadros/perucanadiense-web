import { AppSrc } from '../../../core/directives/app-src';
import {
  Component, signal, ViewChild, ElementRef,
  AfterViewChecked, HostListener, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  id: number;
  text: string;
  type: 'bot' | 'user';
  time: string;
  links?: { label: string; path: string }[];
  quickReplies?: string[];
}

/** Respuesta real del modulo `asistente` del backend. */
interface AsistenteApiResponse {
  texto: string;
  enlaces?: { etiqueta: string; ruta: string }[];
  sugerencias?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [AppSrc, CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private msgContainer!: ElementRef;

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/asistente`;

  isOpen = signal(false);
  isTyping = signal(false);
  userInput = '';
  private msgIdCounter = 0;

  messages = signal<ChatMessage[]>([
    {
      id: this.nextId(),
      type: 'bot',
      text: '¡Hola! 👋 Soy el asistente virtual del **IESPP Privado "Peruano Canadiense"**. Estoy aquí para ayudarte con cualquier consulta sobre nuestra institución.',
      time: this.nowTime(),
      quickReplies: ['¿Qué programas ofrecen?', 'Proceso de admisión', 'Contacto', 'Servicios'],
    },
  ]);

  toggle() { this.isOpen.update(v => !v); }
  close()  { this.isOpen.set(false); }

  sendQuickReply(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isTyping()) return;

    this.addMessage({ type: 'user', text, time: this.nowTime() });
    this.userInput = '';
    this.isTyping.set(true);

    this.http.post<AsistenteApiResponse>(this.API_URL, { mensaje: text }).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        this.addMessage({
          type: 'bot',
          text: res.texto,
          // El backend usa etiqueta/ruta; la plantilla usa label/path.
          // Los enlaces externos (WhatsApp) se descartan: routerLink solo
          // navega rutas internas del portal.
          links: (res.enlaces ?? [])
            .filter((e) => e.ruta?.startsWith('/'))
            .map((e) => ({ label: e.etiqueta, path: e.ruta })),
          quickReplies: res.sugerencias ?? [],
          time: this.nowTime(),
        });
      },
      error: (err) => {
        this.isTyping.set(false);

        let mensaje =
          'Lo siento, hubo un problema al conectar con el servidor. Por favor intenta nuevamente.';

        if (err.status === 429) {
          mensaje =
            'Has realizado varias consultas seguidas. Espera un momento antes de volver a intentarlo.';
        } else if (err.status === 0) {
          mensaje =
            'No puedo comunicarme con el servidor en este momento. Por favor intenta nuevamente más tarde.';
        }

        this.addMessage({
          type: 'bot',
          text: mensaje,
          quickReplies: ['Programas', 'Admisión', 'Contacto'],
          time: this.nowTime(),
        });
      },
    });
  }

  private addMessage(msg: Omit<ChatMessage, 'id'>) {
    this.messages.update(msgs => [...msgs, { id: this.nextId(), ...msg }]);
    setTimeout(() => this.scrollToBottom(), 60);
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  ngAfterViewChecked() {}

  private scrollToBottom() {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private nextId(): number { return ++this.msgIdCounter; }

  private nowTime(): string {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.close(); }
}


