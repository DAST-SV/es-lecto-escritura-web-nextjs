// src/infrastructure/repositories/TranslationNamespaceRepository.ts

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { ITranslationNamespaceRepository, CreateTranslationNamespaceDTO, UpdateTranslationNamespaceDTO } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';
import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';

export class TranslationNamespaceRepository implements ITranslationNamespaceRepository {
  private supabase = createClient();

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

    const namespacesWithCounts = await Promise.all(
      (data || []).map(async (ns: any) => {
        const { count } = await this.supabase
          .schema('app')
          .from('translation_keys')
          .select('*', { count: 'exact', head: true })
          .eq('namespace_slug', ns.slug);

        return TranslationNamespace.fromDatabase({
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

    const { count } = await this.supabase
      .schema('app')
      .from('translation_keys')
      .select('*', { count: 'exact', head: true })
      .eq('namespace_slug', data.slug);

    return TranslationNamespace.fromDatabase({
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

    const { count } = await this.supabase
      .schema('app')
      .from('translation_keys')
      .select('*', { count: 'exact', head: true })
      .eq('namespace_slug', data.slug);

    return TranslationNamespace.fromDatabase({
      ...data,
      translation_count: count ?? 0,
    });
  }

  async create(dto: CreateTranslationNamespaceDTO): Promise<TranslationNamespace> {
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
    return TranslationNamespace.fromDatabase({ ...data, translation_count: 0 });
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

    const { count } = await this.supabase
      .schema('app')
      .from('translation_keys')
      .select('*', { count: 'exact', head: true })
      .eq('namespace_slug', data.slug);

    return TranslationNamespace.fromDatabase({
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
}