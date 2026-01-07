/**
 * UBICACIÓN: src/core/application/use-cases/books/HardDeleteBook.usecase.ts
 * ✅ HARD DELETE: Elimina el libro PERMANENTEMENTE con archivos de storage
 */

import { createClient } from '@/src/utils/supabase/client';

export class HardDeleteBookUseCase {
  static async execute(bookId: string): Promise<void> {
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el libro pertenece al usuario Y está en papelera
      const { data: book, error: fetchError } = await supabase
        .from('books')
        .select('user_id, deleted_at, cover_url, pdf_url')
        .eq('id', bookId)
        .single();

      if (fetchError) {
        throw new Error('Libro no encontrado');
      }

      if (book.user_id !== user.id) {
        throw new Error('No tienes permiso para eliminar este libro');
      }

      if (!book.deleted_at) {
        throw new Error('El libro debe estar en la papelera para eliminarlo permanentemente');
      }

      // Obtener páginas para eliminar sus imágenes
      const { data: pages } = await supabase
        .from('book_pages')
        .select('image_url, background_url')
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
              // pathParts[1] = user-id
              // pathParts[2+] = filename
              if (pathParts.length >= 3) {
                return pathParts.slice(1).join('/'); // "user-id/filename.ext"
              }
            }
          }
          
          // Fallback: tomar últimos 2 segmentos
          const urlParts = url.split('/');
          if (urlParts.length >= 2) {
            return urlParts.slice(-2).join('/');
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

      // PDF
      if (book.pdf_url) {
        const path = extractPath(book.pdf_url);
        if (path) pdfFiles.push(path);
      }

      // Imágenes de páginas
      if (pages && pages.length > 0) {
        pages.forEach(page => {
          if (page.image_url) {
            const path = extractPath(page.image_url);
            if (path) imageFiles.push(path);
          }
          if (page.background_url && page.background_url.includes('supabase')) {
            const path = extractPath(page.background_url);
            if (path) imageFiles.push(path);
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

      // Eliminar libro de BD (CASCADE elimina páginas y relaciones)
      const { error: deleteError } = await supabase
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