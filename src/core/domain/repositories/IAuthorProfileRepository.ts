/**
 * ============================================
 * INTERFAZ: IAuthorProfileRepository
 * Repositorio para perfiles de autor y seguidores
 * ============================================
 */

import { AuthorProfile } from '../entities/AuthorProfile';
import { AuthorProfileData, SocialLinks } from '../types';

export interface CreateAuthorProfileDTO {
  userId: string;
  username: string;
  authorBio?: string;
  shortBio?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
  isPublic?: boolean;
  isAcceptingCollaborations?: boolean;
}

export interface UpdateAuthorProfileDTO {
  username?: string;
  authorBio?: string;
  shortBio?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
  isPublic?: boolean;
  isAcceptingCollaborations?: boolean;
}

export interface AuthorSearchFilters {
  searchTerm?: string;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}

export interface IAuthorProfileRepository {
  // CRUD
  findByUserId(userId: string): Promise<AuthorProfile | null>;
  findByUsername(username: string): Promise<AuthorProfile | null>;
  findAll(filters?: AuthorSearchFilters): Promise<AuthorProfile[]>;
  create(dto: CreateAuthorProfileDTO): Promise<AuthorProfile>;
  update(userId: string, dto: UpdateAuthorProfileDTO): Promise<AuthorProfile>;
  delete(userId: string): Promise<void>;

  // Verificación
  verifyAuthor(userId: string, verifiedBy: string): Promise<void>;
  unverifyAuthor(userId: string): Promise<void>;

  // Seguidores
  follow(authorId: string, followerId: string): Promise<void>;
  unfollow(authorId: string, followerId: string): Promise<void>;
  isFollowing(authorId: string, followerId: string): Promise<boolean>;
  getFollowers(authorId: string, limit?: number, offset?: number): Promise<string[]>;
  getFollowersCount(authorId: string): Promise<number>;
  getFollowing(userId: string, limit?: number, offset?: number): Promise<AuthorProfile[]>;
  getFollowingCount(userId: string): Promise<number>;

  // Estadísticas
  incrementViews(userId: string, count?: number): Promise<void>;
  updateBookCount(userId: string): Promise<void>;
  updateAverageRating(userId: string): Promise<void>;

  // Búsqueda
  searchAuthors(searchTerm: string, limit?: number): Promise<AuthorProfile[]>;
  getPopularAuthors(limit?: number): Promise<AuthorProfile[]>;
  getRecentAuthors(limit?: number): Promise<AuthorProfile[]>;

  // Validación
  isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean>;
}
