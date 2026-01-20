// ============================================
// src/core/domain/repositories/ILanguageRepository.ts
// Repository Interface: Language
// ============================================

import { Language } from '../entities/Language';

// DTOs
export interface CreateLanguageDTO {
  code: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
  isDefault?: boolean;
  isActive?: boolean;
  orderIndex?: number;
}

export interface UpdateLanguageDTO {
  name?: string;
  nativeName?: string;
  flagEmoji?: string;
  isDefault?: boolean;
  isActive?: boolean;
  orderIndex?: number;
}

// Repository Interface
export interface ILanguageRepository {
  findAll(includeInactive?: boolean): Promise<Language[]>;
  findByCode(code: string): Promise<Language | null>;
  findActive(): Promise<Language[]>;
  findDefault(): Promise<Language | null>;
  create(dto: CreateLanguageDTO): Promise<Language>;
  update(code: string, dto: UpdateLanguageDTO): Promise<Language>;
  delete(code: string): Promise<void>;
  activate(code: string): Promise<void>;
  deactivate(code: string): Promise<void>;
  setAsDefault(code: string): Promise<void>;
  reorder(languages: Array<{ code: string; orderIndex: number }>): Promise<void>;
}
