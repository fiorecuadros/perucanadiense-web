export interface CoverImage {
  src: string;
  alt: string;
}

export interface InstitutionalDocument {
  id: string;
  label: string;
  pdfUrl?: string;
  cover?: CoverImage;
  emptyTitle?: string;
  emptyBody?: string;
}
