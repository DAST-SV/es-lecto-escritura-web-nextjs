// ============================================
// src/infrastructure/repositories/user-route-permissions/UserRoutePermissionRepository.ts
// Repository Implementation: UserRoutePermission with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { UserRoutePermission } from '@/src/core/domain/entities/UserRoutePermission';
import { IUserRoutePermissionRepository, CreateUserRoutePermissionDTO, UpdateUserRoutePermissionDTO } from '@/src/core/domain/repositories/IUserRoutePermissionRepository';

export class UserRoutePermissionRepository implements IUserRoutePermissionRepository {
  private supabase = createClient();

  async findAll(includeInactive: boolean = false): Promise<UserRoutePermission[]> {
    let query = this.supabase
      .schema('app')
      .from('user_route_permissions')
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching user route permissions: ${error.message}`);
    }

    return (data || []).map(UserRoutePermission.fromDatabase);
  }

  async findById(id: string): Promise<UserRoutePermission | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_route_permissions')
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching user route permission: ${error.message}`);
    }

    return UserRoutePermission.fromDatabase(data);
  }

  async findByUserId(userId: string): Promise<UserRoutePermission[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_route_permissions')
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching user route permissions by user: ${error.message}`);
    }

    return (data || []).map(UserRoutePermission.fromDatabase);
  }

  async findByRouteId(routeId: string): Promise<UserRoutePermission[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_route_permissions')
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .eq('route_id', routeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching user route permissions by route: ${error.message}`);
    }

    return (data || []).map(UserRoutePermission.fromDatabase);
  }

  async findByUserAndRoute(userId: string, routeId: string, languageCode?: string | null): Promise<UserRoutePermission | null> {
    let query = this.supabase
      .schema('app')
      .from('user_route_permissions')
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .eq('user_id', userId)
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
      throw new Error(`Error fetching user route permission: ${error.message}`);
    }

    return data ? UserRoutePermission.fromDatabase(data) : null;
  }

  async create(dto: CreateUserRoutePermissionDTO): Promise<UserRoutePermission> {
    // Validaciones de entrada
    if (!dto.userId || !dto.userId.trim()) {
      throw new Error('El ID del usuario es requerido');
    }
    if (!dto.routeId || !dto.routeId.trim()) {
      throw new Error('El ID de la ruta es requerido');
    }
    if (!dto.permissionType || !['GRANT', 'DENY'].includes(dto.permissionType)) {
      throw new Error('El tipo de permiso debe ser GRANT o DENY');
    }
    if (!dto.grantedBy || !dto.grantedBy.trim()) {
      throw new Error('El ID del otorgante es requerido');
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('user_route_permissions')
      .insert({
        user_id: dto.userId,
        route_id: dto.routeId,
        permission_type: dto.permissionType,
        reason: dto.reason || null,
        language_code: dto.languageCode || null,
        granted_by: dto.grantedBy,
        expires_at: dto.expiresAt?.toISOString() || null,
        is_active: dto.isActive ?? true,
      })
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .single();

    if (error) {
      throw new Error(`Error creating user route permission: ${error.message}`);
    }

    return UserRoutePermission.fromDatabase(data);
  }

  async update(id: string, dto: UpdateUserRoutePermissionDTO): Promise<UserRoutePermission> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.permissionType !== undefined) updateData.permission_type = dto.permissionType;
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.expiresAt !== undefined) updateData.expires_at = dto.expiresAt?.toISOString() || null;

    const { data, error } = await this.supabase
      .schema('app')
      .from('user_route_permissions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users:user_id (email),
        routes:route_id (path, name)
      `)
      .single();

    if (error) {
      throw new Error(`Error updating user route permission: ${error.message}`);
    }

    return UserRoutePermission.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('user_route_permissions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user route permission: ${error.message}`);
    }
  }
}
