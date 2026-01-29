/**
 * ============================================
 * ENTIDAD: AuthorFollower
 * Relación de seguidor de un autor
 * ============================================
 */

export class AuthorFollower {
  constructor(
    public readonly id: string,
    public readonly authorId: string,
    public readonly followerId: string,
    public readonly notifyNewBook: boolean,
    public readonly notifyCommunityPost: boolean,
    public readonly createdAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): AuthorFollower {
    return new AuthorFollower(
      data.id as string,
      data.author_id as string,
      data.follower_id as string,
      (data.notify_new_book as boolean) ?? true,
      (data.notify_community_post as boolean) ?? true,
      new Date(data.created_at as string)
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): {
    id: string;
    authorId: string;
    followerId: string;
    notifyNewBook: boolean;
    notifyCommunityPost: boolean;
    createdAt: Date;
  } {
    return {
      id: this.id,
      authorId: this.authorId,
      followerId: this.followerId,
      notifyNewBook: this.notifyNewBook,
      notifyCommunityPost: this.notifyCommunityPost,
      createdAt: this.createdAt,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.authorId) {
      errors.push('El ID del autor es requerido');
    }

    if (!this.followerId) {
      errors.push('El ID del seguidor es requerido');
    }

    if (this.authorId === this.followerId) {
      errors.push('Un usuario no puede seguirse a sí mismo');
    }

    return errors;
  }

  /**
   * Verifica si es válida
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }
}
