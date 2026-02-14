// ============================================
// src/core/domain/value-objects/Locale.ts
// Locales soportados importados de generated-locales (fuente: app.languages)
// ============================================

import { locales } from '@/src/infrastructure/config/generated-locales';

export class Locale {
  private static readonly SUPPORTED_LOCALES = locales;

  constructor(public readonly code: string) {
    if (!Locale.isSupported(code)) {
      throw new Error(`Unsupported locale: ${code}`);
    }
  }

  static isSupported(code: string): boolean {
    return (Locale.SUPPORTED_LOCALES as readonly string[]).includes(code);
  }

  static fromString(code: string): Locale {
    return new Locale(code);
  }

  toString(): string {
    return this.code;
  }
}
