// ============================================
// src/infrastructure/repositories/user-relationships/UserRelationshipRepository.ts
// Implementation of IUserRelationshipRepository using Supabase
// ============================================

import {
  IUserRelationshipRepository,
  CreateUserRelationshipDTO
} from '@/src/core/domain/repositories/IUserRelationshipRepository';
import { UserRelationship } from '@/src/core/domain/entities/UserRelationship';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export class UserRelationshipRepository implements IUserRelationshipRepository {

  /**
   * Find all user relationships with user details
   */
  async findAll(): Promise<UserRelationship[]> {
    console.log('🔍 Finding all user relationships');

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding relationships:', error);
      throw new Error(`Error finding relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} relationships`);

    return (data || []).map(relationship => {
      const parentUserData = relationship.parent_user as any;
      const childUserData = relationship.child_user as any;

      return new UserRelationship(
        relationship.id,
        relationship.parent_user_id,
        relationship.child_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        parentUserData?.raw_user_meta_data?.full_name ||
          parentUserData?.raw_user_meta_data?.name ||
          parentUserData?.email?.split('@')[0] ||
          'Usuario',
        parentUserData?.email,
        childUserData?.raw_user_meta_data?.full_name ||
          childUserData?.raw_user_meta_data?.name ||
          childUserData?.email?.split('@')[0] ||
          'Usuario',
        childUserData?.email
      );
    });
  }

  /**
   * Find a specific relationship by ID
   */
  async findById(id: string): Promise<UserRelationship | null> {
    console.log('🔍 Finding relationship by ID:', id);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Relationship not found:', id);
        return null;
      }
      console.error('❌ Error finding relationship:', error);
      throw new Error(`Error finding relationship: ${error.message}`);
    }

    if (!data) return null;

    const parentUserData = data.parent_user as any;
    const childUserData = data.child_user as any;

    console.log('✅ Relationship found:', data);

    return new UserRelationship(
      data.id,
      data.parent_user_id,
      data.child_user_id,
      data.relationship_type,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      parentUserData?.raw_user_meta_data?.full_name ||
        parentUserData?.raw_user_meta_data?.name ||
        parentUserData?.email?.split('@')[0] ||
        'Usuario',
      parentUserData?.email,
      childUserData?.raw_user_meta_data?.full_name ||
        childUserData?.raw_user_meta_data?.name ||
        childUserData?.email?.split('@')[0] ||
        'Usuario',
      childUserData?.email
    );
  }

  /**
   * Find all relationships where user is the parent
   */
  async findByParentUserId(parentUserId: string): Promise<UserRelationship[]> {
    console.log('🔍 Finding relationships for parent user:', parentUserId);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('parent_user_id', parentUserId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding relationships:', error);
      throw new Error(`Error finding relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} relationships for parent user`);

    return (data || []).map(relationship => {
      const parentUserData = relationship.parent_user as any;
      const childUserData = relationship.child_user as any;

      return new UserRelationship(
        relationship.id,
        relationship.parent_user_id,
        relationship.child_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        parentUserData?.raw_user_meta_data?.full_name ||
          parentUserData?.raw_user_meta_data?.name ||
          parentUserData?.email?.split('@')[0] ||
          'Usuario',
        parentUserData?.email,
        childUserData?.raw_user_meta_data?.full_name ||
          childUserData?.raw_user_meta_data?.name ||
          childUserData?.email?.split('@')[0] ||
          'Usuario',
        childUserData?.email
      );
    });
  }

  /**
   * Find all relationships where user is the child
   */
  async findByChildUserId(childUserId: string): Promise<UserRelationship[]> {
    console.log('🔍 Finding relationships for child user:', childUserId);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('child_user_id', childUserId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding relationships:', error);
      throw new Error(`Error finding relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} relationships for child user`);

    return (data || []).map(relationship => {
      const parentUserData = relationship.parent_user as any;
      const childUserData = relationship.child_user as any;

      return new UserRelationship(
        relationship.id,
        relationship.parent_user_id,
        relationship.child_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        parentUserData?.raw_user_meta_data?.full_name ||
          parentUserData?.raw_user_meta_data?.name ||
          parentUserData?.email?.split('@')[0] ||
          'Usuario',
        parentUserData?.email,
        childUserData?.raw_user_meta_data?.full_name ||
          childUserData?.raw_user_meta_data?.name ||
          childUserData?.email?.split('@')[0] ||
          'Usuario',
        childUserData?.email
      );
    });
  }

  /**
   * Find all pending approval relationships
   */
  async findPendingApprovals(): Promise<UserRelationship[]> {
    console.log('🔍 Finding pending approval relationships');

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('is_approved', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error finding pending relationships:', error);
      throw new Error(`Error finding pending relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} pending relationships`);

    return (data || []).map(relationship => {
      const parentUserData = relationship.parent_user as any;
      const childUserData = relationship.child_user as any;

      return new UserRelationship(
        relationship.id,
        relationship.parent_user_id,
        relationship.child_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        parentUserData?.raw_user_meta_data?.full_name ||
          parentUserData?.raw_user_meta_data?.name ||
          parentUserData?.email?.split('@')[0] ||
          'Usuario',
        parentUserData?.email,
        childUserData?.raw_user_meta_data?.full_name ||
          childUserData?.raw_user_meta_data?.name ||
          childUserData?.email?.split('@')[0] ||
          'Usuario',
        childUserData?.email
      );
    });
  }

  /**
   * Create a new user relationship
   */
  async create(dto: CreateUserRelationshipDTO): Promise<UserRelationship> {
    console.log('📝 Creating user relationship:', dto);

    // Validaciones de entrada
    if (!dto.parentUserId || !dto.parentUserId.trim()) {
      throw new Error('El ID del usuario padre es requerido');
    }
    if (!dto.childUserId || !dto.childUserId.trim()) {
      throw new Error('El ID del usuario hijo es requerido');
    }
    if (!dto.relationshipType || !dto.relationshipType.trim()) {
      throw new Error('El tipo de relación es requerido');
    }
    if (dto.parentUserId === dto.childUserId) {
      throw new Error('Un usuario no puede tener una relación consigo mismo');
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .insert({
        parent_user_id: dto.parentUserId,
        child_user_id: dto.childUserId,
        relationship_type: dto.relationshipType,
        is_approved: false,
        approved_at: null,
      })
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error creating relationship:', error);
      throw new Error(`Error creating relationship: ${error.message}`);
    }

    const parentUserData = data.parent_user as any;
    const childUserData = data.child_user as any;

    console.log('✅ Relationship created successfully:', data);

    return new UserRelationship(
      data.id,
      data.parent_user_id,
      data.child_user_id,
      data.relationship_type,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      parentUserData?.raw_user_meta_data?.full_name ||
        parentUserData?.raw_user_meta_data?.name ||
        parentUserData?.email?.split('@')[0] ||
        'Usuario',
      parentUserData?.email,
      childUserData?.raw_user_meta_data?.full_name ||
        childUserData?.raw_user_meta_data?.name ||
        childUserData?.email?.split('@')[0] ||
        'Usuario',
      childUserData?.email
    );
  }

  /**
   * Approve a relationship
   */
  async approve(id: string): Promise<UserRelationship> {
    console.log('✅ Approving relationship:', id);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_relationships')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        parent_user:parent_user_id (
          id,
          email,
          raw_user_meta_data
        ),
        child_user:child_user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error approving relationship:', error);
      throw new Error(`Error approving relationship: ${error.message}`);
    }

    const parentUserData = data.parent_user as any;
    const childUserData = data.child_user as any;

    console.log('✅ Relationship approved successfully:', data);

    return new UserRelationship(
      data.id,
      data.parent_user_id,
      data.child_user_id,
      data.relationship_type,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      parentUserData?.raw_user_meta_data?.full_name ||
        parentUserData?.raw_user_meta_data?.name ||
        parentUserData?.email?.split('@')[0] ||
        'Usuario',
      parentUserData?.email,
      childUserData?.raw_user_meta_data?.full_name ||
        childUserData?.raw_user_meta_data?.name ||
        childUserData?.email?.split('@')[0] ||
        'Usuario',
      childUserData?.email
    );
  }

  /**
   * Soft delete a relationship
   */
  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting relationship (soft delete):', id);

    const supabase = createClient();

    const { error } = await supabase
      .schema('app')
      .from('user_relationships')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting relationship:', error);
      throw new Error(`Error deleting relationship: ${error.message}`);
    }

    console.log('✅ Relationship deleted successfully (soft delete)');
  }
}
