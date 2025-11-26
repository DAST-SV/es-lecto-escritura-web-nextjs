/**
 * UBICACIÓN: src/modules/books/infrastructure/database/repositories/BooksRepository.ts
 */

import { supabaseAdmin } from '@/src/utils/supabase/admin';
import { CreateBookDTO, UpdateBookDTO } from '../types';

export class BooksRepository {
  
  /**
   * Crear libro con metadata
   */
  static async create(dto: CreateBookDTO): Promise<string> {
    // 1. Insertar libro
    const { data: libro, error: libroError } = await supabaseAdmin
      .from('libros')
      .insert([{
        id_usuario: dto.userId,
        id_tipo: 2,
        titulo: dto.titulo,
        portada: dto.portada ?? null,
        descripcion: dto.descripcion ?? null,
        id_nivel: dto.nivel,
      }])
      .select('id_libro')
      .single();

    if (libroError) throw libroError;
    const libroId = libro.id_libro;

    // 2. Insertar relaciones en paralelo (mejor rendimiento)
    await Promise.all([
      this.insertAutores(libroId, dto.autores),
      dto.personajes?.length ? this.insertPersonajes(libroId, dto.personajes) : Promise.resolve(),
      dto.categorias?.length ? this.insertCategorias(libroId, dto.categorias) : Promise.resolve(),
      dto.generos?.length ? this.insertGeneros(libroId, dto.generos) : Promise.resolve(),
      dto.etiquetas?.length ? this.insertEtiquetas(libroId, dto.etiquetas) : Promise.resolve(),
      dto.valores?.length ? this.insertValores(libroId, dto.valores) : Promise.resolve(),
    ]);

    return libroId;
  }

  /**
   * Actualizar datos básicos del libro
   */
  static async update(idLibro: string, dto: UpdateBookDTO): Promise<void> {
    const updateData: any = {};
    
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.portada !== undefined) updateData.portada = dto.portada;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.nivel !== undefined) updateData.id_nivel = dto.nivel;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabaseAdmin
        .from('libros')
        .update(updateData)
        .eq('id_libro', idLibro);

      if (error) throw error;
    }
  }

  /**
   * Eliminar libro
   */
  static async delete(idLibro: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('libros')
      .delete()
      .eq('id_libro', idLibro);

    if (error) throw error;
  }

  /**
   * Obtener libro con metadata completa
   */
  static async getComplete(idLibro: string) {
    const { data: libro, error } = await supabaseAdmin
      .from('libros')
      .select('*')
      .eq('id_libro', idLibro)
      .single();

    if (error || !libro) return null;

    // Consultas en paralelo para mejor rendimiento
    const [
      autoresData,
      personajesData,
      categoriasData,
      generosData,
      valoresData,
      etiquetasData,
      nivelData
    ] = await Promise.all([
      supabaseAdmin.from('libros_autores').select('autores(nombre)').eq('id_libro', idLibro),
      supabaseAdmin.from('libros_personajes').select('personajes(nombre)').eq('id_libro', idLibro),
      supabaseAdmin.from('libro_categorias').select('categorias(nombre)').eq('id_libro', idLibro),
      supabaseAdmin.from('libro_generos').select('generos(nombre)').eq('id_libro', idLibro),
      supabaseAdmin.from('libro_valores').select('valores(nombre)').eq('id_libro', idLibro),
      supabaseAdmin.from('libro_etiquetas').select('etiquetas(nombre)').eq('id_libro', idLibro),
      libro.id_nivel 
        ? supabaseAdmin.from('niveles').select('nombre').eq('id_nivel', libro.id_nivel).single() 
        : Promise.resolve({ data: null })
    ]);

    return {
      ...libro,
      autores: autoresData.data?.map((item: any) => item.autores.nombre).filter(Boolean) || [],
      personajes: personajesData.data?.map((item: any) => item.personajes.nombre).filter(Boolean) || [],
      categorias: categoriasData.data?.map((item: any) => item.categorias.nombre).filter(Boolean) || [],
      generos: generosData.data?.map((item: any) => item.generos.nombre).filter(Boolean) || [],
      valores: valoresData.data?.map((item: any) => item.valores.nombre).filter(Boolean) || [],
      etiquetas: etiquetasData.data?.map((item: any) => item.etiquetas.nombre).filter(Boolean) || [],
      nivel: nivelData.data?.nombre || null
    };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private static async insertAutores(libroId: string, autores: string[]) {
    const autoresIds: string[] = [];

    for (const nombreAutor of autores) {
      const nombreLimpio = nombreAutor.trim();
      if (!nombreLimpio) continue;

      const { data, error } = await supabaseAdmin
        .from('autores')
        .insert({ nombre: nombreLimpio })
        .select('id_autor')
        .single();

      if (error) throw error;
      autoresIds.push(data.id_autor);
    }

    if (autoresIds.length > 0) {
      await supabaseAdmin
        .from('libros_autores')
        .insert(autoresIds.map(id_autor => ({ id_libro: libroId, id_autor })));
    }
  }

  private static async insertPersonajes(libroId: string, personajes: string[]) {
    const personajesIds: string[] = [];

    for (const nombrePersonaje of personajes) {
      const nombreLimpio = nombrePersonaje.trim();
      if (!nombreLimpio) continue;

      const { data, error } = await supabaseAdmin
        .from('personajes')
        .insert({ nombre: nombreLimpio })
        .select('id_personaje')
        .single();

      if (error) throw error;
      personajesIds.push(data.id_personaje);
    }

    if (personajesIds.length > 0) {
      await supabaseAdmin
        .from('libros_personajes')
        .insert(personajesIds.map(id_personaje => ({ id_libro: libroId, id_personaje })));
    }
  }

  private static async insertCategorias(libroId: string, categorias: number[]) {
    await supabaseAdmin
      .from('libro_categorias')
      .insert(categorias.map(id_categoria => ({ id_libro: libroId, id_categoria })));
  }

  private static async insertGeneros(libroId: string, generos: number[]) {
    await supabaseAdmin
      .from('libro_generos')
      .insert(generos.map(id_genero => ({ id_libro: libroId, id_genero })));
  }

  private static async insertEtiquetas(libroId: string, etiquetas: number[]) {
    await supabaseAdmin
      .from('libro_etiquetas')
      .insert(etiquetas.map(id_etiqueta => ({ id_libro: libroId, id_etiqueta })));
  }

  private static async insertValores(libroId: string, valores: number[]) {
    await supabaseAdmin
      .from('libro_valores')
      .insert(valores.map(id_valor => ({ id_libro: libroId, id_valor })));
  }
}