// ============================================
// src/core/domain/repositories/IFavoriteRepository.ts
// Interface del repositorio de favoritos
// ============================================

import { FavoriteEntity } from '../entities/FavoriteEntity';

export interface CreateFavoriteDTO {
  bookId: string;
  userId: string;
}

export interface IFavoriteRepository {
  findAll(): Promise<FavoriteEntity[]>;
  findById(id: string): Promise<FavoriteEntity | null>;
  findByBookId(bookId: string): Promise<FavoriteEntity[]>;
  findByUserId(userId: string): Promise<FavoriteEntity[]>;
  findByBookAndUser(bookId: string, userId: string): Promise<FavoriteEntity | null>;
  isFavorite(bookId: string, userId: string): Promise<boolean>;
  create(data: CreateFavoriteDTO): Promise<FavoriteEntity>;
  toggle(bookId: string, userId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  deleteByBookAndUser(bookId: string, userId: string): Promise<void>;
}
