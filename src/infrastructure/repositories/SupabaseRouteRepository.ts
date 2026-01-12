// ============================================
// src/infrastructure/repositories/SupabaseRouteRepository.ts
// ✅ CORRECCIÓN: Usar schema 'app' en lugar de 'public'
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  RouteRepository,
  CreateRouteDTO,
  UpdateRouteDTO,
} from '@/src/core/domain/repositories/RouteRepository';
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
          translated_name,
          translated_description
        )
      `)
      .order('menu_order', { ascending: true });

    if (error) {
      throw new Error(`Error fetching routes: ${error.message}`);
    }

    return (data || []).map((row: any) => {
      const translations: RouteTranslation[] = (row.translations || []).map((t: any) => ({
        languageCode: t.language_code,
        translatedPath: t.translated_path,
        translatedName: t.translated_name,
        translatedDescription: t.translated_description,
      }));

      return Route.fromDatabase({
        ...row,
        translations,
      });
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
          translated_name,
          translated_description
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
      translatedDescription: t.translated_description,
    }));

    return Route.fromDatabase({
      ...data,
      translations,
    });
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
          translated_name,
          translated_description
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
      translatedDescription: t.translated_description,
    }));

    return Route.fromDatabase({
      ...data,
      translations,
    });
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
          translated_name,
          translated_description
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('menu_order', { ascending: true });

    if (error) {
      throw new Error(`Error fetching active routes: ${error.message}`);
    }

    return (data || []).map((row: any) => {
      const translations: RouteTranslation[] = (row.translations || []).map((t: any) => ({
        languageCode: t.language_code,
        translatedPath: t.translated_path,
        translatedName: t.translated_name,
        translatedDescription: t.translated_description,
      }));

      return Route.fromDatabase({
        ...row,
        translations,
      });
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
        icon: dto.icon,
        is_public: dto.isPublic ?? false,
        requires_permissions: dto.requiresPermissions ?? [],
        requires_all_permissions: dto.requiresAllPermissions ?? true,
        show_in_menu: dto.showInMenu ?? true,
        menu_order: dto.menuOrder ?? 0,
        parent_route_id: dto.parentRouteId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating route: ${error.message}`);
    }

    // Crear traducciones si se proporcionan
    if (dto.translations && dto.translations.length > 0) {
      const translationInserts = dto.translations.map(t => ({
        route_id: data.id,
        language_code: t.languageCode,
        translated_path: t.translatedPath,
        translated_name: t.translatedName,
        translated_description: t.translatedDescription,
      }));

      const { error: translationError } = await this.supabase
        .schema('app')
        .from('route_translations')
        .insert(translationInserts);

      if (translationError) {
        console.error('Error creating route translations:', translationError);
      }
    }

    return this.findById(data.id) as Promise<Route>;
  }

  async update(id: string, dto: UpdateRouteDTO): Promise<Route> {
    const updateData: any = {};
    if (dto.pathname !== undefined) updateData.pathname = dto.pathname;
    if (dto.displayName !== undefined) updateData.display_name = dto.displayName;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.isPublic !== undefined) updateData.is_public = dto.isPublic;
    if (dto.requiresPermissions !== undefined) updateData.requires_permissions = dto.requiresPermissions;
    if (dto.requiresAllPermissions !== undefined) updateData.requires_all_permissions = dto.requiresAllPermissions;
    if (dto.showInMenu !== undefined) updateData.show_in_menu = dto.showInMenu;
    if (dto.menuOrder !== undefined) updateData.menu_order = dto.menuOrder;
    if (dto.parentRouteId !== undefined) updateData.parent_route_id = dto.parentRouteId;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating route: ${error.message}`);
    }

    // Actualizar traducciones si se proporcionan
    if (dto.translations) {
      // Eliminar traducciones existentes
      await this.supabase
        .schema('app')
        .from('route_translations')
        .delete()
        .eq('route_id', id);

      // Insertar nuevas traducciones
      if (dto.translations.length > 0) {
        const translationInserts = dto.translations.map(t => ({
          route_id: id,
          language_code: t.languageCode,
          translated_path: t.translatedPath,
          translated_name: t.translatedName,
          translated_description: t.translatedDescription,
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

    if (error) {
      throw new Error(`Error deleting route: ${error.message}`);
    }
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) {
      throw new Error(`Error restoring route: ${error.message}`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    // Primero eliminar traducciones
    await this.supabase
      .schema('app')
      .from('route_translations')
      .delete()
      .eq('route_id', id);

    // Luego eliminar la ruta
    const { error } = await this.supabase
      .schema('app')
      .from('routes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error hard deleting route: ${error.message}`);
    }
  }
}