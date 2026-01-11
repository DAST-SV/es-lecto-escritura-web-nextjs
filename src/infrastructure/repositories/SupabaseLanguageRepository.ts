// ============================================
// src/infrastructure/repositories/SupabaseLanguageRepository.ts
// Implementación: Repositorio de Idiomas con Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  LanguageRepository,
  CreateLanguageDTO,
  UpdateLanguageDTO,
} from '@/src/core/domain/repositories/LanguageRepository';
import { Language } from '@/src/core/domain/entities/Language';

export class SupabaseLanguageRepository implements LanguageRepository {
  private supabase = createClient();

  async findAll(): Promise<Language[]> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Error fetching languages: ${error.message}`);
    }

    return (data || []).map(Language.fromDatabase);
  }

  async findByCode(code: string): Promise<Language | null> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching language: ${error.message}`);
    }

    return Language.fromDatabase(data);
  }

  async create(dto: CreateLanguageDTO): Promise<Language> {
    // Si es default, desmarcar otros
    if (dto.isDefault) {
      await this.supabase
        .from('languages')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await this.supabase
      .from('languages')
      .insert({
        code: dto.code,
        name: dto.name,
        native_name: dto.nativeName,
        flag_emoji: dto.flagEmoji,
        is_default: dto.isDefault,
        order_index: dto.orderIndex,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating language: ${error.message}`);
    }

    return Language.fromDatabase(data);
  }

  async update(code: string, dto: UpdateLanguageDTO): Promise<Language> {
    // Si se marca como default, desmarcar otros
    if (dto.isDefault === true) {
      await this.supabase
        .from('languages')
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('code', code);
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.nativeName !== undefined) updateData.native_name = dto.nativeName;
    if (dto.flagEmoji !== undefined) updateData.flag_emoji = dto.flagEmoji;
    if (dto.isDefault !== undefined) updateData.is_default = dto.isDefault;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;

    const { data, error } = await this.supabase
      .from('languages')
      .update(updateData)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating language: ${error.message}`);
    }

    return Language.fromDatabase(data);
  }

  async delete(code: string): Promise<void> {
    const { error } = await this.supabase
      .from('languages')
      .delete()
      .eq('code', code);

    if (error) {
      throw new Error(`Error deleting language: ${error.message}`);
    }
  }

  async setAsDefault(code: string): Promise<void> {
    // Desmarcar todos
    await this.supabase
      .from('languages')
      .update({ is_default: false })
      .eq('is_default', true);

    // Marcar el seleccionado
    const { error } = await this.supabase
      .from('languages')
      .update({ is_default: true })
      .eq('code', code);

    if (error) {
      throw new Error(`Error setting default language: ${error.message}`);
    }
  }
}