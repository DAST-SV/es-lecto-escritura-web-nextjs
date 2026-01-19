// ============================================
// src/core/application/use-cases/user-profiles/index.ts
// Use cases for User Profiles management
// ============================================

import {
  IUserProfileRepository,
  CreateUserProfileDTO,
  UpdateUserProfileDTO,
  ProfileFilters
} from '@/src/core/domain/repositories/IUserProfileRepository';
import { UserProfile } from '@/src/core/domain/entities/UserProfile';

// ============================================
// Get All User Profiles Use Case
// ============================================

export class GetAllUserProfilesUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(filters?: ProfileFilters): Promise<UserProfile[]> {
    return await this.repository.findAll(filters);
  }
}

// ============================================
// Get User Profile By ID Use Case
// ============================================

export class GetUserProfileByIdUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(id: string): Promise<UserProfile | null> {
    if (!id) {
      throw new Error('Profile ID is required');
    }

    return await this.repository.findById(id);
  }
}

// ============================================
// Get User Profile By User ID Use Case
// ============================================

export class GetUserProfileByUserIdUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.repository.findByUserId(userId);
  }
}

// ============================================
// Create User Profile Use Case
// ============================================

export class CreateUserProfileUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(dto: CreateUserProfileDTO): Promise<UserProfile> {
    // Validations
    if (!dto.userId) {
      throw new Error('User ID is required');
    }

    if (!dto.displayName || dto.displayName.trim() === '') {
      throw new Error('Display name is required');
    }

    if (dto.displayName.length < 2) {
      throw new Error('Display name must be at least 2 characters long');
    }

    if (dto.displayName.length > 100) {
      throw new Error('Display name must not exceed 100 characters');
    }

    if (dto.bio && dto.bio.length > 500) {
      throw new Error('Bio must not exceed 500 characters');
    }

    if (dto.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(dto.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }
    }

    if (dto.dateOfBirth) {
      const birthDate = new Date(dto.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
    }

    // Check if user already has a profile
    const existingProfile = await this.repository.findByUserId(dto.userId);
    if (existingProfile) {
      throw new Error('User already has a profile');
    }

    return await this.repository.create(dto);
  }
}

// ============================================
// Update User Profile Use Case
// ============================================

export class UpdateUserProfileUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(
    profileId: string,
    dto: UpdateUserProfileDTO,
    requestingUserId?: string
  ): Promise<UserProfile> {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    // Get the profile to update
    const profile = await this.repository.findById(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Verify requesting user has permission to update this profile
    if (requestingUserId && profile.userId !== requestingUserId) {
      throw new Error('You do not have permission to update this profile');
    }

    // Validations
    if (dto.displayName !== undefined) {
      if (!dto.displayName || dto.displayName.trim() === '') {
        throw new Error('Display name cannot be empty');
      }

      if (dto.displayName.length < 2) {
        throw new Error('Display name must be at least 2 characters long');
      }

      if (dto.displayName.length > 100) {
        throw new Error('Display name must not exceed 100 characters');
      }
    }

    if (dto.bio !== undefined && dto.bio && dto.bio.length > 500) {
      throw new Error('Bio must not exceed 500 characters');
    }

    if (dto.phoneNumber !== undefined && dto.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(dto.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }
    }

    if (dto.dateOfBirth !== undefined && dto.dateOfBirth) {
      const birthDate = new Date(dto.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
    }

    return await this.repository.update(profileId, dto);
  }
}

// ============================================
// Delete User Profile Use Case
// ============================================

export class DeleteUserProfileUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(
    profileId: string,
    requestingUserId?: string
  ): Promise<void> {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    // Get the profile to delete
    const profile = await this.repository.findById(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Verify requesting user has permission to delete this profile
    if (requestingUserId && profile.userId !== requestingUserId) {
      throw new Error('You do not have permission to delete this profile');
    }

    await this.repository.delete(profileId);
  }
}

// Export DTOs and types for convenience
export type { CreateUserProfileDTO, UpdateUserProfileDTO, ProfileFilters };
