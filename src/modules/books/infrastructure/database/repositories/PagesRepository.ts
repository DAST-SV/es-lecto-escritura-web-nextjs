/**
 * UBICACIÓN: src/modules/books/infrastructure/database/repositories/PagesRepository.ts
 */

import { supabaseAdmin } from '@/src/utils/supabase/admin';
import { Page } from '../../../domain/types';

export class PagesRepository {
  
  /**
   * Insertar páginas de un libro
   */
  static async insertMany(libroId: string, pages: Page[]): Promise<number> {
    const paginasToInsert = pages.map((p, idx) => ({
      id_libro: libroId,
      numero_pagina: idx + 1,
      layout: p.layout,
      animation: p.animation || null,
      title: p.title || null,
      text: p.text || null,
      image: p.image || null,
      audio: p.audio || null,
      interactive_game: p.interactiveGame || null,
      items: p.items || null,
      background: p.background || null,
      border: p.border || null,
    }));

    console.log('📥 Insertando páginas:', paginasToInsert.length);

    const { error, data } = await supabaseAdmin
      .from('paginas_libro')
      .insert(paginasToInsert)
      .select();

    if (error) {
      console.error('❌ Error insertando páginas:', error);
      throw error;
    }

    console.log('✅ Páginas insertadas:', data?.length || 0);
    return data?.length || 0;
  }

  /**
   * Reemplazar todas las páginas de un libro
   */
  static async replaceAll(libroId: string, pages: Page[]): Promise<void> {
    console.log('🔄 Reemplazando páginas del libro:', libroId);
    
    // 1. Eliminar páginas existentes
    const { error: deleteError } = await supabaseAdmin
      .from('paginas_libro')
      .delete()
      .eq('id_libro', libroId);

    if (deleteError) {
      console.error('❌ Error eliminando páginas antiguas:', deleteError);
      throw deleteError;
    }

    console.log('🗑️ Páginas antiguas eliminadas');

    // 2. Insertar nuevas páginas
    await this.insertMany(libroId, pages);
  }

  /**
   * Obtener páginas de un libro
   */
  static async getByBookId(libroId: string): Promise<Page[]> {
    const { data, error } = await supabaseAdmin
      .from('paginas_libro')
      .select('*')
      .eq('id_libro', libroId)
      .order('numero_pagina', { ascending: true });

    if (error) throw error;

    return data?.map(p => ({
      id: p.id_pagina,
      layout: p.layout,
      title: p.title || undefined,
      text: p.text || undefined,
      image: p.image || undefined,
      imagePosition: undefined, // No está en BD
      background: p.background || undefined,
      animation: p.animation || undefined,
      audio: p.audio || undefined,
      interactiveGame: p.interactive_game || undefined,
      items: p.items || undefined,
      border: p.border || undefined,
    })) || [];
  }

  /**
   * Eliminar páginas de un libro
   */
  static async deleteByBookId(libroId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('paginas_libro')
      .delete()
      .eq('id_libro', libroId);

    if (error) throw error;
  }
}