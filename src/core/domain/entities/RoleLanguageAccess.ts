// ============================================
// src/core/domain/entities/RoleLanguageAccess.ts
// Domain Entity: Role Language Access
// ============================================

export type LanguageCode = 'es' | 'en' | 'fr' | 'it';

export class RoleLanguageAccess {
  constructor(
    public readonly id: string,
    public readonly roleName: string,
    public readonly languageCode: LanguageCode,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | null,
    // Relations (from JOINs)
    public readonly roleDisplayName?: string | null
  ) {}

  /**
   * Check if this language access is currently active
   */
  isAccessActive(): boolean {
    return this.isActive;
  }

  /**
   * Get a display string for the role
   */
  getRoleDisplay(): string {
    return this.roleDisplayName || this.roleName;
  }

  /**
   * Get a display string for the language
   */
  getLanguageDisplay(): string {
    const languageNames: Record<LanguageCode, string> = {
      es: 'Spanish',
      en: 'English',
      fr: 'French',
      it: 'Italian',
    };
    return languageNames[this.languageCode] || this.languageCode.toUpperCase();
  }

  /**
   * Get emoji flag for the language
   */
  getLanguageFlag(): string {
    const flags: Record<LanguageCode, string> = {
      es: '🇪🇸',
      en: '🇬🇧',
      fr: '🇫🇷',
      it: '🇮🇹',
    };
    return flags[this.languageCode] || '🌐';
  }

  /**
   * Check if this access can be deleted (not for critical roles)
   */
  canBeDeleted(): boolean {
    // Prevent deletion of super_admin language access
    return this.roleName !== 'super_admin';
  }

  /**
   * Get a formatted display string
   */
  getFullDisplay(): string {
    return `${this.getRoleDisplay()} → ${this.getLanguageFlag()} ${this.getLanguageDisplay()}`;
  }
}
