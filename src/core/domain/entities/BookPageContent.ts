// src/core/domain/entities/BookPageContent.ts

export interface BookPageContent {
  id: string;
  pageNumber: number;
  content: string;
  imageUrl: string | null;
  audioUrl: string | null;
  hasInteraction: boolean;
  interactionType: string | null;
  interactionData: Record<string, unknown> | null;
}

export interface BookReader {
  book: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    difficulty: string;
    categoryName: string;
  };
  pages: BookPageContent[];
  totalPages: number;
}
