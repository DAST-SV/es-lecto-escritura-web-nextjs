/**
 * UBICACIÓN: src/infrastructure/repositories/SupabaseBookRepository.ts
 */

import { IBookRepository } from '../../core/domain/repositories/IBookRepository';
import { Book } from '../../core/domain/entities/Book.entity';
import { BookMapper } from '../mappers/BookMapper';

export class SupabaseBookRepository implements IBookRepository {
  
  async save(book: Book): Promise<string> {
    try {
      const dto = BookMapper.toDTO(book);
      
      const response = await fetch('/api/libros/createbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      const data = await response.json();
      
      if (!data.libroId) {
        throw new Error(data.error || 'Error al guardar libro');
      }

      return data.libroId;
    } catch (error) {
      console.error('Error en SupabaseBookRepository.save:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Book | null> {
    try {
      const response = await fetch(`/api/libros/${id}`);
      const data = await response.json();

      if (!data.libro) {
        return null;
      }

      return BookMapper.toDomain(data.libro);
    } catch (error) {
      console.error('Error en SupabaseBookRepository.findById:', error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<Book[]> {
    try {
      const response = await fetch(`/api/libros/bookinformation/${userId}`);
      const data = await response.json();

      if (!data.libros) {
        return [];
      }

      return BookMapper.toDomainList(data.libros);
    } catch (error) {
      console.error('Error en SupabaseBookRepository.findByUserId:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch('/api/libros/deletebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LibroId: id }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar libro');
      }
    } catch (error) {
      console.error('Error en SupabaseBookRepository.delete:', error);
      throw error;
    }
  }

  async update(book: Book): Promise<void> {
    try {
      const dto = BookMapper.toDTO(book);
      
      const response = await fetch('/api/libros/updatebook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar libro');
      }
    } catch (error) {
      console.error('Error en SupabaseBookRepository.update:', error);
      throw error;
    }
  }
}