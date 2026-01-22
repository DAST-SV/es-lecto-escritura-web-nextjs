// ============================================
// src/infrastructure/repositories/route-permissions/RoutePermissionRepository.ts
// Repository Implementation: RoutePermission with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';
import { IRoutePermissionRepository, CreateRoutePermissionDTO, UpdateRoutePermissionDTO } from '@/src/core/domain/repositories/IRoutePermissionRepository';

export class RoutePermissionRepository implements IRoutePermissionRepository {
  private supabase = createClient();

  async findAll(includeInactive: boolean = false): Promise<RoutePermission[]> {
    let query = this.supabase
      .schema('app')
      .from('route_permissions')
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching route permissions: ${error.message}`);
    }

    return (data || []).map(RoutePermission.fromDatabase);
  }

  async findById(id: string): Promise<RoutePermission | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching route permission: ${error.message}`);
    }

    return RoutePermission.fromDatabase(data);
  }

  async findByRoleName(roleName: string): Promise<RoutePermission[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .eq('role_name', roleName)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching route permissions by role: ${error.message}`);
    }

    return (data || []).map(RoutePermission.fromDatabase);
  }

  async findByRouteId(routeId: string): Promise<RoutePermission[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .eq('route_id', routeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching route permissions by route: ${error.message}`);
    }

    return (data || []).map(RoutePermission.fromDatabase);
  }

  async findByRoleAndRoute(roleName: string, routeId: string, languageCode?: string | null): Promise<RoutePermission | null> {
    let query = this.supabase
      .schema('app')
      .from('route_permissions')
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .eq('role_name', roleName)
      .eq('route_id', routeId);

    if (languageCode !== undefined) {
      if (languageCode === null) {
        query = query.is('language_code', null);
      } else {
        query = query.eq('language_code', languageCode);
      }
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Error fetching route permission: ${error.message}`);
    }

    return data ? RoutePermission.fromDatabase(data) : null;
  }

  async create(dto: CreateRoutePermissionDTO): Promise<RoutePermission> {
    // Validaciones de entrada
    if (!dto.roleName || !dto.roleName.trim()) {
      throw new Error('El nombre del rol es requerido');
    }
    if (!dto.routeId || !dto.routeId.trim()) {
      throw new Error('El ID de la ruta es requerido');
    }
    if (!dto.createdBy || !dto.createdBy.trim()) {
      throw new Error('El ID del creador es requerido');
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .insert({
        role_name: dto.roleName,
        route_id: dto.routeId,
        language_code: dto.languageCode || null,
        is_active: dto.isActive ?? true,
        created_by: dto.createdBy,
      })
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .single();

    if (error) {
      throw new Error(`Error creating route permission: ${error.message}`);
    }

    return RoutePermission.fromDatabase(data);
  }

  async update(id: string, dto: UpdateRoutePermissionDTO): Promise<RoutePermission> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.languageCode !== undefined) updateData.language_code = dto.languageCode;

    const { data, error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        roles:role_name (display_name),
        routes:route_id (pathname, display_name)
      `)
      .single();

    if (error) {
      throw new Error(`Error updating route permission: ${error.message}`);
    }

    return RoutePermission.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting route permission: ${error.message}`);
    }
  }

  async activate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error activating route permission: ${error.message}`);
    }
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('route_permissions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deactivating route permission: ${error.message}`);
    }
  }
}
