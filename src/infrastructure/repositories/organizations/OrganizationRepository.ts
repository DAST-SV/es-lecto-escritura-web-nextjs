// ============================================
// src/infrastructure/repositories/organizations/OrganizationRepository.ts
// ✅ CORREGIDO: Soft delete, filtros y sincronización con SQL
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
    
    console.log('📝 Creando organización:', data);

    const { data: created, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear organización:', error);
      throw new Error(`Error al crear organización: ${error.message}`);
    }

    console.log('✅ Organización creada:', created);
    return Organization.fromDatabase(created);
  }

  async update(id: string, organization: Organization): Promise<Organization> {
    const data = organization.toPlainObject();
    
    console.log('📝 Actualizando organización:', id, data);
    
    const { data: updated, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar organización:', error);
      throw new Error(`Error al actualizar organización: ${error.message}`);
    }

    console.log('✅ Organización actualizada:', updated);
    return Organization.fromDatabase(updated);
  }

  async findById(id: string): Promise<Organization | null> {
    console.log('🔍 Buscando organización por ID:', id);

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Organización no encontrada:', id);
        return null;
      }
      console.error('❌ Error al buscar organización:', error);
      throw new Error(`Error al buscar organización: ${error.message}`);
    }

    // ✅ NO filtrar por deleted_at aquí - permitir ver eliminadas
    console.log('✅ Organización encontrada:', data);
    return data ? Organization.fromDatabase(data) : null;
  }

  async findAll(): Promise<Organization[]> {
    console.log('🔍 Listando todas las organizaciones (incluyendo eliminadas)');

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al listar organizaciones:', error);
      throw new Error(`Error al listar organizaciones: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0} organizaciones encontradas`);
    return (data || []).map(Organization.fromDatabase);
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    console.log('🔍 Buscando organizaciones del usuario:', userId);

    // ✅ Query corregido con LEFT JOIN
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .select(`
        organization_id,
        organizations!inner (*)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      console.error('❌ Error al buscar organizaciones del usuario:', error);
      throw new Error(`Error al buscar organizaciones del usuario: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Usuario sin organizaciones');
      return [];
    }

    console.log(`✅ ${data.length} organizaciones encontradas para el usuario`);

    // ✅ Filtrar organizaciones que no estén eliminadas
    return data
      .filter((row: any) => row.organizations && !row.organizations.deleted_at)
      .map((row: any) => Organization.fromDatabase(row.organizations));
  }

  async hardDelete(id: string): Promise<void> {
    console.log('🗑️ Eliminación HARD de organización:', id);

    // Primero eliminar miembros
    const { error: membersError } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .delete()
      .eq('organization_id', id);

    if (membersError) {
      console.error('❌ Error eliminando miembros:', membersError);
    }

    // Luego eliminar organización
    const { error } = await supabaseAdmin
      .schema('app')
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar organización:', error);
      throw new Error(`Error al eliminar organización: ${error.message}`);
    }

    console.log('✅ Organización eliminada permanentemente');
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    console.log('🔍 Verificando slug:', slug);

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
      console.error('❌ Error al verificar slug:', error);
      throw new Error(`Error al verificar slug: ${error.message}`);
    }

    const exists = (count || 0) > 0;
    console.log(`${exists ? '❌' : '✅'} Slug ${exists ? 'ya existe' : 'disponible'}`);
    return exists;
  }

  // ============================================
  // MEMBERS
  // ============================================
  
  async addMember(member: OrganizationMember): Promise<OrganizationMember> {
    const data = member.toPlainObject();
    
    console.log('👤 Agregando miembro:', data);
    
    const { data: created, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al agregar miembro:', error);
      throw new Error(`Error al agregar miembro: ${error.message}`);
    }

    console.log('✅ Miembro agregado:', created);
    return OrganizationMember.fromDatabase(created);
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    console.log('👤 Removiendo miembro:', { organizationId, userId });

    // Soft delete
    const { error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error al remover miembro:', error);
      throw new Error(`Error al remover miembro: ${error.message}`);
    }

    console.log('✅ Miembro removido (soft delete)');
  }

  async updateMember(
    organizationId: string, 
    userId: string, 
    member: OrganizationMember
  ): Promise<OrganizationMember> {
    const data = member.toPlainObject();
    
    console.log('👤 Actualizando miembro:', { organizationId, userId, data });
    
    const { data: updated, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar miembro:', error);
      throw new Error(`Error al actualizar miembro: ${error.message}`);
    }

    console.log('✅ Miembro actualizado:', updated);
    return OrganizationMember.fromDatabase(updated);
  }

  async findMembersByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    console.log('👥 Buscando miembros de organización:', organizationId);

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('❌ Error al listar miembros:', error);
      throw new Error(`Error al listar miembros: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0} miembros encontrados`);
    return (data || []).map(OrganizationMember.fromDatabase);
  }
}