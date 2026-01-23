/**
 * UBICACIÓN: src/infrastructure/repositories/audit/AuditRepository.ts
 * ✅ ARQUITECTURA LIMPIA: Implementación del repositorio de auditoría
 */

import { createClient } from '@supabase/supabase-js';
import type {
  IAuditRepository,
  BookAuditData,
  RelationAuditData,
} from '@/src/core/application/use-cases/audit/AuditBooks.usecase';

export class SupabaseAuditRepository implements IAuditRepository {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getAllBooks(): Promise<BookAuditData[]> {
    const { data, error } = await this.supabase
      .from('books')
      .select('id, title, cover_url, pdf_url, deleted_at, user_id');

    if (error) throw new Error(`Error fetching books: ${error.message}`);
    return data || [];
  }

  async getActiveBookIds(): Promise<Set<string>> {
    const { data } = await this.supabase
      .from('books')
      .select('id')
      .is('deleted_at', null);

    return new Set(data?.map(b => b.id) || []);
  }

  async getOrphanedFiles(
    activeBookIds: Set<string>
  ): Promise<{ pdfs: string[]; images: string[] }> {
    const orphanedPDFs: string[] = [];
    const orphanedImages: string[] = [];

    // Auditar PDFs
    const { data: pdfFiles } = await this.supabase.storage
      .from('book-pdfs')
      .list('', { limit: 1000 });

    if (pdfFiles) {
      for (const userFolder of pdfFiles) {
        if (userFolder.name === '.emptyFolderPlaceholder') continue;

        const { data: bookFolders } = await this.supabase.storage
          .from('book-pdfs')
          .list(userFolder.name, { limit: 1000 });

        if (bookFolders) {
          for (const bookFolder of bookFolders) {
            if (bookFolder.name === '.emptyFolderPlaceholder') continue;
            if (!activeBookIds.has(bookFolder.name)) {
              orphanedPDFs.push(`${userFolder.name}/${bookFolder.name}`);
            }
          }
        }
      }
    }

    // Auditar imágenes
    const { data: imageFiles } = await this.supabase.storage
      .from('book-images')
      .list('', { limit: 1000 });

    if (imageFiles) {
      for (const userFolder of imageFiles) {
        if (userFolder.name === '.emptyFolderPlaceholder') continue;

        const { data: bookFolders } = await this.supabase.storage
          .from('book-images')
          .list(userFolder.name, { limit: 1000 });

        if (bookFolders) {
          for (const bookFolder of bookFolders) {
            if (bookFolder.name === '.emptyFolderPlaceholder') continue;
            if (!activeBookIds.has(bookFolder.name)) {
              orphanedImages.push(`${userFolder.name}/${bookFolder.name}`);
            }
          }
        }
      }
    }

    return { pdfs: orphanedPDFs, images: orphanedImages };
  }

  async getBrokenRelations(activeBookIds: Set<string>): Promise<{
    authors: RelationAuditData[];
    characters: RelationAuditData[];
    categories: RelationAuditData[];
    genres: RelationAuditData[];
    tags: RelationAuditData[];
    values: RelationAuditData[];
  }> {
    const broken = {
      authors: [] as RelationAuditData[],
      characters: [] as RelationAuditData[],
      categories: [] as RelationAuditData[],
      genres: [] as RelationAuditData[],
      tags: [] as RelationAuditData[],
      values: [] as RelationAuditData[],
    };

    // Autores
    const { data: authorRels } = await this.supabase
      .from('books_authors')
      .select('book_id, author_id');

    const { data: validAuthors } = await this.supabase
      .from('book_authors')
      .select('id');

    const validAuthorIds = new Set(validAuthors?.map(a => a.id) || []);

    if (authorRels) {
      for (const rel of authorRels) {
        if (!activeBookIds.has(rel.book_id) || !validAuthorIds.has(rel.author_id)) {
          broken.authors.push({
            book_id: rel.book_id,
            related_id: rel.author_id,
          });
        }
      }
    }

    // Personajes
    const { data: charRels } = await this.supabase
      .from('books_characters')
      .select('book_id, character_id');

    const { data: validChars } = await this.supabase
      .from('book_characters')
      .select('id');

    const validCharIds = new Set(validChars?.map(c => c.id) || []);

    if (charRels) {
      for (const rel of charRels) {
        if (!activeBookIds.has(rel.book_id) || !validCharIds.has(rel.character_id)) {
          broken.characters.push({
            book_id: rel.book_id,
            related_id: rel.character_id,
          });
        }
      }
    }

    // Categorías
    const { data: catRels } = await this.supabase
      .from('books_categories')
      .select('book_id, category_id');

    const { data: validCats } = await this.supabase
      .from('book_categories')
      .select('id');

    const validCatIds = new Set(validCats?.map(c => c.id) || []);

    if (catRels) {
      for (const rel of catRels) {
        if (!activeBookIds.has(rel.book_id) || !validCatIds.has(rel.category_id)) {
          broken.categories.push({
            book_id: rel.book_id,
            related_id: rel.category_id,
          });
        }
      }
    }

    // Géneros
    const { data: genRels } = await this.supabase
      .from('books_genres')
      .select('book_id, genre_id');

    const { data: validGens } = await this.supabase
      .from('book_genres')
      .select('id');

    const validGenIds = new Set(validGens?.map(g => g.id) || []);

    if (genRels) {
      for (const rel of genRels) {
        if (!activeBookIds.has(rel.book_id) || !validGenIds.has(rel.genre_id)) {
          broken.genres.push({
            book_id: rel.book_id,
            related_id: rel.genre_id,
          });
        }
      }
    }

    // Etiquetas
    const { data: tagRels } = await this.supabase
      .from('books_tags')
      .select('book_id, tag_id');

    const { data: validTags } = await this.supabase
      .from('book_tags')
      .select('id');

    const validTagIds = new Set(validTags?.map(t => t.id) || []);

    if (tagRels) {
      for (const rel of tagRels) {
        if (!activeBookIds.has(rel.book_id) || !validTagIds.has(rel.tag_id)) {
          broken.tags.push({
            book_id: rel.book_id,
            related_id: rel.tag_id,
          });
        }
      }
    }

    // Valores
    const { data: valRels } = await this.supabase
      .from('books_values')
      .select('book_id, value_id');

    const { data: validVals } = await this.supabase
      .from('book_values')
      .select('id');

    const validValIds = new Set(validVals?.map(v => v.id) || []);

    if (valRels) {
      for (const rel of valRels) {
        if (!activeBookIds.has(rel.book_id) || !validValIds.has(rel.value_id)) {
          broken.values.push({
            book_id: rel.book_id,
            related_id: rel.value_id,
          });
        }
      }
    }

    return broken;
  }

  async getDuplicates(): Promise<{
    authors: Array<{ name: string; count: number; ids: string[] }>;
    characters: Array<{ name: string; count: number; ids: string[] }>;
  }> {
    const duplicates = {
      authors: [] as Array<{ name: string; count: number; ids: string[] }>,
      characters: [] as Array<{ name: string; count: number; ids: string[] }>,
    };

    // Autores duplicados
    const { data: authors } = await this.supabase
      .from('book_authors')
      .select('id, name');

    if (authors) {
      const byName = new Map<string, string[]>();
      for (const author of authors) {
        const name = author.name.toLowerCase().trim();
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(author.id);
      }

      for (const [name, ids] of byName.entries()) {
        if (ids.length > 1) {
          duplicates.authors.push({ name, count: ids.length, ids });
        }
      }
    }

    // Personajes duplicados
    const { data: characters } = await this.supabase
      .from('book_characters')
      .select('id, name');

    if (characters) {
      const byName = new Map<string, string[]>();
      for (const character of characters) {
        const name = character.name.toLowerCase().trim();
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(character.id);
      }

      for (const [name, ids] of byName.entries()) {
        if (ids.length > 1) {
          duplicates.characters.push({ name, count: ids.length, ids });
        }
      }
    }

    return duplicates;
  }

  async getBooksWithoutRelations(
    activeBookIds: Set<string>
  ): Promise<Array<{ id: string; title: string; missing: string[] }>> {
    const result: Array<{ id: string; title: string; missing: string[] }> = [];

    const { data: books } = await this.supabase
      .from('books')
      .select('id, title')
      .is('deleted_at', null);

    if (!books) return result;

    for (const book of books) {
      const missing: string[] = [];

      // Verificar autores
      const { data: authors } = await this.supabase
        .from('books_authors')
        .select('author_id')
        .eq('book_id', book.id);

      if (!authors || authors.length === 0) missing.push('autores');

      // Verificar categorías
      const { data: categories } = await this.supabase
        .from('books_categories')
        .select('category_id')
        .eq('book_id', book.id);

      if (!categories || categories.length === 0) missing.push('categorías');

      // Verificar géneros
      const { data: genres } = await this.supabase
        .from('books_genres')
        .select('genre_id')
        .eq('book_id', book.id);

      if (!genres || genres.length === 0) missing.push('géneros');

      if (missing.length > 0) {
        result.push({
          id: book.id,
          title: book.title || 'Sin título',
          missing,
        });
      }
    }

    return result;
  }
}