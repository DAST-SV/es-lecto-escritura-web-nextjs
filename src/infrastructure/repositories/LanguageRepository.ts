// src/infrastructure/repositories/LanguageRepository.ts

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { ILanguageRepository, CreateLanguageDTO, UpdateLanguageDTO } from '@/src/core/domain/repositories/ILanguageRepository';
import { Language } from '@/src/core/domain/entities/Language';

export class LanguageRepository implements ILanguageRepository {
  private supabase = createClient();

  async findAll(includeInactive = false): Promise<Language[]> {
    let query = this.supabase
      .schema('app')
      .from('languages')
      .select('*')
      .order('order_index')
      .order('code');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch languages: ${error.message}`);
    return (data || []).map(Language.fromDatabase);
  }

  async findByCode(code: string): Promise<Language | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch language: ${error.message}`);
    }
    return data ? Language.fromDatabase(data) : null;
  }

  async create(dto: CreateLanguageDTO): Promise<Language> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('languages')
      .insert({
        code: dto.code,
        name: dto.name,
        native_name: dto.nativeName || null,
        flag_emoji: dto.flagEmoji || null,
        is_default: dto.isDefault ?? false,
        is_active: dto.isActive ?? true,
        order_index: dto.orderIndex ?? 0,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create language: ${error.message}`);
    return Language.fromDatabase(data);
  }

  async update(code: string, dto: UpdateLanguageDTO): Promise<Language> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.nativeName !== undefined) updateData.native_name = dto.nativeName;
    if (dto.flagEmoji !== undefined) updateData.flag_emoji = dto.flagEmoji;
    if (dto.isDefault !== undefined) updateData.is_default = dto.isDefault;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;

    const { data, error } = await this.supabase
      .schema('app')
      .from('languages')
      .update(updateData)
      .eq('code', code)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update language: ${error.message}`);
    return Language.fromDatabase(data);
  }

  async delete(code: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('languages')
      .delete()
      .eq('code', code);

    if (error) throw new Error(`Failed to delete language: ${error.message}`);
  }
}