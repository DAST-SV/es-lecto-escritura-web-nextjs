// ============================================
// src/infrastructure/repositories/organizations/OrganizationRepository.ts
// ============================================

import { supabaseAdmin } from '@/src/utils/supabase/admin';
import { IOrganizationRepository } from '@/src/core/domain/repositories/IOrganizationRepository';
import { Organization, OrganizationMember } from '@/src/core/domain/entities/Organization';

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  
  // ============================================
  // ORGANIZATIONS
  // ============================================
  
  async create(organization: Organization): Promise<Organization> {
    const data = organization.toPlainObject();
    
    const { data: created, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear organización: ${error.message}`);
    }

    return Organization.fromDatabase(created);
  }

  async update(id: string, organization: Organization): Promise<Organization> {
    const data = organization.toPlainObject();
    
    const { data: updated, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar organización: ${error.message}`);
    }

    return Organization.fromDatabase(updated);
  }

  async findById(id: string): Promise<Organization | null> {
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al buscar organización: ${error.message}`);
    }

    return data ? Organization.fromDatabase(data) : null;
  }

  async findAll(): Promise<Organization[]> {
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al listar organizaciones: ${error.message}`);
    }

    return (data || []).map(Organization.fromDatabase);
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .select(`
        organization_id,
        organizations (*)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Error al buscar organizaciones del usuario: ${error.message}`);
    }

    if (!data) return [];

    return data
      .filter(row => row.organizations)
      .map(row => Organization.fromDatabase(row.organizations));
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar organización: ${error.message}`);
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabaseAdmin
      .schema('app')
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
      .is('deleted_at', null);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error al verificar slug: ${error.message}`);
    }

    return (count || 0) > 0;
  }

  // ============================================
  // MEMBERS
  // ============================================
  
  async addMember(member: OrganizationMember): Promise<OrganizationMember> {
    const data = member.toPlainObject();
    
    const { data: created, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al agregar miembro: ${error.message}`);
    }

    return OrganizationMember.fromDatabase(created);
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error al remover miembro: ${error.message}`);
    }
  }

  async updateMember(
    organizationId: string, 
    userId: string, 
    member: OrganizationMember
  ): Promise<OrganizationMember> {
    const data = member.toPlainObject();
    
    const { data: updated, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .update(data)
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar miembro: ${error.message}`);
    }

    return OrganizationMember.fromDatabase(updated);
  }

  async findMembersByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('joined_at', { ascending: false });

    if (error) {
      throw new Error(`Error al listar miembros: ${error.message}`);
    }

    return (data || []).map(OrganizationMember.fromDatabase);
  }
}