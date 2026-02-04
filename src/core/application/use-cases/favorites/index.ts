// ============================================
// src/core/application/use-cases/favorites/index.ts
// Casos de uso para favoritos
// ============================================

import { FavoriteRepository } from '@/src/infrastructure/repositories/favorites/FavoriteRepository';
import { FavoriteEntity } from '@/src/core/domain/entities/FavoriteEntity';
import { CreateFavoriteDTO } from '@/src/core/domain/repositories/IFavoriteRepository';

const repository = new FavoriteRepository();

export async function getAllFavorites(): Promise<FavoriteEntity[]> {
  return repository.findAll();
}

export async function getFavoriteById(id: string): Promise<FavoriteEntity | null> {
  return repository.findById(id);
}

export async function getFavoritesByBook(bookId: string): Promise<FavoriteEntity[]> {
  return repository.findByBookId(bookId);
}

export async function getFavoritesByUser(userId: string): Promise<FavoriteEntity[]> {
  return repository.findByUserId(userId);
}

export async function checkIsFavorite(bookId: string, userId: string): Promise<boolean> {
  return repository.isFavorite(bookId, userId);
}

export async function addToFavorites(data: CreateFavoriteDTO): Promise<FavoriteEntity> {
  return repository.create(data);
}

export async function toggleFavorite(bookId: string, userId: string): Promise<boolean> {
  return repository.toggle(bookId, userId);
}

export async function removeFavorite(id: string): Promise<void> {
  return repository.delete(id);
}

export async function removeFromFavorites(bookId: string, userId: string): Promise<void> {
  return repository.deleteByBookAndUser(bookId, userId);
}
