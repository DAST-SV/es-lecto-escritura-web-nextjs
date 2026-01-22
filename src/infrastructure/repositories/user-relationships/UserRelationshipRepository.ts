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
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding relationships:', error);
      throw new Error(`Error finding relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} relationships`);

    return (data || []).map(relationship => {
      return new UserRelationship(
        relationship.id,
        relationship.primary_user_id,
        relationship.related_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        undefined,
        undefined,
        undefined,
        undefined
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
      .select('*')
      .eq('id', id)
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

    console.log('✅ Relationship found:', data);

    return new UserRelationship(
      data.id,
      data.primary_user_id,
      data.related_user_id,
      data.relationship_type,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      undefined,
      undefined,
      undefined,
      undefined
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
      .select('*')
      .eq('primary_user_id', parentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding relationships:', error);
      throw new Error(`Error finding relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} relationships for parent user`);

    return (data || []).map(relationship => {
      return new UserRelationship(
        relationship.id,
        relationship.primary_user_id,
        relationship.related_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        undefined,
        undefined,
        undefined,
        undefined
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
      .select('*')
      .eq('related_user_id', childUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error finding relationships:', error);
      throw new Error(`Error finding relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} relationships for child user`);

    return (data || []).map(relationship => {
      return new UserRelationship(
        relationship.id,
        relationship.primary_user_id,
        relationship.related_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        undefined,
        undefined,
        undefined,
        undefined
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
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error finding pending relationships:', error);
      throw new Error(`Error finding pending relationships: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} pending relationships`);

    return (data || []).map(relationship => {
      return new UserRelationship(
        relationship.id,
        relationship.primary_user_id,
        relationship.related_user_id,
        relationship.relationship_type,
        relationship.is_approved ?? false,
        relationship.approved_at ? new Date(relationship.approved_at) : null,
        new Date(relationship.created_at),
        new Date(relationship.updated_at),
        undefined,
        undefined,
        undefined,
        undefined
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
        primary_user_id: dto.parentUserId,
        related_user_id: dto.childUserId,
        relationship_type: dto.relationshipType,
        is_approved: false,
        approved_at: null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating relationship:', error);
      throw new Error(`Error creating relationship: ${error.message}`);
    }

    console.log('✅ Relationship created successfully:', data);

    return new UserRelationship(
      data.id,
      data.primary_user_id,
      data.related_user_id,
      data.relationship_type,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      undefined,
      undefined,
      undefined,
      undefined
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
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error approving relationship:', error);
      throw new Error(`Error approving relationship: ${error.message}`);
    }

    console.log('✅ Relationship approved successfully:', data);

    return new UserRelationship(
      data.id,
      data.primary_user_id,
      data.related_user_id,
      data.relationship_type,
      data.is_approved ?? false,
      data.approved_at ? new Date(data.approved_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at),
      undefined,
      undefined,
      undefined,
      undefined
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
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting relationship:', error);
      throw new Error(`Error deleting relationship: ${error.message}`);
    }

    console.log('✅ Relationship deleted successfully (soft delete)');
  }
}
