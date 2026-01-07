/**
 * UBICACIÓN: src/core/application/use-cases/audit/AuditBooks.usecase.ts
 * ✅ ARQUITECTURA LIMPIA: Caso de uso de auditoría
 */

export interface BookAuditData {
  id: string;
  title: string;
  cover_url: string | null;
  pdf_url: string | null;
  deleted_at: string | null;
  user_id: string;
}

export interface RelationAuditData {
  book_id: string;
  related_id: string | number;
}

export interface AuditReport {
  timestamp: string;
  summary: {
    totalBooks: number;
    activeBooks: number;
    deletedBooks: number;
    orphanedFiles: number;
    brokenRelations: number;
    duplicates: number;
    issues: number;
  };
  details: {
    orphanedPDFs: string[];
    orphanedImages: string[];
    booksWithoutPDF: Array<{ id: string; title: string }>;
    booksWithoutCover: Array<{ id: string; title: string }>;
    brokenAuthorRelations: RelationAuditData[];
    brokenCharacterRelations: RelationAuditData[];
    brokenCategoryRelations: RelationAuditData[];
    brokenGenreRelations: RelationAuditData[];
    brokenTagRelations: RelationAuditData[];
    brokenValueRelations: RelationAuditData[];
    duplicateAuthors: Array<{ name: string; count: number; ids: string[] }>;
    duplicateCharacters: Array<{ name: string; count: number; ids: string[] }>;
    oldSoftDeletes: Array<{ id: string; title: string; deleted_at: string; days_ago: number }>;
    booksWithoutRelations: Array<{ id: string; title: string; missing: string[] }>;
  };
  recommendations: string[];
}

/**
 * Puerto para el repositorio de auditoría
 */
export interface IAuditRepository {
  getAllBooks(): Promise<BookAuditData[]>;
  getActiveBookIds(): Promise<Set<string>>;
  getOrphanedFiles(activeBookIds: Set<string>): Promise<{
    pdfs: string[];
    images: string[];
  }>;
  getBrokenRelations(activeBookIds: Set<string>): Promise<{
    authors: RelationAuditData[];
    characters: RelationAuditData[];
    categories: RelationAuditData[];
    genres: RelationAuditData[];
    tags: RelationAuditData[];
    values: RelationAuditData[];
  }>;
  getDuplicates(): Promise<{
    authors: Array<{ name: string; count: number; ids: string[] }>;
    characters: Array<{ name: string; count: number; ids: string[] }>;
  }>;
  getBooksWithoutRelations(activeBookIds: Set<string>): Promise<
    Array<{ id: string; title: string; missing: string[] }>
  >;
}

/**
 * Caso de uso: Auditar libros
 */
export class AuditBooksUseCase {
  constructor(private auditRepository: IAuditRepository) {}

  async execute(): Promise<AuditReport> {
    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBooks: 0,
        activeBooks: 0,
        deletedBooks: 0,
        orphanedFiles: 0,
        brokenRelations: 0,
        duplicates: 0,
        issues: 0,
      },
      details: {
        orphanedPDFs: [],
        orphanedImages: [],
        booksWithoutPDF: [],
        booksWithoutCover: [],
        brokenAuthorRelations: [],
        brokenCharacterRelations: [],
        brokenCategoryRelations: [],
        brokenGenreRelations: [],
        brokenTagRelations: [],
        brokenValueRelations: [],
        duplicateAuthors: [],
        duplicateCharacters: [],
        oldSoftDeletes: [],
        booksWithoutRelations: [],
      },
      recommendations: [],
    };

    // 1. Auditar libros
    const allBooks = await this.auditRepository.getAllBooks();
    report.summary.totalBooks = allBooks.length;
    report.summary.activeBooks = allBooks.filter(b => !b.deleted_at).length;
    report.summary.deletedBooks = allBooks.filter(b => b.deleted_at).length;

    // Libros sin PDF/portada
    report.details.booksWithoutPDF = allBooks
      .filter(b => !b.deleted_at && !b.pdf_url)
      .map(b => ({ id: b.id, title: b.title || 'Sin título' }));

    report.details.booksWithoutCover = allBooks
      .filter(b => !b.deleted_at && !b.cover_url)
      .map(b => ({ id: b.id, title: b.title || 'Sin título' }));

    // Soft deletes antiguos
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    report.details.oldSoftDeletes = allBooks
      .filter(b => {
        if (!b.deleted_at) return false;
        return new Date(b.deleted_at) < thirtyDaysAgo;
      })
      .map(b => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(b.deleted_at!).getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: b.id,
          title: b.title || 'Sin título',
          deleted_at: b.deleted_at!,
          days_ago: daysAgo,
        };
      });

    // 2. Auditar archivos huérfanos
    const activeBookIds = await this.auditRepository.getActiveBookIds();
    const orphanedFiles = await this.auditRepository.getOrphanedFiles(activeBookIds);
    
    report.details.orphanedPDFs = orphanedFiles.pdfs;
    report.details.orphanedImages = orphanedFiles.images;
    report.summary.orphanedFiles = orphanedFiles.pdfs.length + orphanedFiles.images.length;

    // 3. Auditar relaciones rotas
    const brokenRelations = await this.auditRepository.getBrokenRelations(activeBookIds);
    
    report.details.brokenAuthorRelations = brokenRelations.authors;
    report.details.brokenCharacterRelations = brokenRelations.characters;
    report.details.brokenCategoryRelations = brokenRelations.categories;
    report.details.brokenGenreRelations = brokenRelations.genres;
    report.details.brokenTagRelations = brokenRelations.tags;
    report.details.brokenValueRelations = brokenRelations.values;

    report.summary.brokenRelations =
      brokenRelations.authors.length +
      brokenRelations.characters.length +
      brokenRelations.categories.length +
      brokenRelations.genres.length +
      brokenRelations.tags.length +
      brokenRelations.values.length;

    // 4. Auditar duplicados
    const duplicates = await this.auditRepository.getDuplicates();
    
    report.details.duplicateAuthors = duplicates.authors;
    report.details.duplicateCharacters = duplicates.characters;
    report.summary.duplicates = duplicates.authors.length + duplicates.characters.length;

    // 5. Libros sin relaciones básicas
    report.details.booksWithoutRelations = 
      await this.auditRepository.getBooksWithoutRelations(activeBookIds);

    // Calcular issues totales
    report.summary.issues =
      report.details.booksWithoutPDF.length +
      report.details.booksWithoutCover.length +
      report.summary.orphanedFiles +
      report.summary.brokenRelations +
      report.summary.duplicates +
      report.details.oldSoftDeletes.length +
      report.details.booksWithoutRelations.length;

    // Generar recomendaciones
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  private generateRecommendations(report: AuditReport): string[] {
    const recommendations: string[] = [];

    if (report.details.orphanedPDFs.length > 0) {
      recommendations.push(
        `Eliminar ${report.details.orphanedPDFs.length} PDFs huérfanos`
      );
    }

    if (report.details.orphanedImages.length > 0) {
      recommendations.push(
        `Eliminar ${report.details.orphanedImages.length} imágenes huérfanas`
      );
    }

    if (report.summary.brokenRelations > 0) {
      recommendations.push(
        `Limpiar ${report.summary.brokenRelations} relaciones rotas`
      );
    }

    if (report.details.duplicateAuthors.length > 0) {
      recommendations.push(
        `Fusionar ${report.details.duplicateAuthors.length} autores duplicados`
      );
    }

    if (report.details.duplicateCharacters.length > 0) {
      recommendations.push(
        `Fusionar ${report.details.duplicateCharacters.length} personajes duplicados`
      );
    }

    if (report.details.oldSoftDeletes.length > 0) {
      recommendations.push(
        `Eliminar ${report.details.oldSoftDeletes.length} libros hace más de 30 días`
      );
    }

    if (report.details.booksWithoutRelations.length > 0) {
      recommendations.push(
        `Revisar ${report.details.booksWithoutRelations.length} libros sin relaciones`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('¡Todo está en orden!');
    }

    return recommendations;
  }
}