/**
 * UBICACIÓN: src/core/domain/value-objects/LineHeight.vo.ts
 */

export const LINE_HEIGHTS = {
  'compact': '1',
  'tight': '1.15',
  'normal': '1.5',
  'relaxed': '1.8',
  'loose': '2',
  'extra-loose': '2.5',
} as const;

export type LineHeightKey = keyof typeof LINE_HEIGHTS;

export class LineHeight {
  private constructor(private readonly value: string) {}

  static fromKey(key: LineHeightKey): LineHeight {
    const value = LINE_HEIGHTS[key];
    if (!value) {
      throw new Error(`Invalid line height key: ${key}`);
    }
    return new LineHeight(value);
  }

  static fromValue(value: string): LineHeight {
    const isValid = Object.values(LINE_HEIGHTS).includes(value as any);
    if (!isValid) {
      throw new Error(`Invalid line height value: ${value}`);
    }
    return new LineHeight(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LineHeight): boolean {
    return this.value === other.value;
  }
}