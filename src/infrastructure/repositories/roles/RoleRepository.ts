// ============================================
// src/infrastructure/repositories/roles/RoleRepository.ts
// Repository Implementation: Role with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Role } from '@/src/core/domain/entities/Role';
import { IRoleRepository, CreateRoleDTO, UpdateRoleDTO } from '@/src/core/domain/repositories/IRoleRepository';

export class RoleRepository implements IRoleRepository {
  private supabase = createClient();

  async findAll(includeInactive: boolean = false): Promise<Role[]> {
    let query = this.supabase
      .schema('app')
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: false })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
    }

    return (data || []).map(Role.fromDatabase);
  }

  async findById(id: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching role: ${error.message}`);
    }

    return Role.fromDatabase(data);
  }

  async findByName(name: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('roles')
      .select('*')
      .eq('name', name.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching role by name: ${error.message}`);
    }

    return Role.fromDatabase(data);
  }

  async findSystemRoles(): Promise<Role[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('roles')
      .select('*')
      .eq('is_system_role', true)
      .eq('is_active', true)
      .order('hierarchy_level', { ascending: false });

    if (error) {
      throw new Error(`Error fetching system roles: ${error.message}`);
    }

    return (data || []).map(Role.fromDatabase);
  }

  async findByHierarchyLevel(level: number): Promise<Role[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('roles')
      .select('*')
      .eq('hierarchy_level', level)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching roles by hierarchy: ${error.message}`);
    }

    return (data || []).map(Role.fromDatabase);
  }

  async create(dto: CreateRoleDTO): Promise<Role> {
    // Validaciones de entrada
    if (!dto.name || !dto.name.trim()) {
      throw new Error('El nombre del rol es requerido');
    }
    if (!dto.displayName || !dto.displayName.trim()) {
      throw new Error('El nombre visible del rol es requerido');
    }
    if (!dto.createdBy || !dto.createdBy.trim()) {
      throw new Error('El ID del creador es requerido');
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('roles')
      .insert({
        name: dto.name.toLowerCase(),
        display_name: dto.displayName,
        description: dto.description || null,
        hierarchy_level: dto.hierarchyLevel || 0,
        is_active: dto.isActive ?? true,
        is_system_role: dto.isSystemRole ?? false,
        created_by: dto.createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }

    return Role.fromDatabase(data);
  }

  async update(id: string, dto: UpdateRoleDTO, updatedBy: string): Promise<Role> {
    // Validaciones de entrada
    if (!id || !id.trim()) {
      throw new Error('El ID del rol es requerido');
    }
    if (dto.displayName !== undefined && (!dto.displayName || !dto.displayName.trim())) {
      throw new Error('El nombre visible no puede estar vacío');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.displayName !== undefined) updateData.display_name = dto.displayName;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.hierarchyLevel !== undefined) updateData.hierarchy_level = dto.hierarchyLevel;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .schema('app')
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }

    return Role.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    // First check if it's a system role
    const role = await this.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole) {
      throw new Error('Cannot delete system role');
    }

    const { error } = await this.supabase
      .schema('app')
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('roles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deactivating role: ${error.message}`);
    }
  }

  async activate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('roles')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error activating role: ${error.message}`);
    }
  }
}
