const TAG_RE = /<[^>]+>/g;
const WS_RE = /\s+/g;

export function stripHtml(value: string): string {
  return value.replace(TAG_RE, ' ').replace(WS_RE, ' ').trim();
}

export function esHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function htmlVacio(value: string): boolean {
  return !stripHtml(value);
}

export function excerpt(value: string, maxLength = 180): string {
  const plain = stripHtml(value);
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Une párrafos legacy o un bloque HTML de Quill para [innerHTML]. */
export function cuerpoHtml(paragraphs: string[]): string {
  if (!paragraphs.length) {
    return '';
  }
  if (paragraphs.some(esHtml)) {
    return paragraphs.join('');
  }
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
}
