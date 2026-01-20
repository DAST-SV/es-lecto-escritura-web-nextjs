// ============================================
// src/infrastructure/repositories/organization-members/OrganizationMemberRepository.ts
// Implementation of IOrganizationMemberRepository using Supabase
// ============================================

import {
  IOrganizationMemberRepository,
  CreateOrganizationMemberDTO,
  UpdateOrganizationMemberDTO
} from '@/src/core/domain/repositories/IOrganizationMemberRepository';
import { OrganizationMember } from '@/src/core/domain/entities/OrganizationMember';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export class OrganizationMemberRepository implements IOrganizationMemberRepository {

  /**
   * Find all members of an organization with user and organization details
   */
  async findAll(organizationId: string): Promise<OrganizationMember[]> {
    console.log('🔍 Finding all members for organization:', organizationId);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('organization_members')
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding members:', error);
      throw new Error(`Error finding members: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} members`);

    return (data || []).map(member => {
      const userData = member.users as any;
      const orgData = member.organizations as any;

      return new OrganizationMember(
        member.id,
        member.organization_id,
        member.user_id,
        member.user_role,
        new Date(member.joined_at),
        member.invited_by,
        member.is_active ?? true,
        userData?.raw_user_meta_data?.full_name ||
          userData?.raw_user_meta_data?.name ||
          userData?.email?.split('@')[0] ||
          'Usuario',
        userData?.email,
        orgData?.name
      );
    });
  }

  /**
   * Find a specific member by ID
   */
  async findById(id: string): Promise<OrganizationMember | null> {
    console.log('🔍 Finding member by ID:', id);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('organization_members')
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Member not found:', id);
        return null;
      }
      console.error('❌ Error finding member:', error);
      throw new Error(`Error finding member: ${error.message}`);
    }

    if (!data) return null;

    const userData = data.users as any;
    const orgData = data.organizations as any;

    console.log('✅ Member found:', data);

    return new OrganizationMember(
      data.id,
      data.organization_id,
      data.user_id,
      data.user_role,
      new Date(data.joined_at),
      data.invited_by,
      data.is_active ?? true,
      userData?.raw_user_meta_data?.full_name ||
        userData?.raw_user_meta_data?.name ||
        userData?.email?.split('@')[0] ||
        'Usuario',
      userData?.email,
      orgData?.name
    );
  }

  /**
   * Find all organizations a user is a member of
   */
  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    console.log('🔍 Finding memberships for user:', userId);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('organization_members')
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding user memberships:', error);
      throw new Error(`Error finding user memberships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} memberships for user`);

    return (data || []).map(member => {
      const userData = member.users as any;
      const orgData = member.organizations as any;

      return new OrganizationMember(
        member.id,
        member.organization_id,
        member.user_id,
        member.user_role,
        new Date(member.joined_at),
        member.invited_by,
        member.is_active ?? true,
        userData?.raw_user_meta_data?.full_name ||
          userData?.raw_user_meta_data?.name ||
          userData?.email?.split('@')[0] ||
          'Usuario',
        userData?.email,
        orgData?.name
      );
    });
  }

  /**
   * Create a new organization member
   */
  async create(dto: CreateOrganizationMemberDTO): Promise<OrganizationMember> {
    console.log('📝 Creating organization member:', dto);

    // Validaciones de entrada
    if (!dto.organizationId || !dto.organizationId.trim()) {
      throw new Error('El ID de la organización es requerido');
    }
    if (!dto.userId || !dto.userId.trim()) {
      throw new Error('El ID del usuario es requerido');
    }
    if (!dto.role || !dto.role.trim()) {
      throw new Error('El rol del usuario es requerido');
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('organization_members')
      .insert({
        organization_id: dto.organizationId,
        user_id: dto.userId,
        user_role: dto.role,
        invited_by: dto.invitedBy || null,
        is_active: true,
        joined_at: new Date().toISOString(),
      })
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        organizations:organization_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error creating member:', error);
      throw new Error(`Error creating member: ${error.message}`);
    }

    const userData = data.users as any;
    const orgData = data.organizations as any;

    console.log('✅ Member created successfully:', data);

    return new OrganizationMember(
      data.id,
      data.organization_id,
      data.user_id,
      data.user_role,
      new Date(data.joined_at),
      data.invited_by,
      data.is_active ?? true,
      userData?.raw_user_meta_data?.full_name ||
        userData?.raw_user_meta_data?.name ||
        userData?.email?.split('@')[0] ||
        'Usuario',
      userData?.email,
      orgData?.name
    );
  }

  /**
   * Update an organization member
   */
  async update(id: string, dto: UpdateOrganizationMemberDTO): Promise<OrganizationMember> {
    console.log('📝 Updating organization member:', id, dto);

    const supabase = createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.role !== undefined) {
      updateData.user_role = dto.role;
    }

    if (dto.isActive !== undefined) {
      updateData.is_active = dto.isActive;
    }

    const { data, error } = await supabase
      .schema('app')
      .from('organization_members')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        organizations:organization_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error updating member:', error);
      throw new Error(`Error updating member: ${error.message}`);
    }

    const userData = data.users as any;
    const orgData = data.organizations as any;

    console.log('✅ Member updated successfully:', data);

    return new OrganizationMember(
      data.id,
      data.organization_id,
      data.user_id,
      data.user_role,
      new Date(data.joined_at),
      data.invited_by,
      data.is_active ?? true,
      userData?.raw_user_meta_data?.full_name ||
        userData?.raw_user_meta_data?.name ||
        userData?.email?.split('@')[0] ||
        'Usuario',
      userData?.email,
      orgData?.name
    );
  }

  /**
   * Soft delete an organization member
   */
  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting organization member (soft delete):', id);

    const supabase = createClient();

    const { error } = await supabase
      .schema('app')
      .from('organization_members')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting member:', error);
      throw new Error(`Error deleting member: ${error.message}`);
    }

    console.log('✅ Member deleted successfully (soft delete)');
  }
}
