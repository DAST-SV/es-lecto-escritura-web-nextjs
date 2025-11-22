/**
 * UBICACIÓN: src/core/application/use-cases/book/SaveBook.usecase.ts
 */

import { Book } from '../../../domain/entities/Book.entity';
import { IBookRepository } from '../../../domain/repositories/IBookRepository';
import { IStorageService } from '../../ports/IStorageService';

export interface SaveBookDTO {
  book: Book;
  userId: string;
  bookId?: string;
}

export interface SaveBookResult {
  success: boolean;
  bookId: string;
  message: string;
}

export class SaveBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(dto: SaveBookDTO): Promise<SaveBookResult> {
    try {
      // 1. Validar
      if (!dto.userId) throw new Error('Usuario no autenticado');
      if (!dto.book) throw new Error('Libro inválido');
      
      dto.book.validate();

      // 2. Eliminar archivos anteriores si es actualización
      if (dto.bookId) {
        await this.storageService.deleteFolder(
          'ImgLibros', 
          `${dto.userId}/${dto.bookId}`
        );
      }

      // 3. Subir portada si es necesario
      let portadaUrl: string | null = dto.book.metadata.portadaUrl ?? null; // 🔥 FIX: ?? null
      
      if (dto.book.metadata.portada instanceof File) {
        const bookId = dto.bookId || `temp-${Date.now()}`;
        const ext = this.getFileExtension(dto.book.metadata.portada);
        const portadaPath = this.storageService.generateFilePath(
          dto.userId,
          bookId,
          `portada.${ext}`
        );
        
        portadaUrl = await this.storageService.uploadFile(
          dto.book.metadata.portada,
          'ImgLibros',
          portadaPath
        );
      }

      // 4. Subir imágenes de páginas
      for (let i = 0; i < dto.book.pages.length; i++) {
        const page = dto.book.pages[i];
        const bookId = dto.bookId || `temp-${Date.now()}`;

        // Imagen principal
        if (page.files.file) {
          const ext = this.getFileExtension(page.files.file);
          const imagePath = this.storageService.generateFilePath(
            dto.userId,
            bookId,
            `pagina_${i + 1}_file.${ext}`
          );
          
          const imageUrl = await this.storageService.uploadFile(
            page.files.file,
            'ImgLibros',
            imagePath
          );
          
          // Actualizar la página con la URL
          page.content.image = imageUrl;
        }

        // Imagen de fondo
        if (page.files.backgroundFile) {
          const ext = this.getFileExtension(page.files.backgroundFile);
          const bgPath = this.storageService.generateFilePath(
            dto.userId,
            bookId,
            `pagina_${i + 1}_bg.${ext}`
          );
          
          const bgUrl = await this.storageService.uploadFile(
            page.files.backgroundFile,
            'ImgLibros',
            bgPath
          );
          
          page.content.background = bgUrl;
        }
      }

      // 5. Guardar o actualizar en base de datos
      const bookId = dto.bookId 
        ? await this.updateBook(dto.book, portadaUrl) // ✅ Ahora portadaUrl es string | null
        : await this.createBook(dto.book, portadaUrl); // ✅ Ahora portadaUrl es string | null

      return {
        success: true,
        bookId,
        message: dto.bookId 
          ? '📚 Libro actualizado correctamente' 
          : '📚 Libro guardado correctamente'
      };

    } catch (error: any) {
      console.error('❌ Error en SaveBookUseCase:', error);
      throw new Error(error.message || 'Error al guardar el libro');
    }
  }

  private async createBook(book: Book, portadaUrl: string | null): Promise<string> {
    // Actualizar metadata con la URL de portada
    const updatedBook = new Book(
      null,
      { ...book.metadata, portadaUrl, portada: null },
      book.pages,
      book.userId
    );

    return await this.bookRepository.save(updatedBook);
  }

  private async updateBook(book: Book, portadaUrl: string | null): Promise<string> {
    const updatedBook = new Book(
      book.id,
      { ...book.metadata, portadaUrl, portada: null },
      book.pages,
      book.userId,
      book.createdAt,
      new Date()
    );

    await this.bookRepository.update(updatedBook);
    return book.id!;
  }

  private getFileExtension(file: Blob | File): string {
    if (file instanceof File) {
      const parts = file.name.split('.');
      return parts.length > 1 ? parts.pop() || 'bin' : 'bin';
    } else {
      const mimeParts = file.type.split('/');
      return mimeParts.length > 1 ? mimeParts[1] : 'bin';
    }
  }
}