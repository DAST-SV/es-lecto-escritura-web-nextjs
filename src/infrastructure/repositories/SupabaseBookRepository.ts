/**
 * UBICACIÓN: src/infrastructure/repositories/SupabaseBookRepository.ts
 */

import { IBookRepository } from '../../core/domain/repositories/IBookRepository';
import { Book } from '../../core/domain/entities/Book.entity';
import { createClient } from "@/src/utils/supabase/server";
import { supabaseAdmin } from "@/src/utils/supabase/admin";
import { Page } from '@/src/typings/types-page-book';

export class SupabaseBookRepository implements IBookRepository {

  async save(book: Book): Promise<string> {
    try {
      console.log('📚 SupabaseBookRepository.save llamado');

      // Construir DTO para crear libro
      const createDTO = {
        userId: book.userId,
        title: book.metadata.titulo,
        nivel: book.metadata.selectedNivel || 1,
        autores: book.metadata.autores,
        personajes: book.metadata.personajes,
        categoria: book.metadata.selectedCategorias,
        genero: book.metadata.selectedGeneros,
        descripcion: book.metadata.descripcion,
        etiquetas: book.metadata.selectedEtiquetas,
        portada: book.metadata.portadaUrl || book.metadata.cardBackgroundUrl,
        valores: book.metadata.selectedValores,
      };

      // Llamar a la lógica de creación
      const libroId = await this.createBookWithPages(createDTO, book.pages);

      return libroId;
    } catch (error) {
      console.error('❌ Error en SupabaseBookRepository.save:', error);
      throw error;
    }
  }

  async update(book: Book): Promise<void> {
    try {
      console.log('📚 SupabaseBookRepository.update llamado');

      if (!book.id) {
        throw new Error('ID del libro es requerido para actualizar');
      }

      // Construir DTO para actualizar libro
      const updateDTO = {
        idLibro: book.id,
        titulo: book.metadata.titulo,
        descripcion: book.metadata.descripcion,
        portada: book.metadata.portadaUrl || book.metadata.cardBackgroundUrl,
        nivel: book.metadata.selectedNivel || 1,
        autores: book.metadata.autores,
        personajes: book.metadata.personajes,
        categoria: book.metadata.selectedCategorias,
        genero: book.metadata.selectedGeneros,
        etiquetas: book.metadata.selectedEtiquetas,
        valores: book.metadata.selectedValores,
      };

      // Llamar a la lógica de actualización
      await this.updateBookWithPages(updateDTO, book.pages);

    } catch (error) {
      console.error('❌ Error en SupabaseBookRepository.update:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Book | null> {
    try {
      const supabase = await createClient();

      const { data: libro, error } = await supabase
        .from("libros")
        .select("*")
        .eq("id_libro", id)
        .single();

      if (error || !libro) {
        return null;
      }

      // TODO: Implementar mapper completo si es necesario
      // Por ahora retornar null para no romper
      return null;
    } catch (error) {
      console.error('❌ Error en SupabaseBookRepository.findById:', error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<Book[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("libros")
        .select("*")
        .eq("id_usuario", userId);

      if (error) {
        throw error;
      }

      // TODO: Implementar mapper completo
      return [];
    } catch (error) {
      console.error('❌ Error en SupabaseBookRepository.findByUserId:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await supabaseAdmin
        .from("libros")
        .delete()
        .eq("id_libro", id);
    } catch (error) {
      console.error('❌ Error en SupabaseBookRepository.delete:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private async createBookWithPages(dto: any, pages: Page[]): Promise<string> {
    // 1. Crear libro
    const { data: libro, error: libroError } = await supabaseAdmin
      .from("libros")
      .insert([{
        id_usuario: dto.userId,
        id_tipo: 2,
        titulo: dto.title,
        portada: dto.portada ?? null,
        descripcion: dto.descripcion ?? null,
        id_nivel: dto.nivel,
      }])
      .select("id_libro")
      .single();

    if (libroError) throw libroError;
    const libroId = libro.id_libro;

    // 2. Crear autores
    await this.procesarAutores(libroId, dto.autores);

    // 3. Crear personajes
    if (dto.personajes?.length) {
      await this.procesarPersonajes(libroId, dto.personajes);
    }

    // 4. Insertar categorías
    if (dto.categoria?.length) {
      await supabaseAdmin
        .from("libro_categorias")
        .insert(dto.categoria.map((id_categoria: number) => ({
          id_libro: libroId,
          id_categoria,
        })));
    }

    // 5. Insertar géneros
    if (dto.genero?.length) {
      await supabaseAdmin
        .from("libro_generos")
        .insert(dto.genero.map((id_genero: number) => ({
          id_libro: libroId,
          id_genero,
        })));
    }

    // 6. Insertar etiquetas
    if (dto.etiquetas?.length) {
      await supabaseAdmin
        .from("libro_etiquetas")
        .insert(dto.etiquetas.map((id_etiqueta: number) => ({
          id_libro: libroId,
          id_etiqueta,
        })));
    }

    // 7. Insertar valores
    if (dto.valores?.length) {
      await supabaseAdmin
        .from("libro_valores")
        .insert(dto.valores.map((id_valor: number) => ({
          id_libro: libroId,
          id_valor,
        })));
    }

    // 8. Insertar páginas
    await this.insertarPaginas(libroId, pages);

    return libroId;
  }

  private async updateBookWithPages(dto: any, pages: Page[]): Promise<void> {
    const { idLibro } = dto;

    // Validar que haya páginas
    if (!pages || pages.length === 0) {
      throw new Error('Debe haber al menos una página');
    }

    // 1. Actualizar datos básicos
    const updateData: any = {};
    if (dto.titulo != null) updateData.titulo = dto.titulo;
    if (dto.portada != null) updateData.portada = dto.portada;
    if (dto.descripcion != null) updateData.descripcion = dto.descripcion;
    if (dto.nivel != null) updateData.id_nivel = dto.nivel;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabaseAdmin
        .from('libros')
        .update(updateData)
        .eq('id_libro', idLibro);

      if (error) throw error;
    }

    // 2. Reemplazar autores
    if (dto.autores?.length) {
      await this.reemplazarAutores(idLibro, dto.autores);
    }

    // 3. Reemplazar personajes
    if (dto.personajes?.length) {
      await this.reemplazarPersonajes(idLibro, dto.personajes);
    }

    // 4. Reemplazar categorías
    if (dto.categoria?.length) {
      await supabaseAdmin.from('libro_categorias').delete().eq('id_libro', idLibro);
      await supabaseAdmin
        .from('libro_categorias')
        .insert(dto.categoria.map((id_categoria: number) => ({ 
          id_libro: idLibro, 
          id_categoria 
        })));
    }

    // 5. Reemplazar géneros
    if (dto.genero?.length) {
      await supabaseAdmin.from('libro_generos').delete().eq('id_libro', idLibro);
      await supabaseAdmin
        .from('libro_generos')
        .insert(dto.genero.map((id_genero: number) => ({ 
          id_libro: idLibro, 
          id_genero 
        })));
    }

    // 6. Reemplazar etiquetas
    if (dto.etiquetas?.length) {
      await supabaseAdmin.from('libro_etiquetas').delete().eq('id_libro', idLibro);
      await supabaseAdmin
        .from('libro_etiquetas')
        .insert(dto.etiquetas.map((id_etiqueta: number) => ({ 
          id_libro: idLibro, 
          id_etiqueta 
        })));
    }

    // 7. Reemplazar valores
    if (dto.valores?.length) {
      await supabaseAdmin.from('libro_valores').delete().eq('id_libro', idLibro);
      await supabaseAdmin
        .from('libro_valores')
        .insert(dto.valores.map((id_valor: number) => ({ 
          id_libro: idLibro, 
          id_valor 
        })));
    }

    // 8. Reemplazar páginas
    await this.reemplazarPaginas(idLibro, pages);
  }

  private async procesarAutores(libroId: string, autores: string[]) {
    const autoresIds: string[] = [];

    for (const nombreAutor of autores) {
      const nombreLimpio = nombreAutor.trim();
      if (!nombreLimpio) continue;

      const { data: nuevoAutor, error } = await supabaseAdmin
        .from("autores")
        .insert({ nombre: nombreLimpio })
        .select("id_autor")
        .single();

      if (error) throw error;
      autoresIds.push(nuevoAutor.id_autor);
    }

    if (autoresIds.length > 0) {
      const vinculaciones = autoresIds.map(idAutor => ({
        id_libro: libroId,
        id_autor: idAutor,
      }));

      await supabaseAdmin.from("libros_autores").insert(vinculaciones);
    }
  }

  private async procesarPersonajes(libroId: string, personajes: string[]) {
    const personajesIds: string[] = [];

    for (const nombrePersonaje of personajes) {
      const nombreLimpio = nombrePersonaje.trim();
      if (!nombreLimpio) continue;

      const { data: nuevoPersonaje, error } = await supabaseAdmin
        .from("personajes")
        .insert({ nombre: nombreLimpio })
        .select("id_personaje")
        .single();

      if (error) throw error;
      personajesIds.push(nuevoPersonaje.id_personaje);
    }

    if (personajesIds.length > 0) {
      const vinculaciones = personajesIds.map(idPersonaje => ({
        id_libro: libroId,
        id_personaje: idPersonaje,
      }));

      await supabaseAdmin.from("libros_personajes").insert(vinculaciones);
    }
  }

  private async reemplazarAutores(libroId: string, autores: string[]) {
    const { data: autoresActuales } = await supabaseAdmin
      .from("libros_autores")
      .select("id_autor, autores(nombre)")
      .eq("id_libro", libroId);

    const autoresActualesMap = new Map<string, string>();
    const idsActuales = new Set<string>();

    (autoresActuales || []).forEach((item: any) => {
      const nombreActual = item.autores?.nombre?.toLowerCase().trim();
      if (nombreActual) {
        autoresActualesMap.set(nombreActual, item.id_autor);
        idsActuales.add(item.id_autor);
      }
    });

    const autoresIdsFinales: string[] = [];
    const autoresAMantener = new Set<string>();

    for (const nombreAutor of autores) {
      const nombreLimpio = nombreAutor.trim();
      if (!nombreLimpio) continue;

      const nombreNormalizado = nombreLimpio.toLowerCase();

      if (autoresActualesMap.has(nombreNormalizado)) {
        const idExistente = autoresActualesMap.get(nombreNormalizado)!;
        autoresIdsFinales.push(idExistente);
        autoresAMantener.add(idExistente);
      } else {
        const { data: nuevoAutor, error } = await supabaseAdmin
          .from("autores")
          .insert({ nombre: nombreLimpio })
          .select("id_autor")
          .single();

        if (error || !nuevoAutor) continue;
        autoresIdsFinales.push(nuevoAutor.id_autor);
      }
    }

    const autoresAEliminar = Array.from(idsActuales).filter(
      id => !autoresAMantener.has(id)
    );

    if (autoresAEliminar.length > 0) {
      await supabaseAdmin
        .from("libros_autores")
        .delete()
        .eq("id_libro", libroId)
        .in("id_autor", autoresAEliminar);
    }

    const autoresNuevos = autoresIdsFinales.filter(
      id => !idsActuales.has(id)
    );

    if (autoresNuevos.length > 0) {
      await supabaseAdmin
        .from("libros_autores")
        .insert(autoresNuevos.map(idAutor => ({
          id_libro: libroId,
          id_autor: idAutor,
        })));
    }
  }

  private async reemplazarPersonajes(libroId: string, personajes: string[]) {
    const { data: personajesActuales } = await supabaseAdmin
      .from("libros_personajes")
      .select("id_personaje, personajes(nombre)")
      .eq("id_libro", libroId);

    const personajesActualesMap = new Map<string, string>();
    const idsActuales = new Set<string>();

    (personajesActuales || []).forEach((item: any) => {
      const nombreActual = item.personajes?.nombre?.toLowerCase().trim();
      if (nombreActual) {
        personajesActualesMap.set(nombreActual, item.id_personaje);
        idsActuales.add(item.id_personaje);
      }
    });

    const personajesIdsFinales: string[] = [];
    const personajesAMantener = new Set<string>();

    for (const nombrePersonaje of personajes) {
      const nombreLimpio = nombrePersonaje.trim();
      if (!nombreLimpio) continue;

      const nombreNormalizado = nombreLimpio.toLowerCase();

      if (personajesActualesMap.has(nombreNormalizado)) {
        const idExistente = personajesActualesMap.get(nombreNormalizado)!;
        personajesIdsFinales.push(idExistente);
        personajesAMantener.add(idExistente);
      } else {
        const { data: nuevoPersonaje, error } = await supabaseAdmin
          .from("personajes")
          .insert({ nombre: nombreLimpio })
          .select("id_personaje")
          .single();

        if (error || !nuevoPersonaje) continue;
        personajesIdsFinales.push(nuevoPersonaje.id_personaje);
      }
    }

    const personajesAEliminar = Array.from(idsActuales).filter(
      id => !personajesAMantener.has(id)
    );

    if (personajesAEliminar.length > 0) {
      await supabaseAdmin
        .from("libros_personajes")
        .delete()
        .eq("id_libro", libroId)
        .in("id_personaje", personajesAEliminar);
    }

    const personajesNuevos = personajesIdsFinales.filter(
      id => !idsActuales.has(id)
    );

    if (personajesNuevos.length > 0) {
      await supabaseAdmin
        .from("libros_personajes")
        .insert(personajesNuevos.map(idPersonaje => ({
          id_libro: libroId,
          id_personaje: idPersonaje,
        })));
    }
  }

  private async insertarPaginas(libroId: string, pages: Page[]) {
    const paginasToInsert = pages.map((p, idx) => ({
      id_libro: libroId,
      layout: p.layout || "default",
      animation: p.animation || null,
      title: p.title || null,
      text: p.text || null,
      image: p.image || null,
      audio: p.audio || null,
      interactive_game: p.interactiveGame || null,
      items: p.items || [],
      background: p.background || null,
      border: p.border || null,
      numero_pagina: idx + 1,
    }));

    const { error } = await supabaseAdmin
      .from("paginas_libro")
      .insert(paginasToInsert);

    if (error) throw error;
  }

  private async reemplazarPaginas(libroId: string, pages: Page[]) {
    // Eliminar páginas existentes
    await supabaseAdmin
      .from("paginas_libro")
      .delete()
      .eq("id_libro", libroId);

    // Insertar nuevas páginas
    await this.insertarPaginas(libroId, pages);
  }
}