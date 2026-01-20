// ============================================
// src/infrastructure/repositories/user-roles/UserRoleRepository.ts
// Repository Implementation: UserRole with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { UserRole } from '@/src/core/domain/entities/UserRole';
import { IUserRoleRepository, AssignRoleDTO, RevokeRoleDTO, UpdateUserRoleDTO } from '@/src/core/domain/repositories/IUserRoleRepository';

export class UserRoleRepository implements IUserRoleRepository {
  private supabase = createClient();

  async findAll(includeInactive: boolean = false): Promise<UserRole[]> {
    let query = this.supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true).is('revoked_at', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching user roles: ${error.message}`);
    }

    return (data || []).map(UserRole.fromDatabase);
  }

  async findById(id: string): Promise<UserRole | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching user role: ${error.message}`);
    }

    return UserRole.fromDatabase(data);
  }

  async findByUserId(userId: string, includeRevoked: boolean = false): Promise<UserRole[]> {
    let query = this.supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeRevoked) {
      query = query.is('revoked_at', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching user roles by user: ${error.message}`);
    }

    return (data || []).map(UserRole.fromDatabase);
  }

  async findByRoleId(roleId: string, includeRevoked: boolean = false): Promise<UserRole[]> {
    let query = this.supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .eq('role_id', roleId)
      .order('created_at', { ascending: false });

    if (!includeRevoked) {
      query = query.is('revoked_at', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching user roles by role: ${error.message}`);
    }

    return (data || []).map(UserRole.fromDatabase);
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .is('revoked_at', null)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching user role: ${error.message}`);
    }

    return data ? UserRole.fromDatabase(data) : null;
  }

  async findActiveByUserId(userId: string): Promise<UserRole[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching active user roles: ${error.message}`);
    }

    return (data || []).map(UserRole.fromDatabase);
  }

  async assign(dto: AssignRoleDTO): Promise<UserRole> {
    // Check if assignment already exists
    const existing = await this.findByUserAndRole(dto.userId, dto.roleId);
    if (existing && existing.isActive) {
      throw new Error('User already has this role assigned');
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .insert({
        user_id: dto.userId,
        role_id: dto.roleId,
        assigned_by: dto.assignedBy,
        notes: dto.notes || null,
        is_active: dto.isActive ?? true,
      })
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .single();

    if (error) {
      throw new Error(`Error assigning role: ${error.message}`);
    }

    return UserRole.fromDatabase(data);
  }

  async revoke(id: string, dto: RevokeRoleDTO): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: dto.revokedBy,
        is_active: false,
        notes: dto.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error revoking role: ${error.message}`);
    }
  }

  async update(id: string, dto: UpdateUserRoleDTO): Promise<UserRole> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .single();

    if (error) {
      throw new Error(`Error updating user role: ${error.message}`);
    }

    return UserRole.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user role: ${error.message}`);
    }
  }

  async reactivate(id: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('user_roles')
      .update({
        is_active: true,
        revoked_at: null,
        revoked_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        users:user_id (email),
        roles:role_id (name, display_name)
      `)
      .single();

    if (error) {
      throw new Error(`Error reactivating user role: ${error.message}`);
    }

    return UserRole.fromDatabase(data);
  }
}
