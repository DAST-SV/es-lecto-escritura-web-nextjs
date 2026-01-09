// ============================================
// src/core/domain/entities/User.ts
// ============================================

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly metadata: {
      avatar_url?: string;
      full_name?: string;
    }
  ) {}

  get avatarUrl(): string {
    return this.metadata.avatar_url || 
      "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png";
  }

  get displayName(): string {
    return this.metadata.full_name || this.email;
  }
}