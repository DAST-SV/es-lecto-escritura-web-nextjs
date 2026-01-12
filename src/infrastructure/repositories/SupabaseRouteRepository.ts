// ============================================
// src/infrastructure/repositories/SupabaseRouteRepository.ts
// CORREGIDO: Usa schema app.routes
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  RouteRepository,
  CreateRouteDTO,
  UpdateRouteDTO,
} from '@/src/core/domain/repositories/RouteRepository';
import { Route } from '@/src/core/domain/entities/Route';

export class SupabaseRouteRepository implements RouteRepository {
  private supabase = createClient();

  async findAll(): Promise<Route[]> {
    const { data, error } = await this.supabase
      .from('routes') // ✅ Supabase detecta app.routes automáticamente
      .select(`
        *,
        route_translations (
          language_code,
          translated_path,
          translated_name,
          translated_description
        )
      `)
      .order('menu_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching routes:', error);
      throw new Error(`Error fetching routes: ${error.message}`);
    }

    return (data || []).map(route => Route.fromDatabase({
      ...route,
      translations: route.route_translations || []
    }));
  }

  async findById(id: string): Promise<Route | null> {
    const { data, error } = await this.supabase
      .from('routes')
      .select(`
        *,
        route_translations (
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

    return Route.fromDatabase({
      ...data,
      translations: data.route_translations || []
    });
  }

  async findByPathname(pathname: string): Promise<Route | null> {
    const { data, error } = await this.supabase
      .from('routes')
      .select(`
        *,
        route_translations (
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

    return Route.fromDatabase({
      ...data,
      translations: data.route_translations || []
    });
  }

  async create(dto: CreateRouteDTO): Promise<Route> {
    // 1. Crear ruta
    const { data: route, error: routeError } = await this.supabase
      .from('routes')
      .insert({
        pathname: dto.pathname,
        display_name: dto.displayName,
        description: dto.description,
        icon: dto.icon,
        is_public: dto.isPublic,
        requires_permissions: dto.requiresPermissions,
        requires_all_permissions: dto.requiresAllPermissions,
        show_in_menu: dto.showInMenu,
        menu_order: dto.menuOrder,
        parent_route_id: dto.parentRouteId,
      })
      .select()
      .single();

    if (routeError) {
      throw new Error(`Error creating route: ${routeError.message}`);
    }

    // 2. Crear traducciones
    if (dto.translations && dto.translations.length > 0) {
      const translationsData = dto.translations.map(t => ({
        route_id: route.id,
        language_code: t.languageCode,
        translated_path: t.translatedPath,
        translated_name: t.translatedName,
        translated_description: t.translatedDescription,
      }));

      const { error: translationsError } = await this.supabase
        .from('route_translations')
        .insert(translationsData);

      if (translationsError) {
        console.error('Error creating translations:', translationsError);
      }
    }

    // 3. Obtener ruta completa
    const created = await this.findById(route.id);
    if (!created) {
      throw new Error('Route created but not found');
    }

    return created;
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

    const { error } = await this.supabase
      .from('routes')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating route: ${error.message}`);
    }

    // Actualizar traducciones si están presentes
    if (dto.translations && dto.translations.length > 0) {
      // Eliminar traducciones existentes
      await this.supabase
        .from('route_translations')
        .delete()
        .eq('route_id', id);

      // Insertar nuevas traducciones
      const translationsData = dto.translations.map(t => ({
        route_id: id,
        language_code: t.languageCode,
        translated_path: t.translatedPath,
        translated_name: t.translatedName,
        translated_description: t.translatedDescription,
      }));

      await this.supabase
        .from('route_translations')
        .insert(translationsData);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Route not found after update');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting route: ${error.message}`);
    }
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('routes')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) {
      throw new Error(`Error restoring route: ${error.message}`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('routes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error hard deleting route: ${error.message}`);
    }
  }
}