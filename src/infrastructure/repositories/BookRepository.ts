import { supabaseAdmin } from '@/src/utils/supabase/admin';

interface PageData {
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
}

interface BookData {
  titulo: string;
  descripcion: string;
  portada?: string;
  autores: string[];
  personajes: string[];
  categorias: number[];
  generos: number[];
  etiquetas: number[];
  valores: number[];
  nivel: number;
  pages: PageData[];
}

export class BookRepository {
  
  static async create(userId: string, bookData: BookData): Promise<string> {
    console.log('📝 Creando libro nuevo...');

    const { data: libro, error: libroError } = await supabaseAdmin
      .from('libros')
      .insert({
        id_usuario: userId,
        id_tipo: 2,
        titulo: bookData.titulo,
        descripcion: bookData.descripcion,
        portada: bookData.portada || null,
        id_nivel: bookData.nivel,
      })
      .select('id_libro')
      .single();

    if (libroError) {
      console.error('❌ Error creando libro:', libroError);
      throw libroError;
    }

    const libroId = libro.id_libro;
    console.log('✅ Libro creado con ID:', libroId);

    await Promise.all([
      this.saveAutores(libroId, bookData.autores),
      this.savePersonajes(libroId, bookData.personajes),
      this.saveCategorias(libroId, bookData.categorias),
      this.saveGeneros(libroId, bookData.generos),
      this.saveEtiquetas(libroId, bookData.etiquetas),
      this.saveValores(libroId, bookData.valores),
      this.savePages(libroId, bookData.pages),
    ]);

    console.log('✅ Libro completo guardado');
    return libroId;
  }

  static async update(libroId: string, bookData: BookData): Promise<void> {
    console.log('✏️ Actualizando libro:', libroId);

    const { error: updateError } = await supabaseAdmin
      .from('libros')
      .update({
        titulo: bookData.titulo,
        descripcion: bookData.descripcion,
        portada: bookData.portada || null,
        id_nivel: bookData.nivel,
      })
      .eq('id_libro', libroId);

    if (updateError) {
      console.error('❌ Error actualizando libro:', updateError);
      throw updateError;
    }

    await Promise.all([
      this.replaceAutores(libroId, bookData.autores),
      this.replacePersonajes(libroId, bookData.personajes),
      this.replaceCategorias(libroId, bookData.categorias),
      this.replaceGeneros(libroId, bookData.generos),
      this.replaceEtiquetas(libroId, bookData.etiquetas),
      this.replaceValores(libroId, bookData.valores),
      this.replacePages(libroId, bookData.pages),
    ]);

    console.log('✅ Libro actualizado correctamente');
  }

  static async getComplete(libroId: string): Promise<any> {
    console.log('📖 Obteniendo libro:', libroId);

    const { data: libro, error } = await supabaseAdmin
      .from('libros')
      .select('*')
      .eq('id_libro', libroId)
      .single();

    if (error || !libro) {
      console.error('❌ Libro no encontrado');
      return null;
    }

    const [autores, personajes, categorias, generos, valores, etiquetas, nivel, paginas] = 
      await Promise.all([
        this.getAutores(libroId),
        this.getPersonajes(libroId),
        this.getCategorias(libroId),
        this.getGeneros(libroId),
        this.getValores(libroId),
        this.getEtiquetas(libroId),
        this.getNivel(libro.id_nivel),
        this.getPages(libroId),
      ]);

    const libroCompleto = {
      id_libro: libro.id_libro,
      titulo: libro.titulo,
      descripcion: libro.descripcion,
      portada: libro.portada,
      autores,
      personajes,
      categorias,
      generos,
      valores,
      etiquetas,
      nivel,
      paginas,
      fecha_creacion: libro.fecha_creacion,
    };

    console.log('✅ Libro obtenido con', paginas.length, 'páginas');
    return libroCompleto;
  }

  static async findByUserId(userId: string): Promise<any[]> {
    console.log('📚 Obteniendo libros del usuario:', userId);

    const { data: libros, error } = await supabaseAdmin
      .from('libros')
      .select('id_libro, titulo, descripcion, portada, fecha_creacion')
      .eq('id_usuario', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo libros:', error);
      throw error;
    }

    const librosConAutores = await Promise.all(
      (libros || []).map(async (libro) => {
        const autores = await this.getAutores(libro.id_libro);
        return {
          ...libro,
          autores,
        };
      })
    );

    console.log('✅ Libros obtenidos:', librosConAutores.length);
    return librosConAutores;
  }

  static async delete(libroId: string): Promise<void> {
    console.log('🗑️ Eliminando libro:', libroId);

    const { error } = await supabaseAdmin
      .from('libros')
      .delete()
      .eq('id_libro', libroId);

    if (error) {
      console.error('❌ Error eliminando libro:', error);
      throw error;
    }

    console.log('✅ Libro eliminado');
  }

  private static async saveAutores(libroId: string, autores: string[]): Promise<void> {
    if (!autores.length) return;

    const autoresIds = await Promise.all(
      autores.map(async (nombre) => {
        const { data } = await supabaseAdmin
          .from('autores')
          .insert({ nombre: nombre.trim() })
          .select('id_autor')
          .single();
        return data?.id_autor;
      })
    );

    await supabaseAdmin
      .from('libros_autores')
      .insert(
        autoresIds.filter(Boolean).map(id_autor => ({ id_libro: libroId, id_autor }))
      );
  }

  private static async replaceAutores(libroId: string, autores: string[]): Promise<void> {
    await supabaseAdmin.from('libros_autores').delete().eq('id_libro', libroId);
    await this.saveAutores(libroId, autores);
  }

  private static async getAutores(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('libros_autores')
      .select('autores(nombre)')
      .eq('id_libro', libroId);
    
    return data?.map((item: any) => item.autores.nombre).filter(Boolean) || [];
  }

  private static async savePersonajes(libroId: string, personajes: string[]): Promise<void> {
    if (!personajes.length) return;

    const personajesIds = await Promise.all(
      personajes.map(async (nombre) => {
        const { data } = await supabaseAdmin
          .from('personajes')
          .insert({ nombre: nombre.trim() })
          .select('id_personaje')
          .single();
        return data?.id_personaje;
      })
    );

    await supabaseAdmin
      .from('libros_personajes')
      .insert(
        personajesIds.filter(Boolean).map(id_personaje => ({ id_libro: libroId, id_personaje }))
      );
  }

  private static async replacePersonajes(libroId: string, personajes: string[]): Promise<void> {
    await supabaseAdmin.from('libros_personajes').delete().eq('id_libro', libroId);
    await this.savePersonajes(libroId, personajes);
  }

  private static async getPersonajes(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('libros_personajes')
      .select('personajes(nombre)')
      .eq('id_libro', libroId);
    
    return data?.map((item: any) => item.personajes.nombre).filter(Boolean) || [];
  }

  private static async saveCategorias(libroId: string, categorias: number[]): Promise<void> {
    if (!categorias.length) return;
    await supabaseAdmin
      .from('libro_categorias')
      .insert(categorias.map(id_categoria => ({ id_libro: libroId, id_categoria })));
  }

  private static async replaceCategorias(libroId: string, categorias: number[]): Promise<void> {
    await supabaseAdmin.from('libro_categorias').delete().eq('id_libro', libroId);
    await this.saveCategorias(libroId, categorias);
  }

  private static async getCategorias(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('libro_categorias')
      .select('categorias(nombre)')
      .eq('id_libro', libroId);
    
    return data?.map((item: any) => item.categorias.nombre).filter(Boolean) || [];
  }

  private static async saveGeneros(libroId: string, generos: number[]): Promise<void> {
    if (!generos.length) return;
    await supabaseAdmin
      .from('libro_generos')
      .insert(generos.map(id_genero => ({ id_libro: libroId, id_genero })));
  }

  private static async replaceGeneros(libroId: string, generos: number[]): Promise<void> {
    await supabaseAdmin.from('libro_generos').delete().eq('id_libro', libroId);
    await this.saveGeneros(libroId, generos);
  }

  private static async getGeneros(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('libro_generos')
      .select('generos(nombre)')
      .eq('id_libro', libroId);
    
    return data?.map((item: any) => item.generos.nombre).filter(Boolean) || [];
  }

  private static async saveEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    if (!etiquetas.length) return;
    await supabaseAdmin
      .from('libro_etiquetas')
      .insert(etiquetas.map(id_etiqueta => ({ id_libro: libroId, id_etiqueta })));
  }

  private static async replaceEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    await supabaseAdmin.from('libro_etiquetas').delete().eq('id_libro', libroId);
    await this.saveEtiquetas(libroId, etiquetas);
  }

  private static async getEtiquetas(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('libro_etiquetas')
      .select('etiquetas(nombre)')
      .eq('id_libro', libroId);
    
    return data?.map((item: any) => item.etiquetas.nombre).filter(Boolean) || [];
  }

  private static async saveValores(libroId: string, valores: number[]): Promise<void> {
    if (!valores.length) return;
    await supabaseAdmin
      .from('libro_valores')
      .insert(valores.map(id_valor => ({ id_libro: libroId, id_valor })));
  }

  private static async replaceValores(libroId: string, valores: number[]): Promise<void> {
    await supabaseAdmin.from('libro_valores').delete().eq('id_libro', libroId);
    await this.saveValores(libroId, valores);
  }

  private static async getValores(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('libro_valores')
      .select('valores(nombre)')
      .eq('id_libro', libroId);
    
    return data?.map((item: any) => item.valores.nombre).filter(Boolean) || [];
  }

  private static async getNivel(idNivel: number): Promise<any> {
    if (!idNivel) return null;
    
    const { data } = await supabaseAdmin
      .from('niveles')
      .select('*')
      .eq('id_nivel', idNivel)
      .single();
    
    return data || null;
  }

  private static async savePages(libroId: string, pages: PageData[]): Promise<void> {
    if (!pages.length) return;

    const paginasToInsert = pages.map((p, idx) => ({
      id_libro: libroId,
      numero_pagina: idx + 1,
      layout: p.layout,
      title: p.title || null,
      text: p.text || null,
      image: p.image || null,
      background: p.background || null,
      animation: null,
      audio: null,
      interactive_game: null,
      items: null,
      border: null,
    }));

    await supabaseAdmin.from('paginas_libro').insert(paginasToInsert);
  }

  private static async replacePages(libroId: string, pages: PageData[]): Promise<void> {
    await supabaseAdmin.from('paginas_libro').delete().eq('id_libro', libroId);
    await this.savePages(libroId, pages);
  }

  private static async getPages(libroId: string): Promise<any[]> {
    const { data } = await supabaseAdmin
      .from('paginas_libro')
      .select('*')
      .eq('id_libro', libroId)
      .order('numero_pagina');

    return data || [];
  }
}