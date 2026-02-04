// ============================================
// src/core/domain/entities/BookLevel.ts
// Entity: BookLevel (Nivel de lectura)
// ============================================

export interface LevelTranslation {
  id: string;
  languageCode: string;
  name: string;
  description: string | null;
  ageLabel: string | null;
  isActive: boolean;
}

export class BookLevel {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly minAge: number,
    public readonly maxAge: number,
    public readonly gradeMin: number | null,
    public readonly gradeMax: number | null,
    public readonly color: string | null,
    public readonly icon: string | null,
    public readonly orderIndex: number,
    public readonly isActive: boolean,
    public readonly translations: LevelTranslation[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  static fromDatabase(data: any): BookLevel {
    return new BookLevel(
      data.id,
      data.slug,
      data.min_age,
      data.max_age,
      data.grade_min,
      data.grade_max,
      data.color,
      data.icon,
      data.order_index,
      data.is_active,
      (data.level_translations || []).map((t: any) => ({
        id: t.id,
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        ageLabel: t.age_label,
        isActive: t.is_active,
      })),
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null
    );
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get ageRange(): string {
    return `${this.minAge}-${this.maxAge}`;
  }

  get gradeRange(): string | null {
    if (this.gradeMin === null && this.gradeMax === null) return null;
    if (this.gradeMin === this.gradeMax) return `${this.gradeMin}`;
    return `${this.gradeMin || '?'}-${this.gradeMax || '?'}`;
  }

  getTranslation(languageCode: string): LevelTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  getName(languageCode: string, fallback = 'es'): string {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.name;

    const fallbackTranslation = this.getTranslation(fallback);
    if (fallbackTranslation) return fallbackTranslation.name;

    return this.translations[0]?.name || this.slug;
  }

  getDescription(languageCode: string, fallback = 'es'): string | null {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.description;

    const fallbackTranslation = this.getTranslation(fallback);
    return fallbackTranslation?.description || null;
  }

  getAgeLabel(languageCode: string, fallback = 'es'): string {
    const translation = this.getTranslation(languageCode);
    if (translation?.ageLabel) return translation.ageLabel;

    const fallbackTranslation = this.getTranslation(fallback);
    if (fallbackTranslation?.ageLabel) return fallbackTranslation.ageLabel;

    return `${this.minAge}-${this.maxAge} años`;
  }
}
