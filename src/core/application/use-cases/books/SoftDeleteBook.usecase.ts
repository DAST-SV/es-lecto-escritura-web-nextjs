/**
 * UBICACIÓN: src/core/application/use-cases/books/SoftDeleteBook.usecase.ts
 * ✅ SOFT DELETE: Marca el libro como eliminado (deleted_at)
 * Usa el schema 'books' correctamente
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';

export class SoftDeleteBookUseCase {
  static async execute(bookId: string): Promise<void> {
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el libro pertenece al usuario (schema books, columna created_by)
      const { data: book, error: fetchError } = await supabase
        .schema('books')
        .from('books')
        .select('created_by')
        .eq('id', bookId)
        .single();

      if (fetchError) {
        throw new Error('Libro no encontrado');
      }

      if (book.created_by !== user.id) {
        throw new Error('No tienes permiso para eliminar este libro');
      }

      // Soft delete: marcar deleted_at
      const { error: updateError } = await supabase
        .schema('books')
        .from('books')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', bookId);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Libro movido a papelera:', bookId);
    } catch (error: any) {
      console.error('❌ Error en soft delete:', error);
      throw error;
    }
  }
}