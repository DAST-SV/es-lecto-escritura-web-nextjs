/**
 * UBICACIÓN: src/core/domain/value-objects/FontSize.vo.ts
 */

export const FONT_SIZES = {
  'extra-small': '0.625rem',
  'small': '0.75rem',
  'normal': '0.875rem',
  'medium': '1rem',
  'large': '1.125rem',
  'extra-large': '1.25rem',
  'huge': '1.5rem',
  'massive': '2rem',
} as const;

export type FontSizeKey = keyof typeof FONT_SIZES;

export class FontSize {
  private constructor(private readonly value: string) {}

  static fromKey(key: FontSizeKey): FontSize {
    const value = FONT_SIZES[key];
    if (!value) {
      throw new Error(`Invalid font size key: ${key}`);
    }
    return new FontSize(value);
  }

  static fromValue(value: string): FontSize {
    const isValid = Object.values(FONT_SIZES).includes(value as any);
    if (!isValid) {
      throw new Error(`Invalid font size value: ${value}`);
    }
    return new FontSize(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FontSize): boolean {
    return this.value === other.value;
  }
}