/**
 * ============================================
 * INTERFAZ: IBookCollaboratorRepository
 * Repositorio para colaboradores de libros
 * ============================================
 */

import { BookCollaborator } from '../entities/BookCollaborator';
import { CollaboratorRole, BookCollaboratorData } from '../types';

export interface AddCollaboratorDTO {
  bookId: string;
  userId: string;
  role: CollaboratorRole;
  displayOrder?: number;
  isPrimary?: boolean;
  contributionDescription?: string;
  revenueSharePercentage?: number;
  addedBy?: string;
}

export interface UpdateCollaboratorDTO {
  role?: CollaboratorRole;
  displayOrder?: number;
  isPrimary?: boolean;
  contributionDescription?: string;
  revenueSharePercentage?: number;
}

export interface UserSearchResult {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isAuthor: boolean;
  authorUsername?: string;
}

export interface IBookCollaboratorRepository {
  // CRUD
  findByBookId(bookId: string): Promise<BookCollaborator[]>;
  findByUserId(userId: string): Promise<BookCollaborator[]>;
  findById(id: string): Promise<BookCollaborator | null>;
  add(dto: AddCollaboratorDTO): Promise<BookCollaborator>;
  update(id: string, dto: UpdateCollaboratorDTO): Promise<BookCollaborator>;
  remove(id: string): Promise<void>;
  removeByBookAndUser(bookId: string, userId: string): Promise<void>;

  // Operaciones en lote
  replaceCollaborators(bookId: string, collaborators: AddCollaboratorDTO[]): Promise<BookCollaborator[]>;
  reorderCollaborators(bookId: string, collaboratorIds: string[]): Promise<void>;

  // Consultas
  getPrimaryAuthor(bookId: string): Promise<BookCollaborator | null>;
  getAuthors(bookId: string): Promise<BookCollaborator[]>;
  isUserCollaborator(bookId: string, userId: string): Promise<boolean>;
  getUserRole(bookId: string, userId: string): Promise<CollaboratorRole | null>;

  // Búsqueda de usuarios
  searchUsers(query: string, limit?: number): Promise<UserSearchResult[]>;
  searchUsersExcludingBook(query: string, bookId: string, limit?: number): Promise<UserSearchResult[]>;

  // Estadísticas
  getCollaboratorBooksCount(userId: string): Promise<number>;
  getCollaboratorsByRole(bookId: string, role: CollaboratorRole): Promise<BookCollaborator[]>;
}
