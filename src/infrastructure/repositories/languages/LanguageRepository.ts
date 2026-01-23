// ============================================
// src/infrastructure/repositories/languages/LanguageRepository.ts
// Repository Implementation: Language with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  ILanguageRepository,
  CreateLanguageDTO,
  UpdateLanguageDTO,
} from '@/src/core/domain/repositories/ILanguageRepository';
import { Language } from '@/src/core/domain/entities/Language';

export class LanguageRepository implements ILanguageRepository {
  private supabase = createClient();

  private mapToEntity(data: any): Language {
    return Language.fromDatabase(data);
  }

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
    return (data || []).map(this.mapToEntity);
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
    return data ? this.mapToEntity(data) : null;
  }

  async findActive(): Promise<Language[]> {
    return this.findAll(false);
  }

  async findDefault(): Promise<Language | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('languages')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch default language: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async create(dto: CreateLanguageDTO): Promise<Language> {
    // Validaciones de entrada
    if (!dto.code || !dto.code.trim()) {
      throw new Error('El código del idioma es requerido');
    }
    if (!dto.name || !dto.name.trim()) {
      throw new Error('El nombre del idioma es requerido');
    }

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
    return this.mapToEntity(data);
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
    return this.mapToEntity(data);
  }

  async delete(code: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('languages')
      .delete()
      .eq('code', code);

    if (error) throw new Error(`Failed to delete language: ${error.message}`);
  }

  async activate(code: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('languages')
      .update({ is_active: true })
      .eq('code', code);

    if (error) throw new Error(`Failed to activate language: ${error.message}`);
  }

  async deactivate(code: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('languages')
      .update({ is_active: false })
      .eq('code', code);

    if (error) throw new Error(`Failed to deactivate language: ${error.message}`);
  }

  async setAsDefault(code: string): Promise<void> {
    // Primero, quitar el is_default de todos los demás
    await this.supabase
      .schema('app')
      .from('languages')
      .update({ is_default: false })
      .neq('code', code);

    // Luego, establecer el nuevo idioma por defecto
    const { error } = await this.supabase
      .schema('app')
      .from('languages')
      .update({ is_default: true, is_active: true })
      .eq('code', code);

    if (error) throw new Error(`Failed to set default language: ${error.message}`);
  }

  async reorder(languages: Array<{ code: string; orderIndex: number }>): Promise<void> {
    // Actualizar el order_index de cada idioma
    const promises = languages.map(({ code, orderIndex }) =>
      this.supabase
        .schema('app')
        .from('languages')
        .update({ order_index: orderIndex })
        .eq('code', code)
    );

    await Promise.all(promises);
  }
}
