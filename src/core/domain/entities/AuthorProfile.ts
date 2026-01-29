/**
 * ============================================
 * ENTIDAD: AuthorProfile
 * Perfil público de un autor en la plataforma
 * ============================================
 */

import { AuthorProfileData, SocialLinks } from '../types';

export class AuthorProfile {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly authorBio: string | null,
    public readonly shortBio: string | null,
    public readonly bannerUrl: string | null,
    public readonly avatarUrl: string | null,
    public readonly websiteUrl: string | null,
    public readonly socialLinks: SocialLinks,
    public readonly isVerified: boolean,
    public readonly isPublic: boolean,
    public readonly isAcceptingCollaborations: boolean,
    public readonly totalFollowers: number,
    public readonly totalBooks: number,
    public readonly totalViews: number,
    public readonly averageRating: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): AuthorProfile {
    return new AuthorProfile(
      data.user_id as string,
      data.username as string,
      (data.author_bio as string) || null,
      (data.short_bio as string) || null,
      (data.banner_url as string) || null,
      (data.avatar_url as string) || null,
      (data.website_url as string) || null,
      (data.social_links as SocialLinks) || {},
      (data.is_verified as boolean) ?? false,
      (data.is_public as boolean) ?? true,
      (data.is_accepting_collaborations as boolean) ?? true,
      (data.total_followers as number) ?? 0,
      (data.total_books as number) ?? 0,
      (data.total_views as number) ?? 0,
      parseFloat(String(data.average_rating ?? 0)),
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): AuthorProfileData {
    return {
      userId: this.userId,
      username: this.username,
      authorBio: this.authorBio ?? undefined,
      shortBio: this.shortBio ?? undefined,
      bannerUrl: this.bannerUrl ?? undefined,
      avatarUrl: this.avatarUrl ?? undefined,
      websiteUrl: this.websiteUrl ?? undefined,
      socialLinks: this.socialLinks,
      isVerified: this.isVerified,
      isPublic: this.isPublic,
      isAcceptingCollaborations: this.isAcceptingCollaborations,
      totalFollowers: this.totalFollowers,
      totalBooks: this.totalBooks,
      totalViews: this.totalViews,
      averageRating: this.averageRating,
      createdAt: this.createdAt,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.userId) {
      errors.push('El ID de usuario es requerido');
    }

    if (!this.username || this.username.trim().length === 0) {
      errors.push('El nombre de usuario es requerido');
    }

    if (this.username && this.username.length > 50) {
      errors.push('El nombre de usuario no puede exceder 50 caracteres');
    }

    if (this.username && !/^[a-zA-Z0-9_-]+$/.test(this.username)) {
      errors.push('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
    }

    if (this.shortBio && this.shortBio.length > 200) {
      errors.push('La bio corta no puede exceder 200 caracteres');
    }

    return errors;
  }

  /**
   * Verifica si es válida
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }

  /**
   * URL del perfil público
   */
  getProfileUrl(locale: string = 'es'): string {
    return `/${locale}/author/${this.username}`;
  }

  /**
   * Nombre para mostrar
   */
  getDisplayName(): string {
    return this.username;
  }
}
