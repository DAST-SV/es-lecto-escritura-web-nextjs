// ============================================
// src/core/domain/entities/UserProfile.ts
// Entidad de perfil de usuario
// ============================================

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showBirthday?: boolean;
  };
  [key: string]: any;
}

export class UserProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly displayName: string,
    public readonly bio: string | null,
    public readonly avatarUrl: string | null,
    public readonly dateOfBirth: Date | null,
    public readonly phoneNumber: string | null,
    public readonly address: string | null,
    public readonly city: string | null,
    public readonly country: string | null,
    public readonly isPublic: boolean,
    public readonly preferences: UserPreferences,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    // Datos relacionados (cargados con joins)
    public readonly userEmail?: string
  ) {}

  static fromDatabase(data: any): UserProfile {
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
      data.user_email
    );
  }

  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      display_name: this.displayName,
      bio: this.bio,
      avatar_url: this.avatarUrl,
      date_of_birth: this.dateOfBirth?.toISOString(),
      phone_number: this.phoneNumber,
      address: this.address,
      city: this.city,
      country: this.country,
      is_public: this.isPublic,
      preferences: this.preferences,
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  isComplete(): boolean {
    return !!(
      this.displayName &&
      this.bio &&
      this.city &&
      this.country
    );
  }

  hasAvatar(): boolean {
    return !!this.avatarUrl;
  }

  isContactInfoComplete(): boolean {
    return !!(this.phoneNumber || this.address);
  }

  getAge(): number | null {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getLocation(): string | null {
    if (this.city && this.country) {
      return `${this.city}, ${this.country}`;
    }
    return this.city || this.country || null;
  }

  getInitials(): string {
    return this.displayName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  shouldShowContact(): boolean {
    return this.isPublic && this.isContactInfoComplete();
  }

  getPreference<T = any>(key: string, defaultValue?: T): T | undefined {
    const keys = key.split('.');
    let value: any = this.preferences;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value as T;
  }

  hasNotificationsEnabled(): boolean {
    return !!(
      this.getPreference('notifications.email') ||
      this.getPreference('notifications.push') ||
      this.getPreference('notifications.sms')
    );
  }
}
