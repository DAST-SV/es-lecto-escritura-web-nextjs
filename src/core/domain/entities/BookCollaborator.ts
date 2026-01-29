/**
 * ============================================
 * ENTIDAD: BookCollaborator
 * Colaborador de un libro (autor, co-autor, editor, etc.)
 * Vinculado a usuarios reales de la plataforma
 * ============================================
 */

import { BookCollaboratorData, CollaboratorRole } from '../types';

export class BookCollaborator {
  constructor(
    public readonly id: string | null,
    public readonly bookId: string,
    public readonly userId: string,
    public readonly role: CollaboratorRole,
    public readonly displayOrder: number,
    public readonly isPrimary: boolean,
    public readonly contributionDescription: string | null,
    public readonly revenueSharePercentage: number,
    public readonly addedAt: Date,
    public readonly addedBy: string | null,
    // Datos del usuario para display (opcionales)
    public readonly userName: string | null = null,
    public readonly userAvatarUrl: string | null = null,
    public readonly authorUsername: string | null = null,
    public readonly isVerified: boolean = false
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): BookCollaborator {
    return new BookCollaborator(
      data.id as string,
      data.book_id as string,
      data.user_id as string,
      data.role as CollaboratorRole,
      (data.display_order as number) ?? 1,
      (data.is_primary as boolean) ?? false,
      (data.contribution_description as string) || null,
      parseFloat(String(data.revenue_share_percentage ?? 0)),
      new Date(data.added_at as string),
      (data.added_by as string) || null,
      (data.user_display_name as string) || (data.user_name as string) || null,
      (data.user_avatar_url as string) || null,
      (data.author_username as string) || null,
      (data.author_is_verified as boolean) ?? false
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): BookCollaboratorData {
    return {
      userId: this.userId,
      role: this.role,
      displayOrder: this.displayOrder,
      isPrimary: this.isPrimary,
      contributionDescription: this.contributionDescription ?? undefined,
      userName: this.userName ?? undefined,
      userAvatarUrl: this.userAvatarUrl ?? undefined,
      authorUsername: this.authorUsername ?? undefined,
      isVerified: this.isVerified,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.bookId) {
      errors.push('El ID del libro es requerido');
    }

    if (!this.userId) {
      errors.push('El ID del usuario es requerido');
    }

    if (!this.role) {
      errors.push('El rol es requerido');
    }

    const validRoles: CollaboratorRole[] = ['author', 'co_author', 'editor', 'illustrator', 'translator'];
    if (!validRoles.includes(this.role)) {
      errors.push('El rol no es válido');
    }

    if (this.displayOrder < 1) {
      errors.push('El orden de visualización debe ser al menos 1');
    }

    if (this.revenueSharePercentage < 0 || this.revenueSharePercentage > 100) {
      errors.push('El porcentaje de ingresos debe estar entre 0 y 100');
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
   * Obtiene el nombre para mostrar
   */
  getDisplayName(): string {
    return this.userName || this.authorUsername || this.userId;
  }

  /**
   * Obtiene la etiqueta del rol en español
   */
  getRoleLabel(): string {
    const labels: Record<CollaboratorRole, string> = {
      author: 'Autor',
      co_author: 'Co-autor',
      editor: 'Editor',
      illustrator: 'Ilustrador',
      translator: 'Traductor',
    };
    return labels[this.role] || this.role;
  }

  /**
   * Verifica si es el autor principal
   */
  isMainAuthor(): boolean {
    return this.isPrimary && this.role === 'author';
  }
}
