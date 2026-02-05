/**
 * UBICACIÓN: src/core/application/use-cases/books/RestoreBook.usecase.ts
 * ✅ RESTORE: Restaura un libro de la papelera
 * Usa el schema 'books' correctamente
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';

export class RestoreBookUseCase {
  static async execute(bookId: string): Promise<void> {
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el libro pertenece al usuario Y está eliminado (schema books, columna created_by)
      const { data: book, error: fetchError } = await supabase
        .schema('books')
        .from('books')
        .select('created_by, deleted_at')
        .eq('id', bookId)
        .single();

      if (fetchError) {
        throw new Error('Libro no encontrado');
      }

      if (book.created_by !== user.id) {
        throw new Error('No tienes permiso para restaurar este libro');
      }

      if (!book.deleted_at) {
        throw new Error('El libro no está en la papelera');
      }

      // Restaurar: limpiar deleted_at
      const { error: updateError } = await supabase
        .schema('books')
        .from('books')
        .update({
          deleted_at: null
        })
        .eq('id', bookId);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Libro restaurado:', bookId);
    } catch (error: any) {
      console.error('❌ Error restaurando libro:', error);
      throw error;
    }
  }
}