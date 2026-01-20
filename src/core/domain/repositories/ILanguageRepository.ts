// src/core/domain/repositories/ILanguageRepository.ts

import { Language } from '../entities/Language';

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

export interface ILanguageRepository {
  findAll(includeInactive?: boolean): Promise<Language[]>;
  findByCode(code: string): Promise<Language | null>;
  create(dto: CreateLanguageDTO): Promise<Language>;
  update(code: string, dto: UpdateLanguageDTO): Promise<Language>;
  delete(code: string): Promise<void>;
}