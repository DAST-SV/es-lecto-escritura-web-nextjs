// ============================================
// src/core/domain/repositories/IUserProfileRepository.ts
// Repository interface for User Profiles
// ============================================

import { UserProfile, UserPreferences } from '../entities/UserProfile';

export interface IUserProfileRepository {
  findAll(filters?: ProfileFilters): Promise<UserProfile[]>;
  findById(id: string): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  create(dto: CreateUserProfileDTO): Promise<UserProfile>;
  update(id: string, dto: UpdateUserProfileDTO): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}

export interface ProfileFilters {
  isPublic?: boolean;
  city?: string;
  country?: string;
  searchTerm?: string;
}

export interface CreateUserProfileDTO {
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  isPublic?: boolean;
  preferences?: UserPreferences;
}

export interface UpdateUserProfileDTO {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  isPublic?: boolean;
  preferences?: UserPreferences;
}
