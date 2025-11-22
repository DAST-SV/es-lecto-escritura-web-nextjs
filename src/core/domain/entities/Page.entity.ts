/**
 * UBICACIÓN: src/core/domain/entities/Page.entity.ts
 */

export type LayoutType = string;
export type BackgroundType = string | null;

export interface PageContent {
  layout: LayoutType;
  title: string;
  text: string;
  image?: string;
  background?: BackgroundType;
}

export interface PageFiles {
  file?: Blob | null;
  backgroundFile?: Blob | null;
}

export class Page {
  constructor(
    public readonly id: string,
    public readonly content: PageContent,
    public readonly files: PageFiles = {}
  ) {}

  static fromLegacyFormat(legacy: any): Page {
    return new Page(
      legacy.id || `page-${Date.now()}`,
      {
        layout: legacy.layout || 'TextCenterLayout',
        title: legacy.title || '',
        text: legacy.text || '',
        image: legacy.image,
        background: legacy.background
      },
      {
        file: legacy.file,
        backgroundFile: legacy.backgroundFile
      }
    );
  }

  toLegacyFormat(): any {
    return {
      layout: this.content.layout,
      title: this.content.title,
      text: this.content.text,
      image: this.content.image,
      background: this.content.background,
      animation: undefined,
      audio: undefined,
      interactiveGame: undefined,
      items: [],
      border: undefined
    };
  }

  clone(): Page {
    return new Page(
      `${this.id}-copy-${Date.now()}`,
      { ...this.content },
      { ...this.files }
    );
  }

  hasContent(): boolean {
    return !!(
      this.content.title?.trim() ||
      this.content.text?.trim() ||
      this.content.image
    );
  }

  getCharacterCount(): number {
    return (this.content.title?.length || 0) + (this.content.text?.length || 0);
  }
}