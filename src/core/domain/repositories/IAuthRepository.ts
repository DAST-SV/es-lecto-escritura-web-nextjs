// ============================================
// src/core/domain/repositories/IAuthRepository.ts
// ============================================

import { User } from '../entities/User';

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}