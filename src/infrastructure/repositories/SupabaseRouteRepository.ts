// ============================================
// src/infrastructure/repositories/SupabaseRouteRepository.ts
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RouteRepository, CreateRouteDTO, UpdateRouteDTO } from '@/src/core/domain/repositories/RouteRepository';
import { Route, RouteTranslation } from '@/src/core/domain/entities/Route';

export class SupabaseRouteRepository implements RouteRepository {
  private supabase = createClient();

  async findAll(): Promise<Route[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('routes')
      .select(`
        *,
        translations:route_translations(
          language_code,
          translated_path,
          translated_name
        )
      `)
      .order('pathname', { ascending: true });

    if (error) throw new Error(`Error fetching routes: ${error.message}`);

    return (data || []).map((row: any) => {
      const translations: RouteTranslation[] = (row.translations || []).map((t: any) => ({
        languageCode: t.language_code,
        translatedPath: t.translated_path,
        translatedName: t.translated_name,
      }));

      return Route.fromDatabase({ ...row, translations });
    });
  }

  async findById(id: string): Promise<Route | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('routes')
      .select(`
        *,
        translations:route_translations(
          language_code,
          translated_path,
          translated_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching route: ${error.message}`);
    }

    const translations: RouteTranslation[] = (data.translations || []).map((t: any) => ({
      languageCode: t.language_code,
      translatedPath: t.translated_path,
      translatedName: t.translated_name,
    }));

    return Route.fromDatabase({ ...data, translations });
  }

  async findByPathname(pathname: string): Promise<Route | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('routes')
      .select(`
        *,
        translations:route_translations(
          language_code,
          translated_path,
          translated_name
        )
      `)
      .eq('pathname', pathname)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching route: ${error.message}`);
    }

    const translations: RouteTranslation[] = (data.translations || []).map((t: any) => ({
      languageCode: t.language_code,
      translatedPath: t.translated_path,
      translatedName: t.translated_name,
    }));

    return Route.fromDatabase({ ...data, translations });
  }

  async findActive(): Promise<Route[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('routes')
      .select(`
        *,
        translations:route_translations(
          language_code,
          translated_path,
          translated_name
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('pathname', { ascending: true });

    if (error) throw new Error(`Error fetching active routes: ${error.message}`);

    return (data || []).map((row: any) => {
      const translations: RouteTranslation[] = (row.translations || []).map((t: any) => ({
        languageCode: t.language_code,
        translatedPath: t.translated_path,
        translatedName: t.translated_name,
      }));

      return Route.fromDatabase({ ...row, translations });
    });
  }

  async create(dto: CreateRouteDTO): Promise<Route> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('routes')
      .insert({
        pathname: dto.pathname,
        display_name: dto.displayName,
        description: dto.description,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating route: ${error.message}`);

    // Crear traducciones
    if (dto.translations && dto.translations.length > 0) {
      const translationInserts = dto.translations.map(t => ({
        route_id: data.id,
        language_code: t.languageCode,
        translated_path: t.translatedPath,
        translated_name: t.translatedName,
      }));

      const { error: translationError } = await this.supabase
        .schema('app')
        .from('route_translations')
        .insert(translationInserts);

      if (translationError) {
        console.error('Error creating translations:', translationError);
      }
    }

    return this.findById(data.id) as Promise<Route>;
  }

  async update(id: string, dto: UpdateRouteDTO): Promise<Route> {
    const updateData: any = {};
    if (dto.pathname !== undefined) updateData.pathname = dto.pathname;
    if (dto.displayName !== undefined) updateData.display_name = dto.displayName;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(`Error updating route: ${error.message}`);

    // Actualizar traducciones
    if (dto.translations) {
      await this.supabase
        .schema('app')
        .from('route_translations')
        .delete()
        .eq('route_id', id);

      if (dto.translations.length > 0) {
        const translationInserts = dto.translations.map(t => ({
          route_id: id,
          language_code: t.languageCode,
          translated_path: t.translatedPath,
          translated_name: t.translatedName,
        }));

        await this.supabase
          .schema('app')
          .from('route_translations')
          .insert(translationInserts);
      }
    }

    return this.findById(id) as Promise<Route>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Error deleting route: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw new Error(`Error restoring route: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    await this.supabase
      .schema('app')
      .from('route_translations')
      .delete()
      .eq('route_id', id);

    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error hard deleting route: ${error.message}`);
  }
}