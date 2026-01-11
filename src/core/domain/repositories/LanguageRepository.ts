// ============================================
// src/core/domain/repositories/LanguageRepository.ts
// Repositorio: Idiomas
// ============================================

import { Language } from '../entities/Language';

export interface CreateLanguageDTO {
  code: string;
  name: string;
  nativeName: string | null;
  flagEmoji: string | null;
  isDefault: boolean;
  orderIndex: number;
}

export interface UpdateLanguageDTO {
  name?: string;
  nativeName?: string | null;
  flagEmoji?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  orderIndex?: number;
}

export interface LanguageRepository {
  findAll(): Promise<Language[]>;
  findByCode(code: string): Promise<Language | null>;
  create(dto: CreateLanguageDTO): Promise<Language>;
  update(code: string, dto: UpdateLanguageDTO): Promise<Language>;
  delete(code: string): Promise<void>;
  setAsDefault(code: string): Promise<void>;
}