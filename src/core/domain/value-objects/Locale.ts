// ============================================
// src/core/domain/value-objects/Locale.ts
// ============================================

export class Locale {
  private static readonly SUPPORTED_LOCALES = ['es', 'en'] as const;
  
  constructor(public readonly code: string) {
    if (!Locale.isSupported(code)) {
      throw new Error(`Unsupported locale: ${code}`);
    }
  }

  static isSupported(code: string): boolean {
    return Locale.SUPPORTED_LOCALES.includes(code as any);
  }

  static fromString(code: string): Locale {
    return new Locale(code);
  }

  toString(): string {
    return this.code;
  }
}