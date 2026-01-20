// ============================================
// src/infrastructure/repositories/role-language-access/RoleLanguageAccessRepository.ts
// Repository Implementation: Role Language Access with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  IRoleLanguageAccessRepository,
  CreateRoleLanguageAccessDTO,
  UpdateRoleLanguageAccessDTO,
} from '@/src/core/domain/repositories/IRoleLanguageAccessRepository';
import { RoleLanguageAccess, LanguageCode } from '@/src/core/domain/entities/RoleLanguageAccess';

export class RoleLanguageAccessRepository implements IRoleLanguageAccessRepository {
  private supabase = createClient();

  private mapToEntity(data: any): RoleLanguageAccess {
    return new RoleLanguageAccess(
      data.id,
      data.role_name,
      data.language_code,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.roles?.display_name
    );
  }

  async findAll(includeInactive = false): Promise<RoleLanguageAccess[]> {
    let query = this.supabase
      .schema('app')
      .from('role_language_access')
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .order('role_name')
      .order('language_code');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch role language access: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<RoleLanguageAccess | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch role language access: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findByRole(roleName: string): Promise<RoleLanguageAccess[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .eq('role_name', roleName)
      .eq('is_active', true)
      .order('language_code');

    if (error) throw new Error(`Failed to fetch role language access: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findByLanguage(languageCode: LanguageCode): Promise<RoleLanguageAccess[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .eq('language_code', languageCode)
      .eq('is_active', true)
      .order('role_name');

    if (error) throw new Error(`Failed to fetch role language access: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findByRoleAndLanguage(roleName: string, languageCode: LanguageCode): Promise<RoleLanguageAccess | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .eq('role_name', roleName)
      .eq('language_code', languageCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch role language access: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async getActiveLanguagesForRole(roleName: string): Promise<LanguageCode[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .select('language_code')
      .eq('role_name', roleName)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch languages for role: ${error.message}`);
    return (data || []).map((row) => row.language_code as LanguageCode);
  }

  async hasAccess(roleName: string, languageCode: LanguageCode): Promise<boolean> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .select('id')
      .eq('role_name', roleName)
      .eq('language_code', languageCode)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check access: ${error.message}`);
    }
    return !!data;
  }

  async create(dto: CreateRoleLanguageAccessDTO): Promise<RoleLanguageAccess> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .insert({
        role_name: dto.roleName,
        language_code: dto.languageCode,
        created_by: dto.createdBy,
      })
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .single();

    if (error) throw new Error(`Failed to create role language access: ${error.message}`);
    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateRoleLanguageAccessDTO): Promise<RoleLanguageAccess> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .update({
        is_active: dto.isActive,
      })
      .eq('id', id)
      .select(`
        *,
        roles:role_name (display_name)
      `)
      .single();

    if (error) throw new Error(`Failed to update role language access: ${error.message}`);
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete role language access: ${error.message}`);
  }

  async activate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw new Error(`Failed to activate role language access: ${error.message}`);
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to deactivate role language access: ${error.message}`);
  }

  async grantLanguages(roleName: string, languageCodes: LanguageCode[], createdBy: string): Promise<RoleLanguageAccess[]> {
    const inserts = languageCodes.map((code) => ({
      role_name: roleName,
      language_code: code,
      created_by: createdBy,
    }));

    const { data, error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .insert(inserts)
      .select(`
        *,
        roles:role_name (display_name)
      `);

    if (error) throw new Error(`Failed to grant languages: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async revokeAllLanguages(roleName: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('role_language_access')
      .update({ is_active: false })
      .eq('role_name', roleName);

    if (error) throw new Error(`Failed to revoke languages: ${error.message}`);
  }
}
