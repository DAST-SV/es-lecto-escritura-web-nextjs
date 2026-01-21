// ============================================
// src/infrastructure/repositories/user-profiles/UserProfileRepository.ts
// Implementation of IUserProfileRepository using Supabase
// ============================================

import {
  IUserProfileRepository,
  CreateUserProfileDTO,
  UpdateUserProfileDTO,
  ProfileFilters
} from '@/src/core/domain/repositories/IUserProfileRepository';
import { UserProfile } from '@/src/core/domain/entities/UserProfile';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export class UserProfileRepository implements IUserProfileRepository {

  /**
   * Find all user profiles with optional filters
   */
  async findAll(filters?: ProfileFilters): Promise<UserProfile[]> {
    console.log('🔍 Finding all user profiles with filters:', filters);

    const supabase = createClient();

    let query = supabase
      .schema('app')
      .from('user_profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters?.country) {
      query = query.ilike('country', `%${filters.country}%`);
    }

    if (filters?.searchTerm) {
      query = query.or(
        `display_name.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%,city.ilike.%${filters.searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error finding profiles:', error);
      throw new Error(`Error finding profiles: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} profiles`);

    return (data || []).map(profile => {
      return new UserProfile(
        profile.id,
        profile.user_id,
        profile.display_name,
        profile.bio,
        profile.avatar_url,
        profile.date_of_birth ? new Date(profile.date_of_birth) : null,
        profile.phone_number,
        profile.address,
        profile.city,
        profile.country,
        profile.is_public ?? true,
        profile.preferences || {},
        new Date(profile.created_at),
        new Date(profile.updated_at),
        undefined
      );
    });
  }

  /**
   * Find a specific profile by ID
   */
  async findById(id: string): Promise<UserProfile | null> {
    console.log('🔍 Finding profile by ID:', id);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Profile not found:', id);
        return null;
      }
      console.error('❌ Error finding profile:', error);
      throw new Error(`Error finding profile: ${error.message}`);
    }

    if (!data) return null;

    console.log('✅ Profile found:', data);

    return new UserProfile(
      data.id,
      data.user_id,
      data.display_name,
      data.bio,
      data.avatar_url,
      data.date_of_birth ? new Date(data.date_of_birth) : null,
      data.phone_number,
      data.address,
      data.city,
      data.country,
      data.is_public ?? true,
      data.preferences || {},
      new Date(data.created_at),
      new Date(data.updated_at),
      userData?.email
    );
  }

  /**
   * Find a user's profile by user ID
   */
  async findByUserId(userId: string): Promise<UserProfile | null> {
    console.log('🔍 Finding profile by user ID:', userId);

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Profile not found for user:', userId);
        return null;
      }
      console.error('❌ Error finding profile by user ID:', error);
      throw new Error(`Error finding profile: ${error.message}`);
    }

    if (!data) return null;

    const userData = data.users as any;

    console.log('✅ Profile found for user');

    return new UserProfile(
      data.id,
      data.user_id,
      data.display_name,
      data.bio,
      data.avatar_url,
      data.date_of_birth ? new Date(data.date_of_birth) : null,
      data.phone_number,
      data.address,
      data.city,
      data.country,
      data.is_public ?? true,
      data.preferences || {},
      new Date(data.created_at),
      new Date(data.updated_at),
      userData?.email
    );
  }

  /**
   * Create a new user profile
   */
  async create(dto: CreateUserProfileDTO): Promise<UserProfile> {
    console.log('📝 Creating user profile:', dto);

    // Validaciones de entrada
    if (!dto.userId || !dto.userId.trim()) {
      throw new Error('El ID del usuario es requerido');
    }
    if (!dto.displayName || !dto.displayName.trim()) {
      throw new Error('El nombre visible es requerido');
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .schema('app')
      .from('user_profiles')
      .insert({
        user_id: dto.userId,
        display_name: dto.displayName,
        bio: dto.bio || null,
        avatar_url: dto.avatarUrl || null,
        date_of_birth: dto.dateOfBirth?.toISOString() || null,
        phone_number: dto.phoneNumber || null,
        address: dto.address || null,
        city: dto.city || null,
        country: dto.country || null,
        is_public: dto.isPublic ?? true,
        preferences: dto.preferences || {},
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating profile:', error);
      throw new Error(`Error creating profile: ${error.message}`);
    }

    const userData = data.users as any;

    console.log('✅ Profile created successfully:', data);

    return new UserProfile(
      data.id,
      data.user_id,
      data.display_name,
      data.bio,
      data.avatar_url,
      data.date_of_birth ? new Date(data.date_of_birth) : null,
      data.phone_number,
      data.address,
      data.city,
      data.country,
      data.is_public ?? true,
      data.preferences || {},
      new Date(data.created_at),
      new Date(data.updated_at),
      userData?.email
    );
  }

  /**
   * Update a user profile
   */
  async update(id: string, dto: UpdateUserProfileDTO): Promise<UserProfile> {
    console.log('📝 Updating user profile:', id, dto);

    const supabase = createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.displayName !== undefined) {
      updateData.display_name = dto.displayName;
    }

    if (dto.bio !== undefined) {
      updateData.bio = dto.bio;
    }

    if (dto.avatarUrl !== undefined) {
      updateData.avatar_url = dto.avatarUrl;
    }

    if (dto.dateOfBirth !== undefined) {
      updateData.date_of_birth = dto.dateOfBirth?.toISOString() || null;
    }

    if (dto.phoneNumber !== undefined) {
      updateData.phone_number = dto.phoneNumber;
    }

    if (dto.address !== undefined) {
      updateData.address = dto.address;
    }

    if (dto.city !== undefined) {
      updateData.city = dto.city;
    }

    if (dto.country !== undefined) {
      updateData.country = dto.country;
    }

    if (dto.isPublic !== undefined) {
      updateData.is_public = dto.isPublic;
    }

    if (dto.preferences !== undefined) {
      updateData.preferences = dto.preferences;
    }

    const { data, error } = await supabase
      .schema('app')
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error updating profile:', error);
      throw new Error(`Error updating profile: ${error.message}`);
    }

    const userData = data.users as any;

    console.log('✅ Profile updated successfully:', data);

    return new UserProfile(
      data.id,
      data.user_id,
      data.display_name,
      data.bio,
      data.avatar_url,
      data.date_of_birth ? new Date(data.date_of_birth) : null,
      data.phone_number,
      data.address,
      data.city,
      data.country,
      data.is_public ?? true,
      data.preferences || {},
      new Date(data.created_at),
      new Date(data.updated_at),
      userData?.email
    );
  }

  /**
   * Soft delete a user profile
   */
  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting user profile (soft delete):', id);

    const supabase = createClient();

    const { error } = await supabase
      .schema('app')
      .from('user_profiles')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting profile:', error);
      throw new Error(`Error deleting profile: ${error.message}`);
    }

    console.log('✅ Profile deleted successfully (soft delete)');
  }
}
