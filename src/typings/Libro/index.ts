// types/libro.types.ts
export interface Libro {
  id_libro: string;
  id_tipo : string;
  id_usuario: string;
  titulo: string;
  descripcion?: string;
  portada?: string;
  fecha_creacion: string;
}