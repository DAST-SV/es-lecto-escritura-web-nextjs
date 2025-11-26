/**
 * ============================================
 * ARCHIVO: src/core/domain/entities/database/index.ts
 * Entidades que mapean EXACTAMENTE la base de datos
 * ============================================
 */

// ============================================
// 1. LIBROS
// ============================================

/**
 * Tabla: libros
 */
export interface LibroEntity {
  id_libro: string;
  id_usuario: string | null;
  id_tipo: number;
  id_nivel: number | null;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  fecha_creacion: Date;
}

/**
 * Tabla: tipos_de_libro
 */
export interface TipoLibroEntity {
  id_tipo: number;
  nombre: string; // 'oficial' | 'usuario'
}

/**
 * Tabla: niveles
 */
export interface NivelEntity {
  id_nivel: number;
  nombre: string; // '0-3 años', '4-6 años', etc.
}

// ============================================
// 2. PÁGINAS
// ============================================

/**
 * Tabla: paginas_libro
 */
export interface PaginaLibroEntity {
  id_pagina: string;
  id_libro: string;
  numero_pagina: number;
  layout: string;
  animation: string | null;
  title: string | null;
  text: string | null;
  image: string | null;
  audio: string | null;
  interactive_game: string | null;
  items: string[] | null;
  background: string | null;
  border: string | null;
}

// ============================================
// 3. METADATA (Autores, Personajes, etc.)
// ============================================

/**
 * Tabla: autores
 */
export interface AutorEntity {
  id_autor: string;
  nombre: string;
  fecha_creacion: Date;
}

/**
 * Tabla: libros_autores (relación N:M)
 */
export interface LibroAutorEntity {
  id_libro: string;
  id_autor: string;
}

/**
 * Tabla: personajes
 */
export interface PersonajeEntity {
  id_personaje: string;
  nombre: string;
  fecha_creacion: Date;
}

/**
 * Tabla: libros_personajes (relación N:M)
 */
export interface LibroPersonajeEntity {
  id_libro: string;
  id_personaje: string;
}

// ============================================
// 4. CLASIFICACIÓN
// ============================================

/**
 * Tabla: categorias
 */
export interface CategoriaEntity {
  id_categoria: number;
  nombre: string;
}

/**
 * Tabla: libro_categorias
 */
export interface LibroCategoriaEntity {
  id_libro: string;
  id_categoria: number;
  es_principal: boolean;
}

/**
 * Tabla: generos
 */
export interface GeneroEntity {
  id_genero: number;
  nombre: string;
}

/**
 * Tabla: libro_generos
 */
export interface LibroGeneroEntity {
  id_libro: string;
  id_genero: number;
}

/**
 * Tabla: valores
 */
export interface ValorEntity {
  id_valor: number;
  nombre: string;
}

/**
 * Tabla: libro_valores
 */
export interface LibroValorEntity {
  id_libro: string;
  id_valor: number;
  es_principal: boolean;
}

/**
 * Tabla: etiquetas
 */
export interface EtiquetaEntity {
  id_etiqueta: number;
  nombre: string;
}

/**
 * Tabla: libro_etiquetas
 */
export interface LibroEtiquetaEntity {
  id_libro: string;
  id_etiqueta: number;
  es_principal: boolean;
}

/**
 * Tabla: idiomas
 */
export interface IdiomaEntity {
  id_idioma: number;
  codigo_iso: string;
  nombre: string;
}

/**
 * Tabla: libro_idiomas
 */
export interface LibroIdiomaEntity {
  id_libro: string;
  id_idioma: number;
}

// ============================================
// 5. CONSULTAS COMPLEJAS (JOINs comunes)
// ============================================

/**
 * Libro completo con todas sus relaciones
 * (resultado de múltiples JOINs)
 */
export interface LibroCompletoEntity extends LibroEntity {
  tipo: TipoLibroEntity;
  nivel: NivelEntity | null;
  autores: AutorEntity[];
  personajes: PersonajeEntity[];
  categorias: CategoriaEntity[];
  generos: GeneroEntity[];
  valores: ValorEntity[];
  etiquetas: EtiquetaEntity[];
  idiomas: IdiomaEntity[];
  paginas: PaginaLibroEntity[];
}

/**
 * Vista simplificada para listados
 */
export interface LibroListItemEntity {
  id_libro: string;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  autores: string[]; // nombres concatenados
  fecha_creacion: Date;
  nivel_nombre: string | null;
  categorias: string[]; // nombres concatenados
}

// ============================================
// 6. DTOs PARA CREACIÓN/ACTUALIZACIÓN
// ============================================

/**
 * Datos para crear un libro completo
 */
export interface CreateLibroDTO {
  id_usuario: string;
  titulo: string;
  descripcion: string;
  portada?: string;
  nivel: number;
  autores: string[]; // nombres simples
  personajes: string[];
  categorias: number[]; // IDs
  generos: number[];
  etiquetas: number[];
  valores: number[];
  paginas: CreatePaginaDTO[];
}

/**
 * Datos para crear una página
 */
export interface CreatePaginaDTO {
  numero_pagina: number;
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
  animation?: string;
  audio?: string;
  interactive_game?: string;
  items?: string[];
  border?: string;
}

/**
 * Datos para actualizar un libro
 */
export interface UpdateLibroDTO extends Omit<CreateLibroDTO, 'id_usuario'> {
  id_libro: string;
}

// ============================================
// 7. TYPES GUARDS (Validación de tipos)
// ============================================

export function isLibroEntity(obj: any): obj is LibroEntity {
  return (
    typeof obj === 'object' &&
    typeof obj.id_libro === 'string' &&
    typeof obj.titulo === 'string'
  );
}

export function isPaginaLibroEntity(obj: any): obj is PaginaLibroEntity {
  return (
    typeof obj === 'object' &&
    typeof obj.id_pagina === 'string' &&
    typeof obj.id_libro === 'string' &&
    typeof obj.numero_pagina === 'number' &&
    typeof obj.layout === 'string'
  );
}

// ============================================
// 8. MAPPERS (Conversión entre entidades y DTOs)
// ============================================

/**
 * Convierte LibroCompletoEntity → Formato para editor
 */
export function mapLibroEntityToEditor(libro: LibroCompletoEntity) {
  return {
    id: libro.id_libro,
    titulo: libro.titulo,
    descripcion: libro.descripcion || '',
    portada: libro.portada,
    autores: libro.autores.map(a => a.nombre),
    personajes: libro.personajes.map(p => p.nombre),
    categorias: libro.categorias.map(c => c.id_categoria),
    generos: libro.generos.map(g => g.id_genero),
    etiquetas: libro.etiquetas.map(e => e.id_etiqueta),
    valores: libro.valores.map(v => v.id_valor),
    nivel: libro.id_nivel,
    pages: libro.paginas
      .sort((a, b) => a.numero_pagina - b.numero_pagina)
      .map(p => ({
        id: p.id_pagina,
        layout: p.layout,
        title: p.title || '',
        text: p.text || '',
        image: p.image || null,
        background: p.background || null,
        animation: p.animation,
        audio: p.audio,
        interactiveGame: p.interactive_game,
        items: p.items || [],
        border: p.border,
      })),
  };
}

/**
 * Convierte CreateLibroDTO → Formato para BookRepository
 */
export function mapCreateDTOToRepository(dto: CreateLibroDTO) {
  return {
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    portada: dto.portada || null,
    autores: dto.autores,
    personajes: dto.personajes,
    categorias: dto.categorias,
    generos: dto.generos,
    etiquetas: dto.etiquetas,
    valores: dto.valores,
    nivel: dto.nivel,
    pages: dto.paginas.map(p => ({
      layout: p.layout,
      title: p.title,
      text: p.text,
      image: p.image,
      background: p.background,
    })),
  };
}