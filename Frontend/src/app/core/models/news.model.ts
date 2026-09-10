export type NewsCategory = 'noticia' | 'comunicado' | 'evento';

export interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  categoryLabel: string;
  excerpt: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  createdAt: string;
  featured?: boolean;
  /** false = borrador; el listado público no la muestra. Ausente = publicada. */
  publicada?: boolean;
}
