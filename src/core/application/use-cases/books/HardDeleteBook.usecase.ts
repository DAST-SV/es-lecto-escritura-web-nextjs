/**
 * UBICACIÓN: src/core/application/use-cases/books/HardDeleteBook.usecase.ts
 * ✅ HARD DELETE: Elimina el libro PERMANENTEMENTE con archivos de storage
 * Usa el schema 'books' correctamente
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';

export class HardDeleteBookUseCase {
  static async execute(bookId: string): Promise<void> {
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el libro pertenece al usuario Y está en papelera (schema books, columna created_by)
      const { data: book, error: fetchError } = await supabase
        .schema('books')
        .from('books')
        .select('created_by, deleted_at, cover_url')
        .eq('id', bookId)
        .single();

      if (fetchError) {
        throw new Error('Libro no encontrado');
      }

      if (book.created_by !== user.id) {
        throw new Error('No tienes permiso para eliminar este libro');
      }

      if (!book.deleted_at) {
        throw new Error('El libro debe estar en la papelera para eliminarlo permanentemente');
      }

      // Obtener traducciones para eliminar PDFs por idioma
      const { data: translations } = await supabase
        .schema('books')
        .from('book_translations')
        .select('pdf_url')
        .eq('book_id', bookId);

      // Recolectar archivos a eliminar
      const imageFiles: string[] = [];
      const pdfFiles: string[] = [];

      // Extraer path del storage desde URL
      const extractPath = (url: string | null): string | null => {
        if (!url) return null;

        try {
          // URL formato: https://xxx.supabase.co/storage/v1/object/public/bucket-name/user-id/file.ext
          if (url.includes('/storage/v1/object/public/')) {
            const parts = url.split('/storage/v1/object/public/');
            if (parts.length === 2) {
              const pathParts = parts[1].split('/');
              // pathParts[0] = bucket name
              // pathParts[1+] = path
              if (pathParts.length >= 2) {
                return pathParts.slice(1).join('/');
              }
            }
          }

          // Fallback: tomar últimos segmentos después del bucket
          const urlParts = url.split('/');
          if (urlParts.length >= 3) {
            return urlParts.slice(-3).join('/');
          }

          return null;
        } catch (error) {
          console.warn('Error extrayendo path:', error);
          return null;
        }
      };

      // Portada
      if (book.cover_url) {
        const path = extractPath(book.cover_url);
        if (path) imageFiles.push(path);
      }

      // PDFs de traducciones
      if (translations && translations.length > 0) {
        translations.forEach(trans => {
          if (trans.pdf_url) {
            const path = extractPath(trans.pdf_url);
            if (path) pdfFiles.push(path);
          }
        });
      }

      console.log('🗑️ Eliminando archivos:', {
        images: imageFiles.length,
        pdfs: pdfFiles.length
      });

      // Eliminar imágenes
      if (imageFiles.length > 0) {
        const { error: imgError } = await supabase.storage
          .from('book-images')
          .remove(imageFiles);

        if (imgError) {
          console.warn('⚠️ Error eliminando imágenes:', imgError);
        }
      }

      // Eliminar PDFs
      if (pdfFiles.length > 0) {
        const { error: pdfError } = await supabase.storage
          .from('book-pdfs')
          .remove(pdfFiles);

        if (pdfError) {
          console.warn('⚠️ Error eliminando PDFs:', pdfError);
        }
      }

      // Eliminar traducciones primero
      const { error: transDeleteError } = await supabase
        .schema('books')
        .from('book_translations')
        .delete()
        .eq('book_id', bookId);

      if (transDeleteError) {
        console.warn('⚠️ Error eliminando traducciones:', transDeleteError);
      }

      // Eliminar libro de BD (CASCADE elimina relaciones)
      const { error: deleteError } = await supabase
        .schema('books')
        .from('books')
        .delete()
        .eq('id', bookId);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ Libro y archivos eliminados permanentemente:', bookId);
    } catch (error: any) {
      console.error('❌ Error en hard delete:', error);
      throw error;
    }
  }
}