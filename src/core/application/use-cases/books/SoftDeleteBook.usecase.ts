/**
 * UBICACIÓN: src/core/application/use-cases/books/SoftDeleteBook.usecase.ts
 * ✅ SOFT DELETE: Marca el libro como eliminado (deleted_at)
 */

import { createClient } from '@/src/utils/supabase/client';

export class SoftDeleteBookUseCase {
  static async execute(bookId: string): Promise<void> {
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el libro pertenece al usuario
      const { data: book, error: fetchError } = await supabase
        .from('books')
        .select('user_id')
        .eq('id', bookId)
        .single();

      if (fetchError) {
        throw new Error('Libro no encontrado');
      }

      if (book.user_id !== user.id) {
        throw new Error('No tienes permiso para eliminar este libro');
      }

      // Soft delete: marcar deleted_at y deleted_by
      const { error: updateError } = await supabase
        .from('books')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user.id
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