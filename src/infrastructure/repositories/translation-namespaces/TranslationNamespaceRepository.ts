// ============================================
// src/infrastructure/repositories/translation-namespaces/TranslationNamespaceRepository.ts
// Repository Implementation: Translation Namespace with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  ITranslationNamespaceRepository,
  CreateTranslationNamespaceDTO,
  UpdateTranslationNamespaceDTO,
} from '@/src/core/domain/repositories/ITranslationNamespaceRepository';
import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';

export class TranslationNamespaceRepository implements ITranslationNamespaceRepository {
  private supabase = createClient();

  private mapToEntity(data: any): TranslationNamespace {
    return TranslationNamespace.fromDatabase(data);
  }

  async findAll(includeInactive = false): Promise<TranslationNamespace[]> {
    let query = this.supabase
      .schema('app')
      .from('translation_namespaces')
      .select('*')
      .order('slug');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch namespaces: ${error.message}`);

    // Contar traducciones para cada namespace
    const namespacesWithCounts = await Promise.all(
      (data || []).map(async (ns: any) => {
        const { count } = await this.supabase
          .schema('app')
          .from('translations')
          .select('*', { count: 'exact', head: true })
          .eq('namespace_slug', ns.slug);

        return this.mapToEntity({
          ...ns,
          translation_count: count ?? 0,
        });
      })
    );

    return namespacesWithCounts;
  }

  async findById(id: string): Promise<TranslationNamespace | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch namespace: ${error.message}`);
    }

    if (!data) return null;

    // Contar traducciones
    const { count } = await this.supabase
      .schema('app')
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('namespace_slug', data.slug);

    return this.mapToEntity({
      ...data,
      translation_count: count ?? 0,
    });
  }

  async findBySlug(slug: string): Promise<TranslationNamespace | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch namespace: ${error.message}`);
    }

    if (!data) return null;

    // Contar traducciones
    const { count } = await this.supabase
      .schema('app')
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('namespace_slug', data.slug);

    return this.mapToEntity({
      ...data,
      translation_count: count ?? 0,
    });
  }

  async findActive(): Promise<TranslationNamespace[]> {
    return this.findAll(false);
  }

  async create(dto: CreateTranslationNamespaceDTO): Promise<TranslationNamespace> {
    // Validaciones de entrada
    if (!dto.slug || !dto.slug.trim()) {
      throw new Error('El slug del namespace es requerido');
    }
    if (!dto.name || !dto.name.trim()) {
      throw new Error('El nombre del namespace es requerido');
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .insert({
        slug: dto.slug,
        name: dto.name,
        description: dto.description || null,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create namespace: ${error.message}`);
    return this.mapToEntity({ ...data, translation_count: 0 });
  }

  async update(id: string, dto: UpdateTranslationNamespaceDTO): Promise<TranslationNamespace> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update namespace: ${error.message}`);

    // Contar traducciones
    const { count } = await this.supabase
      .schema('app')
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('namespace_slug', data.slug);

    return this.mapToEntity({
      ...data,
      translation_count: count ?? 0,
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete namespace: ${error.message}`);
  }

  async activate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw new Error(`Failed to activate namespace: ${error.message}`);
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('translation_namespaces')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to deactivate namespace: ${error.message}`);
  }
}
